module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1025: { title: 'Lớp chủ nhiệm', link: '/user/lop-chu-nhiem', icon: 'fa fa-users', color: '#000000', backgroundColor: '#9cff67', groupIndex: 1 },
        },

    };

    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6179: { title: 'Lớp chủ nhiệm', link: '/user/lop-chu-nhiem', icon: 'fa fa-users', color: '#000000', backgroundColor: '#9cff67', groupIndex: 2 },
        },
    };

    app.permission.add(
        { name: 'staff:form-teacher', menu: menuStaff },
        { name: 'staff:form-teacher', menu: menuCtsv },
    );


    app.permissionHooks.add('staff', 'addRoleLopChuNhiem', (user, staff) => new Promise(resolve => {
        if (user) {
            app.dkhpRedis.getBanCanSuLop({ userId: staff.shcc }, (item) => {
                if (item) {
                    app.permissionHooks.pushUserPermission(user, 'staff:form-teacher');
                    resolve();
                } else resolve();
            });
        } else resolve();
    }));

    app.get('/user/lop-chu-nhiem', app.permission.check('staff:form-teacher'), app.templates.admin);

    app.get('/api/tccb/lop-chu-nhiem', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const maLop = req.query.maLop;
            let item = await app.model.dtLop.get({ maLop });
            item.dsSinhVien = await app.model.fwStudent.getAll({ lop: maLop }, 'mssv, ho, ten, tinhTrang');
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
            let { rows } = await app.model.svQuanLyLop.getAllBanCanSu(maLop);
            item.dsBanCanSu = rows;
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/lop-chu-nhiem/danh-sach-lop', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const user = req.session.user;
            const items = await app.model.svQuanLyLop.getAll({ userId: user.shcc }, '*');
            res.send({ items: items.map(item => item.maLop) });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/lop-chu-nhiem/ban-can-su', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const { changes } = req.body;
            let item = await app.model.svQuanLyLop.createBanCanSu(changes);
            // await app.dkhpRedis.createBanCanSuLop(changes);
            await app.dkhpRedis.syncWithDb(item.userId);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/lop-chu-nhiem/ban-can-su', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            let item = await app.model.svQuanLyLop.update({ id }, changes);
            // await app.dkhpRedis.createBanCanSuLop(changes);
            await app.dkhpRedis.syncWithDb(item.userId);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/lop-chu-nhiem/ban-can-su', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const { id, userId } = req.body;
            await app.model.svQuanLyLop.delete({ id });
            // await app.dkhpRedis.deleteBanCanSuLop({ userId, maLop, maChucVu });
            await app.dkhpRedis.syncWithDb(userId);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/lop-chu-nhiem/download-excel', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const { filter } = req.query;
            const data = await app.model.fwStudent.downloadExcel('', filter.replaceAll(' ', '+')),
                list = data.rows;
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Students List');
            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(list[0] || {}).map(key => ({ header: key.toString(), key, width: 20 }))];
            list.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, 'STUDENT_DATA.xlsx');
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

};