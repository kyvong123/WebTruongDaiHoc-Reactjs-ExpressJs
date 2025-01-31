module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7111: {
                title: 'Tình trạng phòng', link: '/user/dao-tao/tinh-trang-phong', groupIndex: 1, parentKey: 7027
            }
        }
    };
    app.permission.add(
        { name: 'dmTinhTrangPhong:manage', menu },
        { name: 'dmTinhTrangPhong:write' },
        { name: 'dmTinhTrangPhong:delete' },
    );

    app.get('/user/dao-tao/tinh-trang-phong', app.permission.check('dmTinhTrangPhong:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/tinh-trang-phong/all', app.permission.orCheck('dmTinhTrangPhong:manage', 'staff:login'), async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm || '', kichHoat = req.query.kichHoat || '';
            let items = await app.model.dmTinhTrangPhong.getAll({
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

    app.get('/api/dt/tinh-trang-phong/item/:ma', app.permission.check('dmTinhTrangPhong:manage'), async (req, res) => {
        try {
            let item = await app.model.dmTinhTrangPhong.get({ id: req.params.ma, kichHoat: 1 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/tinh-trang-phong', app.permission.check('dmTinhTrangPhong:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const item = await app.model.dmTinhTrangPhong.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/tinh-trang-phong', app.permission.check('dmTinhTrangPhong:write'), async (req, res) => {
        try {
            let { data, ma } = req.body;
            const item = await app.model.dmTinhTrangPhong.update({ id: ma }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};