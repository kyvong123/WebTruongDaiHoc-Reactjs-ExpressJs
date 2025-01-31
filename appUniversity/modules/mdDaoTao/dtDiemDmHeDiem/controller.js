module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7051: {
                title: 'Hệ điểm', link: '/user/dao-tao/he-diem', groupIndex: 1, parentKey: 7047
            }
        }
    };
    app.permission.add(
        { name: 'dtDiemDmHeDiem:manage', menu },
        { name: 'dtDiemDmHeDiem:write' },
        { name: 'dtDiemDmHeDiem:delete' },
    );

    app.get('/user/dao-tao/he-diem', app.permission.check('dtDiemDmHeDiem:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDiemDmHeDiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemDmHeDiem:manage', 'dtDiemDmHeDiem:write', 'dtDiemDmHeDiem:delete');
            resolve();
        } else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/he-diem/all', app.permission.check('dtDiemDmHeDiem:manage'), async (req, res) => {
        try {
            let kichHoat = req.query.kichHoat;
            let condition = kichHoat ? { kichHoat: 1 } : {};
            let items = await app.model.dtDiemDmHeDiem.getAll(condition, '*', 'ten ASC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/he-diem/get-active', app.permission.check('dtDiemDmHeDiem:manage'), async (req, res) => {
        try {
            let items = await app.model.dtDiemDmHeDiem.getAll({ kichHoat: 1 }, '*', 'id ASC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/he-diem/item/:id', app.permission.check('dtDiemDmHeDiem:manage'), async (req, res) => {
        try {
            let item = await app.model.dtDiemDmHeDiem.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/he-diem', app.permission.check('dtDiemDmHeDiem:write'), async (req, res) => {
        try {
            let data = req.body.item;
            data.kichHoat = 1;
            let item = await app.model.dtDiemDmHeDiem.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/he-diem', app.permission.check('dtDiemDmHeDiem:write'), async (req, res) => {
        try {
            await app.model.dtDiemDmHeDiem.update({ id: req.body.id }, req.body.changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/he-diem', app.permission.check('dtDiemDmHeDiem:delete'), async (req, res) => {
        try {
            await app.model.dtDiemDmHeDiem.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};