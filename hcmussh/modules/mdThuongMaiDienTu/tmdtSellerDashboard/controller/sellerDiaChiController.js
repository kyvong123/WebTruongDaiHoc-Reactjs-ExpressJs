module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.lienHe,
    //     menus: {
    //         4022: { title: 'Chủ đề Q&A', link: '/user/category/chu-de-chat/qa', icon: 'fa fa-envelope-o', groupIndex: 0 },
    //     },
    // };

    const { tmdtSellerSanPhamDraftWrite, tmdtSellerSanPhamDraftRead } = require('../../permission.js')();

    app.get('/user/tmdt/y-shop/seller/dia-chi/:maDaiLy', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);

    app.get('/api/tmdt/y-shop/seller/dia-chi/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                maDaiLy = parseInt(req.query.maDaiLy),
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtSellerDiaChi.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, maDaiLy);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/dia-chi/all', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            let page = await app.model.tmdtSellerDiaChi.getAll();
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/dia-chi/all/:maDaiLy', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const condition = {
                statement: 'lower(address) LIKE :searchTerm AND maDaiLy LIKE :maDaiLy',
                parameter: { searchTerm: `%${searchTerm.toLowerCase()}%`, maDaiLy: req.params.maDaiLy },
            };

            app.model.tmdtSellerDiaChi.getAll(condition, '*', 'address', (error, items) => res.send({ error, items }));
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/dia-chi/:id', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            let item = await app.model.tmdtSellerDiaChi.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/y-shop/seller/dia-chi', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const newItem = req.body.data;
            newItem.currentNumber = newItem.totalNumber;
            let item = await app.model.tmdtSellerDiaChi.create({ ...newItem });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/seller/dia-chi', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const changes = req.body.changes;
            let item = await app.model.tmdtSellerDiaChi.update({ id: req.body.id }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/y-shop/seller/dia-chi', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            let item = await app.model.tmdtSellerDiaChi.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
