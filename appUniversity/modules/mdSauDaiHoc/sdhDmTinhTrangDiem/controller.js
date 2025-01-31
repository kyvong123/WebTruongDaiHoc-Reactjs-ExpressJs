module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7575: {
                title: 'Tình trạng điểm', link: '/user/sau-dai-hoc/tinh-trang-diem', parentKey: 7560
            }
        }
    };
    app.permission.add(
        { name: 'sdhDmTinhTrangDiem:manage', menu }, 'sdhDmTinhTrangDiem:write', 'sdhDmTinhTrangDiem:delete'
    );

    app.get('/user/sau-dai-hoc/tinh-trang-diem', app.permission.check('sdhDmTinhTrangDiem:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhDmTinhTrangDiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmTinhTrangDiem:manage', 'sdhDmTinhTrangDiem:write', 'sdhDmTinhTrangDiem:delete');
            resolve();
        } else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/dm-tinh-trang-diem/all', app.permission.check('sdhDmTinhTrangDiem:manage'), async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm || '', kichHoat = req.query.kichHoat || '';
            let items = await app.model.sdhDmTinhTrangDiem.getAll({
                statement: 'lower(ten) LIKE :searchTerm AND (:kichHoat IS NULL OR kichHoat = :kichHoat) ',
                parameter: {
                    searchTerm: `%${searchTerm}%`, kichHoat
                }
            }, '*', 'ma');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/dm-tinh-trang-diem/item/:ma', app.permission.check('sdhDmTinhTrangDiem:manage'), async (req, res) => {
        try {
            let item = await app.model.sdhDmTinhTrangDiem.get({ ma: req.params.ma, kichHoat: 1 });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/dm-tinh-trang-diem', app.permission.check('sdhDmTinhTrangDiem:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.sdhDmTinhTrangDiem.create(data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/dm-tinh-trang-diem', app.permission.check('sdhDmTinhTrangDiem:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.sdhDmTinhTrangDiem.update({ ma }, data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};