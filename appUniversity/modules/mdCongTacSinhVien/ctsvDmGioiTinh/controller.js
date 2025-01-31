module.exports = app => {
    app.get('/api/ctsv/gioi-tinh/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmGioiTinh.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/ctsv/gioi-tinh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmGioiTinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
};