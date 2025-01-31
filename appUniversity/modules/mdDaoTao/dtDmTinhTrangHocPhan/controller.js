module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7032: {
                title: 'Tình trạng học phần', link: '/user/dao-tao/data-dictionary/tinh-trang-hoc-phan', groupIndex: 2, parentKey: 7027
            }
        }
    };

    app.permission.add(
        { name: 'dtDmTinhTrangHocPhan:manage', menu },
        { name: 'dtDmTinhTrangHocPhan:write' },
        { name: 'dtDmTinhTrangHocPhan:delete' }
    );

    app.get('/user/dao-tao/data-dictionary/tinh-trang-hoc-phan', app.permission.check('dtDmTinhTrangHocPhan:manage'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------
    app.get('/api/dt/dm-tinh-trang-hoc-phan/all', app.permission.orCheck('dtDmTinhTrangHocPhan:manage', 'staff:login'), async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm || '';
            let items = await app.model.dtDmTinhTrangHocPhan.getAll({
                statement: 'lower(ten) LIKE :searchTerm',
                parameter: {
                    searchTerm: `%${searchTerm}%`
                }
            }, '*', 'ten');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dm-tinh-trang-hoc-phan/item/:ma', app.permission.orCheck('dtDmTinhTrangHocPhan:manage', 'staff:login'), async (req, res) => {
        try {
            let item = await app.model.dtDmTinhTrangHocPhan.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/dm-tinh-trang-hoc-phan', app.permission.check('dtDmTinhTrangHocPhan:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.dtDmTinhTrangHocPhan.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/dm-tinh-trang-hoc-phan', app.permission.check('dtDmTinhTrangHocPhan:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.dtDmTinhTrangHocPhan.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/dm-tinh-trang-hoc-phan', app.permission.check('dtDmTinhTrangHocPhan:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.dtDmTinhTrangHocPhan.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};