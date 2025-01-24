module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6137: { title: 'Danh mục chức vụ lớp', link: '/user/ctsv/dm-can-bo-lop', groupIndex: 3, parentKey: 6150 } },
    };
    app.permission.add(
        { name: 'dmCanBoLop:read', menu },
        { name: 'dmCanBoLop:write' },
        { name: 'dmCanBoLop:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleDmCanBoLop', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmCanBoLop:read', 'dmCanBoLop:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/ctsv/dm-can-bo-lop', app.permission.check('dmCanBoLop:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/dm-can-bo-lop/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const page = await app.model.svDmCanBoLop.getPage(pageNumber, pageSize, condition, '*', 'ma ASC');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-can-bo-lop/all', app.permission.orCheck('dmCanBoLop:read', 'tccbLop:manage', 'staff:form-teacher'), async (req, res) => {
        try {
            const { doiTuong } = req.query;
            const items = doiTuong ? await app.model.svDmCanBoLop.getAll({ kichHoat: 1, doiTuong }, '*', 'ma ASC') : await app.model.svDmCanBoLop.getAll({ kichHoat: 1 }, '*', 'ma ASC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-can-bo-lop/item/:ma', app.permission.check('dmCanBoLop:read'), async (req, res) => {
        try {
            const item = await app.model.svDmCanBoLop.get({ ma: req.params.ma }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dm-can-bo-lop', app.permission.check('dmCanBoLop:write'), async (req, res) => {
        try {
            const newItem = req.body.dmCanBoLop;
            const item = await app.model.svDmCanBoLop.create(newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dm-can-bo-lop', app.permission.check('dmCanBoLop:write'), async (req, res) => {
        try {
            const item = await app.model.svDmCanBoLop.update({ ma: req.body.ma }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dm-can-bo-lop/delete', app.permission.check('dmCanBoLop:delete'), async (req, res) => {
        try {
            await app.model.svDmCanBoLop.delete({ ma: req.body.ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};