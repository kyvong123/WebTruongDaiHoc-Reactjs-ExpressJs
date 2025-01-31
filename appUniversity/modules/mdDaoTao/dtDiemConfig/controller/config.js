module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7052: {
                title: 'Cấu hình', link: '/user/dao-tao/grade-manage/setting', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-cogs',
                parentKey: 7047
            },
        }
    };
    app.permission.add(
        { name: 'dtDiemConfig:read', menu }, 'dtDiemConfig:write', 'dtDiemConfig:delete'
    );

    app.permissionHooks.add('staff', 'addRoleDtDiemConfig', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemConfig:write', 'dtDiemConfig:read', 'dtDiemConfig:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/grade-manage/setting', app.permission.check('dtDiemConfig:read'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/setting/:idSemester', app.permission.check('dtDiemConfig:read'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/import', app.permission.check('dtDiemConfig:read'), app.templates.admin);
    // app.get('/user/dao-tao/grade-manage/export', app.permission.check('dtDiemConfig:read'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/data/import', app.permission.check('dtDiemConfig:read'), app.templates.admin);

    app.get('/api/dt/diem/semester-config', app.permission.check('dtDiemConfig:read'), async (req, res) => {
        try {
            let semester = await app.model.dtDiemSemester.getAll({}, '*', 'namHoc desc, hocKy desc');
            semester = await Promise.all(semester.map(async ({ namHoc, hocKy, id }) => {
                const { rows } = await app.model.dtDiemConfig.getConfigBySemester(app.utils.stringify({ idSemester: id }));
                return ({ namHoc, hocKy, idSemester: id, configThanhPhan: rows[0].configThanhPhan, configQuyChe: rows[0].configQuyChe });
            }));
            res.send({ semester });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/semester-config/filter', app.permission.check('dtDiemConfig:read'), async (req, res) => {
        try {
            let { filter } = req.query,
                { namHoc, hocKy } = filter;
            let items = await app.model.dtDiemConfig.getAll({ namHoc, hocKy });

            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/diem-config/hoc-phan', app.permission.orCheck('dtDiemConfig:read', 'staff:login', 'staff:teacher'), async (req, res) => {
        try {
            let { filter } = req.query;
            let [items, countDiem] = await Promise.all([
                app.model.dtDiemConfig.getData(app.utils.stringify(filter)),
                app.model.dtDiemAll.count({
                    statement: 'maMonHoc = :maMonHoc AND maHocPhan = :maHocPhan AND namHoc = :namHoc AND hocKy = :hocKy AND diem IS NOT NULL',
                    parameter: filter
                })
            ]);
            res.send({
                timeNow: Date.now(), dataConfig: items.rows[0], dataConfigQuyChe: items.dataconfigquyche, dataConfigMonHoc: items.dataconfigmonhoc,
                dataConfigHocPhan: items.dataconfighocphan, dataConfigThanhPhan: items.dataconfigthanhphan, countDiem: countDiem.rows[0]['COUNT(*)'],
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/semester/active', app.permission.check('dtDiemConfig:read'), async (req, res) => {
        try {
            let diemConfig = await app.model.dtDiemConfig.get({ active: 1 }, '*');
            res.send({ diemConfig, timeNow: Date.now() });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/config-time-hoc-phan', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            const data = req.body.data, { maHocPhan, maMonHoc, tpDiem = {} } = data;
            data.userModified = req.session.user.email;
            data.timeModified = Date.now();
            let exist = await app.model.dtDiemConfigTimeHocPhan.get({ maHocPhan });
            if (exist) {
                await app.model.dtDiemConfigTimeHocPhan.update({ id: exist.id }, { ...data });
            } else {
                await app.model.dtDiemConfigTimeHocPhan.create({ ...data });
            }

            await app.model.dtHocPhanHinhThucThi.delete({ maMonHoc, maHocPhan });
            for (let tp in tpDiem) {
                if (data[tp] && data[tp].length) {
                    for (let ht of data[tp]) {
                        await app.model.dtHocPhanHinhThucThi.create({
                            userModified: req.session.user.email, timeModified: Date.now(),
                            loaiThanhPhan: tp, hinhThucThi: ht, maMonHoc, maHocPhan
                        });
                    }
                }
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/semester-config', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            const data = req.body.data;
            data.userModified = req.session.user.email;
            data.timeModified = Date.now();
            let exist = await app.model.dtDiemConfig.get({ namHoc: data.namHoc, hocKy: data.hocKy, loaiHinhDaoTao: data.loaiHinhDaoTao });
            if (exist) {
                await app.model.dtDiemConfig.update({ id: exist.id }, { ...data });
            } else {
                await app.model.dtDiemConfig.create({ ...data });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/clone-config', app.permission.check('dtDiemConfig:write'), async (req, res) => {
        try {
            let data = req.body.data, { idSemester, namHoc, hocKy, configQuyChe, configThanhPhan } = data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            configQuyChe = configQuyChe ? app.utils.parse(configQuyChe) : [];
            configThanhPhan = configThanhPhan ? app.utils.parse(configThanhPhan) : [];

            await app.model.dtDiemConfigQuyChe.delete({ idSemester });
            await app.model.dtDiemConfigThanhPhan.delete({ idSemester });

            for (let qc of configQuyChe) {
                await app.model.dtDiemConfigQuyChe.create({ idSemester, namHoc, hocKy, ...qc, timeModified, modifier: userModified });
            }

            for (let tp of configThanhPhan) {
                await app.model.dtDiemConfigThanhPhan.create({ idSemester, namHoc, hocKy, ...tp, timeModified, userModified });
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/time-config-multiple', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { listMaHocPhan, thoiGianBatDauNhap, thoiGianKetThucNhap } = req.body.data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            await Promise.all(listMaHocPhan.map(async maHocPhan => {
                let exist = await app.model.dtDiemConfigTimeHocPhan.get({ maHocPhan });
                if (exist) {
                    await app.model.dtDiemConfigTimeHocPhan.update({ id: exist.id }, { thoiGianBatDauNhap, thoiGianKetThucNhap, userModified, timeModified });
                } else {
                    await app.model.dtDiemConfigTimeHocPhan.create({ maHocPhan, thoiGianBatDauNhap, thoiGianKetThucNhap, userModified, timeModified });
                }
            }));

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/config-thanh-phan', app.permission.orCheck('dtDiemConfig:read', 'dtThoiKhoaBieu:read'), async (req, res) => {
        try {
            const { namHoc, hocKy } = req.query.filter;
            const data = await app.model.dtDiemConfigThanhPhan.getAll({ namHoc, hocKy });
            res.send({ data });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
