module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            517: { title: 'Trạng thái văn bản đi', link: '/user/hcth/van-ban-di-status', icon: 'fa-indent', backgroundColor: '#00aa00', groupIndex: 2 },
        },
    };

    app.permission.add('hcthVanBanDiStatus:write', { name: 'hcthVanBanDiStatus:manage', menu: staffMenu }, 'hcthVanBanDiStatus:delete');

    app.get('/user/hcth/van-ban-di-status', app.permission.check('hcthVanBanDiStatus:manage'), app.templates.admin);

    app.get('/api/hcth/van-ban-di-status/page/:pageNumber/:pageSize', app.permission.orCheck('hcthVanBanDiStatus:manage', 'staff:login'), async (req, res) => {
        try {
            const { pageNumber, pageSize } = req.params;
            const page = await app.model.hcthVanBanDiStatus.getPage(parseInt(pageNumber), parseInt(pageSize), {
                statement: 'ma like :searchTerm OR ten like :searchTerm',
                parameter: { searchTerm: `%${req.query.condition || ''}%` }
            }, '*', 'ten');
            res.send({ page });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/van-ban-di-status', app.permission.check('hcthVanBanDiStatus:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.hcthVanBanDiStatus.create(data);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban-di-status/item/:ma', app.permission.check('hcthVanBanDiStatus:write'), async (req, res) => {
        try {
            const ma = req.params.ma;
            const changes = req.body.changes;
            if (!await app.model.hcthVanBanDiStatus.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthVanBanDiStatus.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban-di-status/item/:ma', app.permission.orCheck('hcthVanBanDiStatus:manage', 'staff:login'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.hcthVanBanDiStatus.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthVanBanDiStatus.get({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/van-ban-di-status/:ma', app.permission.check('hcthVanBanDiStatus:write'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.hcthVanBanDiStatus.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthVanBanDiStatus.delete({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};