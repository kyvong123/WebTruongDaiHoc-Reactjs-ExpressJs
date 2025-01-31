module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2082: {
                title: 'Quản lý Tham số cán bộ', subTitle: 'Only admin',
                link: '/user/settings/parameter-can-bo', icon: 'fa-indent', groupIndex: 5
            },
        },
    };

    app.permission.add(
        { name: 'fwParameterCanBo:manage', menu }, 'fwParameterCanBo:write', 'fwParameterCanBo:delete'
    );

    app.get('/user/settings/parameter-can-bo', app.permission.check('fwParameterCanBo:manage'), app.templates.admin);

    // APIs ---------------------------------------------------------------------------------------------------------------------
    app.get('/api/setting/parameter-can-bo/all', app.permission.check('fwParameterCanBo:manage'), async (req, res) => {
        try {
            let items = await app.model.fwParameterCanBo.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/setting/parameter-can-bo/get-list', app.permission.check('fwParameterCanBo:write'), async (req, res) => {
        try {
            let searchTerm = req.query.condition || '';
            let items = await app.model.fwParameterCanBo.getAll({
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

    app.post('/api/setting/parameter-can-bo', app.permission.check('fwParameterCanBo:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let item = await app.model.fwParameterCanBo.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/setting/parameter-can-bo', app.permission.check('fwParameterCanBo:write'), async (req, res) => {
        try {
            const { changes, bien } = req.body;
            let item = await app.model.fwParameterCanBo.update({ bien }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/setting/parameter-can-bo', app.permission.check('fwSmsTemplateDraft:write'), async (req, res) => {
        try {
            let item = await app.model.fwParameterCanBo.get({ bien: req.query.bien }, 'bien,ten,chuThich');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/setting/parameter-can-bo', app.permission.check('fwParameterCanBo:write'), async (req, res) => {
        try {
            const { bien } = req.body;
            await app.model.fwParameterCanBo.delete({ bien });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};