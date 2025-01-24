module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            513: { title: 'Đối tượng kiểm duyệt', link: '/user/hcth/doi-tuong-kiem-duyet', icon: 'fa-users', backgroundColor: '#28586F', groupIndex: 2 },
        },
    };
    app.permission.add('hcthDoiTuongKiemDuyet:manage', { name: 'hcthDoiTuongKiemDuyet:write', menu: staffMenu }, 'hcthDoiTuongKiemDuyet:delete');

    app.get('/user/hcth/doi-tuong-kiem-duyet', app.permission.check('hcthDoiTuongKiemDuyet:manage'), app.templates.admin);

    app.get('/api/hcth/doi-tuong-kiem-duyet/page/:pageNumber/:pageSize', app.permission.check('hcthDoiTuongKiemDuyet:manage'), async (req, res) => {
        try {
            const { condition } = req.query;
            const { pageSize, pageNumber } = req.params;
            const page = await app.model.hcthDoiTuongKiemDuyet.getPage(parseInt(pageNumber), parseInt(pageSize), {
                statement: 'ma like :searchTerm OR ten like :searchTerm',
                parameter: { searchTerm: `%${condition || ''}%` }
            }, '*', 'ten');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/doi-tuong-kiem-duyet', app.permission.check('hcthDoiTuongKiemDuyet:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let shcc = data['shcc'];
            if (!Array.isArray(shcc))
                shcc = [];
            const item = await app.model.hcthDoiTuongKiemDuyet.create({ ...data, shcc: app.utils.stringify(shcc) });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/doi-tuong-kiem-duyet/item/:ma', app.permission.check('hcthDoiTuongKiemDuyet:write'), async (req, res) => {
        try {
            const ma = req.params.ma;
            const { changes = {} } = req.body;
            let shcc = changes['shcc'];
            if (!Array.isArray(shcc))
                shcc = [];
            if (!await app.model.hcthDoiTuongKiemDuyet.get({ ma }))
                throw 'Dữ liệu không tồn tại';
            const item = await app.model.hcthDoiTuongKiemDuyet.update({ ma }, { ...changes, shcc: app.utils.stringify(shcc) });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/doi-tuong-kiem-duyet/item/:ma', app.permission.check('hcthDoiTuongKiemDuyet:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            let item;
            if (!(item = await app.model.hcthDoiTuongKiemDuyet.get({ ma })))
                throw 'Dữ liệu đối tượng kiểm duyệt không tồn tại';
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/hcth/doi-tuong-kiem-duyet/item/:ma', app.permission.check('hcthDoiTuongKiemDuyet:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            let item;
            if (!(item = await app.model.hcthDoiTuongKiemDuyet.get({ ma })))
                throw 'Dữ liệu đối tượng kiểm duyệt không tồn tại';
            await app.model.hcthDoiTuongKiemDuyet.delete({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};