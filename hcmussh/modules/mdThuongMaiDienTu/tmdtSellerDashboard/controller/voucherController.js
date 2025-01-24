module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.lienHe,
    //     menus: {
    //         4022: { title: 'Chủ đề Q&A', link: '/user/category/chu-de-chat/qa', icon: 'fa fa-envelope-o', groupIndex: 0 },
    //     },
    // };

    const { tmdtSellerSanPhamDraftWrite, tmdtSellerSanPhamDraftRead } = require('../../permission.js')();

    app.get('/user/tmdt/y-shop/seller/voucher/:maDaiLy', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);

    app.get('/api/tmdt/y-shop/seller/voucher/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                maDaiLy = parseInt(req.query.maDaiLy),
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtVoucher.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, maDaiLy);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/voucher/all', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            // const searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
            let page = await app.model.tmdtVoucher.getAll();
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/voucher/:id', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            let item = await app.model.tmdtVoucher.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/y-shop/seller/voucher', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const newItem = req.body.data;
            newItem.currentNumber = newItem.totalNumber;
            let item = await app.model.tmdtVoucher.create({ ...newItem });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/seller/voucher', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const changes = req.body.changes;
            let item = await app.model.tmdtVoucher.update({ id: req.body.id }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/y-shop/seller/voucher', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            let item = await app.model.tmdtVoucher.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
