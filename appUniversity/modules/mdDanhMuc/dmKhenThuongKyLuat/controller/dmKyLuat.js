module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4035: { title: 'Hình thức kỷ luật', link: '/user/category/ky-luat' },
        },
    };
    app.permission.add(
        { name: 'dmKyLuat:read', menu },
        { name: 'dmKyLuat:write' },
        { name: 'dmKyLuat:delete' },
    );
    app.get('/user/category/ky-luat', app.permission.check('dmKyLuat:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ky-luat/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmKyLuat.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ky-luat/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmKyLuat.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ky-luat/item/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.dmKyLuat.get({ ma: req.params._id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ky-luat', app.permission.check('dmKyLuat:write'), (req, res) => {
        app.model.dmKyLuat.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ky-luat', app.permission.check('dmKyLuat:write'), (req, res) => {
        app.model.dmKyLuat.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ky-luat', app.permission.check('dmKyLuat:write'), (req, res) => {
        app.model.dmKyLuat.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};