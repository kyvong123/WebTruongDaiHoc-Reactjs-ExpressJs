module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tmdt,
        menus: {
            10005: { title: 'Tag sản phẩm', parentKey: 10100, link: '/user/tmdt/y-shop/tu-dien-du-lieu/tag' },
        },
    };

    const { tmdtDmTagSanPhamRead, tmdtDmTagSanPhamWrite, tmdtDmTagSanPhamDelete } = require('../permission.js')();

    app.permission.add(
        { name: tmdtDmTagSanPhamRead, menu },
        { name: tmdtDmTagSanPhamWrite },
        { name: tmdtDmTagSanPhamDelete },
    );

    app.get('/user/tmdt/y-shop/tu-dien-du-lieu/tag', app.permission.check(tmdtDmTagSanPhamRead), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tmdt/danh-muc/tag/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = typeof req.query.condition === 'string' ? req.query.condition : '';
            const page = await app.model.tmdtDmTag.getPage(pageNumber, pageSize, condition, '*', 'ten,moTa');
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/danh-muc/tag/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const items = await app.model.tmdtDmTag.getAll();
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/danh-muc/tag/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = await app.model.tmdtDmTag.get({ id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/danh-muc/tag', app.permission.check(tmdtDmTagSanPhamWrite), async (req, res) => {
        try {
            const item = await app.model.tmdtDmTag.create(req.body.item);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/danh-muc/tag', app.permission.check(tmdtDmTagSanPhamWrite), async (req, res) => {
        try {
            const item = await app.model.tmdtDmTag.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/danh-muc/tag', app.permission.check(tmdtDmTagSanPhamDelete), async (req, res) => {
        try {
            const item = await app.model.tmdtDmTag.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};