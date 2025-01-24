module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7057: {
                title: 'Tình trạng điểm', link: '/user/dao-tao/tinh-trang-diem', groupIndex: 1, parentKey: 7047
            }
        }
    };
    app.permission.add(
        { name: 'dtDiemDmTinhTrang:manage', menu },
        { name: 'dtDiemDmTinhTrang:write' },
        { name: 'dtDiemDmTinhTrang:delete' },
    );

    app.get('/user/dao-tao/tinh-trang-diem', app.permission.check('dtDiemDmTinhTrang:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesdtDiemDmTinhTrang', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemDmTinhTrang:manage', 'dtDiemDmTinhTrang:write', 'dtDiemDmTinhTrang:delete');
            resolve();
        } else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/diem-dm-tinh-trang/all', app.permission.orCheck('dtDiemDmTinhTrang:manage', 'staff:login'), async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm || '', kichHoat = req.query.kichHoat || '';
            let items = await app.model.dtDiemDmTinhTrang.getAll({
                statement: 'lower(ten) LIKE :searchTerm AND (:kichHoat IS NULL OR kichHoat = :kichHoat) ',
                parameter: {
                    searchTerm: `%${searchTerm}%`, kichHoat
                }
            }, '*', 'ten');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-dm-tinh-trang/item/:ma', app.permission.check('dtDiemDmTinhTrang:manage'), async (req, res) => {
        try {
            let item = await app.model.dtDiemDmTinhTrang.get({ ma: req.params.ma, kichHoat: 1 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-dm-tinh-trang', app.permission.check('dtDiemDmTinhTrang:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.dtDiemDmTinhTrang.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/diem-dm-tinh-trang', app.permission.check('dtDiemDmTinhTrang:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.dtDiemDmTinhTrang.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};