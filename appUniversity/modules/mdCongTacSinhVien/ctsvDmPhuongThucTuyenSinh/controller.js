module.exports = app => {

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/phuong-thuc-tuyen-sinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'ten'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmPhuongThucTuyenSinh.getPage(pageNumber, pageSize, condition, '*', 'ten', (error, page) => res.send({ error, page }));
    });
    app.get('/api/ctsv/phuong-thuc-tuyen-sinh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhuongThucTuyenSinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
};