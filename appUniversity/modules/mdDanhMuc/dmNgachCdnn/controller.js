module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4050: { title: 'Ngạch chức danh nghề nghiệp', link: '/user/category/ngach-cdnn' },
        },
    };
    app.permission.add(
        { name: 'dmNgachCdnn:read', menu },
        { name: 'dmNgachCdnn:write' },
        { name: 'dmNgachCdnn:delete' },
    );
    app.get('/user/category/ngach-cdnn', app.permission.check('dmNgachCdnn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ngach-cdnn/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        if (req.query.kichHoat) {
            if (req.query.condition) {
                condition.statement += ' AND kichHoat = :kichHoat';
                condition.parameter.kichHoat = req.query.kichHoat;
            }
            else {
                condition = {
                    statement: 'kichHoat = :kichHoat',
                    parameter: { kichHoat: req.query.kichHoat },
                };
            }
        }
        app.model.dmNgachCdnn.getPage(pageNumber, pageSize, condition, '*', 'nhom,ten', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ngach-cdnn/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmNgachCdnn.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ngach-cdnn/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNgachCdnn.get({ ma: req.params.ma }, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/ngach-cdnn', app.permission.check('dmNgachCdnn:write'), (req, res) => {
        app.model.dmNgachCdnn.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ngach-cdnn', app.permission.check('dmNgachCdnn:write'), (req, res) => {
        app.model.dmNgachCdnn.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ngach-cdnn', app.permission.check('dmNgachCdnn:delete'), (req, res) => {
        app.model.dmNgachCdnn.delete({ id: req.body.id }, errors => res.send({ errors }));
    });
};