module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7603: {
                title: 'Hình thức kỷ luật', parentKey: 7544, link: '/user/sau-dai-hoc/tuyen-sinh/dm-ky-luat', groupIndex: 2
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsDmKyLuat:read', menu },
        { name: 'sdhTsDmKyLuat:write' },
        { name: 'sdhTsDmKyLuat:delete' }
    );
    app.permissionHooks.add('staff', 'addRoleSdhTsDmKyLuat', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhTsDmKyLuat:read', 'sdhTsDmKyLuat:write', 'sdhTsDmKyLuat:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/tuyen-sinh/dm-ky-luat', app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/dm-ky-luat/all', app.permission.check('sdhTsDmKyLuat:read'), async (req, res) => {
        try {
            const items = await app.model.sdhTsDmKyLuat.getAll({}, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
    app.get('/api/sdh/dm-ky-luat/item/:ma', app.permission.check('sdhTsDmKyLuat:read'), async (req, res) => {
        try {
            const { ma } = req.params;
            const item = await app.model.sdhTsDmKyLuat.get({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/dm-ky-luat', app.permission.check('sdhTsDmKyLuat:write'), async (req, res) => {
        try {
            const { data, ma } = req.body;
            const item = await app.model.sdhTsDmKyLuat.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/dm-ky-luat', app.permission.check('sdhTsDmKyLuat:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.sdhTsDmKyLuat.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/dm-ky-luat', app.permission.check('sdhTsDmKyLuat:delete'), async (req, res) => {
        try {
            const { ma } = req.body;
            await app.model.sdhTsDmKyLuat.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};