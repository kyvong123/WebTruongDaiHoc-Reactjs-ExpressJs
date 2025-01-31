module.exports = app => {
    app.get('/api/tccb/hop-dong/can-bo', app.permission.check('qtHopDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

        const filter = app.utils.stringify(app.clone({ ks_now: Date.now() }, req.query.filter));
        app.model.qtHopDongLaoDong.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                list = list.map(item => {
                    if (item.newPhanTramHuong) {
                        item.newPhanTramHuong = app.utils.parse(item.newPhanTramHuong);
                    }
                    return item;
                });
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/hop-dong/pre-shcc/:maDonVi', app.permission.check('qtHopDong:write'), async (req, res) => {
        let result = await app.model.qtHopDongLaoDong.getShccAuto(req.params.maDonVi);
        res.send(result);
    });
};