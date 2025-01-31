module.exports = app => {
    const menuQuanLyLop = {
        parentMenu: app.parentMenu.user,
        menus: {
            1018: { title: 'Quản lý lớp sinh viên', link: '/user/lop-truong/quan-ly-lop', icon: 'fa-users', backgroundColor: '#eb9834', groupIndex: 1 }
        }
    };

    app.permissionHooks.add('student', 'addRoleBanCanSuLop', (user) => new Promise(resolve => {
        if (user) {
            app.dkhpRedis.getBanCanSuLop({ userId: user.mssv }, (item) => {
                // if (item && item.includes('LT')) {
                if (item) {
                    app.permissionHooks.pushUserPermission(user, 'svBanCanSu:read');
                    resolve();
                } else resolve();
            });
        } else resolve();
    }));

    app.permission.add(
        { name: 'svBanCanSu:read', menu: menuQuanLyLop },
    );

    app.get('/user/lop-truong/quan-ly-lop', app.permission.check('svBanCanSu:read'), app.templates.admin);

    app.get('/api/sv/lop-truong/quan-ly-lop', app.permission.check('svBanCanSu:read'), async (req, res) => {
        try {
            let { lop } = req.session.user.data;
            let item = await app.model.dtLop.get({ maLop: lop });
            item.dsSinhVien = await app.model.fwStudent.getAll({ lop }, 'mssv, ho, ten, tinhTrang');
            item.dsTuDong = await app.model.fwStudent.getAll({
                statement: 'maNganh = :maNganh AND namTuyenSinh = :namTuyenSinh AND loaiHinhDaoTao = :loaiHinhDaoTao AND lop is null AND tinhTrang NOT IN (:listTinhTrang)',
                parameter: {
                    maNganh: item.maChuyenNganh ? item.maChuyenNganh : item.maNganh,
                    namTuyenSinh: item.khoaSinhVien,
                    loaiHinhDaoTao: item.heDaoTao,
                    listTinhTrang: [3, 4, 6, 7]
                    //buoc thoi hoc: 3, thoi hoc: 4, tot nghiep: 6, chuyen truong: 7
                }
                // maNganh: item.maNganh, namTuyenSinh: item.khoaSinhVien, loaiHinhDaoTao: item.heDaoTao, lop: null
            }, 'mssv, ho, ten, tinhTrang');
            let {rows} = await app.model.svQuanLyLop.getAllBanCanSu(lop);
            item.dsBanCanSu = rows;
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};