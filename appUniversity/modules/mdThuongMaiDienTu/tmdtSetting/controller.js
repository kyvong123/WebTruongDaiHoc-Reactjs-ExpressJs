module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.tmdt,
        menus: {
            10105: { title: 'Cấu hình', pin: true, link: '/user/tmdt/y-shop/setting', icon: 'fa-sliders', backgroundColor: '#274d5a' },
        },
    };

    app.permission.add(
        { name: 'tmdtSettings:manage', menu },
        { name: 'tmdtSettings:admin', menu },
        'tmdtSettings:write'
    );

    app.get('/user/tmdt/y-shop/setting', app.permission.orCheck('tmdtSettings:manage', 'tmdtSettings:admin'), app.templates.admin);

    // APIs -------------------------------------------------------------------------------------------------------------
    app.get('/api/tmdt/setting/all', app.permission.check('tmdtSettings:manage'), async (req, res) => {
        try {
            let items = await app.model.tmdtSetting.getAll(), result = {};
            items.forEach(item => {
                result[item.key] = item.value;
            });
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tmdt/setting/keys', app.permission.check('tmdtSettings:manage'), async (req, res) => {
        try {
            const { keys } = req.query;
            let result = await app.model.dtSettings.getValue(keys);
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tmdt/setting', app.permission.check('dtSettings:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            await app.model.tmdtSetting.setValue(changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });


};