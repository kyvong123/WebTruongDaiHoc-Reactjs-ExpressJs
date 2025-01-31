module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6136: { title: 'Danh mục hình thức kỷ luật', link: '/user/ctsv/hinh-thuc-ky-luat', parentKey: 6140 } },
    };
    app.permission.add(
        { name: 'dmHinhThucKyLuat:read', menu },
        { name: 'dmHinhThucKyLuat:write' },
        { name: 'dmHinhThucKyLuat:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleHinhThucKyLuat', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmHinhThucKyLuat:read', 'dmHinhThucKyLuat:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/hinh-thuc-ky-luat', app.permission.check('dmHinhThucKyLuat:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/dm-hinh-thuc-ky-luat/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const page = await app.model.svDmHinhThucKyLuat.getPage(pageNumber, pageSize, condition, '*', 'id DESC');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/ctsv/dm-hinh-thuc-ky-luat/all', app.permission.check('dmHinhThucKyLuat:read'), async (req, res) => {
        try {
            const items = await app.model.svDmHinhThucKyLuat.getAll({ kichHoat: 1 }, '*', 'id DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-hinh-thuc-ky-luat/item/:id', app.permission.check('dmHinhThucKyLuat:read'), async (req, res) => {
        try {
            const item = await app.model.svDmHinhThucKyLuat.get({ id: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dm-hinh-thuc-ky-luat', app.permission.check('dmHinhThucKyLuat:write'), async (req, res) => {
        try {
            const newItem = req.body.dmHinhThucKyLuat;
            const item = await app.model.svDmHinhThucKyLuat.create(newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dm-hinh-thuc-ky-luat', app.permission.check('dmHinhThucKyLuat:write'), async (req, res) => {
        try {
            const item = await app.model.svDmHinhThucKyLuat.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dm-hinh-thuc-ky-luat/delete', app.permission.check('dmHinhThucKyLuat:delete'), async (req, res) => {
        try {
            await app.model.svDmHinhThucKyLuat.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};