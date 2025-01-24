module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7008: {
                title: 'Khung trình độ ngoại ngữ chung', link: '/user/dao-tao/cefr',
                groupIndex: 2, parentKey: 7068
            }
        }
    };
    app.permission.add(
        { name: 'dtDmCefr:manage', menu },
        { name: 'dtDmCefr:write' },
        { name: 'dtDmCefr:delete' }
    );

    app.get('/user/dao-tao/cefr', app.permission.check('dtDmCefr:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/cefr/all', app.permission.orCheck('dtDmCefr:manage', 'staff:login'), async (req, res) => {
        try {
            let items = await app.model.dtDmCefr.getAll({}, '*', 'ma ASC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/cefr/item/:ma', app.permission.check('dtDmCefr:manage'), async (req, res) => {
        try {
            let item = await app.model.dtDmCefr.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/cefr', app.permission.check('dtDmCefr:write'), async (req, res) => {
        try {
            let item = req.body.item,
                cefr = await app.model.dtDmCefr.get({ ma: item.ma });
            if (cefr) throw 'Mã đã tồn tại';
            else await app.model.dtDmCefr.create(item);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/cefr', app.permission.check('dtDmCefr:write'), async (req, res) => {
        try {
            await app.model.dtDmCefr.update({ ma: req.body.ma }, req.body.changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/cefr', app.permission.check('dtDmCefr:delete'), async (req, res) => {
        try {
            await app.model.dtDmCefr.delete({ ma: req.body.ma });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};