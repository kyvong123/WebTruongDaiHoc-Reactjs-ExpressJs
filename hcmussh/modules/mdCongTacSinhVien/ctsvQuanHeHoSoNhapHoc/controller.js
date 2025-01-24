module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6190: { title: 'Quan hệ hồ sơ nhập học - hệ đào tạo', link: '/user/ctsv/ho-so-nhap-hoc', icon: 'fa-exchange', backgroundColor: '#fcba03', groupIndex: 0 } },
    };
    app.permission.add(
        { name: 'ctsvHoSoNhapHoc:read', menu },
        { name: 'ctsvHoSoNhapHoc:write' },
        { name: 'ctsvHoSoNhapHoc:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesCtsvQuanHeHoSoNhapHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvHoSoNhapHoc:read', 'ctsvHoSoNhapHoc:write', 'ctsvHoSoNhapHoc:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/ho-so-nhap-hoc', app.permission.check('ctsvHoSoNhapHoc:read'), app.templates.admin);

    // API =========================================================================================
    app.get('/api/ctsv/ho-so-nhap-hoc/by-khoa-he', app.permission.orCheck('ctsvHoSoNhapHoc:read', 'student:pending'), async (req, res) => {
        try {
            const { heDaoTao, khoaSinhVien } = req.query;
            const items = await app.model.svDmHoSoNhapHoc.getAllByKhoaHe(khoaSinhVien, heDaoTao, app.utils.stringify({ kichHoat: 1 })).then(mc => mc.rows);
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/ho-so-nhap-hoc', app.permission.check('ctsvHoSoNhapHoc:write'), async (req, res) => {
        try {
            const { heDaoTao, khoaSinhVien, listHoSo } = req.body;
            await app.model.svHoSoHeDaoTao.delete({ heDaoTao });
            await Promise.all(listHoSo?.sort((a, b) => a.stt - b.stt).map((item, index) => app.model.svHoSoHeDaoTao.create({ hoSoId: item.id, heDaoTao, khoaSinhVien, stt: index + 1 })));
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};