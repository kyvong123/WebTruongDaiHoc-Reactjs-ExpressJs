module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7005: {
                title: 'Ngoại ngữ', link: '/user/dao-tao/ngoai-ngu',
                groupIndex: 2, parentKey: 7068
            }
        }
    };
    app.permission.add(
        { name: 'dtDmNgoaiNgu:read', menu },
        { name: 'dtDmNgoaiNgu:write' },
        { name: 'dtDmNgoaiNgu:delete' },
    );
    app.get('/user/dao-tao/ngoai-ngu', app.permission.check('dtDmNgoaiNgu:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/ngoai-ngu/all', app.permission.orCheck('dtDmNgoaiNgu:read', 'staff:login', 'student:login', 'dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let items = await app.model.dtDmNgoaiNgu.getAll({ kichHoat: 1 }, '*', 'ma ASC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/ngoai-ngu/item/:ma', app.permission.check('dtDmNgoaiNgu:read'), async (req, res) => {
        try {
            let item = await app.model.dtDmNgoaiNgu.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/ngoai-ngu', app.permission.check('dtDmNgoaiNgu:write'), async (req, res) => {
        try {
            let item = req.body.item,
                ngoaiNgu = await app.model.dtDmNgoaiNgu.get({ ma: item.ma });
            if (ngoaiNgu) throw 'Mã đã tồn tại';
            else await app.model.dtDmNgoaiNgu.create(item);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/ngoai-ngu', app.permission.check('dtDmNgoaiNgu:write'), async (req, res) => {
        try {
            await app.model.dtDmNgoaiNgu.update({ ma: req.body.ma }, req.body.changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/ngoai-ngu', app.permission.check('dtDmNgoaiNgu:delete'), async (req, res) => {
        try {
            await app.model.dtDmNgoaiNgu.delete({ ma: req.body.ma });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};