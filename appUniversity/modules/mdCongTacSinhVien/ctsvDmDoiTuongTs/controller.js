module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/doi-tuong-tuyen-sinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText OR lower(ma) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmSvDoiTuongTs.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/ctsv/doi-tuong-tuyen-sinh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmSvDoiTuongTs.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
};