module.exports = app => {
    const { tmdtUserSanPhamHomePage } = require('../../permission.js')();

    app.get('/api/tmdt/y-shop/user/voucher/available/page/:pageNumber/:pageSize', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            let epochTimeNow = Date.now();
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                maDaiLy = parseInt(req.query.maDaiLy),
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtVoucher.searchAvailablePage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, maDaiLy, epochTimeNow);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};