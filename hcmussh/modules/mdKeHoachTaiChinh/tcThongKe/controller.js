module.exports = app => {
    app.permission.add(
        'tcThongKe:read', 'tcThongKe:export'
    );

    app.permissionHooks.add('staff', 'addRolesTcThongKe', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcThongKe:read', 'tcThongKe:export');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/statistic/khac', app.permission.check('tcThongKe:read'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');

    //Export xlsx

    app.get('/api/khtc/tach-loai-phi/download-excel', app.permission.check('tcThongKe:export'), async (req, res) => {
        try {
            const prepareDataList = async (list, loaiPhi, listLoaiPhiAll) => {
                let result = list.map(hocPhi => {
                    const listLoaiPhi = hocPhi.listLoaiPhi.split('||');
                    const tenLoaiPhi = hocPhi.listTenLoaiPhi.split('||');
                    const soTien = hocPhi.listSoTien.split('||');
                    const detailList = listLoaiPhi.map((item, index) => ({ loaiPhi: parseInt(item), tenLoaiPhi: tenLoaiPhi[index], soTien: parseInt(soTien[index]) }));
                    if (!loaiPhi || !loaiPhi.length || !detailList.length) {
                        return null;

                    } else {
                        let totalDetail = [];
                        const transactionsAmount = hocPhi.hocPhi - hocPhi.congNo;

                        let currentMoney = transactionsAmount;
                        for (let item of loaiPhi) {
                            let moneyOfDetail = detailList.find(detail => detail.loaiPhi == item)?.soTien;
                            if (moneyOfDetail && currentMoney > 0) {
                                totalDetail.push({
                                    loaiPhi: item,
                                    tenLoaiPhi: listLoaiPhiAll.find(subItem => subItem.id == item).ten,
                                    soTien: currentMoney > moneyOfDetail ? moneyOfDetail : currentMoney
                                });
                                if (currentMoney > moneyOfDetail) {
                                    currentMoney = currentMoney - moneyOfDetail;
                                } else {
                                    currentMoney = 0;
                                }
                            } else {
                                totalDetail.push({
                                    loaiPhi: item,
                                    tenLoaiPhi: listLoaiPhiAll.find(subItem => subItem.id == item).ten,
                                    soTien: 0
                                });
                            }
                        }
                        if (currentMoney > 0 && detailList.find(detail => detail.loaiPhi == totalDetail[loaiPhi.length - 1].loaiPhi)) {
                            totalDetail[loaiPhi.length - 1].soTien += currentMoney;
                        }
                        hocPhi.details = totalDetail;
                        return hocPhi;
                    }

                }).filter(item => item);

                return result;
            };

            // DATA PROCESS
            const reqData = app.utils.parse(req.query.data, {});
            const listLoaiPhi = reqData.listLoaiPhi;
            let filter = reqData.filter;
            const settings = await getSettings();

            const listLoaiPhiAll = listLoaiPhi.length != 0 ? await app.model.tcLoaiPhi.getAll({
                statement: 'id in (:listLoaiPhi)',
                parameter: { listLoaiPhi }
            }) : null;
            if (!filter?.namHoc || !filter?.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }

            filter = app.utils.stringify(filter);
            let { rows: list } = await app.model.tcHocPhiTransaction.tachLoaiPhi(filter);
            let listProcessed = await prepareDataList(list, listLoaiPhi, listLoaiPhiAll);

            // EXCEL PROCESS
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Tách loại phí');

            let listHeader = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ VÀ TÊN', key: 'hoVaTen', width: 30 },
                { header: 'HỆ ĐÀO TẠO', key: 'loaiHinhDaoTao', width: 30 },
                { header: 'KHOA/BỘ MÔN', key: 'donVi', width: 30 },
                { header: 'TÊN NGÀNH HỌC', key: 'tenNganh', width: 30 },
                { header: 'NGÂN HÀNG', key: 'nganHang', width: 20 },
                { header: 'NGÀY NỘP', key: 'thoiGian', width: 20 },
                { header: 'SỐ TIỀN ĐÃ ĐÓNG (VND)', key: 'hocPhi', width: 30 },
            ];

            for (let item of listLoaiPhi) {
                listHeader.push({ header: listLoaiPhiAll.find(subItem => subItem.id == item).ten?.toUpperCase().trim(), key: item, width: 20 });
            }
            ws.columns = listHeader;

            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            listProcessed.forEach((item, index) => {
                const numRow = index + 2;
                ws.getRow(numRow).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(numRow).font = { name: 'Times New Roman' };
                ws.getCell('A' + numRow).value = index + 1;
                ws.getCell('B' + numRow).value = item.mssv;
                ws.getCell('C' + numRow).value = item.hoTenSinhVien?.toUpperCase().trim() || '';
                ws.getCell('D' + numRow).value = item.tenLoaiHinhDaoTao;
                ws.getCell('E' + numRow).value = item.tenKhoa;
                ws.getCell('F' + numRow).value = item.tenNganh;
                ws.getCell('G' + numRow).value = item.lastTransDate ? (item.listBank ? item.listBank : 'n/a') : '';
                ws.getCell('H' + numRow).value = item.lastTransDate ? app.date.viDateFormat(new Date(Number(item.lastTransDate))) : '';
                ws.getCell('I' + numRow).value = item.hocPhi - item.congNo;
                item.details.forEach((detail, index) => {
                    ws.getCell(String.fromCharCode(73 + (index + 1)) + numRow).value = detail.soTien;
                });
            });

            let fileName = 'Tach_Loai_Phi_Excel.xlsx';
            app.excel.attachment(workBook, res, fileName);

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/thong-ke/thong-ke-tuyen-sinh', app.permission.orCheck('tcThongKe:export', 'tcThongKe:read'), async (req, res) => {
        try {
            const filter = req.query?.filter;
            const { rows: listData, listsinhvien: listSinhVien, listgiaodichsinhvien: listGiaoDichSinhVien, listdetail: listDetail } = await app.model.tcHocPhiTransaction.getThongKeTuyenSinh(filter);
            const soLuongSinhVien = (listData) => {
                const data = listData.groupBy('mssv');
                return Object.keys(data).length;
            };
            let listKhoanThu = [];

            listSinhVien.map(item => {
                const { mssv } = item;
                let listCanDong = listDetail.filter(cur => cur.mssv == mssv);
                let listGiaoDich = listGiaoDichSinhVien.filter(cur => cur.mssv == mssv);
                for (let giaoDich of listGiaoDich) {
                    const { transId, amount } = giaoDich;
                    let soTienConLai = parseInt(amount);
                    let lengthCanDong = listCanDong.length;
                    let khoanThu = {};
                    let i = 0;
                    if (listCanDong[lengthCanDong - 1]?.['daDong'] >= listCanDong[lengthCanDong - 1]?.['soTien']) {
                        break;
                    }
                    for (let khoanPhi of listCanDong) {
                        const { loaiPhi, soTien, daDong } = khoanPhi;
                        const soTienCanDong = parseInt(soTien) - parseInt(daDong);
                        if (soTienConLai > 0 && soTienCanDong > 0 && i != lengthCanDong - 1 && soTienConLai >= soTienCanDong) {
                            khoanThu[loaiPhi] = { soTien: soTienCanDong };
                            listCanDong[i]['daDong'] = soTien;
                            soTienConLai -= soTienCanDong;
                        } else if (soTienConLai > 0 && soTienCanDong > 0 && i != lengthCanDong - 1 && soTienConLai < soTienCanDong) {
                            khoanThu[loaiPhi] = { soTien: soTienConLai };
                            listCanDong[i]['daDong'] += soTienConLai;
                            soTienConLai = 0;
                        } else if (soTienConLai > 0 && i == lengthCanDong - 1) {
                            khoanThu[loaiPhi] = { soTien: soTienConLai };
                            listCanDong[i]['daDong'] += soTienConLai;
                            soTienConLai = 0;
                        }
                        i++;
                    }
                    listKhoanThu.push({ mssv, transId, khoanThu });
                }
            });

            const prepareList = listData.map(row => {
                row['khoanThu'] = listKhoanThu.find(cur => cur.transId == row.transId)?.khoanThu || {};
                return row;
            }).filter(item => listDetail.find(cur => cur.mssv == item.mssv) && Object.keys(item['khoanThu']).length > 0);

            const objectLoaiPhi = (list) => {
                let objectLoaiPhiTong = {};
                list.map(item => {
                    if (item.khoanThu) {
                        const khoanThu = item.khoanThu;
                        const dataKhoanThu = Object.keys(khoanThu);
                        for (const loaiPhi of dataKhoanThu) {
                            if (objectLoaiPhiTong[loaiPhi]) {
                                objectLoaiPhiTong[loaiPhi].soTien = objectLoaiPhiTong[loaiPhi].soTien + parseInt(khoanThu[loaiPhi].soTien);
                            } else {
                                objectLoaiPhiTong[loaiPhi] = { soTien: parseInt(khoanThu[loaiPhi].soTien) };
                            }
                        }
                    }
                });
                return objectLoaiPhiTong;
            };

            let { tuNgay, denNgay, namTuyenSinh } = app.utils.parse(req.query.filter);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thống kê tổng');

            const mapper = {};
            const objectTong = objectLoaiPhi(prepareList);
            const listFullLoaiPhi = await app.model.tcLoaiPhi.getAll({ phiTuyenSinh: 1 });
            const tempMaper = {};
            const danhSachChiTieu = await app.model.dtDmChiTieuTuyenSinh.getAll({ namTuyenSinh });
            Object.keys(objectTong).map(item => {
                tempMaper[item] = {
                    ten: listFullLoaiPhi.find(cur => cur.id == item).ten,
                    thuTu: listFullLoaiPhi.find(cur => cur.id == item).thuTu
                };
            });

            //Sheet 1
            ws.mergeCells('A1:M1');
            ws.mergeCells('A2:M2');
            ws.getCell('A1').value = `TỔNG KẾT THU HỌC PHÍ NHẬP HỌC (TUYỂN SINH NĂM ${namTuyenSinh})`;
            ws.getCell('A2').value = `Từ ngày ${app.date.viDateFormat(new Date(tuNgay))} Đến ngày ${app.date.viDateFormat(new Date(denNgay))}`;
            ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('A1').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 14,
                color: { argb: 'FF000000' }
            };

            ws.getCell('A2').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 14,
                color: { argb: 'FF000000' }
            };
            const fill = (key) => {
                ws2.getCell(key).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'F08080' }
                };
            };

            let counter = 4;
            //title
            ws.getCell(`A${counter}`).value = 'STT';
            ws.getCell(`B${counter}`).value = 'Đợt tuyển sinh';
            ws.getCell(`C${counter}`).value = 'Hệ';
            ws.getCell(`D${counter}`).value = 'Khoa';
            ws.getCell(`E${counter}`).value = 'Chỉ tiêu tuyển sinh';
            ws.getCell(`F${counter}`).value = 'Số sv đã nộp';
            ws.getCell(`G${counter}`).value = 'Tỷ lệ';
            ws.getCell(`H${counter}`).value = 'Số tiền đã nộp';

            ws.getColumn(2).width = 20;
            ws.getColumn(3).width = 28;
            ws.getColumn(4).width = 30;
            ws.getColumn(5).width = 30;
            ws.getColumn(6).width = 30;
            ws.getColumn(7).width = 25;
            ws.getColumn(8).width = 30;

            Object.keys(tempMaper).sort((a, b) => tempMaper[a].thuTu - tempMaper[b].thuTu).map((item, index) => {
                mapper[item] = {
                    col: String.fromCharCode(73 + index),
                    ten: listFullLoaiPhi.find(cur => cur.id == item).ten,
                };
            });
            Object.keys(mapper).map((item) => {
                ws.getCell(`${mapper[item].col}4`).value = mapper[item].ten;
                ws.getColumn(`${mapper[item].col}`).width = mapper[item].ten.length < 25 ? 25 : mapper[item].ten.length + 4;
                // if (index == Object.keys(mapper).length - 1) {
                //     ws.getCell(`${String.fromCharCode(mapper[item].col.charCodeAt(0) + 1)}}${counter}`).value = 'GHI CHÚ';
                //     ws.getCell(`${String.fromCharCode(mapper[item].col.charCodeAt(0) + 1)}}${counter}`).width = 30;
                // }
            });
            ws.getRow(counter).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 12,
                color: { argb: 'FF000000' }
            };
            counter++;
            ws.getCell(`A${counter}`).value = 'TỔNG THU';
            ws.getCell(`F${counter}`).value = soLuongSinhVien(prepareList);
            ws.getCell(`H${counter}`).value = prepareList.reduce((total, cur) => total + parseInt(cur.soTien), 0);
            Object.keys(mapper).map(item => {
                ws.getCell(`${mapper[item].col}5`).value = objectTong[item]?.soTien || 0;
            });
            ws.getRow(counter).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 12,
                color: { argb: 'FF000000' }
            };
            ws.getRow(counter).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'd0f4de' }
            };
            counter = 6;
            const dataTheoDot = prepareList.groupBy('dotTuyenSinh');
            Object.keys(dataTheoDot).map((dot, indexDot) => {
                const dataExcelDot = objectLoaiPhi(dataTheoDot[dot]);
                ws.getCell(`A${counter}`).value = app.utils.colName(indexDot);
                ws.getCell(`B${counter}`).value = `ĐỢT ${dot}`;
                ws.getCell(`F${counter}`).value = soLuongSinhVien(dataTheoDot[dot]);
                ws.getCell(`H${counter}`).value = dataTheoDot[dot].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                Object.keys(mapper).map(item => {
                    ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelDot[item]?.soTien || 0;
                });
                ws.getRow(counter).font = {
                    name: 'Times New Roman',
                    bold: true,
                    family: 4,
                    size: 12,
                    color: { argb: 'FF000000' }
                };
                ws.getRow(counter).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'fcf6bd' }
                };
                counter++;

                const dataTheoHe = dataTheoDot[dot].groupBy('tenHe');

                Object.keys(dataTheoHe).map((he, indexHe) => {
                    const dataExcelHe = objectLoaiPhi(dataTheoHe[he]);
                    ws.getCell(`A${counter}`).value = app.utils.romanize(indexHe + 1);
                    ws.getCell(`C${counter}`).value = he;
                    ws.getRow(counter).font = {
                        name: 'Times New Roman',
                        bold: true,
                        family: 4,
                        size: 12,
                        color: { argb: 'FF000000' }
                    };
                    const soLuongNopHocPhi = soLuongSinhVien(dataTheoHe[he]);
                    ws.getCell(`F${counter}`).value = soLuongNopHocPhi;
                    ws.getCell(`H${counter}`).value = dataTheoHe[he].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                    Object.keys(mapper).map(item => {
                        ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelHe[item]?.soTien || 0;
                    });

                    const maHe = dataTheoHe[he][0]?.maLoaiHinh;
                    const soLuongChiTieu = danhSachChiTieu.filter(cur => cur.loaiHinhDaoTao == maHe).reduce((total, i) => total + parseInt(i.soLuong), 0);
                    ws.getCell(`E${counter}`).value = soLuongChiTieu;
                    if (soLuongChiTieu) {
                        ws.getCell(`G${counter}`).value = `${(parseInt(soLuongNopHocPhi) / parseInt(soLuongChiTieu) * 100).toFixed(2)} %`;
                    }
                    counter++;

                    const dataTheoKhoa = dataTheoHe[he].groupBy('khoa');
                    Object.keys(dataTheoKhoa).map((khoa, indexKhoa) => {
                        const dataExcelKhoa = objectLoaiPhi(dataTheoKhoa[khoa]);
                        ws.getCell(`A${counter}`).value = `${indexKhoa + 1}.`;
                        ws.getCell(`C${counter}`).value = he;
                        ws.getCell(`D${counter}`).value = khoa;
                        ws.getCell(`F${counter}`).value = soLuongSinhVien(dataTheoKhoa[khoa]);
                        ws.getCell(`H${counter}`).value = dataTheoKhoa[khoa].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                        Object.keys(mapper).map(item => {
                            ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelKhoa[item]?.soTien || 0;
                        });
                        counter++;
                    });
                });
            });

            //sheet 2
            const ws2 = workBook.addWorksheet('2. Danh sách chi tiết');

            // Title sheet 2
            ws2.mergeCells('A1:Q1');
            ws2.mergeCells('A2:Q2');
            ws2.getCell('A1').value = 'DANH SÁCH SINH VIÊN NỘP HỌC PHÍ TUYỂN SINH';
            ws2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws2.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

            ws2.getCell('A2').value = `TỪ NGÀY ${app.date.viDateFormat(new Date(tuNgay))} ĐẾN NGÀY ${app.date.viDateFormat(new Date(denNgay))}`;
            ws2.getCell('A2').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 16,
                color: { argb: 'FF000000' }
            };

            ws2.getCell('A1').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 16,
                color: { argb: 'FF000000' }
            };

            // Header sheet 2
            let counterSheet2 = 4;
            ws2.getCell(`A${counterSheet2}`).value = 'STT';
            ws2.getCell(`B${counterSheet2}`).value = 'Đợt tuyển sinh';
            ws2.getCell(`C${counterSheet2}`).value = 'Ngân hàng';
            ws2.getCell(`D${counterSheet2}`).value = 'Hệ';
            ws2.getCell(`E${counterSheet2}`).value = 'Khoa';
            ws2.getCell(`F${counterSheet2}`).value = 'Ngành';
            ws2.getCell(`G${counterSheet2}`).value = 'Lớp';
            ws2.getCell(`H${counterSheet2}`).value = 'MSSV';
            ws2.getCell(`I${counterSheet2}`).value = 'Họ và tên';
            ws2.getCell(`J${counterSheet2}`).value = 'Ngày nộp (Sổ phụ)';
            ws2.getCell(`K${counterSheet2}`).value = 'Ngày nộp (Hệ thống)';
            ws2.getCell(`L${counterSheet2}`).value = 'Số tiền đã nộp';

            let mapper2 = {};

            Object.keys(tempMaper).sort((a, b) => tempMaper[a].thuTu - tempMaper[b].thuTu).map((item, index) => {
                mapper2[item] = {
                    col: String.fromCharCode(77 + index),
                    ten: listFullLoaiPhi.find(cur => cur.id == item).ten,
                };
            });

            Object.keys(mapper2).map((item) => {
                ws2.getCell(`${mapper2[item].col}4`).value = mapper2[item].ten;
                fill(`${mapper2[item].col}${counterSheet2}`);
                ws2.getColumn(`${mapper2[item].col}`).width = mapper2[item].ten.length < 25 ? 25 : mapper2[item].ten.length + 4;
                // if (index == Object.keys(mapper2).length - 1) {
                //     ws2.getCell(`${String.fromCharCode(mapper2[item].col.charCodeAt(0) + 1)}}${counterSheet2}`).value = 'GHI CHÚ';
                //     fill(`${String.fromCharCode(mapper2[item].col.charCodeAt(0) + 1)}}${counterSheet2}`);
                // }
            });

            ws2.getCell('A5').value = 'TỔNG CỘNG';
            ws2.getCell('L5').value = prepareList.reduce((total, item) => total + parseInt(item?.soTien || 0), 0);
            ws2.getRow(5).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 14,
                color: { argb: 'FF000000' }
            };
            ws2.getColumn(11).width = 25;
            Object.keys(mapper2).map(item => {
                ws2.getCell(`${mapper2[item].col}5`).value = objectTong[item]?.soTien || 0;
            });
            ws2.getRow(4).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 12,
                color: { argb: 'FF000000' }
            };

            ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4', 'K4', 'L4'].map(key => {
                fill(key);
            });

            // TODO EXCEL
            const dataTheoNganHang = prepareList.groupBy('bank');

            counterSheet2 = 6;
            Object.keys(dataTheoNganHang).map((nganHang, indexNganHang) => {
                ws2.getCell(`A${counterSheet2}`).value = app.utils.colName(indexNganHang);
                ws2.getCell(`C${counterSheet2}`).value = nganHang;
                ws2.getRow(counterSheet2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'fcf6bd' }
                };
                ws2.getRow(counterSheet2).font = {
                    name: 'Times New Roman',
                    bold: true,
                    family: 4,
                    size: 14,
                    color: { argb: 'FF000000' }
                };
                const dataExcelNganHang = objectLoaiPhi(dataTheoNganHang[nganHang]);
                ws2.getCell(`L${counterSheet2}`).value = dataTheoNganHang[nganHang].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                Object.keys(mapper2).map(item => {
                    ws2.getCell(`${mapper2[item].col}${counterSheet2}`).value = dataExcelNganHang[item]?.soTien || 0;
                });

                counterSheet2++;

                const dataTheoHe = dataTheoNganHang[nganHang].groupBy('tenHe');
                Object.keys(dataTheoHe).map((he, indexHe) => {
                    ws2.getCell(`A${counterSheet2}`).value = app.utils.romanize(indexHe + 1);
                    ws2.getCell(`D${counterSheet2}`).value = he.toLocaleUpperCase();
                    ws2.getRow(counterSheet2).font = {
                        name: 'Times New Roman',
                        bold: true,
                        family: 4,
                        size: 12,
                        color: { argb: 'FF000000' }
                    };
                    const dataExcelHe = objectLoaiPhi(dataTheoHe[he]);

                    Object.keys(mapper2).map(item => {
                        ws2.getCell(`${mapper2[item].col}${counterSheet2}`).value = dataExcelHe[item]?.soTien || 0;
                    });
                    counterSheet2++;
                    dataTheoHe[he].map((sinhVien, indexSinhVien) => {
                        const { dotTuyenSinh, soTien, tenHe, mssv, tenNganh, ngayHeThong, ngaySoPhu, hoVaTen, khoa, lop, khoanThu } = sinhVien;
                        ws2.getCell(`A${counterSheet2}`).value = `${indexSinhVien + 1}.`;
                        ws2.getCell(`B${counterSheet2}`).value = dotTuyenSinh;
                        ws2.getCell(`D${counterSheet2}`).value = tenHe;
                        ws2.getCell(`E${counterSheet2}`).value = khoa;
                        ws2.getCell(`F${counterSheet2}`).value = tenNganh;
                        ws2.getCell(`G${counterSheet2}`).value = lop;
                        ws2.getCell(`H${counterSheet2}`).value = mssv;
                        ws2.getCell(`I${counterSheet2}`).value = hoVaTen;
                        ws2.getCell(`J${counterSheet2}`).value = `${app.date.viDateFormat(new Date(parseInt(ngaySoPhu)))}`;
                        ws2.getCell(`K${counterSheet2}`).value = `${app.date.viDateFormat(new Date(parseInt(ngayHeThong)))}`;
                        ws2.getCell(`L${counterSheet2}`).value = soTien;

                        ws2.getColumn(2).width = 20;
                        ws2.getColumn(3).width = 20;
                        ws2.getColumn(4).width = 35;
                        ws2.getColumn(5).width = 30;
                        ws2.getColumn(6).width = 40;
                        ws2.getColumn(7).width = 25;
                        ws2.getColumn(8).width = 25;
                        ws2.getColumn(9).width = 38;
                        ws2.getColumn(10).width = 25;
                        ws2.getColumn(11).width = 25;
                        ws2.getColumn(12).width = 25;

                        Object.keys(mapper2).map(item => {
                            ws2.getCell(`${mapper2[item].col}${counterSheet2}`).value = khoanThu?.[item]?.soTien || 0;
                        });
                        counterSheet2++;
                    });

                });


            });
            let fileName = `${Date.now()}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
            // res.send(prepareList);
        } catch (error) {
            console.error('GET: /api/khtc/thong-ke/thong-ke-tuyen-sinh ::', error);
            res.status(406).send({ error });
        }
    });

    app.get('/api/khtc/thong-ke/thong-ke-tuyen-sinh/nhom-nganh', app.permission.orCheck('tcThongKe:export', 'tcThongKe:read'), async (req, res) => {
        try {
            const filter = req.query?.filter;
            const { rows: listData, listsinhvien: listSinhVien, listgiaodichsinhvien: listGiaoDichSinhVien, listdetail: listDetail } = await app.model.tcHocPhiTransaction.getThongKeTuyenSinhNganh(filter);
            const soLuongSinhVien = (listData) => {
                const data = listData.groupBy('mssv');
                return Object.keys(data).length;
            };
            let listKhoanThu = [];
            const { rows: listSoLuongSv } = await app.model.tcHocPhiTransaction.getSoLuongSv(app.utils.parse(filter).namTuyenSinh);
            const { rows: listChiTieu } = await app.model.dtDmChiTieuTuyenSinh.getListThongKe(app.utils.parse(filter).namTuyenSinh);
            const countSoLuongSinhVien = (tenHe, tenNganh, dot, listSoLuong = listSoLuongSv) => {
                const listFilter = listSoLuong.filter(item => (!tenHe || tenHe == item.tenHe) && (!tenNganh || tenNganh == item.tenNganh) && (!dot || dot == item.dotTuyenSinh));
                return listFilter.reduce((total, cur) => total + parseInt(cur.soLuongSv), 0);
            };
            listSinhVien.map(item => {
                const { mssv } = item;
                let listCanDong = listDetail.filter(cur => cur.mssv == mssv);
                let listGiaoDich = listGiaoDichSinhVien.filter(cur => cur.mssv == mssv);
                for (let giaoDich of listGiaoDich) {
                    const { transId, amount } = giaoDich;
                    let soTienConLai = parseInt(amount);
                    let lengthCanDong = listCanDong.length;
                    let khoanThu = {};
                    let i = 0;
                    if (listCanDong[lengthCanDong - 1]?.['daDong'] >= listCanDong[lengthCanDong - 1]?.['soTien']) {
                        break;
                    }
                    for (let khoanPhi of listCanDong) {
                        const { loaiPhi, soTien, daDong } = khoanPhi;
                        const soTienCanDong = parseInt(soTien) - parseInt(daDong);
                        if (soTienConLai > 0 && soTienCanDong > 0 && i != lengthCanDong - 1 && soTienConLai >= soTienCanDong) {
                            khoanThu[loaiPhi] = { soTien: soTienCanDong };
                            listCanDong[i]['daDong'] = soTien;
                            soTienConLai -= soTienCanDong;
                        } else if (soTienConLai > 0 && soTienCanDong > 0 && i != lengthCanDong - 1 && soTienConLai < soTienCanDong) {
                            khoanThu[loaiPhi] = { soTien: soTienConLai };
                            listCanDong[i]['daDong'] += soTienConLai;
                            soTienConLai = 0;
                        } else if (soTienConLai > 0 && i == lengthCanDong - 1) {
                            khoanThu[loaiPhi] = { soTien: soTienConLai };
                            listCanDong[i]['daDong'] += soTienConLai;
                            soTienConLai = 0;
                        }
                        i++;
                    }
                    listKhoanThu.push({ mssv, transId, khoanThu });
                }
            });

            const prepareList = listData.map(row => {
                row['khoanThu'] = listKhoanThu.find(cur => cur.transId == row.transId)?.khoanThu || {};
                return row;
            }).filter(item => listDetail.find(cur => cur.mssv == item.mssv) && Object.keys(item['khoanThu']).length > 0);

            const objectLoaiPhi = (list) => {
                let objectLoaiPhiTong = {};
                list.map(item => {
                    if (item.khoanThu) {
                        const khoanThu = item.khoanThu;
                        const dataKhoanThu = Object.keys(khoanThu);
                        for (const loaiPhi of dataKhoanThu) {
                            if (objectLoaiPhiTong[loaiPhi]) {
                                objectLoaiPhiTong[loaiPhi].soTien = objectLoaiPhiTong[loaiPhi].soTien + parseInt(khoanThu[loaiPhi].soTien);
                            } else {
                                objectLoaiPhiTong[loaiPhi] = { soTien: parseInt(khoanThu[loaiPhi].soTien) };
                            }
                        }
                    }
                });
                return objectLoaiPhiTong;
            };

            let { tuNgay, denNgay, namTuyenSinh } = app.utils.parse(req.query.filter);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thống kê tổng');

            const mapper = {};
            const objectTong = objectLoaiPhi(prepareList);
            const listFullLoaiPhi = await app.model.tcLoaiPhi.getAll({ phiTuyenSinh: 1 });
            const tempMaper = {};

            Object.keys(objectTong).map(item => {
                tempMaper[item] = {
                    ten: listFullLoaiPhi.find(cur => cur.id == item).ten,
                    thuTu: listFullLoaiPhi.find(cur => cur.id == item).thuTu
                };
            });

            //Sheet 1
            ws.mergeCells('A1:M1');
            ws.mergeCells('A2:M2');
            ws.getCell('A1').value = `TỔNG KẾT THU HỌC PHÍ NHẬP HỌC (TUYỂN SINH NĂM ${namTuyenSinh})`;
            ws.getCell('A2').value = `Từ ngày ${app.date.viDateFormat(new Date(tuNgay))} Đến ngày ${app.date.viDateFormat(new Date(denNgay))}`;
            ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
            ws.getCell('A1').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 14,
                color: { argb: 'FF000000' }
            };

            ws.getCell('A2').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 14,
                color: { argb: 'FF000000' }
            };
            const fill = (key) => {
                ws2.getCell(key).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'F08080' }
                };
            };

            let counter = 4;
            //title
            ws.getCell(`A${counter}`).value = 'STT';
            ws.getCell(`B${counter}`).value = 'Đợt tuyển sinh';
            ws.getCell(`C${counter}`).value = 'Hệ';
            ws.getCell(`D${counter}`).value = 'Ngành';
            ws.getCell(`E${counter}`).value = 'Số SV gọi nhập học';
            ws.getCell(`F${counter}`).value = 'Chỉ tiêu tuyển sinh';
            ws.getCell(`G${counter}`).value = 'Số SV đã đóng tiền';
            ws.getCell(`H${counter}`).value = 'Tỷ lệ so với SV gọi nhập học';
            ws.getCell(`I${counter}`).value = 'Tỷ lệ so với Chỉ tiêu tuyển sinh';
            ws.getCell(`J${counter}`).value = 'Số tiền đã nộp';

            ws.getColumn(2).width = 20;
            ws.getColumn(3).width = 28;
            ws.getColumn(4).width = 30;
            ws.getColumn(5).width = 30;
            ws.getColumn(6).width = 30;
            ws.getColumn(7).width = 25;
            ws.getColumn(8).width = 30;
            ws.getColumn(9).width = 30;
            ws.getColumn(10).width = 30;
            ws.getColumn(11).width = 30;

            Object.keys(tempMaper).sort((a, b) => tempMaper[a].thuTu - tempMaper[b].thuTu).map((item, index) => {
                mapper[item] = {
                    col: String.fromCharCode(75 + index),
                    ten: listFullLoaiPhi.find(cur => cur.id == item).ten,
                };
            });
            Object.keys(mapper).map((item) => {
                ws.getCell(`${mapper[item].col}4`).value = mapper[item].ten;
                ws.getColumn(`${mapper[item].col}`).width = mapper[item].ten.length < 25 ? 25 : mapper[item].ten.length + 4;
                // if (index == Object.keys(mapper).length - 1) {
                //     ws.getCell(`${String.fromCharCode(mapper[item].col.charCodeAt(0) + 1)}}${counter}`).value = 'GHI CHÚ';
                //     ws.getCell(`${String.fromCharCode(mapper[item].col.charCodeAt(0) + 1)}}${counter}`).width = 30;
                // }
            });
            ws.getRow(counter).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 12,
                color: { argb: 'FF000000' }
            };
            counter++;
            const soLuongNhapHocSinVienTong = countSoLuongSinhVien(null, null, null);
            const soLuongChiTieuTong = countSoLuongSinhVien(null, null, null, listChiTieu);
            const soLuongDongTienTong = soLuongSinhVien(prepareList);
            ws.getCell(`A${counter}`).value = 'TỔNG THU';
            ws.getCell(`E${counter}`).value = soLuongNhapHocSinVienTong;
            ws.getCell(`F${counter}`).value = soLuongChiTieuTong;
            ws.getCell(`G${counter}`).value = soLuongDongTienTong;
            ws.getCell(`H${counter}`).value = `${(parseInt(soLuongDongTienTong) / parseInt(soLuongNhapHocSinVienTong) * 100).toFixed(2)} %`;
            ws.getCell(`I${counter}`).value = soLuongChiTieuTong > 0 ? `${(parseInt(soLuongDongTienTong) / parseInt(soLuongChiTieuTong) * 100).toFixed(2)} %` : ' ';
            ws.getCell(`J${counter}`).value = prepareList.reduce((total, cur) => total + parseInt(cur.soTien), 0);
            Object.keys(mapper).map(item => {
                ws.getCell(`${mapper[item].col}5`).value = objectTong[item]?.soTien || 0;
            });
            ws.getRow(counter).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 12,
                color: { argb: 'FF000000' }
            };
            ws.getRow(counter).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'd0f4de' }
            };
            counter = 6;
            const dataTheoDot = prepareList.groupBy('dotTuyenSinh');
            Object.keys(dataTheoDot).map((dot, indexDot) => {
                const dataExcelDot = objectLoaiPhi(dataTheoDot[dot]);
                const soLuongNhapHocDot = countSoLuongSinhVien(null, null, dot);
                const soLuongChiTieuDot = countSoLuongSinhVien(null, null, dot, listChiTieu);
                const soLuongDongTienDot = soLuongSinhVien(dataTheoDot[dot]);
                ws.getCell(`A${counter}`).value = app.utils.colName(indexDot);
                ws.getCell(`B${counter}`).value = `ĐỢT ${dot}`;
                ws.getCell(`E${counter}`).value = soLuongNhapHocDot;
                ws.getCell(`F${counter}`).value = soLuongChiTieuDot;
                ws.getCell(`G${counter}`).value = soLuongDongTienDot;
                ws.getCell(`H${counter}`).value = `${(parseInt(soLuongDongTienDot) / parseInt(soLuongNhapHocSinVienTong) * 100).toFixed(2)} %`;
                ws.getCell(`I${counter}`).value = soLuongChiTieuDot > 0 ? `${(parseInt(soLuongDongTienDot) / parseInt(soLuongChiTieuDot) * 100).toFixed(2)} %` : ' ';
                ws.getCell(`J${counter}`).value = dataTheoDot[dot].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                Object.keys(mapper).map(item => {
                    ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelDot[item]?.soTien || 0;
                });
                ws.getRow(counter).font = {
                    name: 'Times New Roman',
                    bold: true,
                    family: 4,
                    size: 12,
                    color: { argb: 'FF000000' }
                };
                ws.getRow(counter).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'fcf6bd' }
                };
                counter++;

                const dataTheoHe = dataTheoDot[dot].groupBy('tenHe');

                Object.keys(dataTheoHe).map((he, indexHe) => {
                    const dataExcelHe = objectLoaiPhi(dataTheoHe[he]);
                    ws.getCell(`A${counter}`).value = app.utils.romanize(indexHe + 1);
                    ws.getCell(`C${counter}`).value = he;
                    ws.getRow(counter).font = {
                        name: 'Times New Roman',
                        bold: true,
                        family: 4,
                        size: 12,
                        color: { argb: 'FF000000' }
                    };
                    const soLuongNopHocPhi = soLuongSinhVien(dataTheoHe[he]);
                    ws.getCell(`G${counter}`).value = soLuongNopHocPhi;
                    ws.getCell(`J${counter}`).value = dataTheoHe[he].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                    Object.keys(mapper).map(item => {
                        ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelHe[item]?.soTien || 0;
                    });

                    const soLuongNhapHocHe = countSoLuongSinhVien(he, null, dot);
                    const soLuongChiTieuHe = countSoLuongSinhVien(he, null, dot, listChiTieu);
                    ws.getCell(`E${counter}`).value = soLuongNhapHocHe;
                    ws.getCell(`F${counter}`).value = soLuongChiTieuHe;
                    ws.getCell(`H${counter}`).value = `${(parseInt(soLuongNopHocPhi) / parseInt(soLuongNhapHocHe) * 100).toFixed(2)} %`;
                    ws.getCell(`I${counter}`).value = soLuongChiTieuHe > 0 ? `${(parseInt(soLuongNopHocPhi) / parseInt(soLuongChiTieuHe) * 100).toFixed(2)} %` : ' ';

                    counter++;

                    const dataTheoNganh = dataTheoHe[he].groupBy('tenNganh');
                    Object.keys(dataTheoNganh).map((nganh, indexNganh) => {
                        const soLuongNhapHocNganh = countSoLuongSinhVien(he, nganh, dot);
                        const soLuongChiTieuNganh = countSoLuongSinhVien(he, nganh, dot, listChiTieu);
                        const soLuongNopHocPhi = soLuongSinhVien(dataTheoNganh[nganh]);
                        const dataExcelNganh = objectLoaiPhi(dataTheoNganh[nganh]);
                        ws.getCell(`A${counter}`).value = `${indexNganh + 1}.`;
                        ws.getCell(`C${counter}`).value = he;
                        ws.getCell(`D${counter}`).value = nganh;
                        ws.getCell(`E${counter}`).value = soLuongNhapHocNganh;
                        ws.getCell(`F${counter}`).value = soLuongChiTieuNganh;
                        ws.getCell(`G${counter}`).value = soLuongNopHocPhi;
                        ws.getCell(`H${counter}`).value = `${(parseInt(soLuongNopHocPhi) / parseInt(soLuongNhapHocNganh) * 100).toFixed(2)} %`;
                        ws.getCell(`I${counter}`).value = soLuongChiTieuNganh > 0 ? `${(parseInt(soLuongNopHocPhi) / parseInt(soLuongChiTieuNganh) * 100).toFixed(2)} %` : ' ';
                        ws.getCell(`J${counter}`).value = dataTheoNganh[nganh].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                        Object.keys(mapper).map(item => {
                            ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelNganh[item]?.soTien || 0;
                        });
                        counter++;
                    });
                });
            });

            //sheet 2
            const ws2 = workBook.addWorksheet('2. Danh sách chi tiết');

            // Title sheet 2
            ws2.mergeCells('A1:Q1');
            ws2.mergeCells('A2:Q2');
            ws2.getCell('A1').value = 'DANH SÁCH SINH VIÊN NỘP HỌC PHÍ TUYỂN SINH';
            ws2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            ws2.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

            ws2.getCell('A2').value = `TỪ NGÀY ${app.date.viDateFormat(new Date(tuNgay))} ĐẾN NGÀY ${app.date.viDateFormat(new Date(denNgay))}`;
            ws2.getCell('A2').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 16,
                color: { argb: 'FF000000' }
            };

            ws2.getCell('A1').font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 16,
                color: { argb: 'FF000000' }
            };

            // Header sheet 2
            let counterSheet2 = 4;
            ws2.getCell(`A${counterSheet2}`).value = 'STT';
            ws2.getCell(`B${counterSheet2}`).value = 'Đợt tuyển sinh';
            ws2.getCell(`C${counterSheet2}`).value = 'Ngân hàng';
            ws2.getCell(`D${counterSheet2}`).value = 'Hệ';
            ws2.getCell(`E${counterSheet2}`).value = 'Khoa';
            ws2.getCell(`F${counterSheet2}`).value = 'Ngành';
            ws2.getCell(`G${counterSheet2}`).value = 'Lớp';
            ws2.getCell(`H${counterSheet2}`).value = 'MSSV';
            ws2.getCell(`I${counterSheet2}`).value = 'Họ và tên';
            ws2.getCell(`J${counterSheet2}`).value = 'Ngày nộp (Sổ phụ)';
            ws2.getCell(`K${counterSheet2}`).value = 'Ngày nộp (Hệ thống)';
            ws2.getCell(`L${counterSheet2}`).value = 'Số tiền đã nộp';

            let mapper2 = {};

            Object.keys(tempMaper).sort((a, b) => tempMaper[a].thuTu - tempMaper[b].thuTu).map((item, index) => {
                mapper2[item] = {
                    col: String.fromCharCode(76 + index),
                    ten: listFullLoaiPhi.find(cur => cur.id == item).ten,
                };
            });

            Object.keys(mapper2).map((item) => {
                ws2.getCell(`${mapper2[item].col}4`).value = mapper2[item].ten;
                fill(`${mapper2[item].col}${counterSheet2}`);
                ws2.getColumn(`${mapper2[item].col}`).width = mapper2[item].ten.length < 25 ? 25 : mapper2[item].ten.length + 4;
                // if (index == Object.keys(mapper2).length - 1) {
                //     ws2.getCell(`${String.fromCharCode(mapper2[item].col.charCodeAt(0) + 1)}}${counterSheet2}`).value = 'GHI CHÚ';
                //     fill(`${String.fromCharCode(mapper2[item].col.charCodeAt(0) + 1)}}${counterSheet2}`);
                // }
            });

            ws2.getCell('A5').value = 'TỔNG CỘNG';
            ws2.getCell('L5').value = prepareList.reduce((total, item) => total + parseInt(item?.soTien || 0), 0);
            ws2.getRow(5).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 14,
                color: { argb: 'FF000000' }
            };
            ws2.getColumn(11).width = 25;
            Object.keys(mapper2).map(item => {
                ws2.getCell(`${mapper2[item].col}5`).value = objectTong[item]?.soTien || 0;
            });
            ws2.getRow(4).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 12,
                color: { argb: 'FF000000' }
            };

            ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4', 'K4', 'L4'].map(key => {
                fill(key);
            });

            // TODO EXCEL
            const dataTheoNganHang = prepareList.groupBy('bank');

            counterSheet2 = 6;
            Object.keys(dataTheoNganHang).map((nganHang, indexNganHang) => {
                ws2.getCell(`A${counterSheet2}`).value = app.utils.colName(indexNganHang);
                ws2.getCell(`C${counterSheet2}`).value = nganHang;
                ws2.getRow(counterSheet2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'fcf6bd' }
                };
                ws2.getRow(counterSheet2).font = {
                    name: 'Times New Roman',
                    bold: true,
                    family: 4,
                    size: 14,
                    color: { argb: 'FF000000' }
                };
                const dataExcelNganHang = objectLoaiPhi(dataTheoNganHang[nganHang]);
                ws2.getCell(`L${counterSheet2}`).value = dataTheoNganHang[nganHang].reduce((total, cur) => total + parseInt(cur.soTien), 0);
                Object.keys(mapper2).map(item => {
                    ws2.getCell(`${mapper2[item].col}${counterSheet2}`).value = dataExcelNganHang[item]?.soTien || 0;
                });

                counterSheet2++;

                const dataTheoHe = dataTheoNganHang[nganHang].groupBy('tenHe');
                Object.keys(dataTheoHe).map((he, indexHe) => {
                    ws2.getCell(`A${counterSheet2}`).value = app.utils.romanize(indexHe + 1);
                    ws2.getCell(`D${counterSheet2}`).value = he.toLocaleUpperCase();
                    ws2.getRow(counterSheet2).font = {
                        name: 'Times New Roman',
                        bold: true,
                        family: 4,
                        size: 12,
                        color: { argb: 'FF000000' }
                    };
                    const dataExcelHe = objectLoaiPhi(dataTheoHe[he]);

                    Object.keys(mapper2).map(item => {
                        ws2.getCell(`${mapper2[item].col}${counterSheet2}`).value = dataExcelHe[item]?.soTien || 0;
                    });
                    counterSheet2++;
                    dataTheoHe[he].map((sinhVien, indexSinhVien) => {
                        const { dotTuyenSinh, soTien, tenHe, mssv, tenNganh, ngayHeThong, ngaySoPhu, hoVaTen, khoa, lop, khoanThu } = sinhVien;
                        ws2.getCell(`A${counterSheet2}`).value = `${indexSinhVien + 1}.`;
                        ws2.getCell(`B${counterSheet2}`).value = dotTuyenSinh;
                        ws2.getCell(`D${counterSheet2}`).value = tenHe;
                        ws2.getCell(`E${counterSheet2}`).value = khoa;
                        ws2.getCell(`F${counterSheet2}`).value = tenNganh;
                        ws2.getCell(`G${counterSheet2}`).value = lop;
                        ws2.getCell(`H${counterSheet2}`).value = mssv;
                        ws2.getCell(`I${counterSheet2}`).value = hoVaTen;
                        ws2.getCell(`J${counterSheet2}`).value = `${app.date.viDateFormat(new Date(parseInt(ngaySoPhu)))}`;
                        ws2.getCell(`K${counterSheet2}`).value = `${app.date.viDateFormat(new Date(parseInt(ngayHeThong)))}`;
                        ws2.getCell(`L${counterSheet2}`).value = soTien;

                        ws2.getColumn(2).width = 20;
                        ws2.getColumn(3).width = 20;
                        ws2.getColumn(4).width = 35;
                        ws2.getColumn(5).width = 30;
                        ws2.getColumn(6).width = 40;
                        ws2.getColumn(7).width = 25;
                        ws2.getColumn(8).width = 25;
                        ws2.getColumn(9).width = 38;
                        ws2.getColumn(10).width = 25;
                        ws2.getColumn(11).width = 25;
                        ws2.getColumn(12).width = 25;

                        Object.keys(mapper2).map(item => {
                            ws2.getCell(`${mapper2[item].col}${counterSheet2}`).value = khoanThu?.[item]?.soTien || 0;
                        });
                        counterSheet2++;
                    });

                });


            });
            let fileName = `${Date.now()}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/thong-ke/thong-ke-no-hoc-phi/export', app.permission.orCheck('tcThongKe:export'), async (req, res) => {
        try {
            const filter = req.query.filter || '';
            if (!filter) throw 'Thông tin đầu vào không phù hợp';
            let { rows: data, thongketong: dataPivot } = await app.model.tcHocPhi.thongKeNoHocPhi(filter);

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Danh sách');
            ws.columns = [{ header: 'STT', key: 'stt', width: 5 }, ...Object.keys(data[0] || {}).map(key => ({ header: key.toString(), key, width: 25 }))];
            data.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item });
            });

            const groupByKeys = ['loaiHinhDaoTao', 'tenNganh', 'khoaSinhVien'];
            const ws1 = workBook.addWorksheet('Thống kê pivot');

            const header = [
                { header: '', key: 'keyNum', width: 40 },
                { header: 'Tổng số SV', key: 'tongSoSv', width: 20 },
                { header: 'Số SV đã nộp', key: 'soSvDaNop', width: 20 },
                { header: 'Số SV xin gia hạn', key: 'soSvGiaHan', width: 20 },
                { header: 'Số SV đã nộp và gia hạn', key: 'soSvDaNopVaGiaHan', width: 20 },
                { header: 'Số SV chưa nộp', key: 'soSvChuaNop', width: 20 },
                { header: 'Tổng tiền học phí', key: 'tongTienHocPhi', width: 30 },
                { header: 'Tổng tiền đã đóng', key: 'tongTienDaDong', width: 30 },
                { header: 'Tổng tiền chưa đóng', key: 'tongTienChuaDong', width: 30 }
            ];

            ws1.columns = header;

            const initData = () => ({
                tongSoSv: 0,
                soSvDaNop: 0,
                soSvGiaHan: 0,
                soSvDaNopVaGiaHan: 0,
                soSvChuaNop: 0,
                tongTienHocPhi: 0,
                tongTienDaDong: 0,
                tongTienChuaDong: 0
            });

            const listDataKey = Object.keys(initData());

            const sortObject = (obj) => {
                return Object.keys(obj).sort().reduce(function (result, key) {
                    result[key] = obj[key];
                    return result;
                }, {});
            };

            dataPivot = dataPivot.reduce((groupedObj, item) => {
                const keysToGroupBy = [...groupByKeys, ''];
                keysToGroupBy.reduce((currentObj, key, index) => {
                    const value = item[key];
                    if (!currentObj['data']) {
                        currentObj['data'] = initData();
                    }
                    listDataKey.forEach(dataKey => currentObj['data'][dataKey] += (item?.[dataKey] || 0));
                    if (!currentObj[value] && index < keysToGroupBy.length - 1) {
                        currentObj[value] = {};
                    }

                    return currentObj[value];
                }, groupedObj);

                return groupedObj;
            }, {});

            dataPivot = sortObject(dataPivot);

            const flattenObject = (obj, level = 0, parentKey = 'Tổng thu', result = []) => {
                const { data, ...rest } = obj;

                result.push({ keyNum: parentKey, data });

                const properties = [];
                for (const key in rest) {
                    if (typeof rest[key] === 'object' && rest[key] !== null) {
                        properties.push(key);
                    } else {
                        result.push({ keyNum: key, data: rest[key] });
                    }
                }

                properties.sort();
                for (const key of properties) {
                    flattenObject(rest[key], level + 1, key, result);
                }

                return result;
            };

            for (let row of flattenObject(dataPivot)) {
                const addRow = {
                    ...row,
                    ...row.data
                };
                ws1.addRow(addRow);
            }
            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer, filename: `Thong_ke_no_hoc_phi_${Date.now()}.xlsx`, length: data.length });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/thong-ke/thong-ke-no-hoc-phi/template', app.permission.check('tcThongKe:export'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Template');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên', key: 'hoVaTen', width: 30 },
                { header: 'Công nợ', key: 'congNo', width: 20 },
            ];
            ws.addRow({ mssv: '1912811', hoVaTen: 'Test', congNo: '18000000' });
            app.excel.attachment(workBook, res, 'TemplateDsNoHocPhi.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/thong-ke/thong-ke-no-hoc-phi/length', app.permission.check('tcThongKe:read'), async (req, res) => {
        try {
            const filter = req.query.filter || '';
            if (!filter) throw 'Thông tin đầu vào không phù hợp';
            let { rows: data } = await app.model.tcHocPhi.thongKeNoHocPhi(filter);

            res.send({ length: data.length });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const sendEmailNhacNo = async (emailSend, mssv) => {
        const sinhVien = await app.model.fwStudent.get({ mssv });
        const config = await app.model.tcSetting.getValue('hocPhiEmailNhacNhoEditorText', 'hocPhiEmailNhacNhoEditorHtml', 'hocPhiEmailNhacNhoTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
        if (!sinhVien || !config) return;

        const title = config.hocPhiEmailNhacNhoTitle;
        const html = config.hocPhiEmailNhacNhoEditorHtml.replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim().toUpperCase()).replace('{mssv}', sinhVien.mssv).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);
        const text = config.hocPhiEmailNhacNhoEditorText.replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim().toUpperCase()).replace('{mssv}', sinhVien.mssv).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);

        if (!app.isDebug) {
            app.service.emailService.send(emailSend.email, emailSend.password, sinhVien.emailTruong, null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
        } else {
            app.service.emailService.send(emailSend.email, emailSend.password, 'baoid0002@gmail.com', null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
        }
    };

    app.post('/api/khtc/thong-ke/thong-ke-no-hoc-phi/send-email', app.permission.check('tcThongKe:read'), async (req, res) => {
        try {
            const filter = req.body.filter || '';
            if (!filter) throw 'Thông tin đầu vào không phù hợp';
            let listSv = await app.model.tcHocPhi.thongKeNoHocPhi(filter).then(data => data.rows.map(item => item.MSSV));
            const emails = await app.model.tcEmailConfig.getMailConfig();
            const email = emails.splice(Math.floor(Math.random() * emails.length), 1).pop();
            res.send({});
            Promise.all(listSv.map(mssv => sendEmailNhacNo(email, mssv).catch(e => console.error('Gửi mail nhắc nợ lỗi', e))));
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('TcUploadListNo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadListNo(req, fields, files, params, done), done, 'tcThongKe:export')
    );

    const uploadListNo = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcUploadListNo' && files.TcUploadListNo && files.TcUploadListNo.length) {

            const srcPath = files.TcUploadListNo[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                try {
                    app.fs.deleteFile(srcPath);
                    const worksheet = workbook.getWorksheet(1);
                    let index = 2;
                    while (true) {
                        if (!worksheet.getCell('A' + index).value) {
                            break;
                        }
                        else {
                            const mssv = `${worksheet.getCell('A' + index).value}`;
                            try {
                                await app.model.tcDotDong.capNhatDongTien(mssv);
                                const congNo = await app.model.tcHocPhi.get({ mssv }, 'congNo').then(data => data?.congNo);
                                worksheet.getCell('C' + index).value = congNo;
                            } catch (error) {
                                console.error({ error, mssv });
                            }
                        }
                        index++;
                    }
                    const buffer = await workbook.xlsx.writeBuffer();
                    done({ buffer, filename: `Thong_ke_no_hoc_phi_${Date.now()}.xlsx` });
                }
                catch (error) {
                    console.error(error);
                    done && done({ error });
                }
            }
        }
    };

    app.get('/api/khtc/thong-ke/thong-ke-bhyt', app.permission.orCheck('tcThongKe:export', 'tcThongKe:read'), async (req, res) => {
        try {
            const filter = req.query.filter || '';
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Danh sách thu BHYT');

            let { rows: data } = await app.model.tcHocPhi.thongKeBhyt(filter);
            data = data.map(item => ({ ...item, ['Thời gian thanh toán']: app.date.viDateFormat(new Date(item['Thời gian thanh toán'])) }));

            ws.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
            data.forEach(item => ws.addRow(item));

            let fileName = `Danh_sach_thu_BHYT_${Date.now()}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/thong-ke/thong-ke-tai-khoan-ngan-hang', app.permission.orCheck('tcThongKe:export', 'tcThongKe:read'), async (req, res) => {
        try {
            let { tknhcanbo: tknhCanBo, tknhsinhvien: tknhSinhVien } = await app.model.tcHocPhi.thongKeBhyt('');

            const workBook = app.excel.create();
            const ws1 = workBook.addWorksheet('Danh sách TKNH Cán bộ');

            ws1.columns = Object.keys(tknhCanBo[0]).map(key => ({ header: key, key }));
            tknhCanBo.forEach(item => ws1.addRow(item));

            const ws2 = workBook.addWorksheet('Danh sách TKNH Sinh viên');

            ws2.columns = Object.keys(tknhSinhVien[0]).map(key => ({ header: key, key }));
            tknhSinhVien.forEach(item => ws2.addRow(item));

            let fileName = `Danh_sach_TKHN_${Date.now()}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};