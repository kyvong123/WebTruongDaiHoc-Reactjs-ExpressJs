module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4111: { title: 'Nơi cấp CCCD', link: '/user/category/noi-cap-cccd' } },
    };
    app.permission.add(
        { name: 'dmNoiCapCccd:read', menu },
        { name: 'dmNoiCapCccd:write' },
        { name: 'dmNoiCapCccd:delete' },
    );

    app.get('/user/category/noi-cap-cccd', app.permission.check('dmNoiCapCccd:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleDmNoiCapCccd', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'dmNoiCapCccd:write', 'dmNoiCapCccd:read');
            resolve();
        }
        else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/noi-cap-cccd/page/:pageNumber/:pageSize', app.permission.check('dmNoiCapCccd:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            let page = await app.model.dmNoiCapCccd.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });

    app.get('/api/danh-muc/noi-cap-cccd/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const items = await app.model.dmNoiCapCccd.getAll({ statement: 'kichHoat = 1 and lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText', parameter: { searchText: `%${req.query.condition?.toLowerCase() ?? ''}%` } });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/noi-cap-cccd/item/:ma', app.permission.check('user:login'), async (req, res) => {
        try {
            const item = await app.model.dmNoiCapCccd.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/noi-cap-cccd', app.permission.check('dmNoiCapCccd:write'), async (req, res) => {
        try {
            const item = await app.model.dmNoiCapCccd.create(req.body.dmNoiCapCccd);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/noi-cap-cccd', app.permission.check('dmNoiCapCccd:write'), async (req, res) => {
        try {
            const item = await app.model.dmNoiCapCccd.update({ ma: req.body.ma }, req.body.changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/noi-cap-cccd', app.permission.check('dmNoiCapCccd:delete'), async (req, res) => {
        try {
            await app.model.dmNoiCapCccd.delete({ ma: req.body.ma });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};