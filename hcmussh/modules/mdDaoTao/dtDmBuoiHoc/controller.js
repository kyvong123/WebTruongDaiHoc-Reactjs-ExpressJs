module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7022: {
                title: 'Buổi học', groupIndex: 2,
                link: '/user/dao-tao/buoi-hoc', parentKey: 7027
            },
        },
    };
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            71514: {
                title: 'Buổi học',
                link: '/user/sau-dai-hoc/buoi-hoc', parentKey: 7570
            },
        },
    };

    app.permission.add(
        { name: 'dtDmBuoiHoc:manage', menu },
        { name: 'dtDmBuoiHoc:write' },
        { name: 'dtDmBuoiHoc:delete' },
        { name: 'sdhDmBuoiHoc:read', menu: menuSdh }
    );

    app.permissionHooks.add('staff', 'addRolesDtDmBuoiHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmBuoiHoc:manage', 'dtDmBuoiHoc:write');
            resolve();
        }
        else if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmBuoiHoc:read');
            resolve();
        }
        else resolve();
    }));


    app.get('/user/dao-tao/buoi-hoc', app.permission.check('dtDmBuoiHoc:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/buoi-hoc', app.permission.check('sdhDmBuoiHoc:read'), app.templates.admin);

    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/buoi-hoc/all', app.permission.orCheck('dtDmBuoiHoc:manage', 'sdhDmBuoiHoc:read'), async (req, res) => {
        try {
            let kichHoat = req.query.kichHoat;
            let condition = kichHoat ? { kichHoat: 1 } : {};
            let items = await app.model.dtDmBuoiHoc.getAll(condition, '*', 'id asc');
            let listLoaiHinh = await app.model.dmSvLoaiHinhDaoTao.getAll({}, 'ma,ten');
            let loaiHinhMapper = {};
            listLoaiHinh.forEach(loaiHinh => {
                loaiHinhMapper[loaiHinh.ma] = loaiHinh.ten;
            });
            items.forEach(item => {
                if (item.loaiHinh) {
                    let loaiHinh = item.loaiHinh.split(',');
                    item.tenLoaiHinh = loaiHinh.map(item => loaiHinhMapper[item]);
                }
            });
            res.send({ items });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/buoi-hoc', app.permission.check('dtDmBuoiHoc:write'), (req, res) => {
        app.model.dtDmBuoiHoc.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dt/buoi-hoc', app.permission.check('dtDmBuoiHoc:delete'), (req, res) => {
        app.model.dtDmBuoiHoc.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.put('/api/dt/buoi-hoc', app.permission.check('dtDmBuoiHoc:write'), (req, res) => {
        let changes = req.body.changes;
        app.model.dtDmBuoiHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });

    app.get('/api/dt/buoi-hoc/item/:id', app.permission.orCheck('dtDmBuoiHoc:manage', 'sdhDmBuoiHoc:read'), async (req, res) => {
        try {
            let item = await app.model.dtDmBuoiHoc.get({ id: req.params.id }, '*', 'id asc');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};
