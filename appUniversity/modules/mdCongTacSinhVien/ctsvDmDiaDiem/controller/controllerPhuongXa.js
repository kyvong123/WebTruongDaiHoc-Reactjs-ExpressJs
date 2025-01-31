module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/phuong-xa/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(tenPhuongXa) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmPhuongXa.getPage(pageNumber, pageSize, condition, '*', 'maPhuongXa ASC', (error, page) => res.send({ error, page }));
    });

    app.get('/api/ctsv/phuong-xa/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhuongXa.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/phuong-xa/all/:maQuanHuyen', (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const condition = {
            statement: 'lower(tenPhuongXa) LIKE :searchTerm AND maQuanHuyen LIKE :maQuanHuyen AND kichHoat = 1',
            parameter: { searchTerm: `%${searchTerm.toLowerCase()}%`, maQuanHuyen: req.params.maQuanHuyen },
        };

        app.model.dmPhuongXa.getAll(condition, '*', 'tenPhuongXa', (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/phuong-xa/item/:maPhuongXa', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhuongXa.get({ maPhuongXa: req.params.maPhuongXa }, (error, item) => res.send({ error, item }));
    });
};