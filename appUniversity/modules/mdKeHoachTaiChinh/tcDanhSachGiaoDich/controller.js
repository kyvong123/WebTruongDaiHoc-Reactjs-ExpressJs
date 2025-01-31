module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5005: { title: 'Danh sách giao dịch', link: '/user/finance/danh-sach-giao-dich', icon: 'fa fa-table', groupIndex: 1, backgroundColor: '#FC7B5D' },
        },
    };

    app.permissionHooks.add('staff', 'addRolesTcGiaoDich', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:export', 'tcGiaoDich:write');
            resolve();
        } else resolve();
    }));

    app.permission.add(
        { name: 'tcGiaoDich:write', menu }, 'tcGiaoDich:export', 'tcGiaoDich:manage', 'tcGiaoDich:check', 'tcGiaoDich:cancel'
    );

    app.get('/user/finance/danh-sach-giao-dich', app.permission.check('tcGiaoDich:write'), app.templates.admin);
    app.get('/user/finance/danh-sach-giao-dich/compare', app.permission.check('tcGiaoDich:write'), app.templates.admin);


    app.get('/api/khtc/danh-sach-giao-dich/page/:pageNumber/:pageSize', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const settings = await getSettings();
            const namHoc = filter.namHoc || settings.hocPhiNamHoc;
            const hocKy = filter.hocKy || settings.hocPhiHocKy;
            filter.tuNgay = filter.tuNgay || '';
            filter.denNgay = filter.denNgay || '';
            if (!filter?.typePage) {
                filter.typePage = 0;
            }
            const filterData = app.utils.stringify({ ...filter, namHoc, hocKy });
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcHocPhiTransaction.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, totalmoney: totalMoney, detailnganhang: detailNganHang } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, totalMoney, list, filter, settings: { namHoc, hocKy }, detailNganHang }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/danh-sach-giao-dich/list-ngan-hang-sinh-vien', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            const searchTerm = req.query.condition;
            const list = await app.model.tcHocPhiTransaction.listBank(searchTerm || '');
            res.send({ items: list.rows.map(item => item.bank) });
        } catch (error) {
            res.send({ error });
        }
    });

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');

    app.get('/api/khtc/danh-sach-giao-dich/download-psc', app.permission.check('tcGiaoDich:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter, {});
            const settings = await getSettings();

            if (!filter.namHoc || !filter.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }

            const tuNgay = filter.tuNgay && parseInt(filter.tuNgay),
                denNgay = filter.denNgay && parseInt(filter.denNgay);
            filter = app.utils.stringify(filter, '');
            let data = await app.model.tcHocPhiTransaction.downloadPsc(filter);
            const list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet(`${settings.hocPhiNamHoc}_${settings.hocPhiHocKy}`);
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'Mssv', key: 'mssv', width: 15 },
                { header: 'Họ Tên', key: 'hoTen', width: 30 },
                { header: 'Ngày hóa đơn', key: 'ngayHoaDon', width: 30 },
                { header: 'Số tiền', key: 'soTien', width: 30 },
                { header: 'Khoa', key: 'khoa', width: 30 },
                { header: 'Hệ', key: 'he', width: 30 },
                { header: 'Ngành', key: 'nganh', width: 30 },
                { header: 'Khóa', key: 'khoas', width: 30 },
                { header: 'Số series', key: 'soSeries', width: 30 },
                { header: 'Số hóa đơn', key: 'soHoaDon', width: 30 },
                { header: 'Học kỳ', key: 'hocKy', width: 30 },
                { header: 'Năm học', key: 'namHoc', width: 30 },
                { header: 'Nội dung thu', key: 'noiDungThu', width: 30 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };
            list.filter(item => (!Number.isInteger(tuNgay) || parseInt(item.ngayDong) >= tuNgay) && (!Number.isInteger(denNgay) || parseInt(item.ngayDong) <= denNgay)).forEach((item, index) => {
                const ngayDong = item.ngayDong ? new Date(Number(item.ngayDong)) : null;
                ws.getRow(index + 2).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(index + 2).font = { name: 'Times New Roman' };
                ws.getCell('A' + (index + 2)).value = index + 1;
                ws.getCell('B' + (index + 2)).value = item.mssv;
                ws.getCell('C' + (index + 2)).value = `${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''}`.trim();
                ws.getCell('D' + (index + 2)).value = ngayDong ? app.date.dateTimeFormat(ngayDong, 'dd/mm/yyyy') : '';
                ws.getCell('E' + (index + 2)).value = item.khoanDong.toString();
                ws.getCell('F' + (index + 2)).value = item.tenKhoa;
                ws.getCell('G' + (index + 2)).value = item.tenLoaiHinhDaoTao;
                ws.getCell('H' + (index + 2)).value = item.tenNganh;
                ws.getCell('I' + (index + 2)).value = item.namTuyenSinh || '';
                ws.getCell('J' + (index + 2)).value = `${item.nganHang}/${ngayDong ? `${('0' + (ngayDong.getMonth() + 1)).slice(-2)}${ngayDong.getFullYear().toString().slice(-2)}` : ''}`;
                ws.getCell('K' + (index + 2)).value = ('000000' + item.R).slice(-7);
                ws.getCell('L' + (index + 2)).value = 'HK0' + settings.hocPhiHocKy;
                ws.getCell('M' + (index + 2)).value = `${settings.hocPhiNamHoc} - ${parseInt(settings.hocPhiNamHoc) + 1}`;
                ws.getCell('N' + (index + 2)).value = `Tạm thu học phí học kỳ 1 NH${settings.hocPhiNamHoc}-${parseInt(settings.hocPhiNamHoc) + 1}`;
            });
            let fileName = `HOC_PHI_NH_${settings.hocPhiNamHoc}_${parseInt(settings.hocPhiNamHoc) + 1}_HK${settings.hocPhiHocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            res.status(401).send({ error });
        }
    });

    const { reduceBill, addBill } = require('../../../services/bankService/reduceBill')(app);

    app.get('/api/khtc/danh-sach-giao-dich/get-cong-no', app.permission.check('tcGiaoDich:check'), async (req, res) => {
        try {
            let mssv = req.query?.mssv || '';
            if (!mssv) {
                throw ('Không có thông tin sinh viên!');
            }

            const hocPhi = await app.model.tcHocPhi.getAll({ mssv });
            const congNo = hocPhi.map(item => item.congNo).sum();

            res.send({ congNo });
        } catch (error) {
            res.send({ error });
        }

    });

    const importGiaoDich = async (soTien, sinhVien, pttt, ghiChu, thoiGianSoPhu, email) => {
        soTien = parseInt(soTien);
        const settings = await getSettings();
        const namHoc = settings.hocPhiNamHoc;
        const hocKy = settings.hocPhiHocKy;
        if (!Number.isInteger(soTien) || !sinhVien)
            throw 'Dữ liệu không hợp lệ.';
        const hocPhi = await app.model.tcHocPhi.getAll({ mssv: sinhVien });
        if (!hocPhi) throw 'Dữ liệu học phí sinh viên không tồn tại.';
        // if (hocPhi.map(item => item.congNo).sum() <= 0) throw 'Sinh viên không có công nợ.';
        const timeStamp = new Date().getTime();
        !thoiGianSoPhu && (thoiGianSoPhu = timeStamp);
        const manualTransid = `${sinhVien}-${timeStamp}`;
        const contentBill = await reduceBill(sinhVien, parseInt(soTien));
        await addBill(namHoc, hocKy, sinhVien, parseInt(soTien), timeStamp, '', pttt, '', manualTransid, '', contentBill.result, thoiGianSoPhu, 0);
        await app.model.tcHocPhiTransaction.update({ transId: manualTransid }, { ghiChu });

        await app.model.tcHocPhiLog.create({
            namHoc, hocKy,
            mssv: sinhVien,
            email,
            thaoTac: 'c',
            ngay: timeStamp,
            duLieuCu: app.utils.stringify({}),
            duLieuMoi: app.utils.stringify({ hocPhi: `${soTien}`, transId: manualTransid })
        });
    };
    // Some helper function

    const getValue = function (val, type = 'text', _default = null) {
        const value = typeof val == 'string' ? val.trim() : val;
        switch (type) {
            case 'text':
                return value || _default;
            case 'date':
                if (value) {
                    const [d, m, y] = value.split('/'),
                        mil = new Date(y, m - 1, d).getTime();
                    return isNaN(mil) ? _default : mil;
                } else {
                    return _default;
                }
            default:
                return _default;
        }
    };

    const tcImportGiaoDich = async (req, fields, files, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcCreateGiaoDich' && files.TcCreateGiaoDich && files.TcCreateGiaoDich.length) {
            const srcPath = files.TcCreateGiaoDich[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                try {
                    app.fs.deleteFile(srcPath);
                    const worksheet = workbook.getWorksheet(1);
                    let index = 2;
                    const email = `${req.session.user.email} - importGiaoDich`;
                    const listSuccess = [];
                    const listError = [];
                    while (true) {
                        if (!worksheet.getCell('A' + index).value) {
                            break;
                        }
                        else {
                            const sinhVien = `${worksheet.getCell('A' + index).value}`;
                            const soTien = worksheet.getCell('B' + index).value;
                            const pttt = worksheet.getCell('C' + index).value;
                            const thoiGianSoPhu = getValue(worksheet.getCell('D' + index).value, 'date');
                            const ghiChu = worksheet.getCell('E' + index).value;
                            try {
                                await importGiaoDich(parseInt(soTien), sinhVien, pttt, ghiChu, thoiGianSoPhu, email);
                                listSuccess.push({ mssv: sinhVien, soTien });
                            } catch (error) {
                                listError.push({ mssv: sinhVien, soTien });
                                console.error(`${sinhVien} :: ${error}`);
                            }
                        }
                        index++;
                    }
                    done({ listError, listSuccess });
                } catch (error) {
                    console.error(error);
                    done({ error });
                }
            } else {
                done({ error: 'No workbook!' });
            }

        }


    };
    //Hook upload -----------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('TcCreateGiaoDich', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcImportGiaoDich(req, fields, files, done), done, 'tcGiaoDich:write')
    );

    app.post('/api/khtc/danh-sach-giao-dich', app.permission.check('tcGiaoDich:check'), async (req, res) => {
        try {
            let { soTien, sinhVien, pttt, ghiChu, thoiGianSoPhu, isAllowInvoice, loaiGiaoDich } = req.body;
            soTien = parseInt(soTien);
            const settings = await getSettings();
            const namHoc = settings.hocPhiNamHoc;
            const hocKy = settings.hocPhiHocKy;
            if (!Number.isInteger(soTien) || !sinhVien)
                throw 'Dữ liệu không hợp lệ.';
            const hocPhi = await app.model.tcHocPhi.getAll({ mssv: sinhVien });
            if (!hocPhi) throw 'Dữ liệu học phí sinh viên không tồn tại.';
            // if (hocPhi.map(item => item.congNo).sum() <= 0) throw 'Sinh viên không có công nợ.';
            const timeStamp = new Date().getTime();
            !thoiGianSoPhu && (thoiGianSoPhu = timeStamp);
            let manualTransid;

            if (loaiGiaoDich == 'HP') {
                manualTransid = `${sinhVien}-${timeStamp}`;
                const contentBill = await reduceBill(sinhVien, parseInt(soTien));
                await addBill(namHoc, hocKy, sinhVien, parseInt(soTien), timeStamp, '', pttt, '', manualTransid, '', contentBill.result, thoiGianSoPhu, 0);
                await app.model.tcHocPhiTransaction.update({ transId: manualTransid }, { ghiChu, isAllowInvoice, loaiGiaoDich });
            }
            else {
                manualTransid = `${sinhVien}-BH-${timeStamp}`;
                await app.model.tcGiaoDichBhyt.create({
                    namHoc, hocKy,
                    bank: 'BIDV', transId: manualTransid,
                    transDate: timeStamp,
                    customerId: sinhVien,
                    billId: '', serviceId: pttt, checksum: '',
                    amount: parseInt(soTien),
                    status: 1,
                    thoiGianSoPhu: thoiGianSoPhu,
                    originalCustomerId: sinhVien
                });

                const checkDotBhyt = await app.model.svDotDangKyBhyt.getAll({
                    statement: ':timeNow BETWEEN THOI_GIAN_BAT_DAU AND THOI_GIAN_KET_THUC',
                    parameter: { timeNow: Date.now() }
                }).then(data => data.map(item => item.ma));

                checkDotBhyt && checkDotBhyt.length && await app.model.svBaoHiemYTe.update({
                    statement: 'MSSV = :mssv AND ID_DOT IN (:listDot)',
                    parameter: { mssv: sinhVien, listDot: checkDotBhyt.toString() }
                }, { idGiaoDich: manualTransid });
                app.messageQueue.send('thanhToanBhyt:send', { mssv: sinhVien });
            }
            // const result = await app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, '', manualTransid, timeStamp, sinhVien, '', pttt, soTien, '', contentBill.result, thoiGianSoPhu);
            // : (namhoc, hocky, ebank, transid, transdate, customerid, billid, serviceid, eamount, echecksum, done)
            // if (!result?.outBinds?.ret)
            //     throw {};


            await app.model.tcHocPhiLog.create({
                namHoc, hocKy,
                mssv: sinhVien,
                email: req.session.user.email,
                thaoTac: 'c',
                ngay: timeStamp,
                duLieuCu: app.utils.stringify({}),
                duLieuMoi: app.utils.stringify({ hocPhi: `${soTien}`, transId: manualTransid })
            });

            res.end();
        } catch (error) {
            res.send({ error });
        }

    });

    app.put('/api/khtc/danh-sach-giao-dich', app.permission.check('tcGiaoDich:check'), async (req, res) => {
        try {
            const { keys, changes } = req.body;
            if (!keys || !changes) {
                throw ('Thông tin giao dịch không đúng');
            }
            if (Object.keys(changes).some(item => ['ghiChu', 'pttt', 'ngayGiaoDich', 'thoiGianSoPhu', 'isAllowInvoice', 'loaiGiaoDich'].indexOf(item) < 0)) {
                throw ('Tham số không hợp lệ');
            }
            const item = await app.model.tcHocPhiTransaction.get({ transId: keys.transId });
            if (!item) {
                throw ('Thông tin giao dịch không đúng');
            }

            const new_item = await app.model.tcHocPhiTransaction.update({ transId: keys.transId }, { ghiChu: changes.ghiChu, serviceId: changes.pttt, transDate: changes.ngayGiaoDich, thoiGianSoPhu: changes.thoiGianSoPhu, isAllowInvoice: changes.isAllowInvoice });

            const timeStamp = new Date().getTime();
            await app.model.tcHocPhiLog.create({
                namHoc: item.namHoc, hocKy: item.hocKy,
                mssv: item.customerId,
                email: req.session.user.email,
                thaoTac: 'u',
                ngay: timeStamp,
                duLieuCu: app.utils.stringify({ pttt: item.serviceId, ghiChu: item.ghiChu, transDate: item.transDate, thoiGianSoPhu: item.thoiGianSoPhu, transId: item.transId, isAllowInvoice: item.isAllowInvoice }),
                duLieuMoi: app.utils.stringify({ pttt: new_item.serviceId, transDate: new_item.transDate, thoiGianSoPhu: new_item.thoiGianSoPhu, ghiChu: new_item.ghiChu, isAllowInvoice: new_item.isAllowInvoice })
            });

            res.send(new_item);
        } catch (error) {
            res.send({ error });
        }

    });

    //app.permission.check('tcGiaoDich:cancel'),
    app.post('/api/khtc/danh-sach-giao-dich/huy', app.permission.check('tcGiaoDich:cancel'), async (req, res) => {
        try {
            let { ghiChu, transId } = req.body;
            let email = req.session.user.email;
            if (!email) {
                return res.send({ error: 'Không thể thực hiện hủy giao dịch.' });
            }

            const giaoDich = await app.model.tcHocPhiTransaction.get({ transId });
            if (!giaoDich) {
                return res.send({ error: 'Dữ liệu không hợp lệ.' });
            }
            if (giaoDich.status == 0) {
                return res.send({ error: 'Giao dịch đã được hủy trước đó.' });
            }

            // const hocPhi = await app.model.tcHocPhi.get({ mssv: giaoDich.customerId, namHoc: giaoDich.namHoc, hocKy: giaoDich.hocKy });
            // if (!hocPhi) {
            //     return res.send({ error: 'Dữ liệu không hợp lệ.' });
            // }


            await app.model.tcHocPhiTransaction.update({ transId }, { ghiChu, status: 0 });
            const { namHoc, hocKy, khoanThu, invoiceId, customerId: mssv, amount } = giaoDich;
            const listKhoanThu = app.utils.parse(khoanThu);
            for (const item of Object.keys(listKhoanThu)) {
                const getItemDetail = await app.model.tcHocPhiDetail.get({ mssv, loaiPhi: parseInt(item) });
                if (getItemDetail) {
                    await app.model.tcHocPhiDetail.update({ mssv, loaiPhi: parseInt(item) }, { soTienDaDong: parseInt(getItemDetail.soTienDaDong) - parseInt(listKhoanThu[item].soTien) });
                }
            }
            // await app.model.tcHocPhiLog.create({
            //     namhoc: hocPhi.namHoc, hocKy: hocPhi.hocKy,
            //     mssv: hocPhi.mssv,
            //     email: email,
            //     thaoTac: 'd',
            //     ngay: new Date().getTime(),
            //     duLieuCu: app.utils.stringify({ congNo: `${hocPhi.congNo}`, transId: transId }),
            //     duLieuMoi: app.utils.stringify({ congNo: `${parseInt(hocPhi.congNo) + parseInt(amount)}` })
            // });

            await app.model.tcHocPhiLog.create({
                namHoc, hocKy, mssv,
                email: email,
                thaoTac: 'd',
                ngay: new Date().getTime(),
                duLieuCu: app.utils.stringify({ amount: `${amount}`, transId: transId }),
                duLieuMoi: app.utils.stringify({ ghiChu: `${ghiChu}` })
            });
            res.send({ invoiceId });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/danh-sach-giao-dich/stat', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            let { batDau, ketThuc } = app.utils.parse(req.query.data);
            const { rows: list } = await app.model.tcHocPhiTransaction.getThongKeExcel(req.query.data);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thống kê');
            ws.getCell('A1').value = `THỐNG KÊ GIAO DỊCH TỪ NGÀY ${app.date.viDateFormat(new Date(batDau))} ĐẾN NGÀY ${app.date.viDateFormat(new Date(ketThuc))}`;
            ws.getCell('A1').font = {
                name: 'Times New Roman',
                family: 4,
                size: 16,
                bold: true,
                color: { argb: 'FF000000' }
            };
            const objectLoaiPhi = (list) => {
                let objectLoaiPhiTong = {};
                list.map(item => {
                    if (item.khoanThu) {
                        const khoanThu = app.utils.parse(item.khoanThu);
                        const dataKhoanThu = Object.keys(khoanThu);
                        for (const loaiPhi of dataKhoanThu) {
                            if (objectLoaiPhiTong[loaiPhi]) {
                                objectLoaiPhiTong[loaiPhi].soTien = objectLoaiPhiTong[loaiPhi].soTien + khoanThu[loaiPhi].soTien;
                            } else {
                                objectLoaiPhiTong[loaiPhi] = { ten: khoanThu[loaiPhi].ten, soTien: khoanThu[loaiPhi].soTien };
                            }
                        }
                    }
                });
                return objectLoaiPhiTong;
            };

            const mapper = {};

            const objectTong = objectLoaiPhi(list);

            Object.keys(objectTong).map((item, index) => {
                mapper[item] = {
                    col: app.excel.numberToExcelColumn(index + 3),
                    ten: objectTong[item].ten
                };
            });

            Object.keys(mapper).map(item => {
                ws.getCell(`${mapper[item].col}3`).value = mapper[item].ten;
                ws.getColumn(`${mapper[item].col}`).width = mapper[item].ten.length < 50 ? 80 : mapper[item].ten.length + 4;
            });
            ws.getRow(3).font = {
                bold: true,
                name: 'Times New Roman',
                size: 14,
                color: { argb: 'FF000000' }

            };
            ws.getColumn('A').width = 32;
            ws.getColumn('B').width = 40;
            const dataTheoBac = list.groupBy('tenBacDaoTao');

            let counter = 5;
            Object.keys(dataTheoBac).map(bac => {
                // TODO BAC
                ws.getCell(`A${counter}`).value = `BẬC ${bac.toUpperCase()}`;
                ws.getCell(`A${counter}`).font = {
                    name: 'Times New Roman',
                    bold: true,
                    family: 4,
                    size: 14,
                    color: { argb: 'FF000000' }
                };
                const dataExcelBac = objectLoaiPhi(dataTheoBac[bac]);
                Object.keys(mapper).map(item => {
                    ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelBac[item]?.soTien || 0;
                });
                ws.getRow(counter).font = {
                    name: 'Times New Roman',
                    bold: true,
                    family: 4,
                    size: 14,
                    color: { argb: 'FF000000' }
                };
                counter++;

                const dataTheoHe = dataTheoBac[bac].groupBy('tenLoaiHinhDaoTao');

                Object.keys(dataTheoHe).map(he => {
                    // TODO HE
                    const dataExcelHe = objectLoaiPhi(dataTheoHe[he]);

                    ws.getCell(`A${counter}`).value = `Hệ ${he}`;
                    ws.getCell(`A${counter}`).font = {
                        name: 'Times New Roman',
                        bold: true,
                        family: 4,
                        size: 12,
                        color: { argb: 'FF000000' }
                    };
                    Object.keys(mapper).map(item => {
                        ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelHe[item]?.soTien || 0;
                    });
                    ws.getRow(counter).font = {
                        name: 'Times New Roman',
                        bold: true,
                        family: 4,
                        size: 12,
                        color: { argb: 'FF000000' }
                    };
                    counter++;

                    const dataTheoNamTuyenSinh = dataTheoHe[he].groupBy('namTuyenSinh');

                    Object.keys(dataTheoNamTuyenSinh).map(namTuyenSinh => {
                        // TODO NAMTUYENSINH
                        const dataExcelNamTuyenSinh = objectLoaiPhi(dataTheoNamTuyenSinh[namTuyenSinh]);
                        ws.getCell(`A${counter}`).value = namTuyenSinh;
                        ws.getCell(`A${counter}`).font = {
                            name: 'Times New Roman',
                            bold: true,
                            family: 4,
                            size: 12,
                            alignment: 'right',
                            color: { argb: 'FF000000' }
                        };

                        Object.keys(mapper).map(item => {
                            ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelNamTuyenSinh[item]?.soTien || 0;
                        });
                        ws.getRow(counter).font = {
                            name: 'Times New Roman',
                            bold: true,
                            family: 4,
                            size: 12,
                            color: { argb: 'FF000000' }
                        };

                        counter++;

                        const dataTheoKhoa = dataTheoNamTuyenSinh[namTuyenSinh].groupBy('khoa');

                        Object.keys(dataTheoKhoa).map((khoa, index) => {
                            const dataExcelKhoa = objectLoaiPhi(dataTheoKhoa[khoa]);
                            ws.getCell(`B${counter}`).value = `${index + 1}. ${khoa}`;
                            ws.getCell(`B${counter}`).font = {
                                name: 'Times New Roman',
                                italic: true,
                                family: 4,
                                size: 12,
                                color: { argb: 'FF000000' }
                            };
                            Object.keys(mapper).map(item => {
                                ws.getCell(`${mapper[item].col}${counter}`).value = dataExcelKhoa[item]?.soTien || 0;
                                ws.getCell(`${mapper[item].col}${counter}`).font = {
                                    italic: true
                                };
                            });
                            ws.getRow(counter).font = {
                                name: 'Times New Roman',
                                family: 4,
                                size: 12,
                                color: { argb: 'FF000000' }
                            };
                            counter++;
                            // TODO KHOA
                        });
                    });
                    counter += 1;
                });
                counter += 2;
            });
            // res.send({ list });
            // const workBook = app.excel.create();
            // const ws = workBook.addWorksheet('Thống kê');

            // ws.mergeCells('A1:A2');
            // ws.getCell('A1').value = 'HỆ';
            // ws.mergeCells('B1:C1');
            // ws.getCell('B1').value = 'Tổng quan';
            // ws.getCell('B2').value = 'số lượng';
            // ws.getCell('C2').value = 'Đã đóng';
            // addHeader({ columns: [{ text: 'So lượng' }, { text: 'So tiền' }], main: { text: 'Giao dich' } }, ws, 'D');
            // await writeExcel(list, { index: 3 }, ws);
            // res.send({ list });
            let fileName = `${Date.now()}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            res.send({ error });
        }
    });


    app.assignRoleHooks.addRoles('tcThemGiaoDich', { id: 'tcGiaoDich:check', text: 'Quản lý giao dịch: Thêm giao dịch' });

    app.assignRoleHooks.addHook('tcThemGiaoDich', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'tcThemGiaoDich' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('tcThemGiaoDich').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyThemGiaoDich', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:manage', 'tcGiaoDich:check', 'tcGiaoDich:cancel');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyThemGiaoDich', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tcThemGiaoDich');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tcGiaoDich:check') {
                app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:check');
            }
        });
        resolve();
    }));

    app.assignRoleHooks.addRoles('tcHuyGiaoDich', { id: 'tcGiaoDich:cancel', text: 'Quản lý giao dịch: Hủy giao dịch' });

    app.assignRoleHooks.addHook('tcHuyGiaoDich', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'tcHuyGiaoDich' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('tcHuyGiaoDich').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyHuyGiaoDich', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tcHuyGiaoDich');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tcGiaoDich:cancel') {
                app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:cancel');
            }
        });
        resolve();
    }));


    app.get('/api/khtc/danh-sach-giao-dich/bank/stat', async (req, res) => {
        try {
            const bankMapper = {
                'HCMUSSH2': 'Agribank',
                'HCMUSSH1': 'Agribank',
                'VCBXHNV2': 'VIETCOMBANK',
                'VCBXHNV1': 'VIETCOMBANK',
                '347002': 'BIDV',
            };
            const filter = app.utils.parse(req.query.data);
            const downloadType = req.query.downloadType;
            const { namHoc, hocKy } = filter;
            const data = {};
            const setData = (bank, he, khoa, keyword, value, increase = true) => {
                try {
                    if (data[bank][he][khoa][keyword] != null) {
                        data[bank][he][khoa][keyword] += value;
                    }
                    else {
                        throw new Error();
                    }
                } catch {
                    let item = data;
                    for (const key of [bank, he, khoa]) {
                        if (item[key] == null)
                            item[key] = {};
                        item = item[key];
                    }
                    item[keyword] = value;
                }
                if (increase) {
                    data[bank][he][khoa].soTien = (data[bank][he][khoa].soTien || 0) + value;
                }
            };
            const svData = await app.model.tcHocPhiTransaction.getBankStatistic(req.query.data);

            // TODO: Fix: currently using O(m*n*k) algorithm
            svData.rows.forEach(sv => {
                sv.loaiPhiList = app.utils.parse(sv.loaiPhiList, []);
                sv.transactions = app.utils.parse(sv.transactions, []);
                let current = 0;
                const banks = new Set();
                sv.transactions.forEach(transaction => {
                    transaction.left = transaction.amount;
                    banks.add(bankMapper[transaction.serviceId] || 'Khác');
                });
                banks.forEach(bank => setData(bank, sv.maHe, sv.maKhoa, 'soLuong', 1, false));
                for (let i = 0; i < sv.loaiPhiList.length; i++) {
                    const loaiPhi = sv.loaiPhiList[i];
                    loaiPhi.left = loaiPhi.soTien;
                    for (current; current < sv.transactions.length; current++) {
                        const transaction = sv.transactions[current];
                        let amount = 0;
                        if (loaiPhi.left > transaction.left) {
                            amount = transaction.left;
                            loaiPhi.left -= transaction.left;
                            transaction.left = 0;
                        } else if (loaiPhi.left < transaction.left) {
                            amount = loaiPhi.left;
                            if (i == (sv.loaiPhiList.length - 1)) {
                                amount = transaction.left;
                            }
                            transaction.left -= loaiPhi.left;
                            loaiPhi.left = 0;
                        } else {
                            amount = loaiPhi.left;
                            loaiPhi.left = 0;
                            transaction.left = 0;
                        }
                        setData(bankMapper[transaction.serviceId] || 'Khác', sv.maHe, sv.maKhoa, loaiPhi.idLoaiPhi, amount);
                        if (loaiPhi.left <= 0) {
                            break;
                        }
                    }
                    if (current >= sv.transactions.length) {
                        break;
                    }
                }
            });

            const preProcessData = (data) => {
                let khoa = new Set();
                let he = new Set();
                let loaiPhi = new Set();
                Object.keys(data).forEach(bank => {
                    const bankItem = data[bank];
                    const listHe = Object.keys(bankItem);
                    he = new Set([...he, ...listHe]);
                    listHe.forEach(maHe => {
                        const heItem = bankItem[maHe];
                        const listKhoa = Object.keys(heItem);
                        khoa = new Set([...listKhoa, ...khoa]);
                        listKhoa.forEach(maKhoa => loaiPhi = new Set([...loaiPhi, ...Object.keys(heItem[maKhoa])]));
                    });
                });
                return { khoa: Array.from(khoa), he: Array.from(he), loaiPhi: Array.from(loaiPhi), };
            };

            const { khoa, he, loaiPhi } = preProcessData(data);
            const khoaData = khoa.length ? (await app.model.dmDonVi.getAll({
                statement: 'ma in (:khoa)',
                parameter: { khoa }
            }, 'ma, ten')).reduce((prev, cur) => { prev[cur.ma] = cur.ten; return prev; }, {}) : [];
            const loaiPhiData = loaiPhi.length >= 2 ? (await app.model.tcLoaiPhi.getAll({
                statement: 'id in (:loaiPhi)',
                parameter: { loaiPhi: loaiPhi.filter(item => !['soLuong', 'soTien'].includes(item)).map(item => parseInt(item)) }
            }, 'id, ten')).reduce((prev, cur) => { prev[cur.id] = cur.ten; return prev; }, {}) : [];
            const heData = he.length ? (await app.model.dmSvLoaiHinhDaoTao.getAll({
                statement: 'ma in (:he)',
                parameter: { he }
            }, 'ma, ten')).reduce((prev, cur) => { prev[cur.ma] = cur.ten; return prev; }, {}) : [];


            const processData = (item) => {
                if (Object.keys(item).length && item.soTien == null) {
                    const stat = {};
                    Object.keys(item).forEach(key => {
                        item[key] = processData(item[key]);
                        Object.keys(item[key].stat).forEach(statItemKey => stat[statItemKey] = (stat[statItemKey] || 0) + item[key].stat[statItemKey]);
                    });
                    item.stat = stat;
                    return item;
                } else {
                    return { stat: item };
                }
            };

            if (downloadType == 'excel') {

                const workBook = app.excel.create();
                const ws = workBook.addWorksheet('Thống kê');

                const initHeader = function () {
                    formatRow(1, true);
                    formatRow(2, true);
                    const columns = Array.from(arguments);
                    let current = 0;
                    const result = {};
                    for (const column of columns) {
                        if (!column.subColumns) {
                            const char = String.fromCharCode(65 + current++);
                            ws.mergeCells(`${char}1:${char}2`);
                            ws.getCell(`${char}1`).value = column.text;
                            result[column.key] = char;
                        }
                        else if (column.subColumns.length) {
                            const start = String.fromCharCode(65 + current);
                            ws.mergeCells(`${start}1:${String.fromCharCode(65 + current + column.subColumns.length - 1)}1`);
                            ws.getCell(`${start}1`).value = column.text;
                            column.subColumns.forEach((column, index) => {
                                const char = String.fromCharCode(65 + current + index);
                                ws.getCell(`${char}2`).value = column.text;
                                result[column.key] = char;
                            });
                            current += column.subColumns.length;
                        } else {
                            continue;
                        }
                    }
                    return result;
                };

                const formatRow = (index, header = false) => {
                    const row = ws.getRow(index);
                    row.alignment = { vertical: 'middle', wrapText: true };
                    header && (row.alignment.horizontal = 'center');
                    row.font = {
                        name: 'Times New Roman',
                        family: 4,
                        size: 12,
                        bold: header,
                        color: { argb: 'FF000000' }
                    };
                };

                ws.columns = [
                    { key: 'stt', header: 'STT', width: 10 },
                    { key: 'bank', header: 'NGÂN HÀNG', width: 15 },
                    { key: 'hk', header: 'NH-HK', width: 10 },
                    { key: 'he', header: 'Hệ', width: 15 },
                    { key: 'khoa', header: 'Khoa', width: 20 },
                    { key: 'soLuong', header: 'Số SV', width: 8 },
                    { key: 'soTien', header: 'Số tiền đã đóng', width: 15 },
                    ...Object.entries(loaiPhiData).map(([key, header]) => ({ key, header, width: 15 })),
                    { key: 'ghiChu', header: 'Ghi chú', width: 20 },
                ];

                const columnDictionary = initHeader(
                    { key: 'stt', text: 'STT' },
                    { key: 'bank', text: 'NGÂN HÀNG' },
                    { key: 'hk', text: 'NH-HK' },
                    { key: 'he', text: 'Hệ' },
                    { key: 'khoa', text: 'Khoa' },
                    { key: 'soLuong', text: 'Số SV' },
                    { key: 'soTien', text: 'Số tiền đã đóng' },
                    { key: 'stt', text: 'Trong đó', subColumns: Object.entries(loaiPhiData).map(([key, text]) => ({ key, text })) },
                    { key: 'ghiChu', text: 'Ghi chú' },
                );

                const writeCell = (key, index, value) => {
                    ws.getCell(`${columnDictionary[key]}${index}`).value = value;
                };

                const writeStatCell = (row, stat) => {
                    Object.keys(loaiPhiData).forEach(loaiPhi => writeCell(loaiPhi, row, stat[loaiPhi] || 0));
                    writeCell('soTien', row, stat.soTien);
                    writeCell('soLuong', row, stat.soLuong || 0);
                };


                let row = 3;
                const processedData = processData(data);
                const writeExcel = () => {
                    formatRow(row, true);
                    writeCell('hk', row, `${namHoc}-HK0${hocKy}`);
                    writeStatCell(row++, processedData.stat);
                    Object.keys(processedData).sort((a, b) => a == 'Khác' ? 1 : (a < b ? -1 : 1)).forEach((maBank, index) => {
                        if (maBank == 'stat') return;
                        formatRow(row, true);
                        writeCell('hk', row, `${namHoc}-HK0${hocKy}`);
                        const bank = data[maBank];
                        writeCell('stt', row, String.fromCharCode(65 + index));
                        writeStatCell(row, bank.stat);
                        writeCell('bank', row++, maBank);
                        Object.keys(bank).forEach((maHe, index) => {
                            if (maHe == 'stat') return;
                            formatRow(row, true);
                            writeCell('hk', row, `${namHoc}-HK0${hocKy}`);
                            const he = bank[maHe];
                            writeCell('stt', row, app.utils.romanize(index + 1));
                            writeStatCell(row, he.stat);
                            writeCell('he', row++, heData[maHe]);
                            Object.keys(he).forEach((maKhoa, index) => {
                                if (maKhoa == 'stat') return;
                                formatRow(row);
                                const khoa = he[maKhoa];
                                writeCell('stt', row, index + 1);
                                writeStatCell(row, khoa.stat);
                                writeCell('khoa', row++, khoaData[maKhoa]);
                            });
                        });
                    });
                };
                writeExcel();
                let fileName = 'Thống kê.xlsx';
                app.excel.attachment(workBook, res, fileName);
            } else {
                res.send({ data: processData(data) });
            }
        } catch (error) {
            res.status(500).send({ error });
        }
    });


    app.uploadHooks.add('TachTransaction', (req, fields, files, params, done) =>
        app.permission.has(req, () => TachMssv(fields, files, params, done), done, 'tcGiaoDich:write')
    );

    const TachMssv = async (fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TachTransaction' && files.TachTransaction && files.TachTransaction.length) {
            try {
                const srcPath = files.TachTransaction[0].path,
                    fileName = srcPath.replace(/^.*[\\\/]/, '');
                app.fs.renameSync(srcPath, app.path.join(app.assetPath, 'soPhu', fileName));
                done && done({ fileName });
            }
            catch (error) {
                done && done(error);
            }
        }
    };

    app.get('/api/khtc/download-tach-giao-dich-excel/:fileName', app.permission.check('tcGiaoDich:write'), (req, res) => {
        let fileName = req.params.fileName;
        const srcPath = app.path.join(app.assetPath, 'tempTcTachTransaction', fileName);
        res.download(srcPath, 'TachTransaction.xlsx');
    });

    app.readyHooks.add('TcTransaction:deleteTempFolder', {
        ready: () => app.database && app.assetPath,
        run: () => {
            app.primaryWorker && app.schedule('0 0 * * *', () => {
                app.fs.deleteFolder(app.path.join(app.assetPath, 'tempTcTachTransaction'));
            });
        },
    });


    app.get('/api/khtc/danh-sach-giao-dich/excel-can-tru', app.permission.check('tcGiaoDich:export'), async (req, res) => {
        try {
            let filter = req.query?.filter;
            if (!filter) {
                throw ('Thông tin không đúng');
            }

            let { rows: data, listloaiphi: listLoaiPhi } = await app.model.tcHocPhiTransaction.excelCanTru(filter);

            if (!data || !data.length) {
                throw ('Không có dữ liệu giao dịch');
            }

            res.send({});
            const workBook = app.excel.create();

            let listLoaiPhiContains = [];
            data.map(item => {
                if (item.khoanThu) {
                    const khoanThu = app.utils.parse(item.khoanThu);
                    const dataKhoanThu = Object.keys(khoanThu);
                    for (const loaiPhi of dataKhoanThu) {
                        if (!listLoaiPhiContains.find(item => item == loaiPhi)) {
                            listLoaiPhiContains.push(Number(loaiPhi));
                        }
                    }
                }
            });

            filter = app.utils.parse(filter);
            let mapTamThu = {};

            listLoaiPhi.forEach(item => {
                if (item.tamThu != null) {
                    mapTamThu[item.tamThu] = item.id;
                }
            });
            listLoaiPhi = listLoaiPhi.filter(item => listLoaiPhiContains.includes(item.id) && !Object.keys(mapTamThu).includes(String(item.id)));

            let mapLoaiPhi = await app.model.tcLoaiPhi.getAll();

            mapLoaiPhi = mapLoaiPhi.mapArrayToObject('id');

            const listLoaiPhiZero = () => listLoaiPhi.reduce((map, obj) => {
                map[obj.id] = 0;
                return map;
            }, {});

            //Sheet Thống kê cấn trừ theo giao dịch
            const ws1 = workBook.addWorksheet('Cấn trừ theo giao dịch');
            ws1.columns = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên', key: 'hoVaTen', width: 40 },
                { header: 'Hệ đào tạo', key: 'heDaoTao', width: 30 },
                { header: 'Khoa', key: 'tenKhoa', width: 40 },
                { header: 'Khóa sinh viên', key: 'khoaSinhVien', width: 40 },
                { header: 'Ký hiệu', key: 'invoiceSerial', width: 40 },
                { header: 'Số chứng từ', key: 'invoiceNumber', width: 40 },
                { header: 'Số tiền giao dịch', key: 'soTien', width: 20 },
                ...listLoaiPhi.map(item => Object({ header: item.ten, key: item.id, width: 20 })),
                { header: 'Ngày giao dịch', key: 'ngayGiaoDich', width: 20 },
                { header: 'Ngân hàng', key: 'nganHang', width: 40 },
            ];
            ws1.getRow(1).alignment = { ...ws1.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws1.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            //Sheet Thống kê cấn trừ theo khoản thu
            const ws2 = workBook.addWorksheet('Cấn trừ theo khoản thu');
            ws2.columns = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên', key: 'hoVaTen', width: 40 },
                { header: 'Hệ đào tạo', key: 'heDaoTao', width: 30 },
                { header: 'Khoa', key: 'tenKhoa', width: 40 },
                { header: 'Khóa sinh viên', key: 'khoaSinhVien', width: 40 },
                { header: 'Số tiền giao dịch', key: 'soTien', width: 20 },
                { header: 'Nội dung', key: 'noiDung', width: 60 },
                { header: 'Năm phát sinh', key: 'namPhatSinh', width: 20 },
                { header: 'Học kỳ phát sinh', key: 'hocKyPhatSinh', width: 20 },
                { header: 'Ngày giao dịch', key: 'ngayGiaoDich', width: 20 },
                { header: 'Ngân hàng', key: 'nganHang', width: 40 },
            ];
            ws2.getRow(1).alignment = { ...ws2.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws2.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            let index_ws1 = 0, index_ws2 = 0;

            let dataPivot = [];

            data.forEach(item => {
                let khoanThu = app.utils.parse(item.khoanThu);
                let listDongTien = listLoaiPhiZero();

                for (let ele in khoanThu) {
                    listDongTien[ele] = khoanThu[ele].soTien;
                }

                for (let ele in listDongTien) {
                    if (mapTamThu[ele]) {
                        listDongTien[mapTamThu[ele]] += listDongTien[ele];
                        listDongTien[ele] = 0;
                    }
                }

                ws1.addRow({
                    stt: index_ws1 + 1,
                    mssv: item.mssv,
                    hoVaTen: item.hoVaTen,
                    heDaoTao: item.heDaoTao,
                    tenKhoa: item.tenKhoa,
                    khoaSinhVien: item.khoaSinhVien,
                    invoiceSerial: item.invoiceSerial || '',
                    invoiceNumber: item.invoiceNumber,
                    // soTien: item.soTien?.toString().numberDisplay(),
                    soTien: item.soTien,
                    nganHang: item.nganHang,
                    ngayGiaoDich: item.ngayGiaoDich ? app.date.viDateFormat(new Date(Number(item.ngayGiaoDich))) : '',
                    ...listDongTien
                });
                ws1.getRow(index_ws1 + 2).alignment = { ...ws1.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws1.getRow(index_ws1 + 2).font = { name: 'Times New Roman' };

                index_ws1 += 1;

                for (let ele in listDongTien) {
                    let namPhatSinh = mapLoaiPhi[ele]?.namPhatSinh || '';
                    let hocKyPhatSinh = mapLoaiPhi[ele]?.hocKyPhatSinh || '';
                    const rows = {
                        stt: index_ws2 + 1,
                        mssv: item.mssv,
                        hoVaTen: item.hoVaTen,
                        bacDaoTao: item.bacDaoTao,
                        heDaoTao: item.heDaoTao,
                        nganhDaoTao: item.nganhDaoTao,
                        tenKhoa: item.tenKhoa,
                        khoaSinhVien: item.khoaSinhVien,
                        soTien: listDongTien[ele],
                        nganHang: item.nganHang,
                        loaiPhi: ele,
                        noiDung: mapLoaiPhi[ele]?.ten || '',
                        ngayGiaoDich: item.ngayGiaoDich ? app.date.viDateFormat(new Date(Number(item.ngayGiaoDich))) : '',
                        namPhatSinh: namPhatSinh ? `${parseInt(namPhatSinh)}-${parseInt(namPhatSinh) + 1}` : '',
                        hocKyPhatSinh: hocKyPhatSinh ? `HK${hocKyPhatSinh}` : '',
                    };
                    if (rows.soTien > 0) {
                        ws2.addRow(rows);
                        ws2.getRow(index_ws2 + 2).alignment = { ...ws2.getRow(1).alignment, vertical: 'middle', wrapText: true };
                        ws2.getRow(index_ws2 + 2).font = { name: 'Times New Roman' };
                        index_ws2 += 1;

                        dataPivot.push(rows);
                    }
                }
            });

            const groupByKeys = filter.pivot.split(',');

            //Sheet Thống kê pivot
            const ws3 = workBook.addWorksheet('Thống kê pivot');
            ws3.getCell('B1').value = 'ĐẠI HỌC QUỐC GIA TP.HCM';
            ws3.getCell('B1').style = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } };
            ws3.getCell('B2').value = 'TRƯỜNG ĐH KH XÃ HỘI & NHÂN VĂN';
            ws3.getCell('B2').style = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } };
            ws3.getCell('B3').value = 'PHÒNG KẾ HOẠCH - TÀI CHÍNH';
            ws3.getCell('B3').style = { alignment: { horizontal: 'center', vertical: 'middle' } };

            ws3.getCell('E1').value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
            ws3.getCell('E1').style = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } };
            ws3.getCell('E2').value = 'Độc lập - Tự do - Hạnh phúc';
            ws3.getCell('E2').style = { alignment: { horizontal: 'center', vertical: 'middle' } };

            ws3.getCell('B5').value =
                `THỐNG KÊ THU HỌC PHÍ${filter.tuNgay ? ` TỪ NGÀY ${app.date.viDateFormat(new Date(Number(filter.tuNgay)))}` : ''}${filter.denNgay ? ` ĐẾN NGÀY ${app.date.viDateFormat(new Date(Number(filter.denNgay)))}` : ''}`;
            ws3.getCell('B5').font = { size: 16, bold: true };
            const mapHeader = {
                'nganHang': 'Ngân hàng',
                'namPhatSinh': 'Năm học',
                'hocKyPhatSinh': 'Học kỳ',
                'bacDaoTao': 'Bậc đào tạo',
                'heDaoTao': 'Hệ đào tạo',
                'nganhDaoTao': 'Ngành đào tạo',
                'khoaSinhVien': 'Khóa sinh viên',
            };

            const header = [
                { header: '', key: 'key_0', width: 10 },
                ...groupByKeys.map((item, index) => Object({ header: mapHeader[item], key: `key_${index + 1}`, width: 20 })),
                { header: 'Tổng số SV', key: 'total_sv', width: 15 },
                { header: 'Tổng thu', key: 'total_soTien', width: 30 },
                { header: 'Số SV', key: 'hocPhi_sv', width: 10 },
                { header: 'Học phí', key: 'hocPhi_soTien', width: 20 }

            ];

            listLoaiPhi.filter(item => !item.isHocPhi).map(item => {
                header.push({ header: 'Số SV', key: `${item.id}_sv`, width: 10 });
                header.push({ header: item.ten, key: `${item.id}_soTien`, width: 20 });
            });

            header.forEach((item, index) => {
                if (item.header) ws3.getCell(7, index + 1).value = item.header;
                if (item.key) ws3.getColumn(index + 1).key = item.key;
                if (item.width) ws3.getColumn(index + 1).width = item.width;
            });

            ws3.getRow(7).eachCell(cell => {
                cell.style = { font: { size: 14, bold: true }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } };
            });

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
                        currentObj['data'] = { ...Object.fromEntries(listLoaiPhi.filter(item => !Number(item.isHocPhi)).map(key => [key.id, { soTien: 0, sv: [] }])), hocPhi: { soTien: 0, sv: [] } };
                    }
                    if (!listLoaiPhi.find(loaiPhi => loaiPhi.id == item.loaiPhi)?.isHocPhi) {
                        if (currentObj['data'][item.loaiPhi]) {
                            currentObj['data'][item.loaiPhi].soTien += item.soTien;
                            currentObj['data'][item.loaiPhi].sv.push(item.mssv);
                        }
                    }
                    else {
                        currentObj['data'].hocPhi.soTien += item.soTien;
                        currentObj['data'].hocPhi.sv.push(item.mssv);
                    }
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

                result.push({ [`key_${level}`]: parentKey, data });

                const properties = [];
                for (const key in rest) {
                    if (typeof rest[key] === 'object' && rest[key] !== null) {
                        properties.push(key);
                    } else {
                        result.push({ [`key_${level}`]: key, data: rest[key] });
                    }
                }

                properties.sort();
                for (const key of properties) {
                    flattenObject(rest[key], level + 1, key, result);
                }

                return result;
            };

            for (let row of flattenObject(dataPivot)) {
                row.data = {
                    ...row.data,
                    total: {
                        soTien: Object.values(row.data).map(item => item.soTien).sum(),
                        sv: Object.values(row.data).map(item => item.sv).reduce((result, item) => result.concat(item), []),
                    }
                };

                row.data = Object.keys(row.data).reduce((result, key) => {
                    result[`${key}_soTien`] = row.data[key].soTien;
                    result[`${key}_sv`] = new Set(row.data[key].sv).size;
                    return result;
                }, {});
                ws3.addRow({ ...row, ...row.data });
            }

            ws3.getCell(ws3.rowCount + 2, ws3.columnCount - 2).value = 'Thành phố Hồ Chí Minh, ' + app.date.viDateFormatString(new Date());
            ws3.getCell(ws3.rowCount + 1, ws3.columnCount - 2).value = 'Người lập';

            let fileName = `Thong_ke_can_tru (${filter.tuNgay ? app.date.viDateFormat(new Date(Number(filter.tuNgay))).replaceAll('/', '') : ' '} - ${filter.denNgay ? app.date.viDateFormat(new Date(Number(filter.denNgay))).replaceAll('/', '') : ' '}).xlsx`;
            const buffer = await workBook.xlsx.writeBuffer();

            const folderTempChildPath = app.path.join(app.assetPath, 'khtc', 'temp', `${Date.now()}`);
            app.fs.createFolder(folderTempChildPath);

            const filePath = app.path.join(folderTempChildPath, fileName);
            app.fs.writeFileSync(filePath, buffer);

            const email = req.session?.user.email;
            app.io.to(email).emit('downloadExcelCanTru', filePath);
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/danh-sach-giao-dich/excel-can-tru/download', app.permission.check('tcGiaoDich:export'), async (req, res) => {
        try {
            const filePath = req.query?.filePath;
            if (!filePath) {
                throw ('Thông tin không đúng');
            }

            if (!app.fs.existsSync(filePath)) {
                throw 'Không tồn tại tệp';
            }

            const buffer = app.fs.readFileSync(filePath);
            const filename = app.path.basename(filePath);
            res.send({ buffer, filename });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/invoice/info', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            const { khoanThu } = req.query;
            const listLoaiPhiHoaDon = await app.model.tcLoaiPhi.getAll({ xuatHoaDon: 1 });
            let listKhoanThuParse = app.utils.parse(khoanThu);
            let listKhoanThu = Object.keys(listKhoanThuParse).map(item => {
                return { idLoaiPhi: item, tenLoaiPhi: listKhoanThuParse[item].ten, soTien: listKhoanThuParse[item].soTien };
            });
            listKhoanThu = listKhoanThu.filter(khoanThu => listLoaiPhiHoaDon.find(item => item.id == parseInt(khoanThu.idLoaiPhi) && item.xuatHoaDon == 1));
            res.send({ listKhoanThu });
        } catch (error) {
            console.error(error);
        }
    });

    app.fs.createFolder(app.path.join(app.assetPath, 'soPhu'));

    const colName = (n) => {
        let ordA = 'a'.charCodeAt(0);
        let ordZ = 'z'.charCodeAt(0);
        let len = ordZ - ordA + 1;

        let s = '';
        while (n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s.toUpperCase();
    };

    app.get('/api/khtc/danh-sach-giao-dich/compare/result/:path', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            const info = app.utils.parse(req.query.info);
            const fileName = req.params.path;
            const workbook = await app.excel.readFile(app.path.join(app.assetPath, 'soPhu', fileName));
            const worksheet = workbook.getWorksheet(1);
            let { index = 14, tuNgay, denNgay, regularExpressionSet, nganHang, dataColumnEndAt, dataColumnStartAt, soTienColumn, contentColumn } = info;
            try {
                await app.model.dmBank.update({ ma: nganHang }, { bankConfig: app.utils.stringify({ tuNgay, denNgay, regularExpressionSet, nganHang, dataColumnEndAt, dataColumnStartAt, soTienColumn, contentColumn, index }) });
            } catch (error) {
                console.error('GET: /api/khtc/danh-sach-giao-dich/compare/result/ -- update config', error);
            }
            const workSheetData = {};
            dataColumnEndAt = parseInt(dataColumnEndAt) || 0; dataColumnStartAt = parseInt(dataColumnStartAt) || 0;
            const regexItems = await app.model.tcRegularExpressionItem.getAll({ ma: regularExpressionSet }, '*', 'id');
            const workSheetUnidentifyData = [];
            const workSheetRawData = {};
            while (true) {
                let content = worksheet.getCell(contentColumn + index).value;
                if (!content)
                    break;
                else {
                    const rowData = {};
                    rowData.index = index;
                    for (let colIndex = dataColumnStartAt; colIndex <= dataColumnEndAt; colIndex++) {
                        const columnName = colName(colIndex);
                        try {
                            rowData[columnName] = worksheet.getCell(columnName + index).value?.richText[0].text;
                        } catch {
                            rowData[columnName] = worksheet.getCell(columnName + index).value;
                        }
                    }
                    workSheetRawData[index] = rowData;
                    let soTien = worksheet.getCell(soTienColumn + index).value;
                    if (typeof content == 'object') {
                        content = `${worksheet.getCell(contentColumn + index).value?.richText[0].text}`;
                    }
                    else {
                        content = `${worksheet.getCell(contentColumn + index).value}`;
                    }
                    if (soTien && typeof soTien == 'object') {
                        soTien = Number(`${worksheet.getCell(soTienColumn + index).value.richText[0].text}`);
                        if (Number.isNaN(soTien)) {
                            soTien = Number(worksheet.getCell(soTienColumn + index).value.richText[0].text.replace(/,/g, ''));
                        }
                    }
                    else {
                        soTien = Number(worksheet.getCell(soTienColumn + index).value);
                        if (Number.isNaN(soTien)) {
                            soTien = Number(worksheet.getCell(soTienColumn + index).value?.replace(/,/g, ''));
                        }
                    }
                    let mssv;
                    for (const regexItem of regexItems) {
                        const regex = new RegExp(regexItem.regularExpression, 'g');
                        if (regex.test(content)) {
                            if (regexItem.endAt)
                                mssv = content.match(regex)[0].slice(regexItem.startAt, regexItem.endAt);
                            else
                                mssv = content.match(regex)[0].slice(regexItem.startAt);
                            break;
                        }
                    }

                    if (soTien) {
                        worksheet.getCell(colName(dataColumnEndAt + 3) + index).value = soTien;
                    }
                    if (mssv)
                        worksheet.getCell(colName(dataColumnEndAt + 2) + index).value = mssv;

                    if (!Number.isInteger(soTien) || !mssv) {
                        workSheetUnidentifyData.push(rowData);
                    }
                    else {
                        mssv = mssv.toUpperCase();
                        if (workSheetData[mssv]) {
                            workSheetData[mssv].push({ soTien, index, rowData });
                        } else {
                            workSheetData[mssv] = [{ soTien, index, rowData }];
                        }
                    }
                    // sumData += soTien;
                    index++;
                }
            }
            const { rows: systemDataRows } = await app.model.tcHocPhiTransaction.getList(app.utils.stringify({ tuNgay, denNgay, nganHang }));
            const systemData = systemDataRows.reduce((total, cur) => {
                let mssv = cur.originMssv.toUpperCase();
                if (total[mssv]) {
                    total[mssv].push(cur);
                } else {
                    total[mssv] = [cur];
                }
                return total;
            }, {});

            const systemVsSoPhu = [];
            const soPhuVsSystem = [];

            Object.keys(systemData).map(mssv => {
                const systemInfo = systemData[mssv] || [];
                const workSheetInfo = workSheetData[mssv] || [];
                if (systemInfo.length != workSheetInfo.length || !workSheetInfo) {
                    systemVsSoPhu.push({ systemInfo, workSheetInfo, mssv });
                } else {
                    const systemSum = systemInfo.reduce((total, cur) => total + cur.soTien, 0);
                    const worksheetSum = workSheetInfo.reduce((total, cur) => total + cur.soTien, 0);
                    if (systemSum != worksheetSum) {
                        systemVsSoPhu.push({ systemInfo, workSheetInfo, mssv });
                    }
                }
            });

            Object.keys(workSheetData).map(mssv => {
                const systemInfo = systemData[mssv] || [];
                const workSheetInfo = workSheetData[mssv] || [];
                if ((systemInfo.length != workSheetInfo.length) || !systemInfo) {
                    soPhuVsSystem.push({ systemInfo, workSheetInfo, mssv });
                } else {
                    const systemSum = systemInfo.reduce((total, cur) => total + cur.soTien, 0);
                    const worksheetSum = workSheetInfo.reduce((total, cur) => total + cur.soTien, 0);
                    if (systemSum != worksheetSum) {
                        soPhuVsSystem.push({ systemInfo, workSheetInfo, mssv });
                    }
                }
            });

            if (!req.query.download)
                return res.send({ soPhuVsSystem, systemVsSoPhu, systemDataRows, workSheetRawData, workSheetUnidentifyData });

            workbook.addWorksheet('Giao dịch hệ thống');
            workbook.addWorksheet('Hệ thống so với sổ phụ');
            workbook.addWorksheet('Sổ phụ so với hệ thống');
            workbook.addWorksheet('Các phí không xác định');
            let ws2 = workbook.addWorksheet('Giao dịch chi tiết');
            let ws = workbook.addWorksheet('Giao dịch cấn trừ');

            // START CAN TRU GIAO DICH
            let filter = app.utils.stringify({ tuNgay, denNgay, nganHang });
            const { rows: data, listloaiphi: listLoaiPhi } = await app.model.tcHocPhiTransaction.excelCanTru(filter);
            filter = app.utils.parse(filter);

            let mapTamThu = {};
            listLoaiPhi.forEach(item => {
                if (item.tamThu != null) {
                    mapTamThu[item.tamThu] = item.id;
                }
            });

            let mapLoaiPhi = await app.model.tcLoaiPhi.getAll();
            mapLoaiPhi = mapLoaiPhi.reduce((map, obj) => {
                map[obj.id] = {
                    ten: obj.ten,
                    namPhatSinh: obj.namPhatSinh,
                    hocKyPhatSinh: obj.hocKyPhatSinh
                };
                return map;
            }, {});

            // const ws2 = workBook.addWorksheet('Thống kê theo NH-HK');
            ws2.columns = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên', key: 'hoVaTen', width: 40 },
                { header: 'Hệ đào tạo', key: 'heDaoTao', width: 30 },
                { header: 'Khoa', key: 'tenKhoa', width: 40 },
                { header: 'Khóa sinh viên', key: 'khoaSinhVien', width: 40 },
                { header: 'Số tiền giao dịch', key: 'soTien', width: 20 },
                { header: 'Nội dung', key: 'noiDung', width: 60 },
                { header: 'Năm phát sinh', key: 'namPhatSinh', width: 20 },
                { header: 'Học kỳ phát sinh', key: 'hocKyPhatSinh', width: 20 },
                { header: 'Ngày giao dịch', key: 'ngayGiaoDich', width: 20 },
                { header: 'Ngân hàng', key: 'nganHang', width: 40 },
            ];
            ws2.getRow(1).alignment = { ...ws2.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws2.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            const listLoaiPhiZero = () => listLoaiPhi.reduce((map, obj) => {
                map[obj.id] = 0;
                return map;
            }, {});

            index = 0;
            data.forEach(item => {
                let khoanThu = app.utils.parse(item.khoanThu);
                let listDongTien = listLoaiPhiZero();

                for (let ele in khoanThu) {
                    listDongTien[ele] = khoanThu[ele].soTien;
                }

                for (let ele in listDongTien) {
                    if (mapTamThu[ele]) {
                        listDongTien[mapTamThu[ele]] += listDongTien[ele];
                        listDongTien[ele] = 0;
                    }
                }

                if ((!filter.tuNgay && !filter.denNgay) || (!isNaN(item.ngayGiaoDich) && (!filter.tuNgay || parseInt(item.ngayGiaoDich) >= parseInt(filter.tuNgay)) && (!filter.denNgay || parseInt(item.ngayGiaoDich) <= parseInt(filter.denNgay)))) {
                    for (let ele in listDongTien) {
                        let namPhatSinh = mapLoaiPhi[ele]?.namPhatSinh || '';
                        let hocKyPhatSinh = mapLoaiPhi[ele]?.hocKyPhatSinh || '';
                        const rows = {
                            stt: index + 1,
                            mssv: item.mssv,
                            hoVaTen: item.hoVaTen,
                            heDaoTao: item.heDaoTao,
                            tenKhoa: item.tenKhoa,
                            khoaSinhVien: item.khoaSinhVien,
                            soTien: listDongTien[ele],
                            nganHang: item.nganHang,
                            noiDung: mapLoaiPhi[ele]?.ten || '',
                            ngayGiaoDich: item.ngayGiaoDich ? app.date.viDateFormat(new Date(Number(item.ngayGiaoDich))) : '',
                            namPhatSinh: namPhatSinh ? `${parseInt(namPhatSinh)}-${parseInt(namPhatSinh) + 1}` : '',
                            hocKyPhatSinh: hocKyPhatSinh ? `HK${hocKyPhatSinh}` : '',
                        };

                        if (rows.soTien > 0) {
                            ws2.addRow(rows);
                            ws2.getRow(index + 2).alignment = { ...ws2.getRow(1).alignment, vertical: 'middle', wrapText: true };
                            ws2.getRow(index + 2).font = { name: 'Times New Roman' };
                            index += 1;
                        }
                    }
                }
            });

            // const ws = workBook.addWorksheet('Thống kê cấn trừ giao dịch');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên', key: 'hoVaTen', width: 40 },
                { header: 'Hệ đào tạo', key: 'heDaoTao', width: 30 },
                { header: 'Khoa', key: 'tenKhoa', width: 40 },
                { header: 'Khóa sinh viên', key: 'khoaSinhVien', width: 40 },
                { header: 'Ký hiệu', key: 'invoiceSerial', width: 40 },
                { header: 'Số chứng từ', key: 'invoiceNumber', width: 40 },
                { header: 'Số tiền giao dịch', key: 'soTien', width: 20 },
                ...listLoaiPhi.map(item => Object({ header: item.ten, key: item.id, width: 20 })),
                { header: 'Ngày giao dịch', key: 'ngayGiaoDich', width: 20 },
                { header: 'Ngân hàng', key: 'nganHang', width: 40 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            index = 0;

            data.forEach(item => {
                let khoanThu = app.utils.parse(item.khoanThu);
                let listDongTien = listLoaiPhiZero();

                for (let ele in khoanThu) {
                    listDongTien[ele] = khoanThu[ele].soTien;
                }

                for (let ele in listDongTien) {
                    if (mapTamThu[ele]) {
                        listDongTien[mapTamThu[ele]] += listDongTien[ele];
                        listDongTien[ele] = 0;
                    }
                }

                if ((!filter.tuNgay && !filter.denNgay) || (!isNaN(item.ngayGiaoDich) && (!filter.tuNgay || parseInt(item.ngayGiaoDich) >= parseInt(filter.tuNgay)) && (!filter.denNgay || parseInt(item.ngayGiaoDich) <= parseInt(filter.denNgay)))) {
                    const rows = {
                        stt: index + 1,
                        mssv: item.mssv,
                        hoVaTen: item.hoVaTen,
                        heDaoTao: item.heDaoTao,
                        tenKhoa: item.tenKhoa,
                        khoaSinhVien: item.khoaSinhVien,
                        invoiceSerial: item.invoiceSerial || '',
                        invoiceNumber: item.invoiceNumber,
                        // soTien: item.soTien?.toString().numberDisplay(),
                        soTien: item.soTien,
                        nganHang: item.nganHang,
                        ngayGiaoDich: item.ngayGiaoDich ? app.date.viDateFormat(new Date(Number(item.ngayGiaoDich))) : '',
                        ...listDongTien
                    };

                    ws.addRow(rows);
                    ws.getRow(index + 2).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                    ws.getRow(index + 2).font = { name: 'Times New Roman' };

                    index += 1;
                }
            });
            Object.keys(mapTamThu).forEach(item => {
                ws.getColumnKey(item) && ws.spliceColumns(ws.getColumnKey(item).number, 1);
            });
            //END CAN TRU
            let startAt = 1;
            let giaoDichWorkSheet = workbook.getWorksheet(2);
            giaoDichWorkSheet.getCell('A1').value = 'MSSV';
            giaoDichWorkSheet.getCell('B1').value = 'Số tiền';
            giaoDichWorkSheet.getCell('C1').value = 'Năm học';
            giaoDichWorkSheet.getCell('D1').value = 'Học kì';
            giaoDichWorkSheet.getCell('E1').value = 'Thời gian';
            giaoDichWorkSheet.getCell('F1').value = 'Họ và Tên';
            giaoDichWorkSheet.getCell('G1').value = 'Khoa';
            giaoDichWorkSheet.getCell('H1').value = 'Hệ';
            giaoDichWorkSheet.getCell('J1').value = 'Khoản Thu';
            giaoDichWorkSheet.getCell('K1').value = 'Số tiền';

            systemDataRows.forEach((item) => {
                let row = ++startAt;
                Object.keys(item).filter(key => !['ngayGiaoDich', 'mssv', 'serviceId', 'transId', 'billId', 'checkSum', 'R', 'ghiChu', 'invoiceID', 'khoanThu', 'bank', 'khoaSinhVien'].includes(key)).forEach((key, index) => {
                    giaoDichWorkSheet.getCell(String.fromCharCode(65 + index) + row).value = item[key];
                });
                const khoanDong = app.utils.parse(item.khoanThu);
                const length = Object.keys(khoanDong).length;
                Object.values(khoanDong).forEach((khoan, index) => {
                    giaoDichWorkSheet.getCell('J' + (row + index)).value = khoan.ten;
                    giaoDichWorkSheet.getCell('K' + (row + index)).value = khoan.soTien;
                });
                startAt += length - 1;
            });

            startAt = 2;
            let systemWorksheet = workbook.getWorksheet(3);
            systemWorksheet.getCell('A1').value = 'MSSV';
            systemWorksheet.getCell('B1').value = 'Số tiền trong hệ thống';
            systemWorksheet.getCell('C1').value = 'Số tiền trong sổ phụ';
            systemWorksheet.getCell('D1').value = 'Số thứ tự dòng trong sổ phụ';
            for (let item of systemVsSoPhu) {
                let { systemInfo, workSheetInfo, mssv } = item;
                // const mssv = systemInfo[0]?.mssv || workSheetInfo[0];
                systemWorksheet.getCell('A' + (startAt)).value = mssv;
                systemInfo = systemInfo.sort((a, b) => a.soTien - b.soTien);
                workSheetInfo = workSheetInfo.sort((a, b) => a.soTien - b.soTien);
                let maxRows = Math.max(systemInfo.length, workSheetInfo.length);
                for (let i = 0; i < maxRows; i++) {
                    if (systemInfo[i]) {
                        systemWorksheet.getCell('B' + (startAt)).value = systemInfo[i].soTien;
                    }
                    if (workSheetInfo[i]) {
                        systemWorksheet.getCell('C' + (startAt)).value = workSheetInfo[i].soTien;
                        systemWorksheet.getCell('D' + (startAt)).value = workSheetInfo[i].index;
                    }
                    startAt++;

                }
            }
            let soPhuWorkSheet = workbook.getWorksheet(4);
            startAt = 2;
            soPhuWorkSheet.getCell('A1').value = 'MSSV';
            soPhuWorkSheet.getCell('B1').value = 'Số tiền trong hệ thống';
            soPhuWorkSheet.getCell('C1').value = 'Số tiền trong sổ phụ';
            soPhuWorkSheet.getCell('D1').value = 'Số thứ tự dòng trong sổ phụ';
            for (let item of soPhuVsSystem) {
                let { systemInfo, workSheetInfo, mssv } = item;
                // const mssv = systemInfo[0]?.mssv || workSheetInfo[0];
                soPhuWorkSheet.getCell('A' + (startAt)).value = mssv;
                systemInfo = systemInfo.sort((a, b) => a.soTien - b.soTien);
                workSheetInfo = workSheetInfo.sort((a, b) => a.soTien - b.soTien);
                let maxRows = Math.max(systemInfo.length, workSheetInfo.length);
                for (let i = 0; i < maxRows; i++) {
                    if (systemInfo[i]) {
                        soPhuWorkSheet.getCell('B' + (startAt)).value = systemInfo[i].soTien;
                    }
                    if (workSheetInfo[i]) {
                        soPhuWorkSheet.getCell('C' + (startAt)).value = workSheetInfo[i].soTien;
                        soPhuWorkSheet.getCell('D' + (startAt)).value = workSheetInfo[i].index;
                    }
                    startAt++;

                }
            }
            let otherWorksheet = workbook.getWorksheet(5);
            startAt = 2;
            for (let rowData of workSheetUnidentifyData) {
                for (let colIndex = dataColumnStartAt; colIndex <= dataColumnEndAt; colIndex++) {
                    const columnName = colName(colIndex);
                    otherWorksheet.getCell(columnName + startAt).value = rowData[columnName];
                }
                startAt++;
            }
            app.excel.attachment(workbook, res, fileName);
        } catch (error) {
            console.error(error);
            res.status(400).send({ error });
        }
    });

    app.get('/api/khtc/giao-dich/download-template', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Transaction_Template');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Số tiền giao dịch (VNĐ)', key: 'soTienGiaoDich', width: 30 },
                { header: 'Phương thức thanh toán', key: 'pttt', width: 30 },
                { header: 'Thời gian sổ phụ', key: 'thoiGianSoPhu', width: 30 },
                { header: 'Ghi chú', key: 'ghiChu', width: 50 }
            ];
            ws.addRow({ mssv: '1912811', soTienGiaoDich: 1980000, pttt: '91040', thoiGianSoPhu: '6/5/2023', ghiChu: 'Ví dụ ghi chú' });

            const wsPhuongThucThanhToan = workBook.addWorksheet('Danh mục phương thức thanh toán');
            wsPhuongThucThanhToan.columns = [
                { header: 'Mã', key: 'ma', width: 15 },
                { header: 'Ngân hàng', key: 'bank', width: 30 },
            ];
            const dsPhuognThucThanhToan = await app.model.dmPhuongThucThanhToan.getAll({ kichHoat: 1 });
            dsPhuognThucThanhToan.forEach(item => wsPhuongThucThanhToan.addRow(item));
            app.excel.attachment(workBook, res, 'UploadDsGiaoDich_template.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

};
