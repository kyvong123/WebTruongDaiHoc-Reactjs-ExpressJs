module.exports = app => {
    app.get('/api/ctsv/ton-giao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTonGiao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });
    app.get('/api/ctsv/ton-giao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTonGiao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
};