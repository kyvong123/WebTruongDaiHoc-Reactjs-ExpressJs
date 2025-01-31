module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7053: {
                title: 'Quản lý bảng điểm', link: '/user/dao-tao/grade-manage/all', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-leaf',
                parentKey: 7047
            },
        }
    };

    app.permission.add(
        { name: 'dtDiem:manage', menu },
        { name: 'dtDiem:write' },
        { name: 'dtDiem:delete' }, 'dtDiem:export'
    );
    app.get('/user/dao-tao/diem', app.permission.check('dtDiem:manage'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/all', app.permission.check('dtDiem:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiem:manage', 'dtDiem:write', 'dtDiem:delete', 'dtDiem:export');
            resolve();
        } else resolve();
    }));

    app.readyHooks.add('addSocketListener:ChangeMultiThanhPhanDiem', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ChangeMultiThanhPhanDiem', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtDiem:write')) {
                socket.join('ChangeMultiThanhPhanDiem');
            }
        }),
    });

    // API -------------------------------------------------------------------------------------------------------

    app.get('/api/dt/diem/page/:pageNumber/:pageSize', app.permission.orCheck('dtDiem:manage', 'dtDiemAll:read'), async (req, res) => {
        try {
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter || {},
                user = req.session.user;


            const roles = await app.model.dtAssignRole.getAll({
                statement: 'shcc = :shcc AND role LIKE :role',
                parameter: { shcc: user.shcc, role: '%dtBangDiem:manage%' }
            });

            if (roles.length && !user.permissions.includes('quanLyDaoTao:DaiHoc')) {
                filter.listKhoaSinhVienFilter = [...new Set(roles.flatMap(i => i.khoaSinhVien.split(',')))].toString();
                filter.listHeFilter = [...new Set(roles.flatMap(i => i.loaiHinhDaoTao.split(',')))].toString();
            }

            if (!Number(user.isPhongDaoTao)) {
                filter.donViFilter = user.maDonVi;
            }

            if (!filter.sortMode) filter.sortMode = 'ASC';
            filter = JSON.stringify({ ...filter });
            let page = await app.model.dtDiemConfigHocPhan.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, filter: JSON.parse(filter), list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem', app.permission.check('dtDiem:manage'), async (req, res) => {
        app.model.dtDiem.getAll({}, '*', 'id ASC', (error, items) => res.send({ error, items }));
    });

    app.post('/api/dt/diem/multi/hinh-thuc-thi', app.permission.check('dtDiem:write'), async (req, res) => {
        try {
            let { dataHT, dataHP } = req.body;
            for (let item of dataHP) {
                let { maHocPhan, maMonHoc, tpDiem } = item;

                await app.model.dtHocPhanHinhThucThi.delete({ maMonHoc, maHocPhan });
                for (let tp in tpDiem) {
                    if (dataHT[tp] && dataHT[tp].length) {
                        for (let ht of dataHT[tp]) {
                            await app.model.dtHocPhanHinhThucThi.create({
                                userModified: req.session.user.email, timeModified: Date.now(),
                                loaiThanhPhan: tp, hinhThucThi: ht, maMonHoc, maHocPhan
                            });
                        }
                    }
                }
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/dt-diem/export-student-pdf/:mssv', app.permission.check('dtDiem:export'), async (req, res) => {
        try {
            const data = await app.model.dtDiem.generatePdfScoreFile(req.params.mssv);
            res.download(data.filePdfPath, `SCORE_DATA_${req.params.mssv}.pdf`);
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem', app.permission.check('dtDiem:write'), async (req, res) => {
        try {
            let data = req.body.data;
            let { maHocPhan, mssv, maMonHoc, namHoc, hocKy } = data;
            let item = await app.model.dtDiem.get({ maHocPhan, maMonHoc, mssv, namHoc, hocKy });

            if (item) {
                await app.model.dtDiem.update({ id: item.id }, data);
            } else {
                await app.model.dtDiem.create({ ...data, isLock: 0 });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/import-excel', app.permission.check('dtDiem:write'), async (req, res) => {
        try {
            let data = req.body.data, user = req.session.user;
            for (let diem of data) {
                let { maHocPhan, mssv, maMonHoc, namHoc, hocKy } = diem;
                let item = await app.model.dtDiem.get({ maHocPhan, maMonHoc, mssv, namHoc, hocKy });
                if (item) {
                    await app.model.dtDiem.update({ id: item.id }, diem);
                } else {
                    await app.model.dtDiem.create({ ...diem, isLock: 0 });
                }
                await app.model.dtDiemHistoryLock.create({
                    userModified: `${user.lastName} ${user.firstName}`,
                    timeModified: Date.now(),
                    namHoc, hocKy, mssv, maHocPhan,
                    thaoTac: diem.isLock ? 'Khoá điểm sinh viên' : 'Cập nhật điểm sinh viên'
                });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/diem/tinh-trang', app.permission.check('dtDiem:write'), async (req, res) => {
        try {
            let { listHP, changes } = req.body;
            await app.model.dtThoiKhoaBieu.update({
                statement: 'maHocPhan IN (:listHP)',
                parameter: { listHP }
            }, { tinhTrangDiem: changes.tinhTrangDiem });

            let fullDataDotDk = (await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id', 'ngayBatDau')).map(item => item.id);
            if (fullDataDotDk.length) {
                let listMssv = await app.model.dtDangKyHocPhan.getAll({
                    statement: 'maHocPhan IN (:listHP)',
                    parameter: { listHP },
                }, 'mssv');
                listMssv = [...new Set(listMssv.map(i => i.mssv))];
                listMssv.forEach(i => app.dkhpRedis.initDiemStudent(i));
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/diem/thanh-phan-multi', app.permission.check('dtDiem:write'), async (req, res) => {
        try {
            let { listHP, listDiem } = req.body, modifier = req.session.user.email, lastModified = Date.now();

            await Promise.all(listHP.map(async hp => {
                let { maHocPhan, maMonHoc, namHoc, hocKy } = hp;
                await app.model.dtDiemConfigHocPhan.delete({ maHocPhan, maMonHoc });
                for (let tp of listDiem) {
                    let { loaiThanhPhan, phanTram, loaiLamTron } = tp;
                    await app.model.dtDiemConfigHocPhan.create({ maHocPhan, maMonHoc, loaiThanhPhan, phanTram, loaiLamTron, modifier, lastModified });
                }
                await app.model.dtAssignRoleNhapDiem.updateThanhPhan({ maHocPhan, maMonHoc, namHoc, hocKy, modifier, lastModified });
            }));

            res.send();
        } catch (error) {
            res.send({ error });
        }
    });

    // Schedule
    app.readyHooks.add('dtDiemTrungBinh:ScheduleCalculate', {
        ready: () => app.database && app.model,
        run: () => {
            app.primaryWorker && app.appName == 'mdDaoTaoService' && app.schedule('0 23 * * *', async () => {
                try {
                    console.info('dtDiemTrungBinh:ScheduleCalculate is starting');
                    const historyChange = await app.model.dtDiemHistory.getChange(app.utils.stringify({
                        timeStart: new Date().setHours(0, 0, 0, 0),
                        timeEnd: new Date().setHours(23, 59, 59, 999)
                    }));

                    const chunks = historyChange.rows.chunk(100);
                    for (const chunk of chunks) {
                        await Promise.allSettled(chunk.map(async change => {
                            try {
                                const { mssv, namHoc, hocKy } = change;
                                await app.model.dtDiemAll.diemTrungBinh({ mssv, namHoc, hocKy, isSchedule: 1 });
                                console.log(`Calculate diem trung binh sv ${mssv} done`);
                            } catch (error) {
                                console.error({ error });
                            }
                        }));
                    }
                } catch (error) {
                    console.error('dtDiemTrungBinh:ScheduleCalculate', error);
                }
            });
        },
    });
};

