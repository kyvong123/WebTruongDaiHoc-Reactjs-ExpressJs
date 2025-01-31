module.exports = app => {


    app.get('/user/finance/regular-expression', app.permission.check('tcHocPhi:manage'), app.templates.admin);
    app.get('/user/finance/regular-expression/:id', app.permission.check('tcHocPhi:manage'), app.templates.admin);


    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5022: { title: 'Biểu thức chính quy', link: '/user/finance/regular-expression', icon: 'fa fa-terminal', groupIndex: 0, backgroundColor: '#AC2D34' },
        },
    };
    app.permission.add({ name: 'tcHocPhi:manage', menu });
    app.get('/api/khtc/regular-expression/all', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            const items = await app.model.tcRegularExpressionSet.getAll({}, '*', 'id');
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/regular-expression/:id', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            const item = await app.model.tcRegularExpressionSet.get({ id: req.params.id });
            item.regularExpressions = await app.model.tcRegularExpressionItem.getAll({ ma: item.id }, '*', 'id');
            res.send({ item });
        } catch (error) {
            console.error('GET: /api/khtc/regular-expression/' + req.params.id, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/regular-expression', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            const item = await app.model.tcRegularExpressionSet.create({ ten: req.body.ten });
            res.send({ item });
        } catch (error) {
            console.error('POST: /api/khtc/regular-expression/', error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/regular-expression/item', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            const item = await app.model.tcRegularExpressionItem.create(req.body.data);
            res.send({ item });
        } catch (error) {
            console.error('POST: /api/khtc/regular-expression/', error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/regular-expression/:id', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            const item = await app.model.tcRegularExpressionSet.update({ id: req.params.id }, { ten: req.body.ten });
            res.send({ item });
        } catch (error) {
            console.error('PUT: /api/khtc/regular-expression/' + req.params.id, error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/regular-expression/item/:id', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            const item = await app.model.tcRegularExpressionItem.update({ id: req.params.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            console.error('POST: /api/khtc/regular-expression/', error);
            res.send({ error });
        }
    });

    app.delete('/api/khtc/regular-expression/item/:id', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            await app.model.tcRegularExpressionItem.delete({ id: req.params.id });
            res.send({});
        } catch (error) {
            console.error('DELETE: /api/khtc/regular-expression/item/', error);
            res.send({ error });
        }
    });
};