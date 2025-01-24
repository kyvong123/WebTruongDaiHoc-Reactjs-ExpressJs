module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7041: {
                title: 'Hình thức thi', groupIndex: 2, parentKey: 7027,
                link: '/user/dao-tao/hinh-thuc-thi'
            }
        }
    };

    app.permission.add(
        { name: 'dtDmHinhThucThi:manage', menu },
        { name: 'dtDmHinhThucThi:write' },
        { name: 'dtDmHinhThucThi:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDtDmHinhThucThi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmHinhThucThi:manage', 'dtDmHinhThucThi:write', 'dtDmHinhThucThi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/hinh-thuc-thi', app.permission.check('dtDmHinhThucThi:manage'), app.templates.admin);
    // API -------------------------------------------------------------------------------------
    app.get('/api/dt/hinh-thuc-thi/all', app.permission.check('dtDmHinhThucThi:manage'), async (req, res) => {
        try {
            let { kichHoat } = req.query,
                condition = kichHoat ? { kichHoat } : {};
            let items = await app.model.dtDmHinhThucThi.getAll(condition, '*', 'ma');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/hinh-thuc-thi', app.permission.check('dtDmHinhThucThi:write'), async (req, res) => {
        try {
            let { item } = req.body,
                listHinhThuc = await app.model.dtDmHinhThucThi.getAll();
            if (listHinhThuc.length) {
                for (let hinhThuc of listHinhThuc) {
                    if (hinhThuc.ma == item.ma) throw 'Mã hình thức thi bị trùng!';
                }
            }
            let items = await app.model.dtDmHinhThucThi.create({ ...item, kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/hinh-thuc-thi', app.permission.check('dtDmHinhThucThi:delete'), async (req, res) => {
        try {
            let items = await app.model.dtDmHinhThucThi.delete({ ma: req.body.ma });
            res.send(items);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/hinh-thuc-thi', app.permission.check('dtDmHinhThucThi:write'), async (req, res) => {
        try {
            let { ma, changes } = req.body;
            let items = app.model.dtDmHinhThucThi.update({ ma }, changes);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/hinh-thuc-thi/item/:ma', app.permission.check('dtDmHinhThucThi:manage'), async (req, res) => {
        try {
            let item = await app.model.dtDmHinhThucThi.get({ ma: req.params.ma }, '*', 'ma');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};