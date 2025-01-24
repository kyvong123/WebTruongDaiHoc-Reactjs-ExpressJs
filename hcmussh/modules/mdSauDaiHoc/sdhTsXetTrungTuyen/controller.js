module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7625: {
                title: 'Xét trúng tuyển',
                link: '/user/sau-dai-hoc/tuyen-sinh/xet-trung-tuyen',
                parentKey: 7544,
                icon: 'fa-graduation-cap',
                backgroundColor: '#0fd920'
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsXetTrungTuyen:read', menu },
        { name: 'sdhTsXetTrungTuyen:manage', menu },
        'sdhTsXetTrungTuyen:write',
        'sdhTsXetTrungTuyen:import',
        'sdhTsXetTrungTuyen:export'
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/xet-trung-tuyen', app.permission.orCheck('sdhTsXetTrungTuyen:manage', 'sdhTsXetTrungTuyen:write', 'sdhTsXetTrungTuyen:read'), app.templates.admin);

    app.get('/api/sdh/ts/xet-trung-tuyen/page/:pageNumber/:pageSize', app.permission.check('sdhTsXetTrungTuyen:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const sort = filter ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.xetTuyenSearchPageNew(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/xet-trung-tuyen', app.permission.check('sdhTsXetTrungTuyen:write'), async (req, res) => {
        try {
            const { idNganh, diem = {}, listThiSinh } = req.body.data;
            let count = 0;
            const dataMaToHop = Object.keys(diem);
            const dataDiem = dataMaToHop.filter(i => i != 'TB' && i != 'NN');
            let listThiSinhNew = [];
            if (idNganh) {
                listThiSinhNew = listThiSinh.filter(item => item.idNganh == idNganh && !item.isCongBo && item.hinhThucActive);
            } else {
                listThiSinhNew = listThiSinh.filter(item => !item.isCongBo && item.hinhThucActive);
            }
            //Điều kiện đối tượng là thí sinh dự thi
            const conditionDT = !dataMaToHop.includes('TB');
            //Điều kiện phân hệ là nghiên cứu sinh
            const conditionPhanHe = dataMaToHop.includes('DC');
            const diemNN = diem['NN'];
            let condition = true;
            let trungTuyen = [], koTrungTuyen = [];
            if (!diem['tongDiem']) {
                for (let thiSinh of listThiSinhNew) {
                    condition = true;
                    const diemThiSinh = thiSinh.diem;
                    if (!diemThiSinh.length) {
                        koTrungTuyen.push(thiSinh);
                        continue;
                    }
                    if (diemNN) {
                        condition = (thiSinh.xetTuyenNgoaiNgu) ? true : (Number(diemThiSinh.find(i => ['NN'] in i)['NN']) || 0) >= Number(diemNN);
                        if (!condition) { koTrungTuyen.push(thiSinh); continue; }
                    }
                    if (!conditionDT && 'TB' in diem) {
                        !thiSinh.diemDh || Number(thiSinh.diemDh) < Number(diem['TB']) ? condition = false : null; //Chỉ xét điểm dh, do dh yêu câu bắt buộc
                        if (!condition) { koTrungTuyen.push(thiSinh); continue; }
                    }
                    for (let i of dataDiem) {
                        if (i == 'NN' || (i == 'TB' && !conditionDT)) break;
                        else if (i == 'XHS') {
                            const result = await app.model.sdhTsInfoCaThiThiSinh.checkMonXhs(thiSinh);
                            if (result.rows.length) {
                                let diemThanhPhan = diemThiSinh.find(item => i in item);
                                condition =
                                    !diemThanhPhan ||
                                        (Number(diem[i]) && Number(diemThanhPhan[i] || 0) < Number(diem[i])) ? false : true;
                            }
                            if (!condition) { koTrungTuyen.push(thiSinh); break; }
                        } else {
                            let diemThanhPhan = diemThiSinh.find(item => i in item);
                            condition =
                                !diemThanhPhan ||
                                    (Number(diem[i]) && Number(diemThanhPhan[i] || 0) < Number(diem[i])) ? false : true;
                            if (!condition) { koTrungTuyen.push(thiSinh); break; }
                        }


                    }
                    if (!koTrungTuyen.find(item => item.id == thiSinh.id)) trungTuyen.push(thiSinh);
                }
                await Promise.all([
                    ...trungTuyen.map(item => app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: item.id, maHinhThuc: item.hinhThuc }, { trungTuyen: 1 })),
                    ...koTrungTuyen.map(item => app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: item.id, maHinhThuc: item.hinhThuc }, { trungTuyen: 0 }))
                ]);
                count = trungTuyen.length;
            } else {
                //xet trên tổng tiêu chí
                for (let item of listThiSinhNew) {
                    const diemThiSinh = item.diem;
                    if (!diemThiSinh.length) continue;
                    let total = 0;
                    for (let i of diemThiSinh) {
                        if (Object.keys(i)[0] == 'NN' || Object.keys(i)[0] == 'TB') continue;
                        total += Number(Object.values(i)[0] || 0);
                        total += !conditionDT ? (conditionPhanHe ? Number(item.diemThS || 0) : Number(item.diemDh || 0)) : 0;
                    }
                    const conditionUpdate = item.xetTuyenNgoaiNgu ?
                        total >= (Number(diem['tongDiem'])) :
                        (total + (diemThiSinh.find(i => 'NN' in i)['NN'] || 0)) >= Number(diem['tongDiem']);

                    if (conditionUpdate) {
                        count += 1;
                        await app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: item.id, maHinhThuc: item.hinhThuc }, { trungTuyen: 1 });
                    } else if (item.trungTuyen && item.trungTuyen == 1) {
                        await app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: item.id, maHinhThuc: item.hinhThuc }, { trungTuyen: 0 });
                    }
                }
            }
            res.send({ count });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });
    app.readyHooks.add('addSocketListener:sdhTsTrungTuyenExportData', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('sdhTsTrungTuyenExportData', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('sdhTsXetTrungTuyen:export')) {
                socket.join('sdhTsTrungTuyenExportData');
            }
        }),
    });
    app.get('/api/sdh/ts/trung-tuyen/export-pdf', app.permission.check('sdhTsXetTrungTuyen:export'), async (req, res) => {
        try {
            res.end();
            const { filter } = req.query;
            const { maPhanHe } = filter;
            const mapperHinhThuc = { '01': 'DT', '02': 'XT', '03': 'TT', '04': 'KH' };
            let { rows, dataHeader } = await app.model.sdhTsInfoCaThiThiSinh.getExportTrungTuyen(app.utils.stringify(filter));
            let title = '';
            let source = '';
            if (maPhanHe == '01') {
                title = 'DANH SÁCH THÍ SINH TRÚNG TUYỂN NGHIÊN CỨU SINH';
                source = app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'sdh_ts_trung_tuyen_ncs_template.docx');
            } else if (maPhanHe == '02') {
                title = 'DANH SÁCH THÍ SINH TRÚNG TUYỂN CAO HỌC';
                source = app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'sdh_ts_trung_tuyen_cao_hoc_template.docx');
            } else if (maPhanHe == '03') {
                title = 'DANH SÁCH THÍ SINH TRÚNG TUYỂN DỰ BỊ TIẾN SĨ';
                source = app.path.join(app.assetPath, 'sdh/tuyen-sinh', 'sdh_ts_trung_tuyen_dbts_template.docx');
            }
            dataHeader[0].title = title;
            dataHeader[0].tenDot = dataHeader[0].tenDot.toUpperCase();
            let total = 0;
            rows.forEach(item => {
                item.dataThiSinh = app.utils.parse(item.dataThiSinh);
                let index = 1;
                item.dataThiSinh.forEach(i => {
                    i.R = index;
                    let result = { 'NN': '' };
                    const ketQuaThi = i.ketQuaThi?.map(diem => diem);
                    let newKetQuaThi = [{}];
                    // Xử lý điểm nghe đọc nói viết 
                    ketQuaThi?.forEach(cell => {
                        if (cell.hasOwnProperty('NN')) {
                            cell['NN'] ? result['NN'] = (Number(result['NN']) || 0) + Number(cell['NN']) : null;
                        } else {
                            newKetQuaThi[0][Object.keys(cell)] = Object.values(cell)[0];
                        }
                    });
                    let td = 0;
                    Object.values(newKetQuaThi[0]).forEach(i => td += Number(i || 0));
                    i.td = td;
                    newKetQuaThi[0]['NN'] = result['NN'] ? (result['NN'] / 4).toFixed(1) : '';
                    i.ghiChu == '1' ? newKetQuaThi[0]['NN'] = 'XT ngoại ngữ' : null;
                    i.ngaySinh = app.date.dateFormat(new Date(i.ngaySinh));
                    const hinhThuc = mapperHinhThuc[i.hinhThuc];
                    i.ghiChu = hinhThuc == 'DT' || maPhanHe == '01' ? '' : (hinhThuc == 'TT' ? 'TT' : 'XT');
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
            // await app.fs.createFolder(app.path.join(app.assetPath, 'sdh'), app.path.join(app.assetPath, 'sdh', 'trung-tuyen'));
            // const zipToPrintFolder = app.path.join(app.assetPath, 'sdh/trung-tuyen');
            const buffer = await app.docx.generateFile(source, data);
            // let printTime = Date.now();
            // const filePdfPath = `${zipToPrintFolder}/danh-sach-trung-tuyen-${printTime}${idDot}${maPhanHe}.pdf`;
            const pdfBuffer = await app.docx.toPdfBuffer(buffer);
            // await app.fs.writeFileSync(filePdfPath, pdfBuffer);
            // const mapperPhanHe = { '01': 'NCS', '02': 'CH', '03': 'DBTS', '04': 'LT' };
            // const fileNameUser = `danh-sach-trung-tuyen-${mapperPhanHe[filter.maPhanHe]}-${dataHeader[0].maDot}`;
            // app.io.to('sdhTsTrungTuyenExportData').emit('export-trung-tuyen-done', { path: filePdfPath, fileName: fileNameUser });
            app.io.to('sdhTsTrungTuyenExportData').emit('export-trung-tuyen-done', { buffer: pdfBuffer, requester: req.session.user.email });

        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/trung-tuyen/download-export', app.permission.check('sdhTsXetTrungTuyen:export'), async (req, res) => {
        try {
            let outputPath = req.query.outputPath;
            res.sendFile(outputPath);
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/sdh/dsts/trung-tuyen/download-excel', app.permission.check('sdhDsTs:export'), async (req, res) => {
        try {
            const selectHeDaoTao = [{ id: 0, text: 'Trống' }, { id: 1, text: 'Chính quy' }, { id: 2, text: 'Không chính quy' }],
                selectLoaiTotNghiep = [{ id: 0, text: 'Trống' }, { id: 1, text: 'Trung bình' }, { id: 2, text: 'Trung bình khá' }, { id: 3, text: 'Khá' }, { id: 4, text: 'Giỏi' }, { id: 5, text: 'Xuất sắc' }];
            let filter = req.query.filter;
            filter = JSON.parse(filter);
            let { sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsInfoCaThiThiSinh.xetTuyenSearchPageNew(1, 10000, filter, '');
            const { rows: list } = page;
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('DATA');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'SBD', key: 'soBaoDanh', width: 15 },
                { header: 'TRÚNG TUYỂN', key: 'trungTuyen', width: 15 },
                { header: 'HỌ', key: 'ho', width: 15 },
                { header: 'TÊN', key: 'ten', width: 15 },
                { header: 'MÃ NGÀNH', key: 'maNganh', width: 15 },
                { header: 'TÊN NGÀNH', key: 'tenNganh', width: 50 },
                { header: 'PHÂN HỆ', key: 'tenPhanHe', width: 15 },
                { header: 'HÌNH THỨC', key: 'tenHinhThuc', width: 15 },
                { header: 'BỔ SUNG KIẾN THỨC', key: 'btkt', width: 15 },
                { header: 'NGÀY SINH', key: 'ngaySinh', width: 15, alignment: { vertical: 'middle' } },
                { header: 'GIỚI TÍNH', key: 'gioiTinh', width: 10 },
                { header: 'NGHỀ NGHIỆP', key: 'ngheNghiep', width: 15 },
                { header: 'ĐƠN VỊ', key: 'donVi', width: 30 },
                { header: 'NƠI SINH', key: 'noiSinh', width: 30 },
                { header: 'DÂN TỘC', key: 'danToc', width: 15 },
                { header: 'ĐỐI TƯỢNG ƯU TIÊN', key: 'doiTuongUuTien', width: 30 },
                { header: 'PHƯỜNG/XÃ', key: 'tenPhuongXa', width: 15 },
                { header: 'QUẬN/HUYỆN', key: 'tenQuanHuyen', width: 15 },
                { header: 'TỈNH/THÀNH PHỐ', key: 'tenTinhThanhPho', width: 30 },
                { header: 'SỐ NHÀ/ĐƯỜNG', key: 'soNhaDuong', width: 15 },
                { header: 'ĐIỆN THOẠI LIÊN LẠC', key: 'dienThoai', width: 15 },
                { header: 'EMAIL', key: 'email', width: 15 },
                { header: 'TRƯỜNG TN ĐH', key: 'truongTnDh', width: 15 },
                { header: 'NGÀNH TN ĐH', key: 'nganhTnDh', width: 15 },
                { header: 'NĂM TN ĐH', key: 'namTnDh', width: 15 },
                { header: 'HỆ ĐH', key: 'heDh', width: 15 },
                { header: 'ĐIỂM TB ĐH', key: 'diemDh', width: 15 },
                { header: 'XẾP LOẠI ĐH', key: 'xepLoaiDh', width: 15 },
                { header: 'TRƯỜNG TN THS', key: 'truongTnThs', width: 15 },
                { header: 'NGÀNH TN THS', key: 'nganhTnThs', width: 15 },
                { header: 'NĂM TN THS', key: 'namTnThs', width: 15 },
                { header: 'HỆ THS', key: 'heThs', width: 15 },
                { header: 'ĐIỂM TB THS', key: 'diemThs', width: 15 },
                { header: 'XẾP LOẠI THS', key: 'xepLoaiThs', width: 15 },
                { header: 'THI NGOẠI NGỮ', key: 'thiNgoaiNgu', width: 15 },
                { header: 'NGOẠI NGỮ', key: 'xtNgoaiNgu', width: 15 },
                { header: 'LOẠI CHỨNG CHỈ', key: 'loaiChungChi', width: 15 },
                { header: 'ĐIỂM CẤU TRÚC', key: 'diemCauTruc', width: 15 },
                { header: 'ĐIỂM NGHE', key: 'diemNghe', width: 15 },
                { header: 'ĐIỂM ĐỌC', key: 'diemDoc', width: 15 },
                { header: 'ĐIỂM NÓI', key: 'diemNoi', width: 15 },
                { header: 'ĐIỂM VIẾT', key: 'diemViet', width: 15 },
                { header: 'ĐIỂM CHỨNG CHỈ', key: 'diemChungChi', width: 15 },
                { header: 'MÃ CHỨNG CHỈ', key: 'maChungChi', width: 15 },
                { header: 'TÊN ĐỀ TÀI', key: 'tenDeTai', width: 15 },
                { header: 'GHI CHÚ', key: 'ghiChu', width: 15 },
                { header: 'ĐIỂM NGOẠI NGỮ', key: 'NN', width: 15 },
                { header: 'ĐIỂM CƠ BẢN', key: 'CB', width: 15 },
                { header: 'ĐIỂM CƠ SỞ', key: 'CS', width: 15 },
                { header: 'ĐIỂM PHỎNG VẤN', key: 'VD', width: 15 },
                { header: 'ĐIỂM BÀI LUẬN', key: 'BL', width: 15 },
                { header: 'ĐIỂM BẢO VỆ ĐỀ CƯƠNG', key: 'DC', width: 15 }
            ];
            list.forEach((item, index) => {
                let data = {
                    stt: index + 1, ...item, ngaySinh: app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy'),
                    gioiTinh: JSON.parse(item.gioiTinh)?.vi, isXetDuyet: item.isXetDuyet == 0 ? 'Chờ duyệt' : (item.isXetDuyet == 1 ? 'Duyệt' : 'Không duyệt'),
                    btkt: item.btkt ? 'CÓ' : 'KHÔNG',
                    trungTuyen: item.trungTuyen ? 'Đạt' : 'Không đạt',
                    noiSinh: item.noiSinhTinh || item.noiSinhQuocGia,
                    heThs: selectHeDaoTao.find(i => i.id == item.heThs)?.text || item.heThs || '',
                    heDh: selectHeDaoTao.find(i => i.id == item.heDh)?.text || item.heDh || '',
                    xepLoaiDh: selectLoaiTotNghiep.find(i => i.id == item.xepLoaiDh)?.text || item.xepLoaiDh || '',
                    xepLoaiThs: selectLoaiTotNghiep.find(i => i.id == item.xepLoaiThs)?.text || item.xepLoaiThs || '',
                    xtNgoaiNgu: item.ngoaiNgu || JSON.parse(item.listMonThi)?.map(i => i.tenMonThi).join(', '),
                    dienThoai: (item.dienThoai || '').toString(),
                    thiNgoaiNgu: item.ngoaiNgu ? 'Xét tuyển' : 'Thi Tuyển',
                    ngayDangKy: app.date.dateTimeFormat(new Date(Number(item.ngayDangKy)), 'dd/mm/yyyy'),
                };
                const diem = JSON.parse(item.diem || '[]');
                const diemDetail = diem.reduce((pre, cur) => {
                    if ('NN' in cur) {
                        pre['NN'] += Number(cur['NN'] * (cur['kyLuat']) || 0);
                    } else {
                        for (let x of (Object.keys(cur) || [])) {
                            if (!x || x == 'NULL' || x == 'kyLuat') continue;
                            pre[`${x}`] = Number(cur[x]);
                        }
                    }
                    return pre;
                }, { 'NN': 0 });
                data = { ...data, ...diemDetail };
                data['NN'] = data['thiNgoaiNgu'] == 'Xét tuyển' ? 'XT ngoại ngữ' : data['NN'];
                ws.addRow(data, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, 'SDH_KET_QUA_TUYEN_SINH.xlsx');
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/xet-trung-tuyen/single', app.permission.check('sdhTsXetTrungTuyen:write'), async (req, res) => {
        try {
            const { id, trungTuyen, hinhThuc } = req.body.data;
            await app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: id, maHinhThuc: hinhThuc }, { trungTuyen });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/trung-tuyen/cong-bo', app.permission.check('sdhTsXetTrungTuyen:write'), async (req, res) => {
        try {
            const dataThiSinh = req.body.data;
            await app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: dataThiSinh.id, maHinhThuc: dataThiSinh.hinhThuc }, { congBoTrungTuyen: 1, ngayCongBo: Date.now() });
            app.model.sdhTsBackUpTrungTuyen.create({ idThiSinh: dataThiSinh.id, maHinhThuc: dataThiSinh.hinhThuc, trungTuyen: dataThiSinh.trungTuyen, modifier: req.session.user.email, timeModified: Date.now() });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/trung-tuyen/cong-bo/list', app.permission.check('sdhTsXetTrungTuyen:write'), async (req, res) => {
        try {
            const { dataThiSinh = [], maHinhThuc } = req.body.data;
            await Promise.all(dataThiSinh.flatMap(item => ([
                app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: item.id, maHinhThuc }, { congBoTrungTuyen: 1, ngayCongBo: Date.now() })
                , app.model.sdhTsBackUpTrungTuyen.create({ idThiSinh: item.id, trungTuyen: item.trungTuyen, maHinhThuc: item.hinhThuc, modifier: req.session.user.email, timeModified: Date.now() })
            ])));
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/trung-tuyen/change/hinh-thuc', app.permission.check('sdhTsXetTrungTuyen:write'), async (req, res) => {
        try {
            const dataThiSinh = req.body.dataThiSinh;
            await app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: dataThiSinh.id, maHinhThuc: dataThiSinh.originalHinhThuc.ma }, { active: 0, ghiChu: `Thí sinh đã được chuyển sang hình thức ${dataThiSinh.destinationHinhThuc.text}, xin vui lòng theo dõi và thực hiện quy trình tuyển sinh của phương thức mới!` });
            await app.model.sdhTsLichSuHinhThuc.create({ idThiSinh: dataThiSinh.id, maHinhThuc: dataThiSinh.destinationHinhThuc.ma, active: 1 });
            await app.model.sdhTsThongTinCoBan.update({ id: dataThiSinh.id }, { hinhThuc: dataThiSinh.destinationHinhThuc.ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/trung-tuyen/change/check-hinh-thuc', app.permission.check('sdhTsXetTrungTuyen:write'), async (req, res) => {
        try {
            const idNganh = req.query.idNganh;
            const nganh = await app.model.sdhTsInfoNganh.get({ id: idNganh });
            const listIdHinhThuc = nganh.listIdHinhThuc?.split(',') || [];
            if (!listIdHinhThuc.length) throw { message: `Chưa có cấu hình hình thức cho ngành ${idNganh}` };
            let listHinhThuc = await Promise.all(listIdHinhThuc.map(item => app.model.sdhTsInfoHinhThuc.get({ id: item })));
            listHinhThuc = listHinhThuc.filter(item => item.maHinhThuc == '01' || item.maHinhThuc == '04');
            listHinhThuc = listHinhThuc.map(item => {
                if (item.maHinhThuc == '01') return { ma: item.maHinhThuc, text: 'Dự thi' };
                else return { ma: item.maHinhThuc, text: 'Xét tuyển kết hợp thi tuyển' };
            });
            res.send(listHinhThuc[0]);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/thi-sinh/trung-tuyen/:idThiSinh', app.permission.orCheck('sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:write', 'sdhTsThiSinh:login'), async (req, res) => {
        try {
            const data = await app.model.sdhTsLichSuHinhThuc.getAll({ idThiSinh: req.params.idThiSinh });
            res.send({ items: data });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};