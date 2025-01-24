module.exports = app => {
    //index later
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7552: {
                title: 'Hình thức kỷ luật', link: '/user/sau-dai-hoc/hinh-thuc-ky-luat', parentKey: 7570
            }
        }
    };

    app.permission.add(
        { name: 'sdhKyLuat:read', menu },
        { name: 'sdhKyLuat:write' },
        { name: 'sdhKyLuat:delete' }
    );

    app.get('/user/sau-dai-hoc/hinh-thuc-ky-luat', app.permission.check('sdhKyLuat:read'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/hinh-thuc-ky-luat/all', app.permission.check('sdhKyLuat:read'), async (req, res) => {
        try {
            let items = await app.model.sdhHinhThucKyLuat.getAll({}, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
    app.get('/api/sdh/hinh-thuc-ky-luat/item/:ma', app.permission.check('sdhKyLuat:read'), async (req, res) => {
        try {
            let item = await app.model.sdhHinhThucKyLuat.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/hinh-thuc-ky-luat', app.permission.check('sdhKyLuat:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhHinhThucKyLuat.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.post('/api/sdh/hinh-thuc-ky-luat', app.permission.check('sdhKyLuat:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhHinhThucKyLuat.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/hinh-thuc-ky-luat', app.permission.check('sdhKyLuat:delete'), async (req, res) => {
        try {
            let { ma } = req.body;
            await app.model.sdhHinhThucKyLuat.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};