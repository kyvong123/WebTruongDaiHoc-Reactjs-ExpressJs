module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7067: {
                title: 'Loại chứng chỉ khác', link: '/user/dao-tao/loai-chung-chi',
                groupIndex: 2, parentKey: 7068
            }
        }
    };
    app.permission.add(
        { name: 'dtDmLoaiChungChi:manage', menu },
        { name: 'dtDmLoaiChungChi:write' },
        { name: 'dtDmLoaiChungChi:delete' }
    );

    app.get('/user/dao-tao/loai-chung-chi', app.permission.check('dtDmLoaiChungChi:manage'), app.templates.admin);

    // APIs ------------------------------------------------------------------------------------------------------

    app.get('/api/dt/loai-chung-chi/all', app.permission.orCheck('dtDmLoaiChungChi:manage', 'student:login', 'dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            const items = await app.model.dtDmLoaiChungChi.getAll({}, '*', 'ma');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/loai-chung-chi', app.permission.check('dtDmLoaiChungChi:manage'), async (req, res) => {
        try {
            let items = await app.model.dtDmLoaiChungChi.getAll({ kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/loai-chung-chi/item/:ma', app.permission.check('dtDmLoaiChungChi:manage'), async (req, res) => {
        try {
            let { ma } = req.query,
                item = await app.model.dtDmLoaiChungChi.get({ ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/loai-chung-chi', app.permission.check('dtDmLoaiChungChi:write'), async (req, res) => {
        try {
            let { item } = req.body;
            const items = await app.model.dtDmLoaiChungChi.create(item);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/loai-chung-chi', app.permission.check('dtDmLoaiChungChi:write'), async (req, res) => {
        try {
            let { ma, changes } = req.body;
            await app.model.dtDmLoaiChungChi.update({ ma }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};