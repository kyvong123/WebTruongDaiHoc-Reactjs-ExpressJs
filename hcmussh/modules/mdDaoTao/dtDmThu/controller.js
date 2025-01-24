module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7023: {
                title: 'Thứ', groupIndex: 2,
                link: '/user/dao-tao/thu', parentKey: 7027
            },
        },
    };
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7512: {
                title: 'Thứ',
                link: '/user/sau-dai-hoc/thu', parentKey: 7570
            },
        },
    };

    app.permission.add(
        { name: 'dtDmThu:manage', menu },
        { name: 'sdhDmThu:read', menu: menuSdh },
        { name: 'dtDmThu:write' },
        { name: 'dtDmThu:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDtDmThu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmThu:manage', 'dtDmThu:write', 'dtDmThu:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/thu', app.permission.check('dtDmThu:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/thu', app.permission.check('sdhDmThu:read'), app.templates.admin);

    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/thu/all', app.permission.orCheck('dtDmThu:manage', 'staff:login', 'sdhDmThu:read'), (req, res) => {
        app.model.dtDmThu.getAll({}, '*', '', (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/dt/thu/filter', app.permission.check('dtThoiKhoaBieu:write', 'sdhDmThu:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            let statement = '', parameter = {};
            let { namHoc, hocKy, coSo, tietBatDau, soTietBuoi, phong, ngayBatDau, ngayKetThuc } = filter;
            let dataThu = await app.model.dtDmThu.getAll({ kichHoat: 1 }, 'ma,ten');
            if (ngayBatDau && ngayKetThuc && phong) {
                statement += 'namHoc = :namHoc AND hocKy = :hocKy';
                parameter.namHoc = namHoc;
                parameter.hocKy = hocKy;

                statement += ' AND (ngayBatDau BETWEEN :ngayBatDau AND :ngayKetThuc OR ngayKetThuc BETWEEN :ngayBatDau AND :ngayKetThuc) ';
                parameter.ngayBatDau = parseInt(ngayBatDau);
                parameter.ngayKetThuc = parseInt(ngayKetThuc);

                statement += ' AND phong = :phong ';
                parameter.phong = phong;
                if (filter.id) {
                    statement += ' AND id != :id';
                    parameter.id = filter.id;
                }
                if (tietBatDau && soTietBuoi) {
                    statement += ' AND (:tietBatDau BETWEEN tietBatDau AND (tietBatDau + soTietBuoi - 1) OR (:tietBatDau + :soTietBuoi - 1) BETWEEN tietBatDau AND (tietBatDau + soTietBuoi - 1)) ';
                    parameter.tietBatDau = parseInt(tietBatDau);
                    parameter.soTietBuoi = parseInt(soTietBuoi);
                }
                if (coSo) {
                    statement += ' AND coSo = :coSo ';
                    parameter.coSo = coSo;
                }
                let tkbHienTai = await app.model.dtThoiKhoaBieu.getAll({ statement, parameter }, 'thu');

                tkbHienTai = tkbHienTai.map(item => item.thu);
                dataThu = dataThu.filter(item => !tkbHienTai.includes(item.ma));
            }
            res.send({ dataThu });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thu/item/:ma', app.permission.orCheck('staff:teacher', 'dtDmThu:manage', 'staff:login', 'sdhDmThu:read'), (req, res) => {
        app.model.dtDmThu.get({ ma: req.params.ma }, '*', '', (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/dt/thu', app.permission.check('dtDmThu:write'), (req, res) => {
        app.model.dtDmThu.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dt/thu', app.permission.check('dtDmThu:delete'), (req, res) => {
        app.model.dtDmThu.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.put('/api/dt/thu', app.permission.check('dtDmThu:write'), (req, res) => {
        app.model.dtDmThu.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });
};
