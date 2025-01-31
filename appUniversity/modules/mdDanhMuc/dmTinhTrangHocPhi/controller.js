module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4105: { title: 'Tình trạng học phí', link: '/user/category/tinh-trang-hoc-phi' } },
    };
    app.permission.add(
        { name: 'dmTinhTrangHocPhi:read', menu },
        { name: 'dmTinhTrangHocPhi:write' },
        { name: 'dmTinhTrangHocPhi:delete' },
    );
    app.permissionHooks.add('staff', 'addRolesDmTinhTrangHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'dmTinhTrangHocPhi:write', 'dmTinhTrangHocPhi:delete', 'dmTinhTrangHocPhi:read');
            resolve();
        } else resolve();
    }));


    app.get('/user/category/tinh-trang-hoc-phi', app.permission.check('dmTinhTrangHocPhi:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tinh-trang-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('dmTinhTrangHocPhi:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ma) LIKE :searchText OR lower(tinhTrangHocPhi) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            const page = await app.model.dmTinhTrangHocPhi.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });



    app.get('/api/danh-muc/tinh-trang-hoc-phi/item/:ma', app.permission.check('dmTinhTrangHocPhi:read'), async (req, res) => {
        try {
            const item = await app.model.dmTinhTrangHocPhi.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/tinh-trang-hoc-phi', app.permission.check('dmTinhTrangHocPhi:write'), async (req, res) => {
        try {
            const newItem = req.body.dmTinhTrangHocPhi;
            const item = await app.model.dmTinhTrangHocPhi.get({ ma: newItem.ma });
            if (item) {
                res.send({ error: { exist: true, message: 'Tình trạng học phí ' + newItem.ma.toString() + ' đã tồn tại' } });
            }
            else {
                const items = await app.model.dmTinhTrangHocPhi.create(newItem);
                res.send({ item: items });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/tinh-trang-hoc-phi', app.permission.check('dmTinhTrangHocPhi:write'), async (req, res) => {
        try {
            const item = await app.model.dmTinhTrangHocPhi.update({ ma: req.body.ma }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/tinh-trang-hoc-phi', app.permission.check('dmTinhTrangHocPhi:delete'), async (req, res) => {
        try {
            await app.model.dmTinhTrangHocPhi.delete({ ma: req.body.ma });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });
};