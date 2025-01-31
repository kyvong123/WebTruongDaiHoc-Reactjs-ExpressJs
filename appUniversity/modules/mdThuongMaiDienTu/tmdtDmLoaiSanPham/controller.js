module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tmdt,
        menus: {
            10004: { title: 'Loại sản phẩm', parentKey: 10100, link: '/user/tmdt/y-shop/tu-dien-du-lieu/loai-san-pham' },
        },
    };

    const { tmdtDmLoaiSanPhamRead, tmdtDmLoaiSanPhamWrite, tmdtDmLoaiSanPhamDelete } = require('../permission.js')();

    app.permission.add(
        { name: tmdtDmLoaiSanPhamRead, menu },
        { name: tmdtDmLoaiSanPhamWrite },
        { name: tmdtDmLoaiSanPhamDelete },
    );

    app.get('/user/tmdt/y-shop/tu-dien-du-lieu/loai-san-pham', app.permission.check(tmdtDmLoaiSanPhamRead), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tmdt/danh-muc/loai-san-pham/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = typeof req.query.condition === 'string' ? req.query.condition : '';
            const page = await app.model.tmdtDmLoaiSanPham.getPage(pageNumber, pageSize, condition, '*', 'ten,moTa');
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/danh-muc/loai-san-pham/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const items = await app.model.tmdtDmLoaiSanPham.getAll();
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/danh-muc/loai-san-pham/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = await app.model.tmdtDmLoaiSanPham.get({ id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/danh-muc/loai-san-pham', app.permission.check(tmdtDmLoaiSanPhamWrite), async (req, res) => {
        try {
            const item = await app.model.tmdtDmLoaiSanPham.create(req.body.item);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/danh-muc/loai-san-pham', app.permission.check(tmdtDmLoaiSanPhamWrite), async (req, res) => {
        try {
            const item = await app.model.tmdtDmLoaiSanPham.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/danh-muc/loai-san-pham', app.permission.check(tmdtDmLoaiSanPhamDelete), async (req, res) => {
        try {
            const item = await app.model.tmdtDmLoaiSanPham.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};