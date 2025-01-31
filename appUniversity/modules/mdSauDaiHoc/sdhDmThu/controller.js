module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.sdh,
    //     menus: {
    //         7512: {
    //             title: 'Thứ', groupIndex: 2,
    //             link: '/user/sau-dai-hoc/thu'
    //         },
    //     },
    // };

    // app.permission.add(
    //     { name: 'sdhDmThu:manage', menu },
    //     { name: 'sdhDmThu:write' },
    //     { name: 'sdhDmThu:delete' },
    // );

    // app.get('/user/sau-dai-hoc/thu', app.permission.orCheck('sdhDmThu:manage'), app.templates.admin);

    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/thu/all', app.permission.check('sdhDmThu:manage'), (req, res) => {
        app.model.sdhDmThu.getAll({}, '*', 'ma ASC', (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/sdh/thu/active', app.permission.check('sdhDmThu:manage'), (req, res) => {
        let items = [];
        app.model.sdhDmThu.getAll({ kichHoat: 1 }, '*', 'ma ASC', (error, result) => {
            result.forEach(item => items.push({ id: item.ma, text: item.ten }));
            res.send({ error, items });
        });
    });

    app.post('/api/sdh/thu', app.permission.orCheck('sdhDmThu:write', 'sdhDmThu:manage'), (req, res) => {
        app.model.sdhDmThu.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sdh/thu', app.permission.orCheck('sdhDmThu:delete', 'sdhDmThu:manage'), (req, res) => {
        app.model.sdhDmThu.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.put('/api/sdh/thu', app.permission.orCheck('sdhDmThu:write', 'sdhDmThu:manage'), (req, res) => {
        app.model.sdhDmThu.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });
};
