module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7079: {
                title: 'Chứng chỉ khác', groupIndex: 1, backgroundColor: '#A4D0A4', color: '#000',
                link: '/user/dao-tao/student-others-certificate', parentKey: 7068, icon: 'fa-file-excel-o'
            },
        },
    };

    app.permission.add(
        { name: 'dtChungChiTinHocSinhVien:manage', menu },
        { name: 'dtChungChiTinHocSinhVien:write' },
        { name: 'dtChungChiTinHocSinhVien:delete' },
        { name: 'dtChungChiTinHocSinhVien:export' },
    );

    app.get('/user/dao-tao/student-others-certificate', app.permission.check('dtChungChiTinHocSinhVien:manage'), app.templates.admin);
    app.get('/user/dao-tao/student-others-certificate/import', app.permission.check('dtChungChiTinHocSinhVien:manage'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/chung-chi-tin-hoc-sinh-vien/page/:pageNumber/:pageSize', app.permission.check('dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));

            let page = await app.model.dtChungChiTinHocSinhVien.searchPage(_pageNumber, _pageSize, filter, '');
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: '', list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-tin-hoc-sinh-vien', app.permission.check('dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            let { item } = req.body;
            item.modifier = req.session.user.email;
            item.timeModified = Date.now();
            await app.model.dtChungChiTinHocSinhVien.create(item);

            let { isTotNghiep, isNotQualified } = item;
            isTotNghiep = Number(isTotNghiep);
            isNotQualified = Number(isNotQualified);

            if (isTotNghiep || isNotQualified) {
                let title = `Hoàn tất xác nhận chứng chỉ ${item.chungChi.toLowerCase()}`,
                    iconColor = (isTotNghiep) ? 'success' : 'danger',
                    subTitle = isTotNghiep ? 'Đủ điều kiện xét tốt nghiệp' : 'Không đủ điều kiện';
                app.notification.send({
                    toEmail: `${item.mssv.toLowerCase()}@hcmussh.edu.vn`, title, iconColor, subTitle
                });
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/chung-chi-tin-hoc-sinh-vien', app.permission.check('dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            changes.modifier = req.session.user.email;
            changes.timeModified = Date.now();
            changes.status = 1;
            await app.model.dtChungChiTinHocSinhVien.update({ id }, changes);

            let { isTotNghiep, isNotQualified } = changes;
            isTotNghiep = Number(isTotNghiep);
            isNotQualified = Number(isNotQualified);

            if (isTotNghiep || isNotQualified) {
                let title = `Hoàn tất xác nhận chứng chỉ ${changes.chungChi.toLowerCase()}`,
                    iconColor = (isTotNghiep) ? 'success' : 'danger',
                    subTitle = isTotNghiep ? 'Đủ điều kiện xét tốt nghiệp' : 'Không đủ điều kiện';
                app.notification.send({
                    toEmail: `${changes.mssv.toLowerCase()}@hcmussh.edu.vn`, title, iconColor, subTitle
                });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/chung-chi-tin-hoc-sinh-vien', app.permission.check('dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            let { item } = req.body, id = item.id;
            await app.model.dtChungChiTinHocSinhVien.delete({ id });

            let title = `Xoá chứng chỉ ${item.tenLoaiChungChi.toLowerCase()}`,
                iconColor = 'danger',
                subTitle = `Xoá chứng chỉ ${item.tenLoaiChungChi.toLowerCase()}: ${item.maChungChi}`;
            app.notification.send({
                toEmail: `${item.mssv.toLowerCase()}@hcmussh.edu.vn`, title, iconColor, subTitle
            });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-tin-hoc-sinh-vien/export-excel', app.permission.check('dtChungChiTinHocSinhVien:export'), async (req, res) => {
        try {
            let filter = req.query.filter;

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('Sheet');
            let items = await app.model.dtChungChiTinHocSinhVien.exportExcel(filter);

            if (!items.rows.length) {
                res.status(400).send('Không có chứng chỉ nào của sinh viên!');
            } else {
                worksheet.columns = Object.keys(items.rows[0]).map(key => ({ header: key.toString(), key, width: 20 }));
                items.rows.forEach((item, index) => {
                    item['Ngày sinh'] = item['Ngày sinh'] ? app.date.viDateFormat(new Date(item['Ngày sinh'])) : '';
                    item['Ngày cấp'] = item['Ngày cấp'] ? app.date.viDateFormat(new Date(item['Ngày cấp'])) : '';
                    worksheet.addRow({ STT: index + 1, ...item }, index === 0 ? 'n' : 'i');
                });

                app.excel.attachment(workbook, res, 'CHUNG-CHI-KHAC.xlsx');
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-tin-hoc-sinh-vien/save-import', app.permission.check('dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            const { data } = req.body,
                modifier = req.session.user.email,
                timeModified = Date.now();
            await Promise.all(app.utils.parse(data).map(i => app.model.dtChungChiTinHocSinhVien.create({ ...i, modifier, timeModified, status: 1, timeCreated: timeModified })));

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/chung-chi-tin-hoc-sinh-vien/status', app.permission.check('dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            const { listId, changes } = req.body,
                modifier = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtChungChiTinHocSinhVien.update({
                statement: 'id IN (:listId)',
                parameter: { listId },
            }, { ...changes, modifier, timeModified, status: 1 });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-tin-hoc-sinh-vien/import/download-template', app.permission.check('dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Sinh viên chứng chỉ'),
            wsCert = workBook.addWorksheet('Chứng chỉ');

        const defaultColumns = [
            { header: 'Mssv', key: 'mssv', width: 20 },
            { header: 'Loại chứng chỉ', key: 'loaiChungChi', width: 20 },
            { header: 'Chứng chỉ', key: 'maChungChi', width: 20 },
            { header: 'Đủ điều kiện tốt nghiệp', key: 'isTotNghiep', width: 20 },
            { header: 'CCCD', key: 'cccd', width: 20 },
            { header: 'Số hiệu văn bằng', key: 'soHieuVanBang', width: 20 },
            { header: 'Ngày cấp', key: 'ngayCap', width: 20 },
            { header: 'Nơi cấp', key: 'noiCap', width: 20 },
            { header: 'Điểm', key: 'score', width: 20 },
            { header: 'Ghi chú', key: 'ghiChu', width: 20 }
        ];

        const columnsCert = [
            { header: 'Mã loại chứng chỉ', key: 'loaiChungChi', width: 20 },
            { header: 'Tên loại chứng chỉ', key: 'tenLoaiChungChi', width: 20 },
            { header: 'Mã chứng chỉ', key: 'ma', width: 20 },
            { header: 'Tên chứng chỉ', key: 'ten', width: 20 },
        ];

        let [dmChungChi, dmLoai] = await Promise.all([
            app.model.dtDmChungChiTinHoc.getAll({ kichHoat: 1 }),
            app.model.dtDmLoaiChungChi.getAll({}),
        ]);
        wsCert.columns = columnsCert;

        dmChungChi = dmChungChi.map(i => ({ ...i, tenLoaiChungChi: dmLoai.find(nn => nn.ma == i.loaiChungChi)?.ten || '' }));
        for (let [index, item] of dmChungChi.entries()) {
            wsCert.addRow({ ...item }, index === 0 ? 'n' : 'i');
        }

        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = 'TH';
        ws.getCell('C2').value = 'IC3';
        ws.getCell('D2').value = 1;
        ws.getCell('E2').value = 91080481;
        ws.getCell('F2').value = 'XYAH-2019';
        ws.getCell('G2').value = '20/01/2024';
        ws.getCell('H2').value = 'Trung tâm';
        ws.getCell('I2').value = 9.5;

        app.excel.attachment(workBook, res, 'ImportChungChi.xlsx');
    });

    app.uploadHooks.add('ImportChungChiKhac', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtChungChiSinhVienImportData(req, fields, files, done), done, 'dtChungChiTinHocSinhVien:manage')
    );

    const dtChungChiSinhVienImportData = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportChungChiKhac' && files.ImportChungChiKhac && files.ImportChungChiKhac.length) {
            const srcPath = files.ImportChungChiKhac[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                worksheet = workbook.getWorksheet(1);
                app.fs.deleteFile(srcPath);
                if (worksheet) {
                    try {
                        // read columns header
                        let items = [], falseItems = [], index = 2;
                        done({});
                        while (true) {
                            const getVal = (column) => {
                                let val = worksheet.getCell(column + index).text.trim();
                                return val == null ? '' : val;
                            };
                            if (!(worksheet.getCell('A' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    loaiChungChi: getVal('B'),
                                    maChungChi: getVal('C'),
                                    isTotNghiep: getVal('D') == '1' ? 1 : 0,
                                    cccd: getVal('E'),
                                    soHieuVanBang: getVal('F'),
                                    ngay: getVal('G'),
                                    noiCap: getVal('H'),
                                    diem: getVal('I'),
                                    ghiChu: getVal('J'),
                                    row: index,
                                };

                                const student = await app.model.fwStudent.get({ mssv: data.mssv });
                                if (!student) {
                                    falseItems.push({ ...data, error: 'Sinh viên không tồn tại' });
                                    index++;
                                    continue;
                                }
                                data.hoTen = `${student.ho} ${student.ten}`;

                                if (!data.loaiChungChi) {
                                    falseItems.push({ ...data, error: 'Không tồn tại loại chứng chỉ' });
                                    index++;
                                    continue;
                                }

                                const loaiChungChi = await app.model.dtDmLoaiChungChi.get({ ma: data.loaiChungChi });
                                if (!loaiChungChi) {
                                    falseItems.push({ ...data, error: 'Không tồn tại loại chứng chỉ' });
                                    index++;
                                    continue;
                                }
                                data.tenLoaiChungChi = loaiChungChi.ten;

                                if (data.maChungChi) {
                                    const chungChi = await app.model.dtDmChungChiTinHoc.get({ ma: data.maChungChi, loaiChungChi: data.loaiChungChi });
                                    if (!chungChi) {
                                        falseItems.push({ ...data, error: 'Chứng chỉ không tồn tại' });
                                        index++;
                                        continue;
                                    }
                                    data.tenChungChi = chungChi.ten;
                                }

                                if (data.ngay) {
                                    let date = data.ngay;
                                    data.ngayCap = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                                    if (isNaN(data.ngayCap)) data.ngayCap = '';
                                }

                                data.isNotQualified = data.isTotNghiep ? 0 : 1;

                                items.push(data);
                                (index % 10 == 0) && app.io.to(req.session.user.email).emit('import-chung-chi-khac', { status: 'importing', items, falseItems });
                            }
                            index++;
                        }
                        app.io.to(req.session.user.email).emit('import-chung-chi-khac', { status: 'done', items, falseItems });
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
};