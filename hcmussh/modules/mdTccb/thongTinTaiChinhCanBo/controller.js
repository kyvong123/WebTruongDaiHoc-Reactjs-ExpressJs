module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            5902: { title: 'Thông tin tài chính cán bộ', link: '/user/tccb/thong-tin-tai-chinh', icon: 'fa-dollar', backgroundColor: '#fecc2c', pin: true },
        },
    };

    app.permission.add(
        { name: 'tccbThongTinTaiChinhCanBo:read', menu },
        { name: 'tccbThongTinTaiChinhCanBo:export' }
    );

    app.get('/user/tccb/thong-tin-tai-chinh', app.permission.check('tccbThongTinTaiChinhCanBo:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleDanhSachThongTinTaiChinhCanBo', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tccbThongTinTaiChinhCanBo:read', 'tccbThongTinTaiChinhCanBo:export');
            resolve();
        } else resolve();
    }));


    app.get('/api/tccb/thong-tin-tai-chinh/download-excel', app.permission.check('tccbThongTinTaiChinhCanBo:export'), async (req, res) => {
        try {
            const filter = req.query.filter || '';
            const searchText = req.query.searchText || '';
            // const filterSort = req.query;
            let sortTerm = 'hoTen_ASC';
            if (req.query?.sortTerm) sortTerm = req.query.sortTerm;
            const { rows: list } = await app.model.tchcCanBo.thongTinTaiChinhDownloadExcel(app.utils.stringify(filter), searchText, sortTerm.split('_')[0], sortTerm.split('_')[1]);

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thông tin tài chính cán bộ');

            ws.columns = [
                { header: 'STT', key: 'stt' },
                { header: 'Họ và tên lót', key: 'ho', width: 25 },
                { header: 'Tên', key: 'ten' },
                { header: 'Mã cán bộ', key: 'shcc', width: 25 },
                { header: 'Tên đơn vị', key: 'tenDonVi', width: 43 },
                { header: 'Chức vụ', key: 'chucVu', width: 30 },
                { header: 'Ngạch', key: 'ngach', width: 25 },
                { header: 'Tên ngạch', key: 'tenNgach', width: 25 },
                { header: 'Ngày hưởng lương', key: 'ngayHuongLuong', width: 25 },
                { header: 'Hệ số lương', key: 'heSoLuong' },
                { header: 'Bậc lương', key: 'bacLuong' },
                { header: 'Ngày bắt đầu lương', key: 'batDauLuong', width: 25 },
                { header: 'Ngày kết thúc lương', key: 'ketThucLuong', width: 25 },
                { header: 'Phần trăm hưởng lương', key: 'phanTramHuong', width: 120 },
                { header: 'Phương thức trả lương', key: 'phuongThucTraLuong', width: 60 },
                { header: 'Mốc nâng lương', key: 'mocNangLuong', width: 25 },
                { header: 'Mốc bậc lương cuối cùng', key: 'mocBacLuongCuoiCung', width: 25 },
                { header: 'Tỷ lệ vượt khung', key: 'tyLeVuotKhung', width: 25 },
                { header: 'Tỷ lệ phụ cấp thâm niên', key: 'tyLePhuCapThamNien' },
                { header: 'Tỷ lệ phụ cấp ưu đãi', key: 'tyLePhuCapUuDai' },
                { header: 'Phụ cấp', key: 'phuCap' },
                { header: 'Phúc lợi', key: 'phucLoi' },
                { header: 'Số BHXH', key: 'soBHXH', width: 25 },
                { header: 'Ngày bắt đầu BHXH', key: 'batDauBHXH', width: 25 },
                { header: 'Ngày kết thúc BHXH', key: 'ketThucBHXH', width: 25 },
            ];
            list.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    ho: item.ho,
                    ten: item.ten,
                    shcc: item.shcc,
                    tenDonVi: item.tenDonVi,
                    chucVu: item.chucVu,
                    ngach: item.ngach,
                    tenNgach: item.tenNgach,
                    ngayHuongLuong: item.ngayHuongLuong ? app.date.dateTimeFormat(new Date(item.ngayHuongLuong), 'dd/mm/yyyy') : '',
                    heSoLuong: item.heSoLuong ? parseFloat(Number(item.heSoLuong).toFixed(2)) : '',
                    bacLuong: item.bacLuong ? parseFloat(Number(item.bacLuong).toFixed(2)) : '',
                    batDauLuong: item.batDauLuong ? app.date.dateTimeFormat(new Date(item.batDauLuong), 'dd/mm/yyyy') : '',
                    ngayketThucLuong: item.ngayketThucLuong ? app.date.dateTimeFormat(new Date(item.ketThucLuong), 'dd/mm/yyyy') : '',
                    phanTramHuong: item.phanTramHuong,
                    phuongThucTraLuong: item.phuongThucTraLuong,
                    mocNangLuong: item.mocNangLuong ? app.date.dateTimeFormat(new Date(item.mocNangLuong), 'dd/mm/yyyy') : '',
                    mocBacLuongCuoiCung: item.mocBacLuongCuoiCung ? app.date.dateTimeFormat(new Date(item.mocBacLuongCuoiCung), 'dd/mm/yyyy') : '',
                    tyLeVuotKhung: item.tyLeVuotKhung ? parseFloat(Number(item.tyLeVuotKhung).toFixed(2)) : '',
                    phuCap: item.phuCap ? parseFloat(Number(item.phuCap).toFixed(2)) : '',
                    phucLoi: item.phucLoi,
                    tyLePhuCapThamNien: item.tyLePhuCapThamNien ? parseFloat(Number(item.tyLePhuCapThamNien).toFixed(2)) : '',
                    tyLePhuCapUuDai: item.tyLePhuCapUuDai ? parseFloat(Number(item.tyLePhuCapUuDai).toFixed(2)) : '',
                    soBHXH: item.soBHXH,
                    ngayBatDauBHXH: item.ngayBatDauBHXH ? app.date.dateTimeFormat(new Date(item.batDauBHXH), 'dd/mm/yyyy') : '',
                    ngayKetThucBHXH: item.ngayKetThucBHXH ? app.date.dateTimeFormat(new Date(item.ketThucBHXH), 'dd/mm/yyyy') : '',
                });
            });
            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer, filename: 'THONG_TIN_TAI_CHINH_CAN_BO.xlsx' });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // TCCB_THONG_TIN_TAI_CHINH_CAN_BO
    //---------------------------
    app.get('/api/tccb/thong-tin-tai-chinh/page/:pageNumber/:pageSize', app.permission.check('tccbThongTinTaiChinhCanBo:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const filter = app.utils.stringify(req.query.filter || {});
            const filterSort = req.query;
            let sortTerm = 'hoTen_ASC';
            if (filterSort?.sortTerm) sortTerm = filterSort?.sortTerm;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tchcCanBo.thongTinTaiChinhSearchPage(_pageNumber, _pageSize, searchTerm, filter, sortTerm.split('_')[0], sortTerm.split('_')[1]);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};