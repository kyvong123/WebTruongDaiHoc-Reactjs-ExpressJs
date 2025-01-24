const dateformat = require('dateformat');
module.exports = app => {
    // Export xlsx
    // Get data Nganh
    app.get('/api/dt/thoi-khoa-bieu/download-template', app.permission.orCheck('dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:import'), async (req, res) => {
        //Get data Khoa bo mon
        let khoaBoMon = await app.model.dmDonVi.getAll({ kichHoat: 1 }, 'ten');
        khoaBoMon = khoaBoMon.map(ele => ele.ten);
        //Get data Nganh
        let nganhDaoTao = await app.model.dtNganhDaoTao.getAll({ kichHoat: 1 }, 'tenNganh');
        nganhDaoTao = nganhDaoTao.map(ele => ele.tenNganh);
        //Get mon hoc
        let monHoc = await app.model.dtChuongTrinhDaoTao.getAll({ kichHoat: 1 }, '*');
        monHoc = monHoc.map(ele => ele.tenMonHoc);
        //Get Cau truc dao tao
        let ctDaoTao = await app.model.dtCauTrucKhungDaoTao.getAll({}, '*');
        const nam = ctDaoTao.map(ele => ele.namDaoTao);
        const khoa = ctDaoTao.map(ele => ele.khoa);

        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Thoi_khoa_bieu_Template');
        const defaultColumns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'MÃ', key: 'ma', width: 20 },
            { header: 'MÔN HỌC', key: 'monHoc', width: 20 },
            { header: 'TỰ CHỌN', key: 'tuChon', width: 20 },
            { header: 'TỔNG TIẾT', key: 'tongTiet', width: 20 },
            { header: 'THỨ', key: 'thu', width: 25 },
            { header: 'TIẾT BẮT ĐẦU', key: 'tietBatDau', width: 25 },
            { header: 'SỐ TIẾT', key: 'soTiet', width: 25 },
            { header: 'SLDK', key: 'sldk', width: 25 },
            { header: 'NGÀNH', key: 'nganh', width: 20 },
            { header: 'CHUYÊN NGÀNH', key: 'chuyenNganh', width: 25 },
            { header: 'NGÀY BẮT ĐẦU', key: 'ngayBatDau', width: 25 },
            { header: 'NGÀY KẾT THÚC', key: 'ngayKetThuc', width: 25 },
            { header: 'KHOA/BỘ MÔN', key: 'khoa', width: 20 },
            { header: 'GIẢNG VIÊN', key: 'giangVien', width: 25 },
            { header: 'TRỢ GIẢNG', key: 'troGiang', width: 25 },
            { header: 'KHOÁ SV', key: 'khoaSV', width: 25 },
            { header: 'NĂM HỌC', key: 'nam', width: 25 },
            { header: 'HỌC KỲ', key: 'hocKy', width: 25 },
            { header: 'NHÓM', key: 'nhom', width: 25 },
            { header: 'SỐ BUỔI TRÊN TUẦN', key: 'buoiTrenTuan', width: 25 },

        ];
        ws.columns = defaultColumns;
        const { dataRange: khoaBM } = workBook.createRefSheet('Khoa_Bo_Mon', khoaBoMon);
        const { dataRange: nganhHoc } = workBook.createRefSheet('Nganh', nganhDaoTao);
        const { dataRange: mon } = workBook.createRefSheet('Mon_Hoc', monHoc);
        const { dataRange: khoaHoc } = workBook.createRefSheet('Khoa_Hoc', khoa);
        const { dataRange: namHoc } = workBook.createRefSheet('Nam_Hoc', nam);

        const rows = ws.getRows(2, 1000);
        rows.forEach((row) => {
            row.getCell('monHoc').dataValidation = { type: 'list', allowBlank: true, formulae: [mon] };
            row.getCell('nganh').dataValidation = { type: 'list', allowBlank: true, formulae: [nganhHoc] };
            row.getCell('khoa').dataValidation = { type: 'list', allowBlank: true, formulae: [khoaBM] };
            row.getCell('nam').dataValidation = { type: 'list', allowBlank: true, formulae: [namHoc] };
            row.getCell('khoaSV').dataValidation = { type: 'list', allowBlank: true, formulae: [khoaHoc] };
        });
        app.excel.attachment(workBook, res, 'Thoi_khoa_bieu_Template.xlsx');

    });

    app.get('/api/dt/thoi-khoa-bieu/download-excel', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter || {});

            await app.model.dtAssignRole.getDataRole('dtThoiKhoaBieu', req.session.user, filter);

            filter = app.utils.stringify(filter, '');
            let data = await app.model.dtThoiKhoaBieu.downloadExcel(filter),
                list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Data');

            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(list[0]).map(key => ({ header: key.toString(), key, width: 20 }))];
            list.forEach((item, index) => {
                item['Tên môn học'] = app.utils.parse(item['Tên môn học'] || { vi: '' }).vi;
                item['Bắt đầu'] = item['Bắt đầu'] ? app.date.viDateFormat(new Date(item['Bắt đầu'])) : '';
                item['Kết thúc'] = item['Kết thúc'] ? app.date.viDateFormat(new Date(item['Kết thúc'])) : '';
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });

            let fileName = 'THOI_KHOA_BIEU.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/export-tong', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter || {}),
                { listKhoaSV, listKhoa, listTenKhoa, listDonViChuQuan } = filter;
            filter = { ...filter, listKhoaSV, listKhoa, listDonViChuQuan };
            await app.model.dtAssignRole.getDataRole('dtThoiKhoaBieu', req.session.user, filter);
            filter = app.utils.stringify(filter);
            const data = await app.model.dtThoiKhoaBieu.exportData(filter);
            const list = data.rows;
            if (list.length == 0) {
                res.status(400).send('Không có học phần');
            }
            else {
                const workBook = app.excel.create();
                if (listKhoa == '') {
                    let condition = {
                        statement: '(maPl = :maPl) AND kichHoat = 1',
                        parameter: {
                            maPl: 1
                        },
                    };
                    const items = await app.model.dmDonVi.getAll(condition, 'ma,ten', 'ma');
                    listTenKhoa = items.map(item => item.ten).join(',');
                }
                listTenKhoa = listTenKhoa.split(',');
                for (let khoa of listTenKhoa) {
                    let listHocPhan = list, listTheoKhoa = [];
                    if (khoa == 'Phòng Đào tạo') {
                        listTheoKhoa = listHocPhan.filter(item => item.khoaDangKy == 33);
                    } else {
                        listTheoKhoa = listHocPhan.filter(item => item['Khoa / Bộ môn']?.includes(khoa));
                    }
                    if (listTheoKhoa.length == 0) continue;
                    const ws = workBook.addWorksheet(khoa.getFirstLetters());
                    let listKhoaSinhVien = Object.keys(listTheoKhoa.groupBy('khoaSinhVien')),
                        listMonTheoKhoaSv = listTheoKhoa.groupBy('khoaSinhVien');
                    listTheoKhoa = listTheoKhoa.map(item => {
                        item['Sĩ số'] = item['Sĩ số'] || 0;
                        item['Phòng'] = item['Phòng'] || '';
                        switch (item['Thứ']) {
                            case 2:
                                item['Thứ'] = 'Thứ Hai';
                                break;
                            case 3:
                                item['Thứ'] = 'Thứ Ba';
                                break;
                            case 4:
                                item['Thứ'] = 'Thứ Tư';
                                break;
                            case 5:
                                item['Thứ'] = 'Thứ Năm';
                                break;
                            case 6:
                                item['Thứ'] = 'Thứ Sáu';
                                break;
                            case 7:
                                item['Thứ'] = 'Thứ Bảy';
                                break;
                            case 8:
                                item['Thứ'] = 'Chủ Nhật';
                                break;
                            default:
                                item['Thứ'] = '';
                                break;
                        }
                        item['Tiết'] = item.tietBatDau ? `${item.tietBatDau}-${item.tietBatDau + item.soTietBuoi - 1}` : '';
                        let ngayBatDau = new Date(item.ngayBatDau).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                            ngayKetThuc = new Date(item.ngayKetThuc).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                        item['Thời gian học'] = (item.ngayBatDau && item.ngayKetThuc) ? `${ngayBatDau}-${ngayKetThuc}` : '';
                        item['Tên CBGD'] = item.troGiang ? (item.giangVien ? `${item.giangVien}, ${item.troGiang}` : '') : '';
                        return {
                            'Mã học phần': item['Mã học phần'],
                            'Tên HP': item['Tên HP'],
                            'Số TC': item['Số TC'],
                            'Số tiết': item['Số tiết'],
                            'Lớp': item['Lớp'],
                            'Sĩ số': item['Sĩ số'],
                            'Thứ': item['Thứ'],
                            'Tiết': item['Tiết'],
                            'Phòng': item['Phòng'],
                            'Thời gian học': item['Thời gian học'],
                            'Tên CBGD': item['Tên CBGD'],
                        };
                    });
                    ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(listTheoKhoa[0]).map(key => ({ header: key.toString(), key, width: 20 }))];
                    const header = ws.getRow(1);
                    header.eachCell({ includeEmpty: true }, (cell => {
                        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    }));
                    listKhoaSinhVien.forEach(khoaSv => {
                        let listTheoKhoaSv = listMonTheoKhoaSv[khoaSv];
                        ws.addRow({});
                        ws.mergeCells(`A${ws._rows.length}:L${ws._rows.length}`);
                        ws.getCell(`A${ws._rows.length}`).value = `Khoá ${khoaSv}`;
                        listTheoKhoaSv.forEach((item, index) => {
                            item['Tên HP'] = app.utils.parse(item['Tên HP'] || { vi: '' }).vi || item['Tên HP'];
                            ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
                        });
                    });
                }
                let fileName = 'THOI_KHOA_BIEU_TONG.xlsx';
                app.excel.attachment(workBook, res, fileName);
            }
        } catch (error) {
            app.consoleError(req, error);
            res.status(400).send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/export-theo-mon', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter || {}),
                { listKhoa, listDonViChuQuan } = filter;
            filter = { ...filter, listKhoa, listDonViChuQuan };
            await app.model.dtAssignRole.getDataRole('dtThoiKhoaBieu', req.session.user, filter);
            filter = app.utils.stringify(filter);
            const data = await app.model.dtThoiKhoaBieu.exportData(filter),
                list = data.rows;
            if (list.length == 0) {
                res.status(400).send('Không có học phần');
            }
            else {
                let listTheoMon = list.groupBy('maMonHoc'),
                    listMonHoc = Object.keys(listTheoMon);
                const workBook = app.excel.create();
                for (let monHoc of listMonHoc) {
                    const ws = workBook.addWorksheet(monHoc);
                    listTheoMon[monHoc] = listTheoMon[monHoc].map(item => {
                        switch (item['Thứ']) {
                            case 2:
                                item['Thứ'] = 'Thứ Hai';
                                break;
                            case 3:
                                item['Thứ'] = 'Thứ Ba';
                                break;
                            case 4:
                                item['Thứ'] = 'Thứ Tư';
                                break;
                            case 5:
                                item['Thứ'] = 'Thứ Năm';
                                break;
                            case 6:
                                item['Thứ'] = 'Thứ Sáu';
                                break;
                            case 7:
                                item['Thứ'] = 'Thứ Bảy';
                                break;
                            case 8:
                                item['Thứ'] = 'Chủ Nhật';
                                break;
                            default:
                                item['Thứ'] = '';
                                break;
                        }
                        item['Tiết'] = item.tietBatDau ? `${item.tietBatDau}-${item.tietBatDau + item.soTietBuoi - 1}` : '';
                        let ngayBatDau = new Date(item.ngayBatDau).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                            ngayKetThuc = new Date(item.ngayKetThuc).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                        item['Thời gian học'] = (item.ngayBatDau && item.ngayKetThuc) ? `${ngayBatDau}-${ngayKetThuc}` : '';
                        item['Tên CBGD'] = item.troGiang ? `${item.giangVien}, ${item.troGiang}` : item.giangVien;
                        return {
                            'Tên HP': item['Tên HP'],
                            'Nhóm/Lớp': item['Nhóm/Lớp'],
                            'Số TC': item['Số TC'],
                            'Số tiết': item['Số tiết'],
                            'Khoa / Bộ môn': item['Khoa / Bộ môn'],
                            'Sĩ số': item['Sĩ số'],
                            'Thứ': item['Thứ'],
                            'Tiết': item['Tiết'],
                            'Phòng': item['Phòng'],
                            'Thời gian học': item['Thời gian học'],
                            'Tên CBGD': item['Tên CBGD'],
                        };
                    });
                    ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(listTheoMon[monHoc][0]).map(key => ({ header: key.toString(), key, width: 20 }))];
                    const header = ws.getRow(1);
                    header.eachCell({ includeEmpty: true }, (cell => {
                        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    }));
                    listTheoMon[monHoc].forEach((item, index) => {
                        item['Tên HP'] = app.utils.parse(item['Tên HP'] || { vi: '' }).vi || item['Tên HP'];
                        ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
                    });
                }
                let fileName = 'THOI_KHOA_BIEU_THEO_MON.xlsx';
                app.excel.attachment(workBook, res, fileName);
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/export-file-import', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter || {}),
                { listKhoaSV, listKhoa, listDonViChuQuan } = filter;
            filter = { ...filter, listKhoaSV, listKhoa, listDonViChuQuan };
            await app.model.dtAssignRole.getDataRole('dtThoiKhoaBieu', req.session.user, filter);
            filter = app.utils.stringify(filter);
            const [data, dataDonVi] = await Promise.all([
                app.model.dtThoiKhoaBieu.exportData(filter),
                app.model.dmMonHoc.getDonVi('{}'),
            ]);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('ThoiKhoaBieu'),
                wsDonVi = workBook.addWorksheet('DanhSachMaDonVi');

            const defaultColumns = [
                { header: 'MÃ HỌC PHẦN', key: 'ma', width: 20 },
                { header: 'NHÓM', key: 'nhom', width: 20 },
                { header: 'MÔN HỌC', key: 'monHoc', width: 20 },
                { header: 'PHÒNG', key: 'phong', width: 25 },
                { header: 'THỨ', key: 'thu', width: 25 },
                { header: 'TIẾT BẮT ĐẦU', key: 'tietBatDau', width: 25 },
                { header: 'SỐ TIẾT', key: 'soTiet', width: 25 },
                { header: 'SỐ LƯỢNG TỐI ĐA', key: 'sldk', width: 25 },
                { header: 'LỚP', key: 'lop', width: 25 },
                { header: 'NGÀY BẮT ĐẦU', key: 'ngayBatDau', width: 25 },
                { header: 'NGÀY KẾT THÚC', key: 'ngayKetThuc', width: 25 },
                { header: 'MÃ CÁN BỘ GIẢNG VIÊN', key: 'maCanBoGV', width: 25 },
                { header: 'TÊN CÁN BỘ GIẢNG VIÊN', key: 'tenCanBoGV', width: 25 },
                { header: 'MÃ CÁN BỘ TRỢ GIẢNG', key: 'maCanBoTG', width: 25 },
                { header: 'TÊN CÁN BỘ TRỢ GIẢNG', key: 'tenCanBoTG', width: 25 },
                { header: 'ĐƠN VỊ TỔ CHỨC', key: 'donViToChuc', width: 25 },
            ], defaultDonViColumns = [
                { header: 'MÃ KHOA/ĐƠN VỊ', key: 'maDonVi', width: 25 },
                { header: 'TÊN KHOA/ĐƠN VỊ', key: 'tenDonVi', width: 25 },
            ];

            ws.columns = defaultColumns;
            wsDonVi.columns = defaultDonViColumns;

            data.rows.forEach((item, index) => {
                let length = item['Mã học phần'].length;
                let maHocPhan = item['Mã học phần'].substr(0, length - 3);
                let rowData = {
                    ma: maHocPhan,
                    nhom: ('0' + item['Nhóm/Lớp']).slice(-2),
                    monHoc: app.utils.parse(item['Tên HP'] || { vi: '' }).vi,
                    phong: item['Phòng'],
                    thu: item['Thứ'],
                    tietBatDau: item.tietBatDau,
                    soTiet: item.soTietBuoi,
                    sldk: item.SLDK,
                    lop: item.maLop,
                    ngayBatDau: item.ngayBatDau ? app.date.viDateFormat(new Date(item.ngayBatDau)) : '',
                    ngayKetThuc: item.ngayKetThuc ? app.date.viDateFormat(new Date(item.ngayKetThuc)) : '',
                    maCanBoGV: item.shccGiangVien,
                    tenCanBoGV: item.giangVien,
                    maCanBoTG: item.shccTroGiang,
                    tenCanBoTG: item.troGiang,
                    donViToChuc: item.khoaDangKy,
                };
                ws.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            dataDonVi.rows.forEach((item, index) => {
                let rowData = {
                    maDonVi: item.ma,
                    tenDonVi: item.ten,
                };
                wsDonVi.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'ThoiKhoaBieu.xlsx';
            app.excel.attachment(workBook, res, fileName);

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/export-lich-day', app.permission.orCheck('dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:read', 'staff:login'), async (req, res) => {
        try {
            let { dataHocPhan } = req.query;
            dataHocPhan = app.utils.parse(dataHocPhan);

            const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
                worksheet = workBook.getWorksheet(1);
            let cells = await app.model.dtThoiKhoaBieuGiangVien.exportLichDay(dataHocPhan.maHocPhan, worksheet);
            app.excel.write(worksheet, cells);
            app.excel.attachment(workBook, res, `LICH_DAY_${dataHocPhan.maHocPhan}.xlsx`);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/sinh-vien/download-dssv-hoc-phan', app.permission.orCheck('dtDangKyHocPhan:export', 'staff:login'), async (req, res) => {
        let maHocPhan = req.query.maHocPhan;
        const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
            worksheet = workBook.getWorksheet(1);

        let [cells, tkbInfo] = await Promise.all([
            app.model.dtThoiKhoaBieuGiangVien.exportDanhSachSinhVien(maHocPhan, worksheet),
            app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
        ]);

        let tenMonHoc = app.utils.parse(tkbInfo.rows[0].tenMonHoc, { vi: '' })?.vi;
        tenMonHoc = xoaDau(tenMonHoc);

        app.excel.write(worksheet, cells);
        app.excel.attachment(workBook, res, `${maHocPhan}_${tenMonHoc}.xlsx`);
    });

    const xoaDau = (str) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/Đ/g, 'D');
        return str;
    };

    app.get('/api/dt/thoi-khoa-bieu/import/download-template', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('ThoiKhoaBieu');
        const defaultColumns = [
            { header: 'MÃ HỌC PHẦN', key: 'ma', width: 20 },
            { header: 'NHÓM', key: 'nhom', width: 20 },
            { header: 'MÔN HỌC', key: 'monHoc', width: 20 },
            { header: 'PHÒNG', key: 'phong', width: 25 },
            { header: 'THỨ', key: 'thu', width: 25 },
            { header: 'TIẾT BẮT ĐẦU', key: 'tietBatDau', width: 25 },
            { header: 'SỐ TIẾT', key: 'soTiet', width: 25 },
            { header: 'SỐ LƯỢNG TỐI ĐA', key: 'sldk', width: 25 },
            { header: 'LỚP', key: 'khoaSV', width: 25 },
            { header: 'NGÀY BẮT ĐẦU', key: 'ngayBatDau', width: 25 },
            { header: 'NGÀY KẾT THÚC', key: 'ngayKetThuc', width: 25 },
            { header: 'MÃ CÁN BỘ GIẢNG VIÊN', key: 'maCanBoGV', width: 25 },
            { header: 'TÊN CÁN BỘ GIẢNG VIÊN', key: 'tenCanBoGV', width: 25 },
            { header: 'MÃ CÁN BỘ TRỢ GIẢNG', key: 'maCanBoTG', width: 25 },
            { header: 'TÊN CÁN BỘ TRỢ GIẢNG', key: 'tenCanBoTG', width: 25 },
        ];
        ws.columns = defaultColumns;
        app.excel.attachment(workBook, res, 'ThoiKhoaBieu.xlsx');
    });

    app.get('/api/dt/thoi-khoa-bieu/sinh-vien/download-diem-danh-hoc-phan', app.permission.orCheck('dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:read', 'staff:login'), async (req, res) => {
        let maHocPhan = req.query.maHocPhan;

        const workBook = await app.excel.readFile(app.path.join(__dirname, './resource', 'FormDiemDanh.xlsx')),
            worksheet = workBook.getWorksheet(1);

        let cells = await app.model.dtThoiKhoaBieuGiangVien.exportDiemDanh(maHocPhan, worksheet);
        app.excel.write(worksheet, cells);
        app.excel.attachment(workBook, res, `BDDD_${maHocPhan}.xlsx`);
    });

    app.get('/api/dt/thoi-khoa-bieu/download-diem-tong-hop-hoc-phan/pdf', app.permission.orCheck('dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:read', 'staff:login'), async (req, res) => {
        try {
            const { dataHocPhan } = req.query,
                { maMonHoc, maHocPhan, namHoc, hocKy } = JSON.parse(dataHocPhan);

            app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-tong-hop'));

            const [dataTKB, config, listStudent] = await Promise.all([
                app.model.dtThoiKhoaBieu.getInfo(maHocPhan),
                app.model.dtDiemConfig.getData(app.utils.stringify({ namHoc, hocKy, maHocPhan, maMonHoc })),
                app.model.dtThoiKhoaBieu.getStudent(maHocPhan, app.utils.stringify({ namHoc, hocKy })),
            ]), printTime = new Date();

            let configThanhPhan = [];
            if (config.dataconfighocphan.length) {
                configThanhPhan = config.dataconfighocphan.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTram }));
            } else if (config.dataconfigmonhoc.length) {
                configThanhPhan = config.dataconfigmonhoc.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTram }));
            } else {
                configThanhPhan = config.dataconfigthanhphan.map(i => ({ loaiTp: i.loaiThanhPhan, tenTp: i.tenThanhPhan, phanTram: i.phanTramMacDinh }));
            }

            let dataSinhVienHocPhan = listStudent.rows.map((item, index) => {
                const diem = item.diem ? app.utils.parse(item.diem) : {},
                    diemDacBiet = item.diemDacBiet ? app.utils.parse(item.diemDacBiet) : {};

                const tp = configThanhPhan.map(i => ({ diem: diemDacBiet[i.loaiTp] || diem[i.loaiTp] || '' }));

                return {
                    ...item, tp, diemTk: diem['TK'] ?? '', ghiChu: item.ghiChu ?? '', R: index + 1,
                    ho: item.ho?.replaceAll('&apos;', '\'') || '',
                    ten: item.ten?.replaceAll('&apos;', '\'') || '',
                };
            }), dataToPrint = [];
            dataSinhVienHocPhan = Array.from(dataSinhVienHocPhan);

            const { tenNganh, tenMonHoc, tenHe, ngayBatDau, ngayKetThuc, listNienKhoa } = dataTKB.rows[0];
            let data = {
                namHoc, hocKy, tenNganh, tenHe, listNienKhoa, maHocPhan, tenMonHoc: `${maMonHoc} - ${app.utils.parse(tenMonHoc, { 'vi': '' }).vi}`,
                tpDiem: configThanhPhan, dd: new Date().getDate(), mm: new Date().getMonth() + 1, yyyy: new Date().getFullYear(),
                ngayBatDau: ngayBatDau ? app.date.dateTimeFormat(new Date(ngayBatDau), 'dd/mm/yyyy') : '',
                ngayKetThuc: ngayKetThuc ? app.date.dateTimeFormat(new Date(ngayKetThuc), 'dd/mm/yyyy') : '',
                tile: configThanhPhan.length ? configThanhPhan.map(tp => `${tp.tenTp}(${tp.phanTram}%)`).join(', ') : '',
            };

            if (data.ngayBatDau && data.ngayKetThuc) data.ngayBatDau = `${data.ngayBatDau} - `;
            const outputFolder = app.path.join(app.assetPath, 'bang-diem-tong-hop', `${printTime.getTime()}`);
            app.fs.createFolder(outputFolder);

            while (dataSinhVienHocPhan.length) {
                let dataStudent = dataSinhVienHocPhan.splice(0, 28);
                dataToPrint.push({
                    ...data, a: dataStudent
                });
            }
            dataToPrint = dataToPrint.map((item, index) => ({
                ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
            }));

            const source = app.path.join(app.assetPath, 'dtResource', 'score-hp-template.docx');
            let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFile(source, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') })
                .then(buf => {
                    let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
                    app.fs.writeFileSync(filepath, buf);
                    return filepath;
                })
            ));
            let mergedPath = app.path.join(app.assetPath, 'bang-diem-tong-hop', `output_${printTime.getTime()}.pdf`);
            await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
            app.fs.deleteFolder(outputFolder);
            res.download(mergedPath, `BDTH_${maHocPhan}.pdf`);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/download-diem-tong-hop-hoc-phan/excel', app.permission.orCheck('dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:read', 'staff:login'), async (req, res) => {
        try {
            const { dataHocPhan } = req.query,
                { maMonHoc, maHocPhan, namHoc, hocKy } = JSON.parse(dataHocPhan);

            const [hocPhan, config, listStudent] = await Promise.all([
                app.model.dtThoiKhoaBieu.getData(maHocPhan),
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

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet(maHocPhan);

            const { tenMonHoc } = hocPhan.rows[0];
            let cells = [
                { cell: 'A1:E1', value: 'BẢNG ĐIỂM TỔNG HỢP', bold: true },
                { cell: 'A2', value: 'Môn: ' + (app.utils.parse(tenMonHoc, { vi: '' })?.vi || ''), bold: true },
                { cell: 'D2', value: 'Năm học: ' + (namHoc || ''), bold: true },
                { cell: 'F2', value: 'Học kỳ: ' + (hocKy || ''), bold: true },

                { cell: 'A4', value: 'Mã môn học: ' + (maMonHoc || ''), bold: true },
                { cell: 'D4', value: 'Mã học phần: ' + (maHocPhan || ''), bold: true },


                { cell: 'A8', value: 'STT', bold: true, border: '1234' },
                { cell: 'B8', value: 'MÃ SV', bold: true, border: '1234' },
                { cell: 'C8', value: 'HỌ VÀ TÊN LÓT', bold: true, border: '1234' },
                { cell: 'D8', value: 'TÊN', bold: true, border: '1234' },
            ];

            configThanhPhan.forEach((tp, index) => {
                const column = app.excel.numberToExcelColumn(index + 4 + 1);
                cells.push({ cell: `${column}8`, value: `${tp.tenTp} (${tp.phanTram}%)`, bold: true, border: '1234' });
            });

            cells.push({ cell: `${app.excel.numberToExcelColumn(4 + configThanhPhan.length + 1)}8`, value: 'GHI CHÚ', bold: true, border: '1234' });

            for (let [index, item] of listStudent.rows.entries()) {

                const diem = app.utils.parse(item.diem) || {},
                    diemDacBiet = app.utils.parse(item.diemDacBiet) || {};

                cells.push({ cell: 'A' + (index + 9), border: '1234', number: index + 1 });
                cells.push({ cell: 'B' + (index + 9), border: '1234', value: item.mssv });
                cells.push({ cell: 'C' + (index + 9), border: '1234', value: item.ho ?? '' });
                cells.push({ cell: 'D' + (index + 9), border: '1234', value: item.ten ?? '' });

                configThanhPhan.forEach((tp, i) => {
                    const column = app.excel.numberToExcelColumn(i + 4 + 1);
                    cells.push({ cell: `${column}${index + 9}`, bold: true, border: '1234', value: diemDacBiet[tp.loaiTp] || diem[tp.loaiTp] || '' });
                });

                cells.push({ cell: `${app.excel.numberToExcelColumn(4 + configThanhPhan.length + 1)}${index + 9}`, border: '1234', value: item.ghiChu ?? '' });

            }
            app.excel.write(worksheet, cells);
            app.excel.attachment(workbook, res, `BDTH_${maHocPhan}.xlsx`);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/sinh-vien/danh-sach-thi', app.permission.orCheck('staff:login', 'dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            const { maHocPhan, kyThi } = app.utils.parse(req.query.data),
                printTime = new Date();

            app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-thi'));
            let dataToPrint = [];

            await app.model.dtThoiKhoaBieuGiangVien.exportDanhSachThi(maHocPhan, kyThi, dataToPrint);

            dataToPrint = dataToPrint.map((item, index) => ({
                ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
            }));
            const outputFolder = app.path.join(app.assetPath, 'bang-diem-thi', `${printTime.getTime()}`);
            app.fs.createFolder(outputFolder);
            const source = app.path.join(__dirname, './resource', 'FormExam.docx');
            let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFile(source, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') })
                .then(buf => {
                    let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
                    app.fs.writeFileSync(filepath, buf);
                    return filepath;
                })
            ));
            let mergedPath = app.path.join(app.assetPath, 'bang-diem-thi', `output_${printTime.getTime()}.pdf`);
            await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
            app.fs.deleteFolder(outputFolder);
            res.download(mergedPath, `${maHocPhan}-${kyThi}.pdf`);
        } catch (error) {
            res.send({ error });
            app.consoleError(req, error);
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/download-schedule-ngay', app.permission.orCheck('staff:login', 'dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const DATE_UNIX = 24 * 60 * 60 * 1000;
            let { filter } = req.query, rows = [];
            let { rows: dataTKBFull, datathi: dataThi, dataevent: dataEvent } = await app.model.dtThoiKhoaBieu.searchSchedule(filter);

            let dataTKB = [], dataThu = [];
            let { ngayBatDau, ngayKetThuc } = app.utils.parse(filter);
            ngayBatDau = parseInt(ngayBatDau);
            ngayKetThuc = parseInt(ngayKetThuc);
            for (let ngay = ngayBatDau; ngay <= ngayKetThuc; ngay += DATE_UNIX) {
                let thuCheck = new Date(ngay).getDay() + 1;
                if (thuCheck == 1) thuCheck = 8;
                dataThu.push(thuCheck);
            }
            dataThu = [...new Set(dataThu)];
            dataTKB = dataTKBFull.filter(i => dataThu.includes(i.thu));

            [...dataTKB, ...dataThi, ...dataEvent].forEach((item, index) => {
                let thu = '', tiet = '', ghiChu = '', ngay = '';
                if (item.isThi) {
                    thu = new Date(item.batDau).getDay() + 1;
                    tiet = `${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}`;
                    ngay = `${dateformat(item.batDau, 'dd/mm/yyyy')}`;
                    ghiChu = 'Lịch thi';
                }
                if (item.isTKB) {
                    thu = item.thu;
                    tiet = `${item.tietBatDau} - ${(item.tietBatDau + item.soTietBuoi - 1)}`;
                    ngay = `${dateformat(item.ngayHoc, 'dd/mm/yyyy')}`;
                    ghiChu = item.isNghi ? 'Buổi học nghỉ' : (item.isVang ? 'Buổi học vắng' : 'Lịch dạy');
                }
                if (item.isEvent) {
                    thu = new Date(item.batDau).getDay() + 1;
                    tiet = `${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}`;
                    ngay = `${dateformat(item.batDau, 'dd/mm/yyyy')}`;
                    ghiChu = 'Sự kiện';
                }
                if (thu == 8) thu = 'CN';
                rows.push({
                    stt: index + 1, maHocPhan: item.isEvent ? '' : item.maHocPhan,
                    tenMonHoc: item.isEvent ? item.ten : app.utils.parse(item.tenMonHoc, { vi: '' }).vi,
                    lop: item.lop || '', ngayHoc: ngay || '', thu: thu || '', thoiGian: tiet || '',
                    phong: item.phong || '', coSo: item.coSo || '', tenCoSo: app.utils.parse(item.tenCoSo, { vi: '' })?.vi || '',
                    khoa: item.tenKhoaDangKy || '', type: ghiChu,
                    giangVien: item.dataTenGiangVien || '', troGiang: item.dataTenTroGiang || '', ghiChu: item.isLate ? `Đi trễ: ${item.ghiChu}` : (item.isSoon ? `Về sớm: ${item.ghiChu}` : item.ghiChu),
                });
            });

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('Sheet');

            const defaultColumns = [
                { header: 'STT', key: 'stt', width: 20 },
                { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
                { header: 'Tên môn học', key: 'tenMonHoc', width: 20 },
                { header: 'Lớp', key: 'lop', width: 20 },
                { header: 'Ngày học', key: 'ngayHoc', width: 20 },
                { header: 'Thứ', key: 'thu', width: 20 },
                { header: 'Thời gian', key: 'thoiGian', width: 20 },
                { header: 'Phòng', key: 'phong', width: 20 },
                { header: 'Cơ sở', key: 'tenCoSo', width: 20 },
                { header: 'Khoa', key: 'khoa', width: 20 },
                { header: 'Giảng viên', key: 'giangVien', width: 20 },
                { header: 'Trợ giảng', key: 'troGiang', width: 20 },
                { header: 'Tính chất', key: 'type', width: 20 },
                { header: 'Ghi chú', key: 'ghiChu', width: 20 },
            ];
            worksheet.columns = defaultColumns;
            rows.forEach((row, index) => worksheet.addRow(row, index === 0 ? 'n' : 'i'));
            app.excel.attachment(workbook, res, 'Danh sách lịch theo ngày.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};