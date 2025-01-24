module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4118: { title: 'Độ khẩn văn bản', link: '/user/category/do-khan-van-ban' },
        },
    };
    app.permission.add('dmDoKhanVanBan:read', 'dmDoKhanVanBan:manage', { name: 'dmDoKhanVanBan:write', menu: staffMenu }, 'dmDoKhanVanBan:delete');

    app.get('/user/category/do-khan-van-ban', app.permission.check('dmDoKhanVanBan:manage'), app.templates.admin);

    app.get('/api/danh-muc/do-khan-van-ban/page/:pageNumber/:pageSize', app.permission.orCheck('dmDoKhanVanBan:manage', 'staff:login'), async (req, res) => {
        try {
            const { condition } = req.query;
            const { pageSize, pageNumber } = req.params;
            const page = await app.model.dmDoKhanVanBan.getPage(parseInt(pageNumber), parseInt(pageSize), {
                statement: 'ma like :searchTerm OR lower(ten) like lower(:searchTerm)',
                parameter: { searchTerm: `%${condition || ''}%` }
            }, '*', 'ten');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/do-khan-van-ban/all', app.permission.orCheck('dmDoKhanVanBan:manage', 'staff:login'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            const items = await app.model.dmDoKhanVanBan.getAll(condition);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/do-khan-van-ban', app.permission.check('dmDoKhanVanBan:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.dmDoKhanVanBan.create(data);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/danh-muc/do-khan-van-ban/item/:ma', app.permission.check('dmDoKhanVanBan:write'), async (req, res) => {
        try {
            // conssole.log(req.params);
            const ma = req.params.ma;
            const changes = req.body.changes;
            if (!await app.model.dmDoKhanVanBan.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.dmDoKhanVanBan.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/do-khan-van-ban/item/:ma', app.permission.orCheck('dmDoKhanVanBan:manage', 'staff:login'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.dmDoKhanVanBan.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.dmDoKhanVanBan.get({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/do-khan-van-ban/:ma', app.permission.check('dmDoKhanVanBan:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.dmDoKhanVanBan.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.dmDoKhanVanBan.delete({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};