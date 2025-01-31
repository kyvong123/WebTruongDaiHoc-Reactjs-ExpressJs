module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7038: {
                title: 'Dashboard tổng', pin: true, backgroundColor: '#f5c842', color: '#000',
                link: '/user/dao-tao/dashboard-tong', icon: 'fa-bar-chart'
            },
        },
    };

    app.permission.add(
        { name: 'dtDaoTaoDashBoard:manage', menu },
    );

    app.permissionHooks.add('staff', 'addRolesDtDaoTaoDashBoard', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDaoTaoDashBoard:manage');
            resolve();
        } else resolve();
    }));


    app.get('/user/dao-tao/dashboard-tong', app.permission.check('dtDaoTaoDashBoard:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/dao-tao-dashboard', app.permission.check('dtDaoTaoDashBoard:manage'), async (req, res) => {
        try {
            let { filter } = req.query;
            let item = await app.model.dtLichSuDkhp.dashBoardGetData(app.utils.stringify(filter));
            let dangKyTheoHe = item.rows,
                { sinhVienDkhpTheoKhoaSinhVien, soLuongSinhVienTheoKhoaSinhVien, soLuotDangKyHocPhan, thaoTacDangKyHocPhan, soHocPhanTheoNhHk } = item,
                dangKyTheoKhoaSv = sinhVienDkhpTheoKhoaSinhVien,
                countSvTheoKhoaSv = soLuongSinhVienTheoKhoaSinhVien,
                soLuotDangKyTong = soLuotDangKyHocPhan[0].soLuong,
                thaoTacDangKy = thaoTacDangKyHocPhan,
                soHocPhan = soHocPhanTheoNhHk;
            let loaiHinhDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll({}, 'ma', 'ma ASC'),
                listSLHe = loaiHinhDaoTao.map(he => {
                    let item = dangKyTheoHe.filter(e => e.loaiHinhDaoTao == he.ma);
                    if (item.length) return item[0];
                    else return { soLuong: 0, loaiHinhDaoTao: he.ma };
                });
            dangKyTheoHe = listSLHe;
            // thaoTacDangKy.forEach(e => {
            //     if (e.thaoTac == 'A') e.thaoTac = 'Đăng ký mới';
            //     else if (e.thaoTac == 'D') e.thaoTac = 'Hủy đăng ký';
            //     else if (e.thaoTac == 'C') e.thaoTac = 'Chuyển lớp';
            //     else if (e.thaoTac == 'H') e.thaoTac = 'Hoàn tác';
            // })
            res.send({ data: { dangKyTheoHe, dangKyTheoKhoaSv, countSvTheoKhoaSv, soLuotDangKyTong, thaoTacDangKy, soHocPhan } });
        } catch (error) {
            res.send({ error });
        }
    });
};
