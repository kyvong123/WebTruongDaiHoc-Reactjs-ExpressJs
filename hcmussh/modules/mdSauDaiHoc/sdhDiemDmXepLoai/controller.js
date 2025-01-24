module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7583: {
                title: 'Xếp loại điểm', link: '/user/sau-dai-hoc/diem-xep-loai', parentKey: 7560
            }
        }
    };
    app.permission.add(
        { name: 'sdhDiemXepLoai:manage', menu },
        { name: 'sdhDiemXepLoai:write' },
        { name: 'sdhDiemXepLoai:delete' },
        { name: 'sdhDiemXepLoai:read' }
    );

    app.get('/user/sau-dai-hoc/diem-xep-loai', app.permission.check('sdhDiemXepLoai:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhDiemXepLoai', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDiemXepLoai:manage', 'sdhDiemXepLoai:write', 'sdhDiemXepLoai:read');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/diem-xep-loai', app.permission.check('sdhDiemXepLoai:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiemDmXepLoai.getAll({}, '*', 'id  ASC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-xep-loai/active', app.permission.check('sdhDiemXepLoai:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiemDmXepLoai.getAll({ kichHoat: 1 }, '*', 'id  ASC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-xep-loai/item/:id', app.permission.check('sdhDiemXepLoai:read'), async (req, res) => {
        try {
            let item = await app.model.sdhDiemDmXepLoai.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/diem-xep-loai', app.permission.check('sdhDiemXepLoai:write'), async (req, res) => {
        try {
            let { data } = req.body;
            await app.model.sdhDiemDmXepLoai.create(data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem-xep-loai', app.permission.check('sdhDiemXepLoai:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            await app.model.sdhDiemDmXepLoai.update({ id }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });



};
