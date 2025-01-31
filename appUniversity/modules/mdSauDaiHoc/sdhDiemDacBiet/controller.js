module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7577: {
                title: 'Điểm đặc biệt', link: '/user/sau-dai-hoc/diem-dac-biet', parentKey: 7560
            }
        }
    };
    app.permission.add(
        { name: 'sdhDiemDacBiet:manage', menu },
        { name: 'sdhDiemDacBiet:write' },
        { name: 'sdhDiemDacBiet:delete' },
        { name: 'sdhDiemDacBiet:read' }
    );

    app.get('/user/sau-dai-hoc/diem-dac-biet', app.permission.check('sdhDiemDacBiet:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhDiemDacBiet', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDiemDacBiet:manage', 'sdhDiemDacBiet:write', 'sdhDiemDacBiet:read');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/diem-dac-biet', app.permission.check('sdhDiemDacBiet:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiemDacBiet.getAll({});
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-dac-biet/tong-ket', app.permission.check('sdhDiemDacBiet:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiemDacBiet.getAll({ kichHoat: 1, tinhTongKet: 1 }, '*', 'ma');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-dac-biet/active', app.permission.check('sdhDiemDacBiet:read'), async (req, res) => {
        try {
            let items = await app.model.sdhDiemDacBiet.getAll({ kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/diem-dac-biet/item/:ma', app.permission.check('sdhDiemDacBiet:read'), async (req, res) => {
        try {
            let item = await app.model.sdhDiemDacBiet.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/diem-dac-biet', app.permission.check('sdhDiemDacBiet:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let exist = await app.model.sdhDiemDacBiet.get({ ma: data.ma });
            if (exist) {
                throw 'Điểm đặc biệt này đã tồn tại!';
            }
            await app.model.sdhDiemDacBiet.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/diem-dac-biet', app.permission.check('sdhDiemDacBiet:write'), async (req, res) => {
        try {
            let { changes } = req.body;
            let { ma } = changes;
            delete changes.ma;
            await app.model.sdhDiemDacBiet.update({ ma }, changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

};
