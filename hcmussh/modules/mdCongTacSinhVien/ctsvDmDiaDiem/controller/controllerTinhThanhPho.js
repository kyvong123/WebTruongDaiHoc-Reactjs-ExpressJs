module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/tinh-thanh-pho/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTinhThanhPho.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/ctsv/tinh-thanh-pho/item/:ma', (req, res) => {
        app.model.dmTinhThanhPho.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/ctsv/tinh-thanh-pho/all', (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const condition = {
            statement: 'lower(ten) LIKE :searchTerm',
            parameter: { searchTerm: `%${searchTerm.toLowerCase()}%` },
        };
        app.model.dmTinhThanhPho.getAll(condition, '*', 'ten', (error, items) => res.send({ error, items }));
    });
};