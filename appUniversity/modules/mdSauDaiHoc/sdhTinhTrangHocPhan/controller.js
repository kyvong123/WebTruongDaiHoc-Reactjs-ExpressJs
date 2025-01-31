module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7521: {
                title: 'Tình trạng học phần', link: '/user/sau-dai-hoc/tinh-trang-hoc-phan', parentKey: 7570
            }
        }
    };

    app.permission.add(
        { name: 'sdhTinhTrangHocPhan:manage', menu }, 'sdhTinhTrangHocPhan:write', 'sdhTinhTrangHocPhan:delete'
    );
    app.permissionHooks.add('staff', 'addRoleSdhTinhTrangHocPhan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhTinhTrangHocPhan:delete', 'sdhTinhTrangHocPhan:write', 'sdhTinhTrangHocPhan:manage');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/tinh-trang-hoc-phan', app.permission.check('sdhTinhTrangHocPhan:manage'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/tinh-trang-hoc-phan/all', app.permission.check('sdhTinhTrangHocPhan:manage'), async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm || '';
            let items = await app.model.sdhTinhTrangHocPhan.getAll({
                statement: 'lower(ten) LIKE :searchTerm',
                parameter: {
                    searchTerm: `%${searchTerm}%`
                }
            }, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
    app.get('/api/sdh/tinh-trang-hoc-phan/item/:ma', app.permission.check('sdhTinhTrangHocPhan:manage'), async (req, res) => {
        try {
            let item = await app.model.sdhTinhTrangHocPhan.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/tinh-trang-hoc-phan', app.permission.check('sdhTinhTrangHocPhan:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhTinhTrangHocPhan.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/tinh-trang-hoc-phan', app.permission.check('sdhTinhTrangHocPhan:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhTinhTrangHocPhan.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/tinh-trang-hoc-phan', app.permission.check('sdhTinhTrangHocPhan:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.sdhTinhTrangHocPhan.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};