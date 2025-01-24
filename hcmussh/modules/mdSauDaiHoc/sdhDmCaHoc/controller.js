module.exports = app => {
    //commnent change to use from dao-tao

    // const menu = {
    //     parentMenu: app.parentMenu.sdh,
    //     menus: {
    //         7513: { title: 'Giờ học', groupIndex: 2, link: '/user/sau-dai-hoc/ca-hoc' },
    //     },
    // };

    // app.permission.add(
    //     { name: 'sdhDmCaHoc:read', menu }, 'sdhDmCaHoc:write', 'sdhDmCaHoc:delete',
    // );

    // app.get('/user/sau-dai-hoc/ca-hoc', app.permission.check('sdhDmCaHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/ca-hoc/page/:pageNumber/:pageSize', app.permission.check('sdhDmCaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.sdhDmCaHoc.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/sdh/ca-hoc/all', app.permission.check('sdhDmCaHoc:read'), (req, res) => {
        app.model.sdhDmCaHoc.getAll({}, '*', 'maCoSo,thoiGianBatDau', (error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/ca-hoc/all-condition', app.permission.check('sdhDmCaHoc:read'), async (req, res) => {
        try {
            let maCoSo = req.query.maCoSo || '';
            let items = await app.model.sdhDmCaHoc.getAll({ maCoSo, kichHoat: 1 }, '*', 'thoiGianBatDau');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });

    app.get('/api/sdh/ca-hoc/item', app.permission.check('sdhDmCaHoc:read'), async (req, res) => {
        try {
            const { _id, maCoSo } = req.query;
            let item = await app.model.sdhDmCaHoc.get({ ten: _id, maCoSo });
            res.send({ item });

        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/ca-hoc', app.permission.check('sdhDmCaHoc:write'), async (req, res) => {
        try {
            await app.model.sdhDmCaHoc.create(req.body.item, (error, item) => res.send({ error, item }));
        } catch (error) {
            console.error(error);
            res.send(error);
        }

    });

    app.put('/api/sdh/ca-hoc', app.permission.check('sdhDmCaHoc:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.sdhDmCaHoc.update({ ma: req.body._id }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/sdh/ca-hoc', app.permission.check('sdhDmCaHoc:delete'), (req, res) => {
        app.model.sdhDmCaHoc.delete({ ma: req.body._id }, error => res.send({ error }));
    });
};