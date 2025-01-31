module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7099: {
                title: 'Thống kê đăng ký học phần', pin: true, backgroundColor: '#F9F54B', color: '#000',
                link: '/user/dao-tao/thong-ke-dkhp', icon: 'fa-window-maximize'
            },
        },
    };

    app.permission.add(
        { name: 'dtThongKeDkhp:manage', menu },
        { name: 'dtThongKeDkhp:read' },
        { name: 'dtThongKeDkhp:export' }
    );

    app.permissionHooks.add('staff', 'addRolesDtThongKeDkhp', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThongKeDkhp:manage', 'dtThongKeDkhp:read', 'dtThongKeDkhp:export');
            resolve();
        } else resolve();
    }));


    app.get('/user/dao-tao/thong-ke-dkhp', app.permission.check('dtThongKeDkhp:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/thong-ke-dkhp/page/:pageNumber/:pageSize', app.permission.check('dtThongKeDkhp:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.thongKeDkhpSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    const getFullDateTime = async (value) => {
        try {
            if (value == null || value == -1) return;
            const d = new Date(value);
            const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
            const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
            const year = d.getFullYear();
            const hours = ('0' + d.getHours()).slice(-2);
            const minutes = ('0' + d.getMinutes()).slice(-2);
            return `${date}/${month}/${year}  ${hours}:${minutes} `;
        } catch (error) {
            return error;
        }
    };

    //Export --------
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

    const getCellsDSDK = async (filter) => {
        try {
            filter = { ...filter, isCaiThien: null };
            let items = await app.model.dtLichSuDkhp.thongKeDangKyDownload(app.utils.stringify(filter));
            items = items.rows;
            let cells = [
                { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                { cell: 'B1', value: 'MSSV', bold: true, border: '1234' },
                { cell: 'C1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                { cell: 'D1', value: 'NGÀNH', bold: true, border: '1234' },
                { cell: 'E1', value: 'KHÓA SINH VIÊN', bold: true, border: '1234' },
                { cell: 'F1', value: 'MÃ HỌC PHẦN', bold: true, border: '1234' },
                { cell: 'G1', value: 'TÊN MÔN HỌC', bold: true, border: '1234' },
                { cell: 'H1', value: 'SỐ TC', bold: true, border: '1234' },
                { cell: 'I1', value: 'SỐ TIẾT', bold: true, border: '1234' },
                { cell: 'J1', value: 'HÌNH THỨC ĐĂNG KÝ', bold: true, border: '1234' },
                { cell: 'K1', value: 'NGƯỜI ĐĂNG KÝ', bold: true, border: '1234' },
                { cell: 'L1', value: 'THỜI GIAN', bold: true, border: '1234' },
                { cell: 'M1', value: 'GHI CHÚ', bold: true, border: '1234' },
            ];

            for (let [index, item] of items.entries()) {
                let time = await getFullDateTime(item.timeModified);
                cells.push({ cell: 'A' + (index + 2), border: '1234', value: index + 1 });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.mssv });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.hoTen });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenNganh });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.khoaSinhVien });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.maHocPhan });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.soTinChi });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.soTiet });
                cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.maLoaiDky });
                cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.modifier });
                cells.push({ cell: 'L' + (index + 2), border: '1234', value: time });
                cells.push({ cell: 'M' + (index + 2), border: '1234' });
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
            let cells = [
                { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                { cell: 'B1', value: 'MSSV', bold: true, border: '1234' },
                { cell: 'C1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                { cell: 'D1', value: 'NGÀNH', bold: true, border: '1234' },
                { cell: 'E1', value: 'KHÓA SINH VIÊN', bold: true, border: '1234' },
            ];

            if (value) {
                cells.push({ cell: 'F1', value: 'TỔNG SỐ MÔN HỌC', bold: true, border: '1234' });
                cells.push({ cell: 'G1', value: 'TỔNG STC', bold: true, border: '1234' });
                cells.push({ cell: 'H1', value: 'TỔNG SỐ TIẾT', bold: true, border: '1234' });
                cells.push({ cell: 'I1', value: 'GHI CHÚ', bold: true, border: '1234' });
            } else cells.push({ cell: 'F1', value: 'GHI CHÚ', bold: true, border: '1234' });

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

    app.get('/api/dt/thong-ke-dkhp/tong-quan/download', app.permission.check('dtThongKeDkhp:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = await app.excel.readFile(app.path.join(__dirname, './resource/Thong_ke_dang_ky_hoc_phan_Template.xlsx')),
                workTKĐKTC = workBook.getWorksheet('TK ĐKTC'),
                workDSDKTC = workBook.getWorksheet('DS ĐKTC'),
                workDSDKMH = workBook.getWorksheet('DS ĐKMH'),
                workDSK = workBook.getWorksheet('DSSV không ĐKTC');

            let [
                cellsTKĐKTC, cellsDSDKTC, cellsDSDKMH, cellsDSK
            ] = await Promise.all([
                getCellsDKTC(filter),
                getCellsDSDK(filter), getCellsDSDKMH(filter, 1),
                getCellsDSDKMH(filter, 0)
            ]);

            if (cellsTKĐKTC.length) app.excel.write(workTKĐKTC, cellsTKĐKTC);
            if (cellsDSDKTC.length) app.excel.write(workDSDKTC, cellsDSDKTC);
            if (cellsDSDKMH.length) app.excel.write(workDSDKMH, cellsDSDKMH);
            if (cellsDSK.length) app.excel.write(workDSK, cellsDSK);

            workTKĐKTC.getRow(5).font = { name: 'Times New Roman', family: 4, size: 13, bold: true, };
            workTKĐKTC.getRow(8).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            workDSDKTC.getRow(1).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };
            workDSDKMH.getRow(1).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };
            workDSK.getRow(1).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-dkhp/ds-dang-ky-tin-chi/download', app.permission.check('dtThongKeDkhp:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = app.excel.create(),
                workSheet = workBook.addWorksheet('DS ĐKTC');

            let cells = await getCellsDSDK(filter);
            if (cells.length) app.excel.write(workSheet, cells);
            workSheet.getRow(1).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-dkhp/ds-dang-ky-mon-hoc/download', app.permission.check('dtThongKeDkhp:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = app.excel.create(),
                workSheet = workBook.addWorksheet('DS ĐKMH');

            let cells = await getCellsDSDKMH(filter, 1);
            if (cells.length) app.excel.write(workSheet, cells);
            workSheet.getRow(1).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-dkhp/ds-khong-dang-ky/download', app.permission.check('dtThongKeDkhp:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = app.excel.create(),
                workSheet = workBook.addWorksheet('DSSV_khong_ĐKTC');

            let cells = await getCellsDSDKMH(filter, 0);
            if (cells.length) app.excel.write(workSheet, cells);
            workSheet.getRow(1).font = { name: 'Times New Roman', family: 4, size: 12, bold: true, };

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });
};
