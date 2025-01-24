module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7077: {
                title: 'Quản lý điểm hoãn', link: '/user/dao-tao/grade-manage/diem-hoan', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-stop',
                parentKey: 7047
            },
        }
    };
    app.permission.add(
        { name: 'dtDiemHoan:write', menu }
    );

    app.get('/user/dao-tao/grade-manage/diem-hoan', app.permission.check('dtDiemHoan:write'), app.templates.admin);
    // API -----------------------------------------------

    const hanldeSave = async ({ mssv, thanhPhan, phanTram, maHocPhan, diem, namHoc, hocKy, maMonHoc, ghiChu, userModified, timeModified }) => {
        let condition = { mssv, maMonHoc, namHoc, hocKy, maHocPhan };

        // eslint-disable-next-line no-unused-vars
        let [isExist, _] = await Promise.all([
            app.model.dtDiemAll.get({ ...condition, loaiDiem: thanhPhan }),
            app.model.dtDinhChiThi.delete({ ...condition, loaiDinhChi: 'HT' }),
        ]);

        if (isExist) {
            await app.model.dtDiemAll.update({ ...condition, loaiDiem: thanhPhan }, { diem, diemDacBiet: 'I', isLock: 1, timeLock: Date.now() });
        } else {
            await app.model.dtDiemAll.create({
                ...condition, maMonHoc,
                diem, diemDacBiet: 'I', isLock: 1, timeLock: Date.now(),
                loaiDiem: thanhPhan, phanTramDiem: phanTram
            });
        }

        await Promise.all([
            app.model.dtDiemHistory.create({ ...condition, userModified, timeModified, newDiem: diem, loaiDiem: thanhPhan, phanTramDiem: phanTram, hinhThucGhi: '2', diemDacBiet: 'I' }),
            app.model.dtDinhChiThi.create({ ...condition, ghiChu, userModified, timeModified, kyThi: thanhPhan, isHoanThi: 1, loaiDinhChi: 'HT' }),
        ]);

        const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK(condition);

        if (isTK) {
            await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
        } else {
            await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
        }

        app.dkhpRedis.initDiemStudent(mssv);
    };

    app.post('/api/dt/diem-hoan', app.permission.check('dtDiemHoan:write'), async (req, res) => {
        try {
            let { data } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();

            await hanldeSave({ ...data, userModified, timeModified });

            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-hoan/import/download-template', app.permission.check('dtDiemHoan:write'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Diem');
        const defaultColumns = [
            { header: 'MSSV', key: 'mssv', width: 20 },
            { header: 'Mã học phần', key: 'maMonHoc', width: 20 },
            { header: 'Kỳ thi', key: 'kyThi', width: 20 },
            { header: 'Ghi chú', key: 'ghiChu', width: 20 },
        ];
        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = '2220BCH074L01';
        ws.getCell('C2').value = 'GK';
        ws.getCell('D2').value = '';
        app.excel.attachment(workBook, res, 'ImportDiemHoan.xlsx');
    });

    app.readyHooks.add('addSocketListener:ListenDtDiemHoanImport', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('dtDiemHoanImportData', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtDiemHoan:write')) {
                socket.join('dtDiemHoanSaveImportData');
                socket.join('dtDiemHoanImportData');
            }
        })
    });

    app.uploadHooks.add('ImportDiemHoan', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDiemHoanImportData(req, fields, files, done), done, 'dtDiemHoan:write')
    );

    const dtDiemHoanImportData = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportDiemHoan' && files.ImportDiemHoan && files.ImportDiemHoan.length) {
            const srcPath = files.ImportDiemHoan[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    try {
                        let items = [], falseItems = [], index = 2;
                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text?.trim();
                                if (type == 'number' && val != '') {
                                    if (!isNaN(val)) val = Number(val).toFixed(2);
                                    else val = '';
                                }
                                return val === '' ? Default : (val == null ? '' : val.toString());
                            };
                            done({});
                            if (!(worksheet.getCell('A' + index).value && worksheet.getCell('B' + index).value && worksheet.getCell('C' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    maHocPhan: getVal('B'),
                                    kyThi: getVal('C'),
                                    ghiChu: getVal('D'),
                                    row: index,
                                };

                                let sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'mssv, ho, ten');
                                data.hoTen = `${sv.ho} ${sv.ten}`;
                                if (!sv) {
                                    falseItems.push({ ...data, error: 'Không tồn tại sinh viên' });
                                } else {
                                    const dataHocPhan = await app.model.dtDangKyHocPhan.getHocPhanDky(app.utils.stringify({ maHocPhan: data.maHocPhan, maSoSv: data.mssv }));
                                    if (!dataHocPhan.rows[0]) {
                                        falseItems.push({ ...data, error: 'Sinh viên không đăng ký học phần' });
                                    } else {
                                        let { namHoc, hocKy, tenMonHoc, maMonHoc, diem, diemDacBiet, configDefault, tpHocPhan, tpMonHoc, configQC } = dataHocPhan.rows[0],
                                            tpDiem = tpHocPhan || tpMonHoc || configDefault;

                                        tpDiem = tpDiem ? app.utils.parse(tpDiem) : [];
                                        diem = diem ? app.utils.parse(diem) : { GK: '', CK: '' };
                                        diemDacBiet = diemDacBiet ? app.utils.parse(diemDacBiet) : { GK: '', CK: '' };
                                        configQC = configQC ? app.utils.parse(configQC) : [];

                                        if (diem[data.kyThi] || diemDacBiet[data.kyThi]) {
                                            falseItems.push({ ...data, error: 'Thành phần của học phần đã có điểm' });
                                            index++;
                                            continue;
                                        }

                                        const dacbiet = configQC.find(i => i.ma == 'I');
                                        if (!dacbiet) {
                                            falseItems.push({ ...data, error: 'Năm học, học kỳ chưa có cấu hình điểm đặc biệt hoãn thi' });
                                            index++;
                                            continue;
                                        } else if (!dacbiet.loaiApDung.includes(data.kyThi)) {
                                            falseItems.push({ ...data, error: 'Điểm hoãn thi không áp dụng cho thành phần' });
                                            index++;
                                            continue;
                                        }

                                        const loaiDiem = tpDiem.find(i => i.thanhPhan == data.kyThi);
                                        if (!loaiDiem) {
                                            falseItems.push({ ...data, error: 'Học phần không có loại thành phần điểm' });
                                            index++;
                                            continue;
                                        }

                                        items.push({ ...data, namHoc, hocKy, tenMonHoc, maMonHoc, phanTram: loaiDiem.phanTram, diem: Number(dacbiet.tinhTongKet) ? 'I' : '0.0' });
                                    }
                                }
                                index++;
                                (index % 10 == 0) && app.io.to('dtDiemHoanImportData').emit('import-diem-hoan', { requester: req.session.user.email, items, falseItems, index });
                            }
                        }
                        app.io.to('dtDiemHoanImportData').emit('import-diem-hoan', { requester: req.session.user.email, items, falseItems, isDone: 1 });
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

    app.post('/api/dt/diem-hoan/save-import', app.permission.check('dtDiemHoan:write'), async (req, res) => {
        try {
            let { data } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();

            data = JSON.parse(data);
            res.end();
            for (let [index, item] of data.entries()) {
                await hanldeSave({ userModified, timeModified, ...item, thanhPhan: item.kyThi });

                (index % 10 == 0) && app.io.to('dtDiemHoanSaveImportData').emit('save-import-diem-hoan', { requester: req.session.user.email, mssv: item.mssv, maHocPhan: item.maHocPhan });
            }

            app.io.to('dtDiemHoanSaveImportData').emit('save-import-diem-hoan', { requester: req.session.user.email, isDone: true });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/diem-hoan', app.permission.check('dtDiemHoan:write'), async (req, res) => {
        try {
            let { data } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now(),
                { id, mssv, maHocPhan, maMonHoc, namHoc, hocKy, kyThi } = data,
                condition = { mssv, maHocPhan, maMonHoc, namHoc, hocKy, loaiDiem: kyThi };

            // eslint-disable-next-line no-unused-vars
            const [exist, _] = await Promise.all([
                app.model.dtDiemAll.get(condition),
                app.model.dtDinhChiThi.delete({ id }),
            ]);
            if (exist) {
                await Promise.all([
                    app.model.dtDiemAll.update(condition, { diem: '', diemDacBiet: '' }),
                    app.model.dtDiemHistory.create({ ...condition, userModified, timeModified, newDiem: '', oldDiem: exist.diem || '', phanTramDiem: exist.phanTramDiem, hinhThucGhi: '2', diemDacBiet: '' }),
                ]);

                const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK(condition);

                if (isTK) {
                    await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
                } else {
                    await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
                }
                app.dkhpRedis.initDiemStudent(mssv);
            }

            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-hoan/sinh-vien', app.permission.check('dtDiemHoan:write'), async (req, res) => {
        try {
            const { filter } = req.query;
            let [items, loaiDiem] = await Promise.all([
                app.model.dtDiemAll.getDataHoan(app.utils.stringify(filter)),
                app.model.dtDiemDmLoaiDiem.getAll({}, '*', 'priority')
            ]);

            res.send({ items: items.rows, loaiDiem });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-hoan/hoc-phan', app.permission.check('dtDiemHoan:write'), async (req, res) => {
        try {
            let { filter } = req.query;

            let items = await app.model.dtDinhChiThi.getHocPhanDangKy(app.utils.stringify(filter));
            items = items.rows.map(item => {
                const tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;
                return {
                    ...item,
                    tpDiem: tpDiem ? app.utils.parse(tpDiem) : [],
                    roleNhapDiem: item.roleNhapDiem ? app.utils.parse(item.roleNhapDiem) : [],
                };
            });
            res.send({ items: items.filter(i => i.tpDiem.map(tp => tp.thanhPhan).includes(filter.kyThiHoan)) });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-hoan/hoc-phan', app.permission.check('dtDiemHoan:write'), async (req, res) => {
        try {
            let { data } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();
            let { mssv, maHocPhanHoan: maHocPhan, kyThi, maHocPhanThi } = data;
            await app.model.dtDinhChiThi.update({ mssv, maHocPhan, kyThi }, { isThi: 1, maHocPhanThi, userModified, timeModified });
            await app.model.dtDiemAll.update({ mssv, maHocPhan, loaiDiem: kyThi }, { timeLock: '', isLock: '' });
            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
};