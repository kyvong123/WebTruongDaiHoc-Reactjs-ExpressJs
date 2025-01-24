module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4007: { title: 'Giờ học', link: '/user/category/ca-hoc' },
        },
    };
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7010: { title: 'Giờ học', link: '/user/dao-tao/ca-hoc', groupIndex: 2, parentKey: 7027 },
        },
    };
    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7573: { title: 'Giờ học', link: '/user/sau-dai-hoc/ca-hoc', parentKey: 7570 },
        },
    };
    app.permission.add(
        { name: 'dmCaHoc:read', menu },
        { name: 'dtCaHoc:read', menu: menuDaoTao },
        { name: 'sdhCaHoc:read', menu: menuSdh },
        { name: 'dmCaHoc:write' },
        { name: 'dmCaHoc:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesCaHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtCaHoc:read', 'dmCaHoc:write', 'dmCaHoc:delete');
            resolve();
        } else resolve();
    }));



    app.get('/user/category/ca-hoc', app.permission.check('dmCaHoc:read'), app.templates.admin);
    app.get('/user/dao-tao/ca-hoc', app.permission.check('dtCaHoc:read'), app.templates.admin);
    app.get('/user/sau-dai-hoc/ca-hoc', app.permission.check('sdhCaHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ca-hoc/page/:pageNumber/:pageSize', app.permission.orCheck('dmCaHoc:read', 'dtCaHoc:read', 'sdhCaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmCaHoc.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/ca-hoc/all', app.permission.orCheck('dmCaHoc:read', 'dtCaHoc:read', 'staff:login', 'staff:teacher'), (req, res) => {
        app.model.dmCaHoc.getAll({}, '*', 'maCoSo,thoiGianBatDau', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ca-hoc/all-condition', app.permission.orCheck('staff:teacher', 'dmCaHoc:read', 'dtCaHoc:read', 'sdhCaHoc:read'), async (req, res) => {
        try {
            let maCoSo = req.query.maCoSo || '';
            if (!maCoSo) {
                throw 'Vui lòng chọn cơ sở!';
            }
            let items = await app.model.dmCaHoc.getAll({ maCoSo, kichHoat: 1 }, '*', 'TO_NUMBER(ten)');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/danh-muc/ca-hoc/filter', app.permission.orCheck('dmCaHoc:read', 'dtCaHoc:read', 'sdhCaHoc:read'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query;
            let statement = '', parameter = {}, dataCaHoc = [];
            let { namHoc, hocKy, coSo, thu, phong, ngayBatDau, ngayKetThuc } = filter;
            if (!coSo) throw 'Khồng tìm thấy cơ sở';

            dataCaHoc = await app.model.dmCaHoc.getAll({ kichHoat: 1, maCoSo: coSo }, '*', 'TO_NUMBER(ten)');

            if (!(ngayBatDau && ngayKetThuc && phong)) {
                res.send({ dataCaHoc });
            } else {
                statement += 'namHoc = :namHoc AND hocKy = :hocKy';
                parameter.namHoc = namHoc;
                parameter.hocKy = hocKy;
                statement += ' AND coSo = :coSo';
                parameter.coSo = coSo;

                if (filter.id) {
                    statement += ' AND id != :id';
                    parameter.id = filter.id;
                }

                statement += ' AND (ngayBatDau BETWEEN :ngayBatDau AND :ngayKetThuc OR ngayKetThuc BETWEEN :ngayBatDau AND :ngayKetThuc)';
                parameter.ngayBatDau = parseInt(ngayBatDau);
                parameter.ngayKetThuc = parseInt(ngayKetThuc);
                if (thu) {
                    statement += ' AND thu = :thu ';
                    parameter.thu = thu;
                }
                if (phong) {
                    statement += 'AND phong = :phong ';
                    parameter.phong = phong;
                }
                // if (tietBatDau && soTietBuoi) {
                //     statement += ' AND NOT (:tietBatDau BETWEEN tietBatDau AND (tietBatDau + soTietBuoi - 1) OR (:tietBatDau + :soTietBuoi - 1) BETWEEN tietBatDau AND (tietBatDau + soTietBuoi - 1)) ';
                //     parameter.tietBatDau = parseInt(tietBatDau);
                //     parameter.soTietBuoi = parseInt(soTietBuoi);
                // }
                let tkbHienTai = await app.model.dtThoiKhoaBieu.getAll({ statement, parameter }, 'maHocPhan,tietBatDau,soTietBuoi');
                const dataTietHienTai = [];
                for (let hocPhan of tkbHienTai) {
                    let { tietBatDau, soTietBuoi } = hocPhan;
                    for (let i = 1; i <= soTietBuoi; i++) {
                        dataTietHienTai.push(tietBatDau);
                        tietBatDau++;
                    }
                }
                dataCaHoc = dataCaHoc.filter(item => ![...new Set(dataTietHienTai)].includes(parseInt(item.ten)) && item.ten.toLowerCase().includes((searchTerm || '').toLowerCase()));

                res.send({ dataCaHoc: dataCaHoc.sort((a, b) => parseInt(a.ten) - parseInt(b.ten)) });
            }
        } catch (error) {
            console.log(error);
            res.send({ error });
        }

    });

    app.get('/api/danh-muc/ca-hoc/item/:ten', app.permission.orCheck('staff:teacher', 'dmCaHoc:read', 'dtCaHoc:read', 'staff:login', 'sdhCaHoc:read'), (req, res) => {
        app.model.dmCaHoc.get({ ten: req.params.ten }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:write'), (req, res) => {
        app.model.dmCaHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmCaHoc.update({ ma: req.body._id }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:delete'), (req, res) => {
        app.model.dmCaHoc.delete({ ma: req.body._id }, error => res.send({ error }));
    });
};