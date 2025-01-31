module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            516: { title: 'Loại ký', link: '/user/hcth/loai-chu-ky', icon: 'fa-pencil-square-o', backgroundColor: '#2a99b8', groupIndex: 2 },
        },
    };
    app.permission.add('hcthSignType:manage', { name: 'hcthSignType:write', menu: staffMenu }, 'hcthSignType:delete');

    app.get('/user/hcth/loai-chu-ky', app.permission.check('hcthSignType:manage'), app.templates.admin);

    app.get('/api/hcth/loai-chu-ky/page/:pageNumber/:pageSize', app.permission.orCheck('hcthSignType:manage', 'staff:login'), async (req, res) => {
        try {
            const { condition } = req.query;
            const { pageSize, pageNumber } = req.params;
            const page = await app.model.hcthSignType.getPage(parseInt(pageNumber), parseInt(pageSize), {
                statement: 'ma like :searchTerm OR ten like :searchTerm',
                parameter: { searchTerm: `%${condition || ''}%` }
            }, '*', 'ten');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/loai-chu-ky/all', app.permission.orCheck('hcthSignType:manage', 'staff:login'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            const items = await app.model.hcthSignType.getAll(condition);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/loai-chu-ky', app.permission.check('hcthSignType:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.hcthSignType.create(data);
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/loai-chu-ky/item/:ma', app.permission.check('hcthSignType:write'), async (req, res) => {
        try {
            // conssole.log(req.params);
            const ma = req.params.ma;
            const changes = req.body.changes;
            if (!await app.model.hcthSignType.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthSignType.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/loai-chu-ky/item/:ma', app.permission.orCheck('hcthSignType:manage', 'staff:login'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.hcthSignType.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthSignType.get({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/loai-chu-ky/:ma', app.permission.check('hcthSignType:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            if (!await app.model.hcthSignType.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthSignType.delete({ ma });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};