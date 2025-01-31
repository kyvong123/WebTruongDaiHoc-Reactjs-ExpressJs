module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7556: {
                title: 'Đối tượng ưu tiên', link: '/user/sau-dai-hoc/doi-tuong-uu-tien', groupIndex: 2, parentKey: 7544
            }
        }
    };


    app.permission.add(
        { name: 'sdhDoiTuongUuTien:read', menu },
        { name: 'sdhDoiTuongUuTien:write' },
        { name: 'sdhDoiTuongUuTien:delete' }
    );
    app.permissionHooks.add('staff', 'addRoleSdhDoiTuongUuTien', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDoiTuongUuTien:read', 'sdhDoiTuongUuTien:write', 'sdhDoiTuongUuTien:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/doi-tuong-uu-tien', app.permission.check('sdhDoiTuongUuTien:read'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/doi-tuong-uu-tien/all', app.permission.check('sdhDoiTuongUuTien:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDoiTuongUuTien.getAll({}, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
    app.get('/api/sdh/doi-tuong-uu-tien/item/:ma', app.permission.check('sdhDoiTuongUuTien:read'), async (req, res) => {
        try {
            let item = await app.model.sdhDoiTuongUuTien.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/doi-tuong-uu-tien', app.permission.check('sdhDoiTuongUuTien:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhDoiTuongUuTien.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/doi-tuong-uu-tien', app.permission.check('sdhDoiTuongUuTien:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhDoiTuongUuTien.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/doi-tuong-uu-tien', app.permission.check('sdhDoiTuongUuTien:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.sdhDoiTuongUuTien.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};