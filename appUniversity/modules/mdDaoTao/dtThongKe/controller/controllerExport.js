module.exports = app => {
    const getCellsQuiMo = async (filter) => {
        try {
            let data = [],
                items = await app.model.dtLichSuDkhp.thongKeQuiMo(app.utils.stringify(filter));
            items = items.rows;
            let listTinhTrang = Object.keys(items.groupBy('tenTinhTrang')),
                listMaNganh = Object.keys(items.groupBy('maNganh'));

            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: [],
                        soLuong: 0
                    };
                listTinhTrang.forEach(tenTinhTrang => {
                    let listTTSV = list.filter(e => e.tenTinhTrang == tenTinhTrang),
                        itemSub = { tenTinhTrang, soLuong: 0 };
                    if (listTTSV.length) {
                        itemSub.soLuong = listTTSV[0].soLuong;
                        item.soLuong = item.soLuong + listTTSV[0].soLuong;
                    }
                    item.sub.push(itemSub);
                });
                data.push(item);
            });

            let khoaSinhVien = filter.khoaSinhVien.split(',').join(', '),
                text = '';
            if (filter.lopSinhVien) text = 'LỚP ' + filter.lopSinhVien + ', ';
            else if (filter.nganhDaoTao) {
                let nganh = await app.model.dtNganhDaoTao.get({ maNganh: filter.nganhDaoTao });
                text = 'NGÀNH ' + nganh.tenNganh.toUpperCase() + ', ';
            } else if (filter.khoaDaoTao) {
                let khoa = await app.model.dmDonVi.get({ ma: filter.khoaDaoTao });
                text = 'KHOA ' + khoa.ten.toUpperCase() + ', ';
            }

            let he = await app.model.dmSvLoaiHinhDaoTao.get({ ma: filter.loaiHinhDaoTao }),
                cells = [
                    { cell: 'A5', value: `HỆ ${he.ten.toUpperCase()}, ${text}KHÓA SINH VIÊN ${khoaSinhVien}` },

                    { cell: 'A8', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B8', value: 'Ngành học', bold: true, border: '1234' },
                    { cell: 'C8', value: 'SLSV', bold: true, border: '1234' },
                ];

            for (let i = 0; i <= listTinhTrang.length; i++) {
                if (i == listTinhTrang.length) cells.push({ cell: String.fromCharCode(68 + i) + '8', value: 'Ghi chú', bold: true, border: '1234' });
                else cells.push({ cell: String.fromCharCode(68 + i) + '8', value: `SLSV ${listTinhTrang[i]}`, bold: true, border: '1234' });
            }

            for (let [index, item] of data.entries()) {
                cells.push({ cell: 'A' + (index + 9), border: '1234', value: index + 1 });
                cells.push({ cell: 'B' + (index + 9), border: '1234', value: item.tenNganh });
                cells.push({ cell: 'C' + (index + 9), border: '1234', value: item.soLuong ? item.soLuong : '0' });

                for (let i = 0; i <= listTinhTrang.length; i++) {
                    if (i == listTinhTrang.length) cells.push({ cell: String.fromCharCode(68 + i) + (index + 9), border: '1234' });
                    else cells.push({ cell: String.fromCharCode(68 + i) + (index + 9), border: '1234', value: item.sub[i].soLuong ? item.sub[i].soLuong : '0' });
                }
            }
            return cells;
        } catch (error) {
            return error;
        }
    };

    const getCellsDKTC = async (filter) => {
        try {
            let data = [],
                khoaSinhVien = filter.khoaSinhVien.split(','),
                items = await app.model.dtLichSuDkhp.thongKeDangKyGetData(app.utils.stringify(filter));
            items = items.rows;
            let listMaNganh = Object.keys(items.groupBy('maNganh'));
            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: [],
                        soLuong: 0
                    };
                khoaSinhVien.forEach(khoaSV => {
                    let listKSV = list.filter(e => e.khoaSinhVien == khoaSV),
                        itemSub = { khoaSinhVien: khoaSV, soLuong: 0 };
                    if (listKSV.length) {
                        itemSub.soLuong = listKSV[0].soLuong;
                        item.soLuong = item.soLuong + listKSV[0].soLuong;
                    }
                    item.sub.push(itemSub);
                });
                data.push(item);
            });

            let text = '';
            if (filter.lopSinhVien) text = 'LỚP ' + filter.lopSinhVien + ', ';
            else if (filter.nganhDaoTao) {
                let nganh = await app.model.dtNganhDaoTao.get({ maNganh: filter.nganhDaoTao });
                text = 'NGÀNH ' + nganh.tenNganh.toUpperCase() + ', ';
            } else if (filter.khoaDaoTao) {
                let khoa = await app.model.dmDonVi.get({ ma: filter.khoaDaoTao });
                text = 'KHOA ' + khoa.ten.toUpperCase() + ', ';
            }

            let he = await app.model.dmSvLoaiHinhDaoTao.get({ ma: filter.loaiHinhDaoTao }),
                cells = [
                    { cell: 'A5', value: `HỆ ${he.ten.toUpperCase()}, ${text}HK${filter.hocKy} NĂM HỌC ${filter.namHoc}` },
                    { cell: 'A8', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B8', value: 'Ngành học', bold: true, border: '1234' },
                ];

            for (let i = 0; i <= khoaSinhVien.length; i++) {
                if (i == khoaSinhVien.length) cells.push({ cell: String.fromCharCode(67 + i) + '8', value: 'Tổng', bold: true, border: '1234' });
                else cells.push({ cell: String.fromCharCode(67 + i) + '8', value: `Khóa ${khoaSinhVien[i]}`, bold: true, border: '1234' });
            }

            for (let [index, item] of data.entries()) {
                cells.push({ cell: 'A' + (index + 9), border: '1234', value: index + 1 });
                cells.push({ cell: 'B' + (index + 9), border: '1234', value: item.tenNganh });

                for (let i = 0; i <= khoaSinhVien.length; i++) {
                    if (i == khoaSinhVien.length) cells.push({ cell: String.fromCharCode(67 + i) + (index + 9), border: '1234', value: item.soLuong ? item.soLuong : '0' });
                    else cells.push({ cell: String.fromCharCode(67 + i) + (index + 9), border: '1234', value: item.sub[i].soLuong ? item.sub[i].soLuong : '0' });
                }
            }

            return cells;
        } catch (error) {
            return error;
        }
    };

    const getCellsDKHLCT = async (filter) => {
        try {
            let data = [],
                khoaSinhVien = filter.khoaSinhVien.split(','),
                items = await app.model.dtLichSuDkhp.thongKeHlCtGetData(app.utils.stringify(filter));
            items = items.rows;
            let listMaNganh = Object.keys(items.groupBy('maNganh'));
            listMaNganh.forEach(maNganh => {
                let list = items.filter(e => e.maNganh == maNganh),
                    item = {
                        maNganh,
                        tenNganh: list[0].tenNganh,
                        tenKhoa: list[0].khoa,
                        sub: [],
                        soLuongCT: 0, soLuongHL: 0
                    };
                khoaSinhVien.forEach(khoaSV => {
                    let listKSV = list.filter(e => e.khoaSinhVien == khoaSV),
                        itemSub = { khoaSinhVien: khoaSV, isHocLai: 0, isCaiThien: 0 };
                    if (listKSV.length) {
                        itemSub.isHocLai = listKSV[0].isHocLai;
                        itemSub.isCaiThien = listKSV[0].isCaiThien;
                        item.soLuongCT = item.soLuongCT + listKSV[0].isCaiThien;
                        item.soLuongHL = item.soLuongHL + listKSV[0].isHocLai;
                    }
                    item.sub.push(itemSub);
                });
                data.push(item);
            });

            let text = '';
            if (filter.lopSinhVien) text = 'LỚP ' + filter.lopSinhVien + ', ';
            else if (filter.nganhDaoTao) {
                let nganh = await app.model.dtNganhDaoTao.get({ maNganh: filter.nganhDaoTao });
                text = 'NGÀNH ' + nganh.tenNganh.toUpperCase() + ', ';
            } else if (filter.khoaDaoTao) {
                let khoa = await app.model.dmDonVi.get({ ma: filter.khoaDaoTao });
                text = 'KHOA ' + khoa.ten.toUpperCase() + ', ';
            }

            let he = await app.model.dmSvLoaiHinhDaoTao.get({ ma: filter.loaiHinhDaoTao }),
                cellsHL = [
                    { cell: 'A5', value: `HỆ ${he.ten.toUpperCase()}, ${text}HK${filter.hocKy} NĂM HỌC ${filter.namHoc}` },
                    { cell: 'A8', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B8', value: 'Ngành học', bold: true, border: '1234' },
                ],
                cellsCT = [
                    { cell: 'A5', value: `HỆ ${he.ten.toUpperCase()}, ${text}HK${filter.hocKy} NĂM HỌC ${filter.namHoc}` },
                    { cell: 'A8', value: 'STT', bold: true, border: '1234' },
                    { cell: 'B8', value: 'Ngành học', bold: true, border: '1234' },
                ];

            for (let i = 0; i <= khoaSinhVien.length; i++) {
                if (i == khoaSinhVien.length) {
                    cellsHL.push({ cell: String.fromCharCode(67 + i) + '8', value: 'Tổng', bold: true, border: '1234' });
                    cellsCT.push({ cell: String.fromCharCode(67 + i) + '8', value: 'Tổng', bold: true, border: '1234' });
                }
                else {
                    cellsHL.push({ cell: String.fromCharCode(67 + i) + '8', value: `Khóa ${khoaSinhVien[i]}`, bold: true, border: '1234' });
                    cellsCT.push({ cell: String.fromCharCode(67 + i) + '8', value: `Khóa ${khoaSinhVien[i]}`, bold: true, border: '1234' });
                }
            }

            for (let [index, item] of data.entries()) {
                cellsHL.push({ cell: 'A' + (index + 9), border: '1234', value: index + 1 });
                cellsHL.push({ cell: 'B' + (index + 9), border: '1234', value: item.tenNganh });

                cellsCT.push({ cell: 'A' + (index + 9), border: '1234', value: index + 1 });
                cellsCT.push({ cell: 'B' + (index + 9), border: '1234', value: item.tenNganh });

                for (let i = 0; i <= khoaSinhVien.length; i++) {
                    if (i == khoaSinhVien.length) {
                        cellsHL.push({ cell: String.fromCharCode(67 + i) + (index + 9), border: '1234', value: item.soLuongHL ? item.soLuongHL : '0' });
                        cellsCT.push({ cell: String.fromCharCode(67 + i) + (index + 9), border: '1234', value: item.soLuongCT ? item.soLuongCT : '0' });
                    }
                    else {
                        cellsHL.push({ cell: String.fromCharCode(67 + i) + (index + 9), border: '1234', value: item.sub[i].isHocLai ? item.sub[i].isHocLai : '0' });
                        cellsCT.push({ cell: String.fromCharCode(67 + i) + (index + 9), border: '1234', value: item.sub[i].isCaiThien ? item.sub[i].isCaiThien : '0' });
                    }
                }
            }
            return { cellsHL, cellsCT };
        } catch (error) {
            return error;
        }
    };

    const getCellsDSDK = async (filter, value) => {
        try {
            filter = { ...filter, isCaiThien: value };
            let items = await app.model.dtLichSuDkhp.thongKeDangKyDownload(app.utils.stringify(filter));
            items = items.rows;
            let cells = [];
            for (let [index, item] of items.entries()) {
                cells.push({ cell: 'A' + (index + 2), border: '1234', value: index + 1 });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.mssv });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.hoTen });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenNganh });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.khoaSinhVien });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.maHocPhan });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.soTinChi });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.soTiet });
                if (value == null) {
                    cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.maLoaiDky });
                    cells.push({ cell: 'K' + (index + 2), border: '1234' });
                } else cells.push({ cell: 'J' + (index + 2), border: '1234' });

            }
            return cells;
        } catch (error) {
            return error;
        }
    };

    const getCellsDSDKMH = async (filter, value) => {
        try {
            filter = { ...filter, isDangKy: value };
            let items = await app.model.dtLichSuDkhp.thongKeDanhSachSvDownload(app.utils.stringify(filter));
            items = items.rows;
            let cells = [];
            for (let [index, item] of items.entries()) {
                cells.push({ cell: 'A' + (index + 2), border: '1234', value: index + 1 });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.mssv });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.hoTen });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenNganh });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.khoaSinhVien });
                if (value) {
                    cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.soLuongDangKy });
                    cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tongTinChi });
                    cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tongTiet });
                    cells.push({ cell: 'I' + (index + 2), border: '1234' });
                } else cells.push({ cell: 'F' + (index + 2), border: '1234' });
            }
            return cells;
        } catch (error) {
            return error;
        }
    };

    const getCellsDHP = async (filter, value) => {
        try {
            filter = { ...filter, isDongPhi: value };
            let items = await app.model.dtLichSuDkhp.thongKeHocPhiDownload(app.utils.stringify(filter));
            items = items.rows;
            let cells = [];
            if (items.length) {
                for (let [index, item] of items.entries()) {
                    cells.push({ cell: 'A' + (index + 2), border: '1234', value: index + 1 });
                    cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.mssv });
                    cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.hoTen });
                    cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenNganh });
                    cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.khoaSinhVien });

                    cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.hocPhi ? item.hocPhi : '0' });
                    cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.daDong ? item.daDong : '0' });
                    cells.push({ cell: 'H' + (index + 2), border: '1234' });
                }
            }
            return cells;
        } catch (error) {
            return error;
        }
    };

    app.get('/api/dt/thong-ke/qui-mo/download', app.permission.check('dtThongKe:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = await app.excel.readFile(app.path.join(__dirname, '../resource/Thong_ke_qui_mo_Template.xlsx')),
                workSheet = workBook.getWorksheet('Qui mô');

            let cells = await getCellsQuiMo(filter);

            if (cells.length) app.excel.write(workSheet, cells);

            workSheet.getRow(5).font = { name: 'Times New Roman', family: 4, size: 13, bold: true, };
            workSheet.getRow(8).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke/dang-ky-hoc-phan/download', app.permission.check('dtThongKe:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = await app.excel.readFile(app.path.join(__dirname, '../resource/Thong_ke_dang_ky_hoc_phan_Template.xlsx')),
                workTKĐKTC = workBook.getWorksheet('TK ĐKTC'),
                workDSDKTC = workBook.getWorksheet('DS ĐKTC'),
                workDSDKMH = workBook.getWorksheet('DS ĐKMH'),
                workDSK = workBook.getWorksheet('DSSV không ĐKTC');

            let [
                cellsTKĐKTC, cellsDSDKTC, cellsDSDKMH, cellsDSK
            ] = await Promise.all([
                getCellsDKTC(filter),
                getCellsDSDK(filter, null), getCellsDSDKMH(filter, 1),
                getCellsDSDKMH(filter, 0)
            ]);

            if (cellsTKĐKTC.length) app.excel.write(workTKĐKTC, cellsTKĐKTC);
            if (cellsDSDKTC.length) app.excel.write(workDSDKTC, cellsDSDKTC);
            if (cellsDSDKMH.length) app.excel.write(workDSDKMH, cellsDSDKMH);
            if (cellsDSK.length) app.excel.write(workDSK, cellsDSK);

            workTKĐKTC.getRow(5).font = { name: 'Times New Roman', family: 4, size: 13, bold: true, };
            workTKĐKTC.getRow(8).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke/hoc-lai-hoc-cai-thien/download', app.permission.check('dtThongKe:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = await app.excel.readFile(app.path.join(__dirname, '../resource/Thong_ke_hoc_lai_hoc_cai_thien_Template.xlsx')),
                workTKHL = workBook.getWorksheet('TK ĐKTC Học lại'),
                workTKCT = workBook.getWorksheet('TK ĐKTC Học cải thiện'),
                workDSDKHL = workBook.getWorksheet('DS ĐK học lại'),
                workDSDKCT = workBook.getWorksheet('DS ĐK cải thiện');

            let [
                { cellsHL, cellsCT }, cellsDSDKHL, cellsDSDKCT
            ] = await Promise.all([
                getCellsDKHLCT(filter), getCellsDSDK(filter, 0), getCellsDSDK(filter, 1)
            ]);

            if (cellsHL.length) app.excel.write(workTKHL, cellsHL);
            if (cellsCT.length) app.excel.write(workTKCT, cellsCT);
            if (cellsDSDKHL.length) app.excel.write(workDSDKHL, cellsDSDKHL);
            if (cellsDSDKCT.length) app.excel.write(workDSDKCT, cellsDSDKCT);

            workTKHL.getRow(5).font = { name: 'Times New Roman', family: 4, size: 13, bold: true, };
            workTKHL.getRow(8).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            workTKCT.getRow(5).font = { name: 'Times New Roman', family: 4, size: 13, bold: true, };
            workTKCT.getRow(8).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke/hoc-phi/download', app.permission.check('dtThongKe:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = await app.excel.readFile(app.path.join(__dirname, '../resource/Thong_ke_hoc_phi_Template.xlsx')),
                workDHP = workBook.getWorksheet('DSSV đóng đủ học phí'),
                workCHP = workBook.getWorksheet('DSSV chưa đóng đủ học phí');

            let [
                cellsDHP, cellsCHP
            ] = await Promise.all([
                getCellsDHP(filter, 1), getCellsDHP(filter, 0)
            ]);

            if (cellsDHP.length) app.excel.write(workDHP, cellsDHP);
            if (cellsCHP.length) app.excel.write(workCHP, cellsCHP);

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });
};