module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7056: {
                title: 'Xếp loại điểm', link: '/user/dao-tao/diem/xep-loai', groupIndex: 1, parentKey: 7047
            }
        }
    };
    app.permission.add(
        { name: 'dtDiemDmXepLoai:manage', menu },
        { name: 'dtDiemDmXepLoai:write' },
        { name: 'dtDiemDmXepLoai:read' }
    );

    app.get('/user/dao-tao/diem/xep-loai', app.permission.check('dtDiemDmXepLoai:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesdtDiemDmXepLoai', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemDmXepLoai:manage', 'dtDiemDmXepLoai:write', 'dtDiemDmXepLoai:read');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/diem/xep-loai', app.permission.check('dtDiemDmXepLoai:read'), async (req, res) => {
        try {
            let items = await app.model.dtDiemDmXepLoai.getAll({});
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/xep-loai/active', app.permission.check('dtDiemDmXepLoai:read'), async (req, res) => {
        try {
            let items = await app.model.dtDiemDmXepLoai.getAll({ kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/xep-loai/item/:id', app.permission.check('dtDiemDmXepLoai:read'), async (req, res) => {
        try {
            let item = await app.model.dtDiemDmXepLoai.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/xep-loai', app.permission.check('dtDiemDmXepLoai:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let exist = await app.model.dtDiemDmXepLoai.get({ ten: data.ten });
            if (exist) {
                throw 'Đã tồn tại điểm xếp loại này rồi!';
            }
            await app.model.dtDiemDmXepLoai.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/diem/xep-loai', app.permission.check('dtDiemDmXepLoai:write'), async (req, res) => {
        try {
            let { changes, id } = req.body;
            await app.model.dtDiemDmXepLoai.update({ id }, changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

};
