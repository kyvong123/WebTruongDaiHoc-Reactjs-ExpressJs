module.exports = app => {
    const beautify = require('json-beautify');

    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7058: {
                title: 'Quản lý nhập điểm', link: '/user/dao-tao/grade-manage/nhap-diem', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-pencil-square',
                parentKey: 7047
            },
        }
    };
    app.permission.add(
        { name: 'dtDiemAll:read', menu }, 'dtDiemAll:write', 'dtDiemAll:delete', 'dtDiemAll:export'
    );

    app.permissionHooks.add('staff', 'addRoleDtDiemAll', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemAll:read', 'dtDiemAll:write', 'dtDiemAll:delete', 'dtDiemAll:export');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/grade-manage/nhap-diem', app.permission.check('dtDiemAll:read'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/nhap-diem/:maHocPhan', app.permission.check('dtDiemAll:read'), app.templates.admin);


    // API---------------------------------
    app.get('/api/dt/diem-all/get-data-diem', app.permission.orCheck('dtDiemAll:read', 'dtDiemHoan:write'), async (req, res) => {
        try {
            let { filter } = req.query;
            let items = await app.model.dtDiemAll.getDataDiem(app.utils.stringify(filter));
            res.send({ items: items.rows.filter(i => i.isMienDiem != 1) });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-all/import/download-template', app.permission.check('dtDiemAll:export'), async (req, res) => {
        let { dataLoaiDiem } = req.query;
        dataLoaiDiem = JSON.parse(dataLoaiDiem);

        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Diem');
        const defaultColumns = [
            { header: 'Mssv', key: 'mssv', width: 20 },
            { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
            { header: 'Loại hình đào tạo', key: 'loaiHinhDaoTao', width: 20 },
            ...dataLoaiDiem.map(i => ({ header: i.ten, key: i.ma, width: 20 })),
            { header: 'Ghi chú', key: 'ghiChu', width: 20 }
        ];
        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = '2222DAI048';
        ws.getCell('C2').value = '2';
        app.excel.attachment(workBook, res, 'ImportDiem.xlsx');
    });

    app.post('/api/dt/diem-all/nhap-diem-sinh-vien', app.permission.check('dtDiemAll:write'), async (req, res) => {
        try {
            let { changes } = req.body,
                { diemDacBiet, tpDiem, ghiChu, data } = JSON.parse(changes),
                userModified = req.session.user.email,
                timeModified = Date.now();

            for (let tp of tpDiem) {
                let isExist = await app.model.dtDiemAll.get({ ...data, loaiDiem: tp.thanhPhan });
                if (isExist) {
                    await app.model.dtDiemAll.update({ ...data, loaiDiem: tp.thanhPhan }, { diem: diemDacBiet[tp.thanhPhan] ? 0 : isExist.diem, diemDacBiet: diemDacBiet[tp.thanhPhan] || '' });
                } else {
                    await app.model.dtDiemAll.create({ ...data, loaiDiem: tp.thanhPhan, phanTramDiem: tp.phanTram, diemDacBiet: diemDacBiet[tp.thanhPhan] });
                }

                if (isExist.diemDacBiet != diemDacBiet[tp.thanhPhan]) {
                    await app.model.dtDiemHistory.create({
                        userModified, timeModified, ...data, phanTramDiem: tp.phanTram,
                        oldDiem: '', newDiem: '', loaiDiem: tp.thanhPhan,
                        diemDacBiet: diemDacBiet[tp.thanhPhan], hinhThucGhi: 2
                    });
                }
            }

            let diemTp = await app.model.dtDiemAll.getAll({
                statement: 'mssv = :mssv AND maHocPhan = :maHocPhan AND loaiDiem != :loaiDiem',
                parameter: {
                    mssv: data.mssv, maHocPhan: data.maHocPhan, loaiDiem: 'TK'
                }
            }, 'diem,phanTramDiem');
            if (diemTp.length) {
                let sum = diemTp.reduce((prev, cur) => prev + Number(cur.diem) * Number(cur.phanTramDiem) / 100, 0);
                sum = Math.round(sum * (10 / 5)) / (10 / 5);
                let isTongKet = await app.model.dtDiemAll.get({ ...data, loaiDiem: 'TK' });
                if (isTongKet) {
                    await app.model.dtDiemAll.update({ ...data, loaiDiem: 'TK' }, { diem: sum });
                } else {
                    await app.model.dtDiemAll.create({
                        ...data,
                        loaiDiem: 'TK', phanTramDiem: '',
                        diemDacBiet: '', diem: sum
                    });
                }
            }
            if (ghiChu) {
                await app.model.dtDiemGhiChu.delete({ ...data });
                await app.model.dtDiemGhiChu.create({ ...data, ghiChu, userModified, timeModified });
            }
            app.dkhpRedis.initDiemStudent(data.mssv);

            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-all/nhap-diem', app.permission.orCheck('dtDiemAll:write', 'dtDiemHoan:write'), async (req, res) => {
        try {
            let { condition, dataHocPhan } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now(),
                { mssv, namHoc, hocKy } = condition,
                isLock = 1,
                timeLock = timeModified;

            dataHocPhan = JSON.parse(dataHocPhan);
            for (let hocPhan of dataHocPhan) {
                let { maHocPhan, maMonHoc, diem, diemDacBiet, ghiChu, khongTinhPhi } = hocPhan,
                    tpDiem = hocPhan.tpHocPhan || hocPhan.tpMonHoc || hocPhan.configDefault;
                diem = diem ? JSON.parse(diem) : { GK: '', CK: '', TK: '' };
                diemDacBiet = diemDacBiet ? JSON.parse(diemDacBiet) : { GK: '', CK: '', TK: '' };
                ghiChu = ghiChu ?? '';
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];
                for (let tp of tpDiem) {
                    const diemSv = diem[tp.thanhPhan] ?? '';
                    let isExist = await app.model.dtDiemAll.get({ ...condition, maHocPhan, loaiDiem: tp.thanhPhan }), oldDiem = '';
                    if (isExist || !(diemSv == '' || diemSv == null)) {
                        if (isExist) {
                            oldDiem = (isExist.diemDacBiet || isExist.diem) ?? '';
                            await app.model.dtDiemAll.update({ ...condition, maHocPhan, loaiDiem: tp.thanhPhan }, { diem: diemSv, diemDacBiet: diemDacBiet[tp.thanhPhan] || '', isLock, timeLock });
                        } else {
                            await app.model.dtDiemAll.create({
                                ...condition, maHocPhan, maMonHoc,
                                diem: diemSv, diemDacBiet: diemDacBiet[tp.thanhPhan] || '',
                                loaiDiem: tp.thanhPhan, phanTramDiem: tp.phanTram, isLock, timeLock,
                            });
                        }

                        if (oldDiem != (diemDacBiet[tp.thanhPhan] || diemSv)) {
                            await app.model.dtDiemHistory.create({
                                userModified, timeModified, ...condition,
                                maHocPhan, maMonHoc, loaiDiem: tp.thanhPhan, phanTramDiem: tp.phanTram,
                                oldDiem, newDiem: diemSv,
                                diemDacBiet: diemDacBiet[tp.thanhPhan] ?? '', hinhThucGhi: 2
                            });
                        }
                    }
                }
                let isTongKet = await app.model.dtDiemAll.get({ ...condition, maHocPhan, loaiDiem: 'TK' });
                if (isTongKet || !(diem['TK'] == '' || diem['TK'] == null)) {
                    if (isTongKet) {
                        await app.model.dtDiemAll.update({ ...condition, maHocPhan, loaiDiem: 'TK' }, { diem: diem['TK'] ?? '', diemDacBiet: diemDacBiet['TK'] || '' });
                    } else {
                        await app.model.dtDiemAll.create({
                            ...condition, maHocPhan, maMonHoc,
                            loaiDiem: 'TK', phanTramDiem: '',
                            diemDacBiet: diemDacBiet['TK'] ?? '', diem: diem['TK'] || ''
                        });
                    }
                }

                let ghiChuExist = await app.model.dtDiemGhiChu.get({ mssv: condition.mssv, maHocPhan });
                if (ghiChuExist) {
                    await app.model.dtDiemGhiChu.update({ mssv: condition.mssv, maHocPhan }, { ghiChu, userModified, timeModified });
                } else {
                    await app.model.dtDiemGhiChu.create({ mssv: condition.mssv, maHocPhan, ghiChu, userModified, timeModified });
                }

                if (Number(khongTinhPhi)) {
                    await app.model.dtDangKyHocPhan.update({ mssv, maHocPhan }, { tinhPhi: 0 });
                    await app.model.tcDotDong.dongBoHocPhi(parseInt(namHoc), hocKy, mssv, null, null, 1);
                }
            }
            app.dkhpRedis.initDiemStudent(condition.mssv);
            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/lich-su-nhap-diem', app.permission.check('dtDiemAll:read'), async (req, res) => {
        try {
            let { mssv, maHocPhan } = req.query;
            let items = await app.model.dtDiemHistory.getAll({ mssv, maHocPhan }, '*', 'timeModified DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-all/save-import', app.permission.check('dtDiemAll:write'), async (req, res) => {
        try {
            let { dataDiem, config } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now(),
                listError = [];
            dataDiem = JSON.parse(dataDiem);
            const size = dataDiem.length;
            res.end();
            try {
                let index = 0;
                for (let data of dataDiem) {
                    const { mssv, maHocPhan, namHoc, hocKy, maMonHoc } = data,
                        isLock = 1,
                        timeLock = timeModified;

                    const [isDangKy, hp] = await Promise.all([
                        app.model.dtDangKyHocPhan.get({ mssv, maHocPhan, namHoc, hocKy }),
                        app.model.dtThoiKhoaBieu.get({ maHocPhan }, 'tinhTrangDiem'),
                    ]);
                    if (!isDangKy) {
                        listError.push({ mssv, maHocPhan, ghiChu: 'Sinh viên không đăng ký học phần' });
                        continue;
                    } else if (hp && hp.tinhTrangDiem == 4) {
                        listError.push({ mssv, maHocPhan, ghiChu: 'Học phần bị khóa bảng điểm' });
                        continue;
                    }

                    let config = await app.model.dtDiemConfig.getData(app.utils.stringify({
                        namHoc, hocKy, maHocPhan, maMonHoc
                    }));

                    let configThanhPhan = [];
                    if (config.dataconfighocphan.length) {
                        configThanhPhan = config.dataconfighocphan.map(i => ({ loaiThanhPhan: i.loaiThanhPhan, tenThanhPhan: i.tenThanhPhan, phanTram: i.phanTram, loaiLamTron: i.loaiLamTron }));
                    } else if (config.dataconfigmonhoc.length) {
                        configThanhPhan = config.dataconfigmonhoc.map(i => ({ loaiThanhPhan: i.loaiThanhPhan, tenThanhPhan: i.tenThanhPhan, phanTram: i.phanTram, loaiLamTron: i.loaiLamTron }));
                    } else {
                        configThanhPhan = config.dataconfigthanhphan.map(i => ({ loaiThanhPhan: i.loaiThanhPhan, tenThanhPhan: i.tenThanhPhan, phanTram: i.phanTramMacDinh, loaiLamTron: i.loaiLamTron }));
                    }

                    if (JSON.stringify(configThanhPhan) != JSON.stringify(data.configThanhPhan)) {
                        listError.push({ mssv, maHocPhan, ghiChu: 'Thành phần điểm bị thay đổi' });
                        continue;
                    }

                    for (let tp of data.configThanhPhan) {
                        const diemDacBiet = data.dataDacBiet[tp.loaiThanhPhan] || '';
                        if (data[tp.loaiThanhPhan]) {
                            let isExist = await app.model.dtDiemAll.get({ ...data, loaiDiem: tp.loaiThanhPhan }), oldDiem = '';
                            if (isExist && isExist.diemDacBiet == 'I') {
                                listError.push({ mssv, maHocPhan, ghiChu: 'Điểm sinh viên hiện tại là điểm hoãn' });
                                continue;
                            }
                            if (isExist) {
                                oldDiem = isExist.diem;
                                await app.model.dtDiemAll.update({ ...data, loaiDiem: tp.loaiThanhPhan }, { diem: data[tp.loaiThanhPhan], diemDacBiet, isLock, timeLock });
                            } else {
                                await app.model.dtDiemAll.create({ ...data, loaiDiem: tp.loaiThanhPhan, phanTramDiem: tp.phanTram, diem: data[tp.loaiThanhPhan], diemDacBiet, isLock, timeLock });
                            }

                            await app.model.dtDiemHistory.create({ userModified, timeModified, ...data, phanTramDiem: tp.phanTram, oldDiem, newDiem: data[tp.loaiThanhPhan], diemDacBiet, loaiDiem: tp.loaiThanhPhan, hinhThucGhi: 4 });
                        }
                    }
                    await app.model.dtDiemGhiChu.delete({ mssv: data.mssv, maHocPhan: data.maHocPhan });
                    await app.model.dtDiemGhiChu.create({ ...data, userModified, timeModified });

                    const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK({ ...data });

                    if (isTK) {
                        await app.model.dtDiemAll.update({ ...data, loaiDiem: 'TK' }, { diem: sumDiem });
                    } else {
                        await app.model.dtDiemAll.create({ ...data, loaiDiem: 'TK', diem: sumDiem });
                    }
                    if (Number(data.khongTinhPhi)) {
                        await app.model.dtDangKyHocPhan.update({ mssv, maHocPhan }, { tinhPhi: 0 });
                        await app.model.tcDotDong.dongBoHocPhi(parseInt(namHoc), hocKy, mssv, null, null, 1);
                    }

                    app.dkhpRedis.initDiemStudent(data.mssv);

                    (index % Math.ceil(size / 50) == 0) && app.io.to('dtDiemAllSaveImportData').emit('dt-diem-all-save-import-data', { requester: req.session.user.email, mssv: data.mssv, maHocPhan: data.maHocPhan, isDone: false, index });
                    index++;
                }
                if (listError.length) {
                    const defaultColumns = [
                        { header: 'MSSV', key: 'mssv', width: 20 },
                        { header: 'Học phần', key: 'maHocPhan', width: 20 },
                        { header: 'Ghi chú', key: 'ghiChu', width: 20 },
                    ];

                    const beautifyJsonString = beautify({ defaultColumns, rows: listError, filename: 'ErrorImportDiem.xlsx' }, null, 4);
                    app.fs.writeFileSync(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${config.taskId}.json`), beautifyJsonString);
                    app.model.fwExecuteTask.update({ id: config.taskId }, { status: 3 });
                } else {
                    app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${config.taskId}.json`));
                    app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'dataTask', `${config.taskId}.json`));
                    app.model.fwExecuteTask.update({ id: config.taskId }, { status: 2 });
                }
                app.fs.deleteFile(config.srcPath);
                app.io.to('dtDiemAllSaveImportData').emit('dt-diem-all-save-import-data', { requester: req.session.user.email, isDone: true });
            } catch (error) {
                console.error(req.url, req.method, { error });
            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-all/get-data-scan', app.permission.orCheck('dtDiemAll:read', 'dtThoiKhoaBieu:read'), async (req, res) => {
        try {
            const dataScan = await app.model.dtDiemScanGradeResult.getFileScan(req.query.maHocPhan);
            let items = await Promise.all(dataScan.rows.map(async data => {
                const { idSemester, idFolder, idResult } = data;
                let gradeResult = (await app.model.dtDiemScanResult.searchPage(JSON.stringify({ idSemester, idFolder, idResult }))).rows;
                return { ...data, gradeResult };
            }));

            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-all/resave-data-scan', app.permission.orCheck('dtDiemAll:write', 'dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            const { data, dataHocPhan } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now(),
                isLock = 1,
                timeLock = timeModified;
            if (data && data.gradeResult) {

                const config = await app.model.dtDiemConfig.getData(app.utils.stringify({ ...dataHocPhan }));

                let configThanhPhan = [];
                if (config.dataconfighocphan.length) {
                    configThanhPhan = config.dataconfighocphan.map(i => ({ loaiTp: i.loaiThanhPhan, phanTram: i.phanTram }));
                } else if (config.dataconfigmonhoc.length) {
                    configThanhPhan = config.dataconfigmonhoc.map(i => ({ loaiTp: i.loaiThanhPhan, phanTram: i.phanTram }));
                } else {
                    configThanhPhan = config.dataconfigthanhphan.map(i => ({ loaiTp: i.loaiThanhPhan, phanTram: i.phanTramMacDinh }));
                }

                const tpDiem = configThanhPhan.find(i => i.loaiTp == data.kyThi);
                if (!tpDiem) throw 'Học phần không tồn tại điểm thành phần này';

                for (let sv of data.gradeResult) {
                    if (sv.dinhChiThi || sv.idDinhChi) continue;
                    let { mssv, idResult, isMissed, grade = '' } = sv,
                        diemDacBiet = Number(isMissed) ? 'VT' : '',
                        diem = Number(isMissed) ? 0 : grade.toString();

                    const exist = await app.model.dtDiemAll.get({ mssv, ...dataHocPhan, loaiDiem: data.kyThi });

                    if (exist) {
                        await app.model.dtDiemAll.update({ mssv, ...dataHocPhan, loaiDiem: data.kyThi }, { diem, diemDacBiet, isLock, timeLock });
                    } else {
                        await app.model.dtDiemAll.create({ mssv, ...dataHocPhan, loaiDiem: data.kyThi, phanTramDiem: tpDiem.phanTram, diem, diemDacBiet, isLock, timeLock });
                    }

                    const { sumDiem } = await app.model.dtDiemAll.updateDiemTK({ mssv, ...dataHocPhan });

                    await Promise.all([
                        app.model.dtDiemHistory.create({ mssv, userModified, timeModified, ...dataHocPhan, loaiDiem: data.kyThi, phanTramDiem: tpDiem.phanTram, oldDiem: exist?.diem ?? '', newDiem: diem, diemDacBiet, hinhThucGhi: 1 }),
                        app.model.dtDiemAll.update({ mssv, ...dataHocPhan, loaiDiem: 'TK' }, { diem: sumDiem }),
                        app.model.dtDiemScanGradeResult.update({ mssv, idResult }, { timeSaved: timeModified, isMissed, grade }),
                    ]);
                    app.dkhpRedis.initDiemStudent(mssv);
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.readyHooks.add('addSocketListener:ListenDtDiemAllImport', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('dtDiemAllImportData', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtDiemAll:write')) {
                socket.join('dtDiemAllSaveImportData');
                socket.join('dtDiemAllImportData');
            }
        })
    });

    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('ImportDiemAll', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDiemAllImportDiemData(req, fields, files, done), done, 'dtDiemAll:write')
    );

    const dtDiemAllImportDiemData = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportDiemAll' && files.ImportDiemAll && files.ImportDiemAll.length) {
            const srcPath = files.ImportDiemAll[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                worksheet = workbook.getWorksheet(1);
                let dmLoaiDiem = await app.model.dtDiemDmLoaiDiem.getAll({}, '*', 'priority');
                if (worksheet) {
                    try {
                        // read columns header
                        let i = 1, columns = [];
                        while (true) {
                            let column = app.excel.numberToExcelColumn(i),
                                value = worksheet.getCell(`${column}1`).text?.trim();
                            if (value) {
                                columns.push({ column, name: value });
                            } else {
                                break;
                            }
                            i++;
                        }
                        dmLoaiDiem = dmLoaiDiem.filter(loai => columns.find(i => i.name.toLowerCase() == loai.ten.trim().toLowerCase()));
                        done({});

                        app.service.executeService.run({
                            email: req.session.user.email,
                            param: { srcPath, dmLoaiDiem, columns },
                            path: '/user/dao-tao/grade-manage/nhap-diem',
                            task: 'importDiem',
                            taskName: 'Đọc dữ liệu điểm từ Excel',
                            customUrlParam: {
                                tabIndex: 2,
                            }
                        });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    //Export ---------------------------------------------------------------------------------
    app.get('/api/dt/grade-manage/diem-all/export', app.permission.check('dtDiemAll:export'), async (req, res) => {
        try {
            const { filter, dataThanhPhan } = req.query;

            app.service.executeService.run({
                email: req.session.user.email,
                param: { filter, dataThanhPhan },
                task: 'exportDiem',
                path: '/user/dao-tao/grade-manage/data',
                isExport: 1,
                taskName: 'Export dữ liệu điểm',
            });

            res.send({});
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};