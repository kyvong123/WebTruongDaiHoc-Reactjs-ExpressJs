module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2081: {
                title: 'Quản lý Tham số', subTitle: 'Only admin',
                link: '/user/settings/parameter', icon: 'fa-indent', groupIndex: 5
            },
        },
    };

    app.permission.add(
        { name: 'fwParameter:manage', menu }, 'fwParameter:write', 'fwParameter:delete'
    );

    app.get('/user/settings/parameter', app.permission.check('fwParameter:manage'), app.templates.admin);

    // APIs ---------------------------------------------------------------------------------------------------------------------
    app.get('/api/setting/parameter/all', app.permission.check('fwParameter:manage'), async (req, res) => {
        try {
            let items = await app.model.fwParameter.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/setting/parameter/get-list', app.permission.check('fwParameter:write'), async (req, res) => {
        try {
            let searchTerm = req.query.condition || '';
            let items = await app.model.fwParameter.getAll({
                statement: 'lower(bien) LIKE :searchTerm OR lower(chuThich) AND kichHoat = 1',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase()}%`
                }
            }, 'bien,chuThich', 'ten ASC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/setting/parameter', app.permission.check('fwParameter:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let item = await app.model.fwParameter.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/setting/parameter', app.permission.check('fwParameter:write'), async (req, res) => {
        try {
            const { changes, bien } = req.body;
            let item = await app.model.fwParameter.update({ bien }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/setting/parameter', app.permission.check('fwSmsTemplateDraft:write'), async (req, res) => {
        try {
            let item = await app.model.fwParameter.get({ bien: req.query.bien }, 'bien,ten,chuThich');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/setting/parameter', app.permission.check('fwParameter:write'), async (req, res) => {
        try {
            const { bien } = req.body;
            await app.model.fwParameter.delete({ bien });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};