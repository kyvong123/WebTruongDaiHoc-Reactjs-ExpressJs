module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6193: { title: 'Hồ sơ nhập học', link: '/user/ctsv/danh-muc-ho-so', icon: 'fa-paperclip', groupIndex: 3, parentKey: 6150 } },
    };

    app.permission.add(
        { name: 'ctsvDmHoSoNhapHoc:read', menu },
        { name: 'ctsvDmHoSoNhapHoc:write' },
        { name: 'ctsvDmHoSoNhapHoc:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesCtsvDanhMucHoSo', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvDmHoSoNhapHoc:read', 'ctsvDmHoSoNhapHoc:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/danh-muc-ho-so', app.permission.check('ctsvHoSoNhapHoc:read'), app.templates.admin);

    app.get('/api/ctsv/danh-muc/ho-so-nhap-hoc/all', app.permission.check('ctsvDmHoSoNhapHoc:read'), async (req, res) => {
        try {
            const condition = req.query.condition ?? {};
            const items = await app.model.svDmHoSoNhapHoc.getAll(condition, '*', 'id desc');
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/danh-muc/ho-so-nhap-hoc', app.permission.check('ctsvDmHoSoNhapHoc:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.svDmHoSoNhapHoc.create(data);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/danh-muc/ho-so-nhap-hoc', app.permission.check('ctsvDmHoSoNhapHoc:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.svDmHoSoNhapHoc.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/danh-muc/ho-so-nhap-hoc', app.permission.check('ctsvDmHoSoNhapHoc:delete'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svDmHoSoNhapHoc.delete({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};