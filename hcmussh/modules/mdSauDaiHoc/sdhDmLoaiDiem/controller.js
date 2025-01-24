module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7516: {
                title: 'Loại điểm',
                link: '/user/sau-dai-hoc/loai-diem',
                parentKey: 7560
            },
        },
    };

    app.permission.add(
        { name: 'sdhDmLoaiDiem:manage', menu },
        { name: 'sdhDmLoaiDiem:write' },
        { name: 'sdhDmLoaiDiem:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesdhDmLoaiDiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmLoaiDiem:manage', 'sdhDmLoaiDiem:write', 'sdhDmLoaiDiem:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/loai-diem', app.permission.orCheck('sdhDmLoaiDiem:manage'), app.templates.admin);

    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/loai-diem/all', app.permission.check('sdhDmLoaiDiem:manage'), (req, res) => {
        app.model.sdhDmLoaiDiem.getAll({}, '*', 'ma', (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/sdh/loai-diem/item/:ma', app.permission.check('sdhDmLoaiDiem:manage'), (req, res) => {
        app.model.sdhDmLoaiDiem.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sdh/loai-diem', app.permission.orCheck('sdhDmLoaiDiem:write', 'sdhDmLoaiDiem:manage'), (req, res) => {
        app.model.sdhDmLoaiDiem.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sdh/loai-diem', app.permission.orCheck('sdhDmLoaiDiem:delete', 'sdhDmLoaiDiem:manage'), (req, res) => {
        app.model.sdhDmLoaiDiem.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.put('/api/sdh/loai-diem', app.permission.orCheck('sdhDmLoaiDiem:write', 'sdhDmLoaiDiem:manage'), (req, res) => {
        app.model.sdhDmLoaiDiem.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });
    app.get('/api/sdh/loai-diem/is-thi', app.permission.check('sdhDmLoaiDiem:manage'), (req, res) => {
        app.model.sdhDmLoaiDiem.getAll({ isThi: 1, kichHoat: 1 }, '*', 'ma', (error, items) => {
            res.send({ error, items });
        });
    });
};
