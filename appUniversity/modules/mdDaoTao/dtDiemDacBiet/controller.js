module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7046: {
                title: 'Điểm đặc biệt', link: '/user/dao-tao/diem-dac-biet', groupIndex: 1, parentKey: 7047
            }
        }
    };
    app.permission.add(
        { name: 'dtDiemDacBiet:manage', menu },
        { name: 'dtDiemDacBiet:write' },
        { name: 'dtDiemDacBiet:delete' },
        { name: 'dtDiemDacBiet:read' }
    );

    app.get('/user/dao-tao/diem-dac-biet', app.permission.check('dtDiemDacBiet:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDiemDacBiet', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemDacBiet:manage', 'dtDiemDacBiet:write', 'dtDiemDacBiet:read');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/diem-dac-biet', app.permission.check('dtDiemDacBiet:read'), async (req, res) => {
        try {
            let items = await app.model.dtDiemDacBiet.getAll({});
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-dac-biet/active', app.permission.check('dtDiemDacBiet:read'), async (req, res) => {
        try {
            let items = await app.model.dtDiemDacBiet.getAll({ kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-dac-biet/item/:ma', app.permission.check('dtDiemDacBiet:read'), async (req, res) => {
        try {
            let item = await app.model.dtDiemDacBiet.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-dac-biet', app.permission.check('dtDiemDacBiet:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let exist = await app.model.dtDiemDacBiet.get({ ma: data.ma });
            if (exist) {
                throw 'Đã tồn tại điểm đặc biệt này rồi!';
            }
            await app.model.dtDiemDacBiet.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/diem-dac-biet', app.permission.check('dtDiemDacBiet:write'), async (req, res) => {
        try {
            let { changes } = req.body;
            let { ma } = changes;
            delete changes.ma;
            await app.model.dtDiemDacBiet.update({ ma }, changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

};
