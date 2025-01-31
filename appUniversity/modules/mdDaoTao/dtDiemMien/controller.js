module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7071: {
                title: 'Quản lý điểm miễn', link: '/user/dao-tao/grade-manage/diem-mien', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-list-alt',
                parentKey: 7047
            },
        }
    };
    app.permission.add(
        { name: 'dtDiemMien:write', menu }
    );

    app.get('/user/dao-tao/grade-manage/diem-mien', app.permission.check('dtDiemMien:write'), app.templates.admin);

    // API -----------------------------------------------
    app.get('/api/dt/diem-mien/data/page/:pageNumber/:pageSize', app.permission.check('dtDiemMien:write'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            const filter = app.utils.stringify(req.query.filter || {});
            const page = await app.model.dtDiemAll.searchPageDiemMien(_pageNumber, _pageSize, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;

            res.send({ page: { totalItem, pageNumber, pageTotal, pageSize, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-mien/import/download-template', app.permission.check('dtDiemMien:write'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Diem');
        const defaultColumns = [
            { header: 'MSSV', key: 'mssv', width: 20 },
            { header: 'Mã môn học', key: 'maMonHoc', width: 20 },
            { header: 'Năm học', key: 'namHoc', width: 20 },
            { header: 'Học kỳ', key: 'hocKy', width: 20 },
        ];
        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = 'DAI007';
        ws.getCell('C2').value = '2022 - 2023';
        ws.getCell('D2').value = '1';
        app.excel.attachment(workBook, res, 'ImportDiemMien.xlsx');
    });

    app.readyHooks.add('addSocketListener:ListenDtDiemMienImport', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('dtDiemMienImportData', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtDiemMien:write')) {
                socket.join('dtDiemMienSaveImportData');
                socket.join('dtDiemMienImportData');
            }
        })
    });

    app.uploadHooks.add('ImportDiemMien', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDiemMienImportData(req, fields, files, done), done, 'dtDiemMien:write')
    );

    const dtDiemMienImportData = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportDiemMien' && files.ImportDiemMien && files.ImportDiemMien.length) {
            const srcPath = files.ImportDiemMien[0].path;
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
                            if (!(worksheet.getCell('A' + index).value && worksheet.getCell('B' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    maMonHoc: getVal('B'),
                                    namHoc: getVal('C'),
                                    hocKy: getVal('D'),
                                    row: index,
                                };

                                const nam = parseInt(data.namHoc);
                                if (data.namHoc != `${nam} - ${nam + 1}`) {
                                    falseItems.push({ ...data, error: `Năm học không đúng định dạng. VD: ${nam} - ${nam + 1}` });
                                } else {
                                    let sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'mssv, ho, ten');
                                    if (!sv) {
                                        falseItems.push({ ...data, error: 'Không tồn tại sinh viên' });
                                    } else {
                                        data.hoTen = sv.ho + ' ' + sv.ten;
                                        let mh = await app.model.dmMonHoc.get({ ma: data.maMonHoc });
                                        if (!mh) {
                                            falseItems.push({ ...data, error: 'Không tồn tại môn học' });
                                        } else {
                                            data.tenMonHoc = mh?.ten;
                                            let diem = await app.model.dtDiemAll.get({ mssv: data.mssv, maHocPhan: data.maMonHoc, maMonHoc: data.maMonHoc, diem: 'M', loaiDiem: 'TK' });
                                            if (diem) {
                                                falseItems.push({ ...data, error: 'Sinh viên đã được miễn môn học này' });
                                            } else if (await app.model.dtDangKyHocPhan.get({ mssv: data.mssv, maMonHoc: data.maMonHoc, namHoc: data.namHoc, hocKy: data.hocKy })) {
                                                falseItems.push({ ...data, error: 'Sinh viên đã đăng ký môn học trong năm học, học kỳ' });
                                            } else {
                                                let checkTrung = false,
                                                    row = null;
                                                items.forEach(e => {
                                                    if (e.maMonHoc == data.maMonHoc && e.mssv == data.mssv) {
                                                        checkTrung = true;
                                                        row = data.row;
                                                    }
                                                });
                                                if (checkTrung) {
                                                    falseItems.push({ ...data, error: `Dữ liệu bị lặp ở dòng ${row}` });
                                                } else {
                                                    let listCtdt = await app.model.dtDangKyHocPhan.getListCtdt(JSON.stringify({ mssvFilter: data.mssv })),
                                                        ghiChu = '';
                                                    listCtdt = listCtdt.rows;

                                                    if (listCtdt && listCtdt.length && listCtdt.find(i => i.maMonHoc == data.maMonHoc)) {
                                                        const mon = listCtdt.find(i => i.maMonHoc == data.maMonHoc);
                                                        data.namHoc = mon.namHocDuKien || data.namHoc;
                                                        data.hocKy = mon.hocKyDuKien || data.hocKy;
                                                        ghiChu = 'Môn học có trong CTDT';
                                                    }

                                                    if (!(data.namHoc && data.hocKy)) {
                                                        falseItems.push({ ...data, error: 'Môn học chưa nhập năm học, học kỳ' });
                                                    } else {
                                                        items.push({ ...data, ghiChu: ghiChu ? ghiChu : 'Môn học không có trong CTDT' });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                index++;
                                (index % 10 == 0) && app.io.to('dtDiemMienImportData').emit('import-diem-mien', { requester: req.session.user.email, items, falseItems, index });
                            }
                        }
                        app.io.to('dtDiemMienImportData').emit('import-diem-mien', { requester: req.session.user.email, items, falseItems, isDone: 1 });
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

    app.post('/api/dt/diem-mien/save-import', app.permission.check('dtDiemMien:write'), async (req, res) => {
        try {
            let { dataDiem } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();

            dataDiem = JSON.parse(dataDiem);
            res.end();
            for (let [index, data] of dataDiem.entries()) {
                const { mssv, maMonHoc, namHoc, hocKy } = data;
                try {
                    if (!(await app.model.dtDangKyHocPhan.get({ mssv, maMonHoc, namHoc, hocKy }))) {
                        await Promise.all([
                            app.model.dtDangKyHocPhan.create({ ...data, maHocPhan: maMonHoc, modifier: userModified, timeModified, tinhPhi: 0, maLoaiDky: 'CT', loaiMonHoc: 1, isMienDiem: 1 }),
                            app.model.dtDiemAll.create({ ...data, maHocPhan: maMonHoc, diem: 'M', phanTramDiem: '100', loaiDiem: 'CK', diemDacBiet: 'M', isLock: 1, timeLock: timeModified }),
                            app.model.dtDiemAll.create({ ...data, maHocPhan: maMonHoc, diem: 'M', loaiDiem: 'TK', isLock: 1, timeLock: timeModified }),
                            app.model.dtDiemHistory.create({ ...data, maHocPhan: maMonHoc, userModified, timeModified, newDiem: 'M', loaiDiem: 'CK', phanTramDiem: '100', hinhThucGhi: '4' }),
                        ]);
                        app.dkhpRedis.initDiemStudent(mssv);
                        app.notification.send({
                            toEmail: `${mssv.toLowerCase()}@hcmussh.edu.vn`, title: 'Xác nhận miễn môn học', iconColor: 'success', icon: 'fa-check',
                            subTitle: `Phòng Quản Lý Đào Tạo đã xác nhận miễn môn ${maMonHoc} cho bạn`,
                        });
                    }
                } catch (error) {
                    console.error(req.url, req.method, { error });
                }
                (index % 10 == 0) && app.io.to('dtDiemMienSaveImportData').emit('save-import-diem-mien', { requester: req.session.user.email, mssv, maMonHoc });
            }

            app.io.to('dtDiemMienSaveImportData').emit('save-import-diem-mien', { requester: req.session.user.email, isDone: true });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-mien', app.permission.check('dtDiemMien:write'), async (req, res) => {
        try {
            let { list } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now(),
                listError = [];

            for (let data of list) {
                const { mssv, maMonHoc, namHoc, hocKy } = data;
                if (!(await app.model.dtDangKyHocPhan.get({ mssv, maMonHoc, namHoc, hocKy }))) {
                    await Promise.all([
                        app.model.dtDangKyHocPhan.create({ ...data, maHocPhan: maMonHoc, modifier: userModified, timeModified, tinhPhi: 0, maLoaiDky: 'CT', loaiMonHoc: 1, isMienDiem: 1 }),
                        app.model.dtDiemAll.create({ ...data, maHocPhan: maMonHoc, diem: 'M', phanTramDiem: '100', loaiDiem: 'CK', diemDacBiet: 'M', isLock: 1, timeLock: timeModified }),
                        app.model.dtDiemAll.create({ ...data, maHocPhan: maMonHoc, diem: 'M', loaiDiem: 'TK', isLock: 1, timeLock: timeModified }),
                        app.model.dtDiemHistory.create({ ...data, maHocPhan: maMonHoc, userModified, timeModified, newDiem: 'M', loaiDiem: 'CK', phanTramDiem: '100', hinhThucGhi: '4' }),
                    ]);
                    app.dkhpRedis.initDiemStudent(mssv);
                    app.notification.send({
                        toEmail: `${mssv.toLowerCase()}@hcmussh.edu.vn`, title: 'Xác nhận miễn môn học', iconColor: 'success', icon: 'fa-check',
                        subTitle: `Phòng Quản Lý Đào Tạo đã xác nhận miễn môn ${maMonHoc} cho bạn`,
                    });
                } else {
                    listError.push(maMonHoc);
                }
            }
            res.send({ listError });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/diem-mien', app.permission.check('dtDiemMien:write'), async (req, res) => {
        try {
            let { mssv, maMonHoc, namHoc, hocKy } = req.body.data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            await Promise.all([
                app.model.dtDangKyHocPhan.delete({ mssv, maMonHoc, maHocPhan: maMonHoc }),
                app.model.dtDiemAll.delete({ mssv, maMonHoc, maHocPhan: maMonHoc }),
                app.model.dtDiemHistory.create({ mssv, maMonHoc, namHoc, hocKy, maHocPhan: maMonHoc, userModified, timeModified, newDiem: '', oldDiem: 'M', loaiDiem: 'CK', phanTramDiem: '100', hinhThucGhi: '4' }),
            ]);
            app.dkhpRedis.initDiemStudent(mssv);
            app.notification.send({
                toEmail: `${mssv.toLowerCase()}@hcmussh.edu.vn`, title: 'Hủy miễn môn học', iconColor: 'danger', icon: 'fa-times',
                subTitle: `Phòng Quản Lý Đào Tạo đã hủy miễn môn ${maMonHoc} cho bạn`,
            });
            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
};