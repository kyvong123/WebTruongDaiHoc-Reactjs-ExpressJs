module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: { 5120: { title: 'Thu nhập cá nhân', subTitle: 'Phòng Kế hoạch - Tài chính', link: '/user/tncn', icon: 'fa fa-university', color: '#fff', backgroundColor: '#009933', pin: true } },
    };
    app.permission.add(
        { name: 'tcThuNhapCaNhan:read', menu: menu },
        { name: 'tcThuNhapCaNhan:write' },
        { name: 'tcThuNhapCaNhan:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesThuNhapCaNhan', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcThuNhapCaNhan:read', 'tcThuNhapCaNhan:write', 'tcThuNhapCaNhan:delete');
        }
    });

    app.get('/user/tncn', app.permission.check('tcThuNhapCaNhan:read'), app.templates.admin);

    //API--------------------------------


    app.get('/api/cb/tncn/tai-bieu-mau/:loai', app.permission.check('tcThueDangKy:write'), async (req, res) => {
        try {
            const { loai } = req.params;
            const type = {
                'dangKy': 'toKhaiDangKyTncn.docx',
                'capNhat': 'toKhaiDieuChinhTncn.docx',
                'uyQuyen': 'toKhaiUyQuyenTncn.docx',
                'phuThuoc': 'toKhaiNguoiPhuThuoc.docx'
            };
            const pathDownload = app.path.join(app.assetPath, `khtc/tncn/bieuMau/${type[loai]}`);
            res.download(pathDownload);

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};