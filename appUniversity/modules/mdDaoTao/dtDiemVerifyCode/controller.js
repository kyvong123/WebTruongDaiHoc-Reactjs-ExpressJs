module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7076: {
                title: 'Xác thực mã', link: '/user/dao-tao/verify-code', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-codepen',
                parentKey: 7047
            },
        },
    };

    app.permission.add(
        { name: 'dtDiemVerifyCode:manage', menu },
    );

    app.get('/user/dao-tao/verify-code', app.permission.check('dtDiemVerifyCode:manage'), app.templates.admin);
    app.get('/user/dao-tao/verify-code/item/:idGroup', app.permission.check('dtDiemVerifyCode:manage'), app.templates.admin);

    // API =======================================================================

    const getDetailCode = async (item) => {
        const codeFile = await app.model.dtDiemCodeFile.get({ id: item.idCode });
        const { maHocPhan, maMonHoc, namHoc, hocKy, kyThi, idExam } = codeFile;

        let [config, listDinhChi, infoExam, dmMonHoc] = await Promise.all([
            app.model.dtDiemConfig.getData(app.utils.stringify({ namHoc, hocKy, maHocPhan, maMonHoc })),
            app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi, idExam }),
            idExam && app.model.dtExam.get({ id: idExam }),
            app.model.dmMonHoc.get({ ma: maMonHoc }),
        ]);

        let configThanhPhan = [], listStudent = [];
        if (config.dataconfighocphan.length) {
            configThanhPhan = config.dataconfighocphan.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTram, priority: i.priority }));
        } else if (config.dataconfigmonhoc.length) {
            configThanhPhan = config.dataconfigmonhoc.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTram, priority: i.priority }));
        } else {
            configThanhPhan = config.dataconfigthanhphan.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTramMacDinh, priority: i.priority }));
        }
        configThanhPhan.sort((a, b) => Number(b.priority) - Number(a.priority));

        if (idExam) {
            listStudent = await app.model.dtExamDanhSachSinhVien.getAll({
                statement: 'idExam = :idExam AND idDinhChiThi IS NULL',
                parameter: { idExam }
            });
        } else {
            listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
        }

        listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id, maHocPhanThi: i.maHocPhan }));
        listDinhChi = await Promise.all(listDinhChi.map(async stu => {
            let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: stu.mssv.toString(), maHocPhan: stu.maHocPhanThi, isHoanThi: 1 }));
            return { ...dataStu.rows[0], ...stu };
        }));

        await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ listStudent: listStudent.map(i => i.mssv).toString(), maHocPhan })).then(i => listStudent = i.rows);

        listStudent.push(...listDinhChi);
        listStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1);

        listStudent = listStudent.map(item => ({
            ...item, diem: app.utils.parse(item.diem), diemDacBiet: app.utils.parse(item.diemDacBiet),
        }));

        return { ...item, listStudent, configThanhPhan, codeFile, infoExam, tenMonHoc: dmMonHoc.ten };
    };

    const verifyCode = async (listCode, timeVerify) => {
        const codeData = await app.model.dtDiemCodeFile.get({ id: listCode });
        const { maHocPhan, maMonHoc, namHoc, hocKy, kyThi, idExam } = codeData;

        let listDinhChi = await app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi });

        let listStudent = [];

        if (idExam) {
            listStudent = await app.model.dtExamDanhSachSinhVien.getAll({ idExam });
        } else {
            listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
            listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id }));
            listStudent.push(...listDinhChi);
        }

        listStudent = listStudent.map(i => ({ mssv: i.mssv, idDinhChiThi: i.idDinhChiThi }));

        await Promise.all(listStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1).map(async stu => {
            let maHocPhanThi = maHocPhan;
            if (stu.idDinhChiThi) {
                await app.model.dtDinhChiThi.get({ id: stu.idDinhChiThi }).then(dinhChi => maHocPhanThi = dinhChi.maHocPhan);
            }

            let statement = 'mssv = :mssv AND maHocPhan = :maHocPhan AND loaiDiem != :TK';
            if (kyThi == 'CK') statement += ' AND loaiDiem = :kyThi';
            else statement += ' AND loaiDiem != :kyThi';

            await app.model.dtDiemAll.update({
                statement,
                parameter: { mssv: stu.mssv, maHocPhan: maHocPhanThi, TK: 'TK', kyThi: 'CK' }
            }, { isLock: 1, timeLock: timeVerify }).catch(err => console.error({ mssv: stu.mssv, maHocPhan: maHocPhanThi }, err));
        }));
        await app.model.dtAssignRoleNhapDiem.update({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi, idExam }, { isLock: 1, timeLock: timeVerify }).catch(err => console.error({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi, idExam }, err));

        const statusCode = await app.model.dtDiemCodeFile.getStatus(app.utils.stringify({ namHoc, hocKy, maHocPhan }));
        if (statusCode.rows.every(i => i.isVerified)) await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { tinhTrangDiem: 4 });
    };

    app.get('/api/dt/verify-code/download-verify-diem', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const bwipjs = require('bwip-js');
            const { maHocPhan, namHoc, hocKy, maMonHoc } = app.utils.parse(req.query.dataHocPhan);
            const [dataTKB, config, listStudent] = await Promise.all([
                app.model.dmMonHoc.get({ ma: maMonHoc }, 'ten'),
                app.model.dtDiemConfig.getData(app.utils.stringify({ namHoc, hocKy, maHocPhan, maMonHoc })),
                app.model.dtThoiKhoaBieu.getStudent(maHocPhan, app.utils.stringify({ namHoc, hocKy })),
            ]);

            let configThanhPhan = [];
            if (config.dataconfighocphan.length) {
                configThanhPhan = config.dataconfighocphan.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTram }));
            } else if (config.dataconfigmonhoc.length) {
                configThanhPhan = config.dataconfigmonhoc.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTram }));
            } else {
                configThanhPhan = config.dataconfigthanhphan.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTramMacDinh }));
            }

            let l = listStudent.rows.map((item, index) => {
                const diem = app.utils.parse(item.diem) || {},
                    diemDacBiet = app.utils.parse(item.diemDacBiet) || {};

                const tp = configThanhPhan.map(i => ({ diem: diemDacBiet[i.loaiTp] || diem[i.loaiTp] || '' }));

                return {
                    ...item, tp, ghiChu: item.ghiChu ?? '', i: index + 1
                };
            });

            let data = {
                namHoc, hocKy, maHocPhan, tenMonHoc: `${maMonHoc} - ${app.utils.parse(dataTKB.ten, { 'vi': '' }).vi}`,
                l, tpDiem: configThanhPhan, dd: new Date().getDate(), mm: new Date().getMonth() + 1, yyyy: new Date().getFullYear(),
            };

            let id = await app.model.dtDiemCodeFile.get({ namHoc, hocKy }, 'id', 'id DESC');
            if (!id) id = `${namHoc.split(' - ')[0].substring(2, 4)}${hocKy}00000`;
            else id = Number(id.id) + 1;

            await app.model.dtDiemCodeFile.create({ maHocPhan, maMonHoc, namHoc, hocKy, printTime: Date.now(), userPrint: req.session.user.email, id });

            let barCodeImage = app.path.join(app.assetPath, '/barcode-verifyDiem', maHocPhan + '.png');
            app.fs.createFolder(app.path.join(app.assetPath, '/barcode-verifyDiem'));
            const png = await bwipjs.toBuffer({
                bcid: 'code128',
                text: id.toString(),
                includetext: true,
                textxalign: 'center',
            });
            app.fs.writeFileSync(barCodeImage, png);

            data.code = barCodeImage;

            const source = app.path.join(__dirname, 'resource', 'verifyCode.docx');
            const buffer = await app.docx.generateFileHasImage(source, data, [89, 91]);
            app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-xac-nhan'));
            const filePdfPath = app.path.join(app.assetPath, 'bang-diem-xac-nhan', maHocPhan + '.pdf');
            const pdfBuffer = await app.docx.toPdfBuffer(buffer);
            app.fs.writeFileSync(filePdfPath, pdfBuffer);
            app.fs.deleteFile(barCodeImage);
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { tinhTrangDiem: 4 });
            res.download(filePdfPath, `${maHocPhan}.pdf`);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/confirm', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const { listCode, data } = req.body, { idFolder, taskId } = data,
                timeVerify = Date.now(), userVerify = req.session.user.email;

            if (Array.isArray(listCode)) {
                await Promise.all(
                    listCode.map(async code => {
                        let vCode = await app.model.dtDiemVerifyCode.update({ idFolder, idCode: code }, { timeVerify, userVerify, status: 1 });
                        if (!vCode.errorDetail) {
                            await verifyCode(code, timeVerify);
                        }
                    })
                );

                await app.model.dtDiemVerifyFolder.update({ id: idFolder }, { status: 1 });

                if (taskId) {
                    app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${taskId}.json`));
                    app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'dataTask', `${taskId}.json`));
                    app.model.fwExecuteTask.update({ id: taskId }, { status: 2 });
                }
            } else {
                let vCode = await app.model.dtDiemVerifyCode.update({ idFolder, idCode: listCode }, { timeVerify, userVerify, status: 1 });
                if (!vCode.errorDetail) {
                    await verifyCode(listCode, timeVerify);
                }
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/verify', app.permission.check('dtDiemVerifyCode:manage'), async (req, res) => {
        try {
            let { data } = req.body,
                { email } = req.session.user,
                timeVerify = Date.now();
            for (let item of data) {
                const { maHocPhan, maMonHoc, namHoc, hocKy, idExam, thanhPhan } = item,
                    code = await app.model.dtDiemCodeFile.getCode({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi: thanhPhan, idExam }, email);
                await app.model.dtDiemVerifyCode.create({ idFolder: '', idCode: code, timeVerify, userVerify: email, status: 1, errorDetail: '' });
                await verifyCode(code, timeVerify);
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/cancel', app.permission.check('dtDiemVerifyCode:manage'), async (req, res) => {
        try {
            let { data } = req.body;
            await Promise.all(data.map(async item => {
                const { maHocPhan, maMonHoc, namHoc, hocKy, idExam, thanhPhan } = item,
                    listCode = await app.model.dtDiemCodeFile.getAll({ maHocPhan, maMonHoc, namHoc, hocKy, idExam, kyThi: thanhPhan });

                await Promise.all(listCode.flatMap(code => [
                    app.model.dtDiemVerifyCode.delete({ idCode: code.id }),
                    app.model.dtDiemCodeFile.delete({ id: code.id }),
                ]));

                let listDinhChi = await app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi: thanhPhan });

                let listStudent = [];

                if (idExam) {
                    listStudent = await app.model.dtExamDanhSachSinhVien.getAll({ idExam });
                } else {
                    listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
                    listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id }));
                    listStudent.push(...listDinhChi);
                }

                listStudent = listStudent.map(i => ({ mssv: i.mssv, idDinhChiThi: i.idDinhChiThi }));

                await Promise.all(listStudent.sort((a, b) => a.mssv < b.mssv ? -1 : (a.mssv == b.mssv) ? 0 : 1).map(async stu => {
                    let condition = { mssv: stu.mssv, maMonHoc, maHocPhan, namHoc, hocKy };

                    if (stu.idDinhChiThi) {
                        await app.model.dtDinhChiThi.get({ id: stu.idDinhChiThi }).then(dinhChi => {
                            condition.maHocPhan = dinhChi.maHocPhan;
                            condition.namHoc = dinhChi.namHoc;
                            condition.hocKy = dinhChi.hocKy;
                        });
                    }

                    let statement = 'mssv = :mssv AND maHocPhan = :maHocPhan AND loaiDiem != :TK';
                    if (thanhPhan == 'CK') statement += ' AND loaiDiem = :kyThi';
                    else statement += ' AND loaiDiem != :kyThi';

                    let listDiem = await app.model.dtDiemAll.getAll({
                        statement,
                        parameter: { mssv: stu.mssv, maHocPhan: condition.maHocPhan, TK: 'TK', kyThi: 'CK' }
                    });

                    await Promise.all(listDiem.flatMap(diem => [
                        app.model.dtDiemAll.update({ mssv: diem.mssv, maHocPhan: diem.maHocPhan, maMonHoc: diem.maMonHoc, namHoc: diem.namHoc, hocKy: diem.hocKy, loaiDiem: diem.loaiDiem }, { isLock: 0, timeLock: '' }),
                    ]));
                }));
            }));
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-verify/get-value', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const { idFolder } = req.query;

            let [items, folder] = await Promise.all([
                app.model.dtDiemVerifyCode.getAll({ idFolder }, '*', 'id'),
                app.model.dtDiemVerifyFolder.get({ id: idFolder }),
            ]);

            items = await Promise.all(items.map(async item => {
                if (!item.errorDetail) {
                    return getDetailCode(item);
                } else {
                    const codeFile = await app.model.dtDiemCodeFile.get({ id: item.idCode });
                    if (!codeFile) return { ...item };

                    let [infoExam, dmMonHoc] = await Promise.all([
                        codeFile.idExam && app.model.dtExam.get({ id: codeFile.idExam }),
                        app.model.dmMonHoc.get({ ma: codeFile.maMonHoc }),
                    ]);

                    return { ...item, codeFile, infoExam, tenMonHoc: dmMonHoc.ten };
                }
            }));

            res.send({ items, folder });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-verify/search-all', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const { filter = {} } = req.query, { user } = req.session;

            if (user && user.permissions && !user.permissions.includes('developer:login')) {
                filter.modifier = 'an.le123456@hcmut.edu.vn';
            }

            const items = await app.model.dtDiemVerifyCode.searchAll(app.utils.stringify(filter));

            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/check-code', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const { listCode, idFolder } = req.body,
                timeVerify = Date.now(), userVerify = req.session.user.email;

            for (let code of listCode) {
                let errorDetail = await app.model.dtDiemVerifyCode.checkCode(code);
                await app.model.dtDiemVerifyCode.create({ timeVerify, userVerify, idFolder, idCode: code, errorDetail, status: 0 });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/check-code/item', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const { code, idFolder } = req.body,
                timeVerify = Date.now(), userVerify = req.session.user.email;
            let errorDetail = await app.model.dtDiemVerifyCode.checkCode(code);

            let item = await app.model.dtDiemVerifyCode.create({ timeVerify, userVerify, idFolder, idCode: code, errorDetail, status: 0 });
            if (!errorDetail) {
                item = getDetailCode(item);
            }

            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/folder-verify', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const { folderName } = req.body,
                userCreated = req.session.user.email;

            if (await app.model.dtDiemVerifyFolder.get({ folderName, userCreated })) throw { message: 'Trùng tên folder' };
            await app.model.dtDiemVerifyFolder.create({ folderName, status: 0, userCreated, timeCreated: Date.now() });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/diem-verify/folder-verify', app.permission.orCheck('dtDiemVerifyCode:manage', 'staff:login'), async (req, res) => {
        try {
            const { idFolder } = req.body;

            await Promise.all([
                app.model.dtDiemVerifyFolder.delete({ id: idFolder }),
                app.model.dtDiemVerifyCode.delete({ idFolder }),
            ]);

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('ImportVerifyCode', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDiemVerifyCodeData(req, fields, files, params, done), done, 'dtDiemVerifyCode:manage')
    );

    const dtDiemVerifyCodeData = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportVerifyCode' && files.ImportVerifyCode && files.ImportVerifyCode.length) {
            const srcPath = files.ImportVerifyCode[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    try {
                        let email = req.session.user.email;
                        let index = 2, items = [];
                        while (true) {
                            const getVal = (column) => {
                                let val = worksheet.getCell(column + index).text.trim();
                                return val == null ? '' : val;
                            };
                            if (!worksheet.getCell('A' + index).text) {
                                break;
                            } else {
                                const code = getVal('A');
                                if (!isNaN(Number(code)) && !items.includes(code)) {
                                    items.push(code);
                                }
                            }
                            index++;
                        }
                        done({});

                        app.service.executeService.run({
                            email,
                            param: { items, email, idFolder: params.idFolder },
                            path: `/user/dao-tao/verify-code/item/${params.idFolder}`,
                            task: 'importVerifyCode',
                            taskName: 'Đọc dữ liệu mã bảng điểm từ Excel',
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

    app.get('/api/dt/diem-verify/download-template', app.permission.check('dtDiemVerifyCode:manage'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Ma');
        const defaultColumns = [
            { header: 'Mã', key: 'ma', width: 20 },
        ];
        ws.columns = defaultColumns;
        ws.getCell('A2').value = '22200001';
        app.excel.attachment(workBook, res, 'ImportMaXacThuc.xlsx');
    });

    app.get('/api/dt/diem-verify/search-page/:pageNumber/:pageSize', app.permission.check('dtDiemVerifyCode:manage'), async (req, res) => {
        try {
            const { filter } = req.query,
                _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            let [items, statusCode] = await Promise.all([
                app.model.dtAssignRoleNhapDiem.parseData(filter, _pageNumber, _pageSize),
                app.model.dtDiemCodeFile.getStatus(app.utils.stringify(filter)),
            ]);

            items = items.map(item => {
                const code = statusCode.rows.find(i => (!item.idExam || i.idExam == item.idExam) && i.maHocPhan == item.maHocPhan && i.kyThi == item.thanhPhan),
                    { idCode, userPrint, printTime } = code || {};
                return { ...item, isVerified: code && code.isVerified, idCode, userPrint, printTime };
            });

            res.send({ items, statusCode: statusCode.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-verify/export', app.permission.check('dtDiemVerifyCode:manage'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter);

            app.service.executeService.run({
                email: req.session.user.email,
                param: { filter },
                task: 'exportVerifyCode',
                path: '/user/dao-tao/verify-code',
                isExport: 1,
                taskName: 'Export dữ liệu mã xác thực',
            });

            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/student', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { mssv, maHocPhan } = req.body;
            await app.model.dtDiemAll.update({
                statement: 'mssv = :mssv AND maHocPhan = :maHocPhan AND loaiDiem != :TK',
                parameter: { mssv, maHocPhan, TK: 'TK' }
            }, { isLock: 1, timeLock: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-verify/student/cancel', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { mssv, maHocPhan } = req.body;
            await app.model.dtDiemAll.update({
                statement: 'mssv = :mssv AND maHocPhan = :maHocPhan AND loaiDiem != :TK',
                parameter: { mssv, maHocPhan, TK: 'TK' }
            }, { isLock: '', timeLock: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};