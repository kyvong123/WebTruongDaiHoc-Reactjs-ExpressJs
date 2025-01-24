module.exports = app => {
    app.get('/api/ctsv/quan-huyen/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(tenQuanHuyen) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmQuanHuyen.getPage(pageNumber, pageSize, condition, '*', 'maTinhThanhPho ASC, tenQuanHuyen ASC', (error, page) => res.send({ error, page }));
    });

    app.get('/api/ctsv/quan-huyen/all/:maTinhThanhPho', (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const condition = {
            statement: 'lower(tenQuanHuyen) LIKE :searchTerm AND maTinhThanhPho LIKE :maTinhThanhPho AND kichHoat = 1',
            parameter: { searchTerm: `%${searchTerm.toLowerCase()}%`, maTinhThanhPho: req.params.maTinhThanhPho },
        };
        app.model.dmQuanHuyen.getAll(condition, '*', 'tenQuanHuyen', (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/quan-huyen/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmQuanHuyen.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/quan-huyen/item/:maQuanHuyen', app.permission.check('user:login'), (req, res) => {
        app.model.dmQuanHuyen.get({ maQuanHuyen: req.params.maQuanHuyen }, (error, item) => res.send({ error, item }));
    });
};