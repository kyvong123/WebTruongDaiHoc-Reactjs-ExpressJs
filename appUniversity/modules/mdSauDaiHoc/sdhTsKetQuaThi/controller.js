module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7618: {
                title: 'Quản lý điểm',
                link: '/user/sau-dai-hoc/tuyen-sinh/ket-qua-thi',
                parentKey: 7544,
                icon: 'fa-star-o',
                backgroundColor: '#F7C04A'
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsKetQuaThi:read', menu },
        { name: 'sdhTsKetQuaThi:manage', menu },
        { name: 'sdhTsKetQuaThi:write', menu },
        { name: 'sdhTsKetQuaThi:import', menu },
        { name: 'sdhTsKetQuaThi:export', menu },
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/ket-qua-thi', app.permission.orCheck('sdhTsKetQuaThi:write', 'sdhTsKetQuaThi:read'), app.templates.admin);

    //------API--------------s

    app.get('/api/sdh/ts/ket-qua-thi/page/:pageNumber/:pageSize', app.permission.orCheck('sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.searchDiemPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/thi-sinh/items', app.permission.orCheck('sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:write', 'sdhTsThiSinhMoPhong:read'), async (req, res) => {
        try {
            const { searchTerm = '', idDot = '' } = req.query;
            const condition = {
                statement: '(lower(sbd) like :searchTerm or lower(ho) like :searchTerm or lower(ten) like :searchTerm ) AND isXetDuyet = 1 AND idDot = :idDot',
                parameter: { searchTerm: `%${searchTerm.toLowerCase()}%`, idDot }
            };
            let items = await app.model.sdhTsThongTinCoBan.getAll(condition);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/thi-sinh/diem-thi/:sbd', app.permission.orCheck('sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:write', 'sdhTsThiSinh:login'), async (req, res) => {
        try {
            const data = await app.model.sdhTsInfoCaThiThiSinh.getDiemThiSinh(`${req.params.sbd}`);
            res.send({ items: data.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts-info/thi-sinh-mp/item', app.permission.orCheck('sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:write'), async (req, res) => {
        try {
            const { maTui, id } = req.query;
            let item = await app.model.sdhTsInfoCaThiThiSinh.get({ maTui, maPhach: id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/ts-info/thi-sinh-mp/item', app.permission.check('sdhTsKetQuaThi:write'), async (req, res) => {
        try {
            const { id, diem, diemCu } = req.body;
            const hinhThuc = diemCu ? 'Chỉnh sửa' : 'Nhập điểm';
            if (id) {
                await Promise.all(
                    [
                        app.model.sdhTsInfoCaThiThiSinh.update({ id: id }, { diem }),
                        diem != diemCu ? app.model.sdhTsQuanLyDiem.create({
                            modifier: req.session.user.email,
                            timeModified: Date.now(),
                            diemMoi: diem,
                            diemCu,
                            hinhThuc,
                            idCaThi: id
                        }) : null
                    ]);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/phong-thi/diem-thi/item', app.permission.orCheck('sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:write'), async (req, res) => {
        try {
            const { maTui, idDot } = req.query;
            let data = await app.model.sdhTsInfoCaThiThiSinh.getDiemPhongThi(idDot, maTui);
            //Phân quyền sau
            // const result = req.session.user.permissions?.includes('manager:write') ? { items: data.rows } : { items: data.rows.map(item => ({ ...item, sbd: '' })) };
            const result = { items: data.rows };
            res.send(result);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/phong-thi/diem-thi/mon-thi', app.permission.orCheck('sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:write'), async (req, res) => {
        try {
            const { maMonThi, kyNang, idDot } = req.query.data;
            let data = await app.model.sdhTsInfoCaThiThiSinh.getDiemMonThi(idDot, maMonThi, kyNang);
            //Phân quyền sau
            // const result = req.session.user.permissions?.includes('manager:write') ? { items: data.rows } : { items: data.rows.map(item => ({ ...item, sbd: '' })) };
            const result = { items: data.rows };
            res.send(result);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts-info/phong-thi/diem-thi', app.permission.check('sdhTsKetQuaThi:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const items = data.thiSinh || [], diem = data.diem;
            let dataLog = {};
            for (let item of items) {
                const diemCu = item.diem, diemMoi = diem[item.id];
                if (diemCu == diemMoi) continue;
                dataLog = {
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                    diemMoi,
                    diemCu,
                    hinhThuc: !diemCu ? 'Nhập điểm' : 'Chỉnh sửa',
                    idCaThi: item.id
                };
                await app.model.sdhTsQuanLyDiem.create(dataLog);
            }
            items.length && await Promise.all(items.map(item => app.model.sdhTsInfoCaThiThiSinh.update({ id: item.id }, { diem: diem[item.id] })));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-diem-template/download/:type', app.permission.check('sdhTsKetQuaThi:import'), async (req, res) => {
        try {
            let fileName = '';
            const type = req.params.type;
            if (type == 'NN') {
                fileName = 'TS_diem_NN_template.xlsx';
            } else if (type == 'MATUI') fileName = 'TS_diem_template.xlsx';
            else fileName = 'TS_diem_other_template.xlsx';
            const path = app.path.join(__dirname, 'resources', fileName);
            if (app.fs.existsSync(path)) {
                res.download(path, fileName);
            } else {
                console.error(req.url, req.method, { error: `Không tìm thấy đường dẫn: ${path}` });
                res.sendStatus(404);
            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
    app.readyHooks.add('addSocketListener:sdhTsDiemImportData', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('sdhTsDiemImportData', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('sdhTsKetQuaThi:write')) {
                socket.join('sdhTsDiemImportData');
                socket.join('saveTsDiemImportData');
            }
        }),
    });

    app.uploadHooks.add('sdhTsDiemImportData', (req, fields, files, params, done) => {
        app.permission.has(req, () => sdhTsDiemImportData(req, fields, files, params, done), done, 'sdhTsKetQuaThi:write');
    });

    const sdhTsDiemImportData = async (req, fields, files, params, done) => {

        if (fields.userData && fields.userData[0] && fields.userData[0] == 'sdhTsDiemImportData' && files.sdhTsDiemImportData && files.sdhTsDiemImportData.length) {
            let { maMon, type } = app.utils.parse(params.filter);
            let worksheet = null;
            const srcPath = files.sdhTsDiemImportData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    let index = 2;
                    let items = [], createItem = [], updateItem = [], falseItem = [];
                    try {
                        done({ items });
                        const getVal = (column) => {
                            let val = worksheet.getCell(column + index).text.trim();
                            return val == null ? '' : val;
                        };
                        const nextLoop = (index, createItem, updateItem, falseItem) => {
                            index % 10 == 0 && app.io.to('sdhTsDiemImportData').emit('import-sdh-ts-diem-one', { requester: req.session.user.email, createItem, updateItem, falseItem, index });
                            return index + 1;
                        };
                        if (type == 'NN') {
                            let conditionNN = true;
                            worksheet.getCell('B1')?.text && worksheet.getCell('B1').text.trim().toLowerCase() == 'sbd' ? null : conditionNN = false;
                            worksheet.getCell('G1')?.text && worksheet.getCell('G1').text.trim().toLowerCase() == 'listening' ? null : conditionNN = false;
                            worksheet.getCell('H1')?.text && worksheet.getCell('H1').text.trim().toLowerCase() == 'reading' ? null : conditionNN = false;
                            worksheet.getCell('I1')?.text && worksheet.getCell('I1').text.trim().toLowerCase() == 'speaking' ? null : conditionNN = false;
                            worksheet.getCell('J1')?.text && worksheet.getCell('J1').text.trim().toLowerCase() == 'writing' ? null : conditionNN = false;
                            if (!conditionNN) return app.io.to('sdhTsDiemImportData').emit('import-sdh-ts-diem-error', { requester: req.session.user.email, err: 'Định dạng file excel chưa chính xác!' });
                        } else if (type == 'MATUI') {
                            let conditionMaTui = true;
                            worksheet.getCell('B1')?.text && worksheet.getCell('B1').text.trim().toLowerCase() == 'sbd' ? null : conditionMaTui = false;
                            worksheet.getCell('C1')?.text && worksheet.getCell('C1').text.trim().toLowerCase() == 'mã phách' ? null : conditionMaTui = false;
                            worksheet.getCell('D1')?.text && worksheet.getCell('D1').text.trim().toLowerCase() == 'điểm' ? null : conditionMaTui = false;
                            if (!conditionMaTui) return app.io.to('sdhTsDiemImportData').emit('import-sdh-ts-diem-error', { requester: req.session.user.email, err: 'Định dạng file excel chưa chính xác!' });
                        } else {
                            let conditionKhac = true;
                            worksheet.getCell('B1')?.text && worksheet.getCell('B1').text.trim().toLowerCase() == 'sbd' ? null : conditionKhac = false;
                            worksheet.getCell('G1')?.text && worksheet.getCell('G1').text.trim().toLowerCase() == 'điểm' ? null : conditionKhac = false;
                            if (!conditionKhac) return app.io.to('sdhTsDiemImportData').emit('import-sdh-ts-diem-error', { requester: req.session.user.email, err: 'Định dạng file excel chưa chính xác!' });
                        }
                        app.io.to('sdhTsDiemImportData').emit('import-sdh-ts-diem-one', { requester: req.session.user.email, createItem, updateItem, falseItem, index: index - 2 });
                        while (true) {
                            if (!worksheet.getCell('A' + index).text) {
                                break;
                            } else {
                                let data = type == 'NN' ?
                                    {
                                        sbd: getVal('B'),
                                        ho: getVal('C'),
                                        ten: getVal('D'),
                                        nganh: getVal('E'),
                                        email: getVal('F'),
                                        listening: getVal('G'),
                                        reading: getVal('H'),
                                        speaking: getVal('I'),
                                        writing: getVal('J')
                                    } : (type == 'MATUI' ?
                                        {
                                            sbd: getVal('B'),
                                            maPhach: getVal('C'),
                                            diem: getVal('D'),
                                        } : {
                                            sbd: getVal('B'),
                                            ho: getVal('C'),
                                            ten: getVal('D'),
                                            nganh: getVal('E'),
                                            email: getVal('F'),
                                            diem: getVal('G')
                                        });
                                if (falseItem.map(i => i.sbd).includes(data.sbd)) {
                                    falseItem.push({ ...data, ghiChuExcel: 'Số báo danh không tồn tại', flag: 'fail' });
                                    index = nextLoop(index, createItem, updateItem, falseItem);
                                    continue;
                                }
                                if (createItem.map(i => i.sbd).includes(data.sbd) || updateItem.map(i => i.sbd).includes(data.sbd)) {
                                    falseItem.push({ ...data, ghiChuExcel: 'Trùng lặp thí sinh', flag: 'fail' });
                                    index = nextLoop(index, createItem, updateItem, falseItem);
                                    continue;
                                }
                                if (type == 'NN') {
                                    let condition = true;
                                    (!data.speaking || isNaN(data.speaking)) ? condition = false : null;
                                    (!data.reading || isNaN(data.reading)) ? condition = false : null;
                                    (!data.writing || isNaN(data.writing)) ? condition = false : null;
                                    (!data.listening || isNaN(data.listening)) ? condition = false : null;
                                    if (!condition) {
                                        falseItem.push({ ...data, ghiChuExcel: 'Điểm trống hoặc không phải là số', flag: 'fail' });
                                        index = nextLoop(index, createItem, updateItem, falseItem);
                                        continue;
                                    }
                                } else {
                                    if (!data.diem || isNaN(data.diem)) {
                                        falseItem.push({ ...data, ghiChuExcel: 'Điểm trống hoặc không phải là số', flag: 'fail' });
                                        index = nextLoop(index, createItem, updateItem, falseItem);
                                        continue;
                                    }
                                }
                                let dataDiem = await app.model.sdhTsInfoCaThiThiSinh.getDiemThiSinh(data.sbd);
                                if (dataDiem.rows.length) {
                                    let item = {};
                                    if (type == 'MATUI') item = dataDiem.rows.find(({ maMonThi, maPhach }) => maMonThi == maMon && maPhach == data.maPhach);
                                    else item = dataDiem.rows.find(({ maMonThi }) => maMonThi == maMon);
                                    if (!item) {
                                        falseItem.push({ ...data, ghiChuExcel: 'Thí sinh không đăng ký môn thi này hoặc không đúng mã phách', flag: 'fail' });
                                    } else if (!item.diem) {
                                        createItem.push({ ...data, ghiChuExcel: 'Nhập điểm thành công', flag: 'success' });
                                    } else {
                                        updateItem.push({ ...data, ghiChuExcel: 'Cập nhật điểm thành công', flag: 'modify' });
                                    }
                                } else {
                                    falseItem.push({ ...data, ghiChuExcel: 'Số báo danh không tồn tại', flag: 'fail' });
                                }
                                index = nextLoop(index, createItem, updateItem, falseItem);
                            }
                        }
                        let errListSbd = falseItem.map(i => i.sbd);
                        createItem = createItem.filter(item => !errListSbd.includes(item.sbd));
                        updateItem = updateItem.filter(item => !errListSbd.includes(item.sbd));
                        falseItem.sort((a, b) => a.row - b.row);
                        app.io.to('sdhTsDiemImportData').emit('import-sdh-ts-diem-all-done', { requester: req.session.user.email, createItem, updateItem, falseItem, index });
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
    app.post('/api/sdh/ts/diem-thi/excel', app.permission.check('sdhTsKetQuaThi:write'), async (req, res) => {
        try {
            let { data, type, idDot, maMonThi } = req.body.filter;
            res.end();
            let index = 1;
            if (type == 'NN') {
                for (let item of data) {
                    const thiSinh = await app.model.sdhTsInfoCaThiThiSinh.getDiemNN(app.utils.stringify({ sbd: item.sbd, maMon: maMonThi, idDot }));
                    if (thiSinh.rows.length) {
                        for (let ts of thiSinh.rows) {
                            let diemMoi = item[`${ts.kyNang.toLowerCase()}`];
                            await Promise.all([
                                app.model.sdhTsInfoCaThiThiSinh.update({ id: ts.id }, { diem: diemMoi }),
                                diemMoi != ts.diem ? app.model.sdhTsQuanLyDiem.create({
                                    modifier: req.session.user.email,
                                    timeModified: Date.now(),
                                    diemMoi,
                                    diemCu: ts.diem,
                                    hinhThuc: 'Nhập điểm excel',
                                    idCaThi: ts.id
                                }) : null]);
                        }
                    }
                    index % 5 == 0 && app.io.to('saveTsDiemImportData').emit('save-import-ts-diem-one', { requester: req.session.user.email, process: index });
                }
                app.io.to('saveTsDiemImportData').emit('save-import-sdh-ts-diem-all-done', { requester: req.session.user.email });

            } else if (type == 'MATUI') {
                for (let item of data) {
                    const thiSinh = await app.model.sdhTsInfoCaThiThiSinh.get({ maPhach: item.maPhach, maMonThi });
                    thiSinh && await Promise.all([
                        app.model.sdhTsInfoCaThiThiSinh.update({ id: thiSinh.id }, item),
                        item.diem != thiSinh.diem ? app.model.sdhTsQuanLyDiem.create({
                            modifier: req.session.user.email,
                            timeModified: Date.now(),
                            diemMoi: item.diem,
                            diemCu: thiSinh.diem,
                            hinhThuc: 'Nhập điểm excel',
                            idCaThi: thiSinh.id
                        }) : null
                    ]);
                    index % 5 == 0 && app.io.to('saveTsDiemImportData').emit('save-import-sdh-ts-diem-one', { requester: req.session.user.email, process: index });
                }
                app.io.to('saveTsDiemImportData').emit('save-import-sdh-ts-diem-all-done', { requester: req.session.user.email });
            } else {
                for (let item of data) {
                    const ttcb = await app.model.sdhTsThongTinCoBan.get({ sbd: item.sbd });
                    const thiSinh = await app.model.sdhTsInfoCaThiThiSinh.get({ maMonThi, idThiSinh: ttcb.id });
                    thiSinh && await Promise.all([
                        app.model.sdhTsInfoCaThiThiSinh.update({ id: thiSinh.id }, item),
                        item.diem != thiSinh.diem ? app.model.sdhTsQuanLyDiem.create({
                            modifier: req.session.user.email,
                            timeModified: Date.now(),
                            diemMoi: item.diem,
                            diemCu: thiSinh.diem,
                            hinhThuc: 'Nhập điểm excel',
                            idCaThi: thiSinh.id
                        }) : null
                    ]);
                    index % 5 == 0 && app.io.to('saveTsDiemImportData').emit('save-import-diem-one', { requester: req.session.user.email, process: index });
                }
                app.io.to('saveTsDiemImportData').emit('save-import-sdh-ts-diem-all-done', { requester: req.session.user.email });
            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/ket-qua-thi/export-pdf', app.permission.check('sdhTsKetQuaThi:export'), async (req, res) => {
        try {
            res.end();
            const { filter } = req.query;
            const requester = req.session.user.email;
            const { maPhanHe, maHinhThuc } = filter;
            const mapperHinhThuc = { '01': 'DT', '02': 'XT', '03': 'TT', '04': 'KH' };
            // const mapperPhanHe = { '01': 'NCS', '02': 'CH', '03': 'DBTS', '04': 'LT' };
            let hinhThuc = mapperHinhThuc[maHinhThuc];
            let { rows, dataHeader } = await app.model.sdhTsInfoCaThiThiSinh.getExportDataDiem(app.utils.stringify(filter));
            let title = '';
            let cotDiem = '';
            if (hinhThuc == 'DT') {
                title = 'Kết quả thi tuyển Cao học';
            } else if (hinhThuc == 'XT') {
                if (maPhanHe == '01') {
                    title = 'Kết quả thi bảo vệ đề cương nghiên cứu sinh';
                    cotDiem = 'Bảo vệ đề cương';
                } else {
                    title = 'Kết quả thi phỏng vấn xét tuyển Cao học';
                    cotDiem = 'Vấn đáp';
                }

            } else if (hinhThuc == 'KH') {
                title = 'Kết quả dự thi kết hợp xét tuyển Cao học';
                cotDiem = 'Bài luận';
            }
            dataHeader[0].title = title.toUpperCase();
            dataHeader[0].tenDot = dataHeader[0].tenDot.toUpperCase();
            dataHeader[0].cotDiem = cotDiem;
            let total = 0;
            rows.forEach(item => {
                item.dataThiSinh = app.utils.parse(item.dataThiSinh);
                let index = 1;
                item.dataThiSinh.forEach(i => {
                    i.R = index;
                    let result = { 'NN': '' };
                    const ketQuaThi = i.ketQuaThi ? app.utils.parse(i.ketQuaThi)?.map(diem => diem) : [];
                    let newKetQuaThi = [{}];
                    // Xử lý điểm nghe đọc nói viết
                    let td = 0;
                    if (ketQuaThi.length) {
                        ketQuaThi.forEach(cell => {
                            if (cell.hasOwnProperty('NN')) {
                                cell['NN'] ? result['NN'] = (Number(result['NN']) || 0) + Number(cell['NN']) : null;
                            } else {
                                const diem = Object.values(cell)[0];
                                newKetQuaThi[0][Object.keys(cell)[0]] = Object.values(cell)[0];
                                td += Number(diem || 0);
                            }
                        });
                        newKetQuaThi[0]['NN'] = result['NN'] ? (result['NN'] / 4).toFixed(1) : '';
                    }
                    i.td = td;
                    i.ngaySinh = app.date.dateFormat(new Date(i.ngaySinh));
                    i.ghiChu = i.ghiChu == '0' ? '' : 'XT ngoại ngữ';
                    i.ketQuaThi = newKetQuaThi;
                    index++;
                    total++;
                });
            });
            let data = {
                ...dataHeader[0],
                nganh: rows,
                total
            };
            const source = hinhThuc == 'DT' ? app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'sdh_ts_ket_qua_thi_template.docx') : app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'sdh_ts_ket_qua_xet_tuyen_template.docx');
            const buffer = await app.docx.generateFile(source, data);
            // let printTime = Date.now();
            // const fileName = `ket-qua-thi-${dataHeader[0].maDot}-${mapperPhanHe[maPhanHe]}-${hinhThuc}.pdf`;
            // const filePdfPath = `${zipToPrintFolder}/ket-qua-thi-${printTime}${idDot}${maPhanHe}.pdf`;
            const pdfBuffer = await app.docx.toPdfBuffer(buffer);
            // await app.fs.writeFileSync(filePdfPath, pdfBuffer);
            app.io.to('sdhTsDiemImportData').emit('export-diem-thi-done', { buffer: pdfBuffer, requester });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/ket-qua-thi/download-export', app.permission.check('sdhTsKetQuaThi:export'), async (req, res) => {
        try {
            let outputPath = req.query.outputPath;
            res.sendFile(outputPath);
        } catch (error) {
            res.send({ error });
        }
    });
};
