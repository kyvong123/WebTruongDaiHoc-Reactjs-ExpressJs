module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6135: { title: 'Danh mục lý do quyết định', link: '/user/ctsv/ly-do-quyet-dinh', groupIndex: 3, parentKey: 6150 } },
    };
    app.permission.add(
        { name: 'dmLyDoQuyetDinh:read', menu },
        { name: 'dmLyDoQuyetDinh:write' },
        { name: 'dmLyDoQuyetDinh:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleLyDoQuyetDinh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmLyDoQuyetDinh:read', 'dmLyDoQuyetDinh:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/ly-do-quyet-dinh', app.permission.check('dmLyDoQuyetDinh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/dm-ly-do-quyet-dinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const page = await app.model.svDmLyDoQuyetDinh.getPage(pageNumber, pageSize, condition, '*', 'id DESC');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/ctsv/dm-ly-do-quyet-dinh/all', app.permission.check('dmLyDoQuyetDinh:read'), async (req, res) => {
        try {
            const items = await app.model.svDmLyDoQuyetDinh.getAll({ kichHoat: 1 }, '*', 'id DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-ly-do-quyet-dinh/loai-quyet-dinh/all', app.permission.check('dmLyDoQuyetDinh:read'), async (req, res) => {
        try {
            const { loaiQuyetDinh } = req.query;
            const items = await app.model.svDmLyDoQuyetDinh.getAll({ kichHoat: 1, loaiQuyetDinh }, '*', 'id DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-ly-do-quyet-dinh/item/:id', app.permission.orCheck('dmLyDoQuyetDinh:read', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            const item = await app.model.svDmLyDoQuyetDinh.get({ id: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dm-ly-do-quyet-dinh', app.permission.check('dmLyDoQuyetDinh:write'), async (req, res) => {
        try {
            const newItem = req.body.dmLyDoQuyetDinh;
            const item = await app.model.svDmLyDoQuyetDinh.create(newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dm-ly-do-quyet-dinh', app.permission.check('dmLyDoQuyetDinh:write'), async (req, res) => {
        try {
            const item = await app.model.svDmLyDoQuyetDinh.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dm-ly-do-quyet-dinh/delete', app.permission.check('dmLyDoQuyetDinh:delete'), async (req, res) => {
        try {
            await app.model.svDmLyDoQuyetDinh.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};