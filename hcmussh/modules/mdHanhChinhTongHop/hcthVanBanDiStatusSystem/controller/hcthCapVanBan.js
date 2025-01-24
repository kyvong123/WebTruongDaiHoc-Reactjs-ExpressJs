module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            515: { title: 'Cấp văn bản', link: '/user/hcth/cap-van-ban', icon: 'fa fa-object-group', backgroundColor: '#DE602F', groupIndex: 2 },
        },
    };
    app.permission.add('hcthCapVanBan:write', { name: 'hcthCapVanBan:manage', menu: staffMenu }, 'hcthCapVanBan:delete');

    app.get('/user/hcth/cap-van-ban', app.permission.check('hcthCapVanBan:manage'), app.templates.admin);

    app.get('/api/hcth/cap-van-ban/page/:pageNumber/:pageSize', app.permission.orCheck('hcthCapVanBan:manage', 'staff:login'), async (req, res) => {
        try {
            const { condition } = req.query;
            const { pageSize, pageNumber } = req.params;
            const page = await app.model.hcthCapVanBan.getPage(parseInt(pageNumber), parseInt(pageSize), {
                statement: 'ma like :searchTerm OR ten like :searchTerm',
                parameter: { searchTerm: `%${condition || ''}%` }
            }, '*', 'ten');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/cap-van-ban', app.permission.check('hcthCapVanBan:manage'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.hcthCapVanBan.create(data);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/cap-van-ban/item/:ma', app.permission.check('hcthCapVanBan:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            const { changes } = req.body;
            if (!await app.model.hcthCapVanBan.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthCapVanBan.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/cap-van-ban/item/:ma', app.permission.orCheck('hcthCapVanBan:manage', 'staff:login'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.hcthCapVanBan.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthCapVanBan.get({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cap-van-ban/:ma', app.permission.check('hcthCapVanBan:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.hcthCapVanBan.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthCapVanBan.delete({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};