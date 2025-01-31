module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7048: {
                title: 'Loại điểm', link: '/user/dao-tao/loai-diem', groupIndex: 1, parentKey: 7047
            }
        }
    };
    app.permission.add(
        { name: 'dtDiemDmLoaiDiem:manage', menu },
        { name: 'dtDiemDmLoaiDiem:write' },
        { name: 'dtDiemDmLoaiDiem:read' }
    );

    app.get('/user/dao-tao/loai-diem', app.permission.check('dtDiemDmLoaiDiem:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesdtDiemDmLoaiDiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemDmLoaiDiem:manage', 'dtDiemDmLoaiDiem:write', 'dtDiemDmLoaiDiem:read');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/loai-diem', app.permission.orCheck('dtDiemDmLoaiDiem:read', 'staff:login'), async (req, res) => {
        try {
            let items = await app.model.dtDiemDmLoaiDiem.getAll({}, '*', 'priority DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/loai-diem/active', app.permission.check('dtDiemDmLoaiDiem:read'), async (req, res) => {
        try {
            let items = await app.model.dtDiemDmLoaiDiem.getAll({ kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/loai-diem/item/:ma', app.permission.check('dtDiemDmLoaiDiem:read'), async (req, res) => {
        try {
            let item = await app.model.dtDiemDmLoaiDiem.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/loai-diem', app.permission.check('dtDiemDmLoaiDiem:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let exist = await app.model.dtDiemDmLoaiDiem.get({ ma: data.ma });
            if (exist) {
                throw 'Đã tồn tại loại điểm này rồi!';
            }
            await app.model.dtDiemDmLoaiDiem.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/loai-diem', app.permission.check('dtDiemDmLoaiDiem:write'), async (req, res) => {
        try {
            let { changes } = req.body;
            let { ma } = changes;
            delete changes.ma;
            await app.model.dtDiemDmLoaiDiem.update({ ma }, changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

};
