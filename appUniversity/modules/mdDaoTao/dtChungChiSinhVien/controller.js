module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7075: {
                title: 'Chứng chỉ ngoại ngữ', groupIndex: 1, backgroundColor: '#FFA96A', color: '#000',
                link: '/user/dao-tao/student-certificate-management', parentKey: 7068, icon: 'fa-certificate'
            },
        },
    };

    app.permission.add(
        { name: 'dtChungChiSinhVien:manage', menu },
        'dtChungChiSinhVien:write',
        'dtChungChiSinhVien:export'
    );

    const folderUploadCert = app.path.join(app.assetPath, 'cert-uploaded-file');

    app.get('/user/dao-tao/student-certificate-management', app.permission.check('dtChungChiSinhVien:manage'), app.templates.admin);
    app.get('/user/dao-tao/student-certificate-management/import', app.permission.check('dtChungChiSinhVien:manage'), app.templates.admin);
    app.get('/user/dao-tao/student-certificate-management/import/status', app.permission.check('dtChungChiSinhVien:manage'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/chung-chi-sinh-vien/page/:pageNumber/:pageSize', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            let filter = req.query.filter || {}, sortTerm = filter.sortTerm;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sortTerm.split('_')[0], sortMode: sortTerm.split('_')[1] }));

            let page = await app.model.dtChungChiSinhVien.searchPage(_pageNumber, _pageSize, filter, '');
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: '', list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-sinh-vien-all', app.permission.orCheck('dtChungChiSinhVien:manage', 'staff:login'), async (req, res) => {
        try {
            const mssv = req.query.mssv;
            let result = await app.model.dtChungChiSinhVien.getChungChi(app.utils.stringify({ mssv }));
            let items = result.rows.concat(result.datacert);
            items = items.map(item => {
                item.ngayCap = item.ngayCap ? app.date.viDateFormat(new Date(item.ngayCap)) : '';
                item.timeCreated = item.timeCreated ? app.date.dateTimeFormat(new Date(item.timeCreated), 'HH:MM:ss dd/mm/yyyy') : '';
                item.timeModified = item.timeModified ? app.date.dateTimeFormat(new Date(item.timeModified), 'HH:MM:ss dd/mm/yyyy') : '';
                return item;
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-sinh-vien', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const { data } = req.body;

            const item = await app.model.dtChungChiSinhVien.create({ ...data, status: 1, userModified: req.session.user.email, timeModified: Date.now() });

            let { isTotNghiep, isDangKy, isJuniorStudent, isNotQualified } = data;
            isTotNghiep = Number(isTotNghiep);
            isDangKy = Number(isDangKy);
            isJuniorStudent = Number(isJuniorStudent);
            isNotQualified = Number(isNotQualified);

            if (isDangKy || isTotNghiep || isJuniorStudent || isNotQualified) {
                let title = 'Hoàn tất xác nhận chứng chỉ ngoại ngữ',
                    iconColor = (isTotNghiep || isJuniorStudent || isDangKy) ? 'success' : 'danger',
                    subTitle = isTotNghiep ? 'Đủ điều kiện xét tốt nghiệp' : (
                        isJuniorStudent ? 'Đủ chuẩn ngoại ngữ năm ba' : (
                            isDangKy ? 'Đủ điều kiện đăng ký học phần' : 'Không đủ điều kiện ngoại ngữ'
                        )
                    );
                app.notification.send({
                    toEmail: `${data.mssv.toLowerCase()}@hcmussh.edu.vn`, title, iconColor, subTitle
                });
            }

            app.dkhpRedis.initNgoaiNguStudent(data.mssv);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/chung-chi-sinh-vien', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const { id, data } = req.body;

            const item = await app.model.dtChungChiSinhVien.update({ id }, { ...data, status: 1, userModified: req.session.user.email, timeModified: Date.now() });

            let { isTotNghiep, isDangKy, isJuniorStudent, isNotQualified } = data;
            isTotNghiep = Number(isTotNghiep);
            isDangKy = Number(isDangKy);
            isJuniorStudent = Number(isJuniorStudent);
            isNotQualified = Number(isNotQualified);

            if (isDangKy || isTotNghiep || isJuniorStudent || isNotQualified) {
                let title = `${data.status == '1' ? 'Cập nhật' : 'Hoàn tất'} xác nhận chứng chỉ ngoại ngữ`,
                    iconColor = (isTotNghiep || isJuniorStudent || isDangKy) ? 'success' : 'danger',
                    subTitle = isTotNghiep ? 'Đủ điều kiện xét tốt nghiệp' : (
                        isJuniorStudent ? 'Đủ chuẩn ngoại ngữ năm ba' : (
                            isDangKy ? 'Đủ điều kiện đăng ký học phần' : 'Không đủ điều kiện ngoại ngữ'
                        )
                    );
                app.notification.send({
                    toEmail: `${data.mssv.toLowerCase()}@hcmussh.edu.vn`, title, iconColor, subTitle
                });
            }

            app.dkhpRedis.initNgoaiNguStudent(data.mssv);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/chung-chi-sinh-vien', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const { item } = req.body, id = item.id;

            await app.model.dtChungChiSinhVien.delete({ id });

            let title = 'Xoá chứng chỉ ngoại ngữ',
                iconColor = 'danger',
                subTitle = `Xoá chứng chỉ ${item.tenNgoaiNgu}: ${item.tenChungChi}`;
            app.notification.send({
                toEmail: `${item.mssv.toLowerCase()}@hcmussh.edu.vn`, title, iconColor, subTitle
            });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-sinh-vien/item/:id', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const id = req.params.id,
                item = await app.model.dtDmChungChiNgoaiNgu.get({ id });

            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-sinh-vien/filter', app.permission.orCheck('dtChungChiSinhVien:manage', 'student:login', 'dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            const { maNgoaiNgu, sv } = req.query;
            let items = await app.model.dtDmChungChiNgoaiNgu.getAll({ maNgoaiNgu, kichHoat: 1 });
            items = items.filter(item => {
                let isApDung = true;
                if (!(item.khoa && item.khoaSinhVien && item.loaiHinhDaoTao)) {
                    isApDung = false;
                } else {
                    item.khoa = item.khoa.split(', ');
                    item.khoaSinhVien = item.khoaSinhVien.split(', ');
                    item.loaiHinhDaoTao = item.loaiHinhDaoTao.split(', ');
                    isApDung = item.khoaSinhVien.includes(sv.khoaSinhVien) && item.khoa.includes(sv.khoa) && item.loaiHinhDaoTao.includes(sv.loaiHinhDaoTao);
                }
                return isApDung;
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-sinh-vien/export-excel', app.permission.check('dtChungChiSinhVien:export'), async (req, res) => {
        try {
            let filter = req.query.filter;

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('Sheet');
            let items = await app.model.dtChungChiSinhVien.exportExcel(filter);

            if (!items.rows.length) {
                res.status(400).send('Không có chứng chỉ nào của sinh viên');
            } else {
                worksheet.columns = Object.keys(items.rows[0]).filter(i => i.toString() != 'id').map(key => ({ header: key.toString(), key, width: 20 }));
                items.rows.forEach((item, index) => {
                    item['Ngày sinh'] = item['Ngày sinh'] ? app.date.viDateFormat(new Date(item['Ngày sinh'])) : '';
                    item['Ngày cấp'] = item['Ngày cấp'] ? app.date.viDateFormat(new Date(item['Ngày cấp'])) : '';
                    worksheet.addRow({ STT: index + 1, ...item }, index === 0 ? 'n' : 'i');
                });

                app.excel.attachment(workbook, res, 'CHUNG-CHI-NGOAI-NGU.xlsx');
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-sinh-vien/cert-image', app.permission.orCheck('student:login', 'dtChungChiSinhVien:manage', 'staff:login'), async (req, res) => {
        try {
            const { fileName } = req.query,
                path = app.path.join(folderUploadCert, fileName);
            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                res.end();
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-sinh-vien/download-image', app.permission.orCheck('dtChungChiSinhVien:manage', 'dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            let { fileName } = req.query;
            const path = app.path.join(folderUploadCert, fileName);
            app.fs.existsSync(path) ? res.sendFile(path) : res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-sinh-vien/download-image-zip', app.permission.orCheck('dtChungChiSinhVien:manage', 'dtChungChiTinHocSinhVien:manage'), async (req, res) => {
        try {
            let { listFileName } = req.body, time = new Date(),
                dd = (`00${time.getDate()}`).slice(-2), mm = (`00${time.getMonth() + 1}`).slice(-2), yyyy = time.getFullYear(),
                HH = (`00${time.getHours()}`).slice(-2), MM = (`00${time.getMinutes()}`).slice(-2), ss = (`00${time.getSeconds()}`).slice(-2);
            time = `${dd}${mm}${yyyy}_${HH}${MM}${ss}`;
            listFileName = listFileName.split(';');

            await app.model.dtChungChiSinhVien.getAll({
                statement: 'id IN (:listId)',
                parameter: { listId: listFileName },
            }, 'id, fileName').then(items => listFileName = items.filter(i => i.fileName).map(i => ({ id: i.id, filename: i.fileName })));

            const tempPathFolder = app.path.join(folderUploadCert, `${Date.now()}`);
            app.fs.createFolder(tempPathFolder);
            let listPromise = listFileName.map(file => {
                const srcPath = app.path.join(folderUploadCert, file.filename);
                if (app.fs.existsSync(srcPath)) {
                    app.fs.copyFile(srcPath, app.path.join(tempPathFolder, `${file.id}_${file.filename}`), error => {
                        if (error) {
                            res.send({ error });
                        }
                    });
                }
            });
            await Promise.all([...listPromise]);
            const outDir = app.path.join(folderUploadCert, `${time}.zip`);
            await app.fs.zipDirectory(tempPathFolder, outDir);
            await app.fs.deleteFolder(tempPathFolder);
            res.send({ fileName: `${time}.zip` });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/chung-chi-sinh-vien/status', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const { listId, changes } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtChungChiSinhVien.update({
                statement: 'id IN (:listId)',
                parameter: { listId },
            }, { ...changes, userModified, timeModified, status: 1 });

            let listMssv = await app.model.dtChungChiSinhVien.getAll({
                statement: 'id IN (:listId)',
                parameter: { listId },
            }, 'mssv');
            listMssv = [...new Set(listMssv.map(i => i.mssv))];
            listMssv.forEach(i => app.dkhpRedis.initNgoaiNguStudent(i));

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-sinh-vien/save-import', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const { data } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();
            await Promise.all(app.utils.parse(data).map(i => app.model.dtChungChiSinhVien.create({ ...i, userModified, timeModified, status: 1, timeCreated: timeModified, isJuniorStudent: i.isTotNghiep ? 1 : i.isJuniorStudent, score: app.utils.stringify({ ...i.diem, score: i.score }) })));

            app.utils.parse(data).forEach(i => app.dkhpRedis.initNgoaiNguStudent(i.mssv));

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chung-chi-sinh-vien/save-import-status', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        try {
            const { data } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();
            await Promise.all(app.utils.parse(data).map(i => app.model.dtChungChiSinhVien.update({ id: i.ma }, { ...i, userModified, timeModified, status: 1 })));

            let listMssv = await app.model.dtChungChiSinhVien.getAll({
                statement: 'id IN (:listId)',
                parameter: { listId: app.utils.parse(data).map(i => i.ma) },
            }, 'mssv');
            listMssv = [...new Set(listMssv.map(i => i.mssv))];
            listMssv.forEach(i => app.dkhpRedis.initNgoaiNguStudent(i));

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chung-chi-sinh-vien/import/download-template', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Sinh viên chứng chỉ'),
            wsNgoaiNgu = workBook.addWorksheet('Chứng chỉ'),
            wsCert = workBook.addWorksheet('Trình độ');

        const defaultColumns = [
            { header: 'Mssv', key: 'mssv', width: 20 },
            { header: 'Ngoại ngữ', key: 'ngoaiNgu', width: 20 },
            { header: 'Chứng chỉ', key: 'chungChi', width: 20 },
            { header: 'Trình độ', key: 'trinhDo', width: 20 },
            { header: 'Đủ điều kiện đăng ký', key: 'isDangKy', width: 20 },
            { header: 'Đủ điều kiện tốt nghiệp', key: 'isTotNghiep', width: 20 },
            { header: 'Đủ điều kiện sinh viên năm 3', key: 'isJuniorStudent', width: 20 },
            { header: 'CCCD', key: 'cccd', width: 20 },
            { header: 'Số hiệu văn bằng', key: 'soHieuVanBang', width: 20 },
            { header: 'Ngày cấp', key: 'ngayCap', width: 20 },
            { header: 'Nơi cấp', key: 'noiCap', width: 20 },
            { header: 'Điểm kỹ năng', key: 'diem', width: 20 },
            { header: 'Điểm', key: 'score', width: 20 },
            { header: 'Ghi chú', key: 'ghiChu', width: 20 }
        ];

        const columnsNgoaiNgu = [
            { header: 'Mã chứng chỉ', key: 'maChungChi', width: 20 },
            { header: 'Mã ngoại ngữ', key: 'maNgoaiNgu', width: 20 },
            { header: 'Tên chứng chỉ', key: 'tenChungChi', width: 20 },
            { header: 'Tên ngoại ngữ', key: 'tenNgoaiNgu', width: 20 },
        ];

        const columnsCert = [
            { header: 'Trình độ', key: 'ma', width: 20 },
            { header: 'Tên', key: 'description', width: 20 },
        ];

        let [dmChungChi, dmNgoaiNgu, dmCert] = await Promise.all([
            app.model.dtDmChungChiNgoaiNgu.getAll({ kichHoat: 1 }),
            app.model.dtDmNgoaiNgu.getAll({}),
            app.model.dtDmCefr.getAll({})
        ]);
        wsNgoaiNgu.columns = columnsNgoaiNgu;

        dmChungChi = dmChungChi.map(i => ({ ...i, tenNgoaiNgu: dmNgoaiNgu.find(nn => nn.ma == i.maNgoaiNgu)?.ten || '' }));
        for (let [index, item] of dmChungChi.entries()) {
            wsNgoaiNgu.addRow({ maChungChi: item.id, maNgoaiNgu: item.maNgoaiNgu, tenChungChi: item.ten, tenNgoaiNgu: item.tenNgoaiNgu }, index === 0 ? 'n' : 'i');
        }

        wsCert.columns = columnsCert;
        for (let [index, item] of dmCert.entries()) {
            wsCert.addRow({ ma: item.ma, description: item.description }, index === 0 ? 'n' : 'i');
        }

        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = 'TA';
        ws.getCell('C2').value = '21';
        ws.getCell('D2').value = 'B1';
        ws.getCell('E2').value = 1;
        ws.getCell('F2').value = 1;
        ws.getCell('G2').value = 1;
        ws.getCell('H2').value = 'B1';
        ws.getCell('I2').value = 'B1';
        ws.getCell('J2').value = '20/01/2024';
        ws.getCell('K2').value = 'IIG';
        ws.getCell('L2').value = 'L:8;R:7;W:7;S:6';
        ws.getCell('M2').value = '7.5';

        app.excel.attachment(workBook, res, 'ImportChungChi.xlsx');
    });

    app.get('/api/dt/chung-chi-sinh-vien/export/xet-duyet', app.permission.check('dtChungChiSinhVien:manage'), async (req, res) => {
        let filter = req.query.filter;

        const workbook = app.excel.create(),
            worksheet = workbook.addWorksheet('Sheet');
        let items = await app.model.dtChungChiSinhVien.exportExcel(filter);

        if (!items.rows.length) {
            res.status(400).send('Không có chứng chỉ nào của sinh viên');
        } else {
            worksheet.columns = [
                { header: 'Mã', key: 'id', width: 20 },
                { header: 'Mssv', key: 'mssv', width: 20 },
                { header: 'Họ tên', key: 'hoTen', width: 20 },
                { header: 'Ngoại ngữ', key: 'tenNgoaiNgu', width: 20 },
                { header: 'Chứng chỉ', key: 'tenChungChi', width: 20 },
                { header: 'Đủ ĐK đăng ký', key: 'isDangKy', width: 20 },
                { header: 'Đủ ĐK năm ba', key: 'isJuniorStudent', width: 20 },
                { header: 'Đủ ĐK tốt nghiệp', key: 'isTotNghiep', width: 20 },
                { header: 'Không đủ điều kiện', key: 'isNotQualified', width: 20 },
                { header: 'Ghi chú', key: 'ghiChu', width: 20 },
            ];

            items.rows.forEach((item, index) => {
                worksheet.addRow({
                    id: item.id, mssv: item['MSSV'], hoTen: item['Họ tên'], tenNgoaiNgu: item['Ngoại ngữ'], isDangKy: item['Đủ ĐK đăng ký'],
                    tenChungChi: item['Chứng chỉ'], isJuniorStudent: item['Đủ ĐK năm ba'], isTotNghiep: item['Đủ ĐK tốt nghiệp'],
                }, index === 0 ? 'n' : 'i');
            });

            app.excel.attachment(workbook, res, 'chungchicapnhattinhtrang.xlsx');
        }
    });

    // UPLOAD HOOKS =================================
    app.uploadHooks.add('uploadCertificateFileManageLanguage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCertificateFile(req, fields, files, done), done, 'dtChungChiSinhVien:manage'));

    const uploadCertificateFile = async (req, fields, files, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'CertFile' && files.CertFile && files.CertFile.length) {
            try {
                if (!files.CertFile[0].headers['content-type'].includes('image/')) throw { message: 'Vui lòng chọn file ảnh' };
                let { originalFilename, path } = files.CertFile[0],
                    time = Date.now(),
                    { mssv, loaiChungChi } = req.query,
                    type = originalFilename.substring(originalFilename.lastIndexOf('.') + 1, originalFilename.length);

                const imagePath = app.path.join(folderUploadCert, `${mssv}_${loaiChungChi}_${time}.${type}`);
                await app.fs.rename(path, imagePath);

                done && done({ fileName: `${mssv}_${loaiChungChi}_${time}.${type}` });
            } catch (error) {
                done && done(error);
            }
        }
    };

    app.uploadHooks.add('ImportChungChi', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtChungChiSinhVienImportData(req, fields, files, done), done, 'dtChungChiSinhVien:manage')
    );

    const dtChungChiSinhVienImportData = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportChungChi' && files.ImportChungChi && files.ImportChungChi.length) {
            const srcPath = files.ImportChungChi[0].path;
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
                                    ngoaiNgu: getVal('B'),
                                    chungChi: getVal('C'),
                                    trinhDo: getVal('D'),
                                    isDangKy: getVal('E') == '1' ? 1 : 0,
                                    isTotNghiep: getVal('F') == '1' ? 1 : 0,
                                    isJuniorStudent: getVal('G') == '1' ? 1 : 0,
                                    cccd: getVal('H'),
                                    soHieuVanBang: getVal('I'),
                                    ngay: getVal('J'),
                                    noiCap: getVal('K'),
                                    diem: getVal('L'),
                                    score: getVal('M'),
                                    ghiChu: getVal('N'),
                                    row: index,
                                };

                                const student = await app.model.fwStudent.get({ mssv: data.mssv });
                                if (!student) {
                                    falseItems.push({ ...data, error: 'Sinh viên không tồn tại' });
                                    index++;
                                    continue;
                                }
                                data.hoTen = `${student.ho} ${student.ten}`;

                                if (!data.ngoaiNgu) {
                                    falseItems.push({ ...data, error: 'Không tồn tại ngoại ngữ' });
                                    index++;
                                    continue;
                                }
                                const ngoaiNgu = await app.model.dtDmNgoaiNgu.get({ ma: data.ngoaiNgu });
                                if (!ngoaiNgu) {
                                    falseItems.push({ ...data, error: 'Không tồn tại ngoại ngữ' });
                                    index++;
                                    continue;
                                }
                                data.tenNgoaiNgu = ngoaiNgu.ten;

                                if (data.chungChi) {
                                    const chungChi = await app.model.dtDmChungChiNgoaiNgu.get({ id: data.chungChi, maNgoaiNgu: data.ngoaiNgu });
                                    if (!chungChi) {
                                        falseItems.push({ ...data, error: 'Chứng chỉ theo loại ngoại ngữ không tồn tại' });
                                        index++;
                                        continue;
                                    }
                                    data.tenChungChi = chungChi.ten;
                                }

                                if (data.trinhDo) {
                                    const trinhDo = await app.model.dtDmCefr.get({ ma: data.trinhDo });
                                    if (!trinhDo) {
                                        falseItems.push({ ...data, error: 'Trình độ không tồn tại' });
                                        index++;
                                        continue;
                                    }
                                }

                                if (data.ngay) {
                                    let date = data.ngay;
                                    data.ngayCap = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                                    if (isNaN(data.ngayCap)) data.ngayCap = '';
                                }

                                if (data.diem) {
                                    data.diem = data.diem.split(';').reduce((acc, cur) => {
                                        const [key, value] = cur.split(':');
                                        if (['L', 'R', 'W', 'S'].includes(key) && value != '') acc[key] = value;
                                        return acc;
                                    }, {});
                                }
                                data.isJuniorStudent = data.isTotNghiep ? 1 : data.isJuniorStudent;
                                data.isDangKy = data.isJuniorStudent ? 1 : data.isDangKy;
                                data.isNotQualified = (data.isDangKy || data.isTotNghiep || data.isJuniorStudent) ? 0 : 1;

                                items.push(data);
                                (index % 10 == 0) && app.io.to(req.session.user.email).emit('import-chung-chi', { status: 'importing', items, falseItems });
                            }
                            index++;
                        }
                        app.io.to(req.session.user.email).emit('import-chung-chi', { status: 'done', items, falseItems });
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

    app.uploadHooks.add('ImportStatusChungChi', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtChungChiSinhVienImportStatusData(req, fields, files, done), done, 'dtChungChiSinhVien:manage')
    );

    const dtChungChiSinhVienImportStatusData = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportStatusChungChi' && files.ImportStatusChungChi && files.ImportStatusChungChi.length) {
            const srcPath = files.ImportStatusChungChi[0].path;
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
                                    ma: getVal('A'),
                                    mssv: getVal('B'),
                                    hoTen: getVal('C'),
                                    tenNgoaiNgu: getVal('D'),
                                    tenChungChi: getVal('E'),
                                    isDangKy: getVal('F') == '1' ? 1 : 0,
                                    isJuniorStudent: getVal('G') == '1' ? 1 : 0,
                                    isTotNghiep: getVal('H') == '1' ? 1 : 0,
                                    isNotQualified: getVal('I'),
                                    ghiChu: getVal('J'),
                                    row: index,
                                };

                                const chungChi = await app.model.dtChungChiSinhVien.get({ id: data.ma });
                                if (!chungChi) {
                                    falseItems.push({ ...data, error: 'Mã chứng chỉ sinh viên không tồn tại' });
                                    index++;
                                    continue;
                                }

                                const student = await app.model.fwStudent.get({ mssv: data.mssv });
                                if (!student) {
                                    falseItems.push({ ...data, error: 'Sinh viên không tồn tại' });
                                    index++;
                                    continue;
                                }

                                if (chungChi.mssv != data.mssv) {
                                    falseItems.push({ ...data, error: 'Mã chứng chỉ không tồn tại với sinh viên' });
                                    index++;
                                    continue;
                                }

                                data.isJuniorStudent = data.isTotNghiep ? 1 : data.isJuniorStudent;
                                data.isDangKy = data.isJuniorStudent ? 1 : data.isDangKy;
                                data.isNotQualified = (data.isDangKy || data.isTotNghiep || data.isJuniorStudent) ? 0 : data.isNotQualified;
                                items.push(data);
                                (index % 10 == 0) && app.io.to(req.session.user.email).emit('import-status-chung-chi', { status: 'importing', items, falseItems });
                            }
                            index++;
                        }
                        app.io.to(req.session.user.email).emit('import-status-chung-chi', { status: 'done', items, falseItems });
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