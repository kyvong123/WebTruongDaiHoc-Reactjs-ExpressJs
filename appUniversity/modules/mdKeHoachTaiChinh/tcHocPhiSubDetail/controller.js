module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5016: { title: 'Quản lý học phí theo môn học', link: '/user/finance/hoc-phi-theo-mon', icon: 'fa fa-calculator', groupIndex: 1, backgroundColor: '#B52B79' } },
    };

    app.permission.add(
        { name: 'tcHocPhiTheoMon:manage', menu },
        { name: 'tcHocPhiTheoMon:write' },
        { name: 'tcHocPhiTheoMon:delete' },
        { name: 'tcHocPhiTheoMon:export' },
    );

    app.permissionHooks.add('staff', 'addRolesTcHocPhiTheoMon', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcHocPhiTheoMon:manage', 'tcHocPhiTheoMon:write', 'tcHocPhiTheoMon:delete', 'tcHocPhiTheoMon:export');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/hoc-phi-theo-mon', app.permission.check('tcHocPhiTheoMon:manage'), app.templates.admin);

    // APIs

    app.get('/api/khtc/hoc-phi-theo-mon/page/:pageNumber/:pageSize', app.permission.check('tcHocPhiTheoMon:manage'), async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm || '';
            let filter = req.query.filter || {};
            const { namHocSetting, hocKySetting } = await app.model.tcSetting.getSettingNamHocHocKy();
            if (!filter?.namHoc) {
                filter.namHoc = namHocSetting;
                filter.hocKy = hocKySetting;
                filter.typePage = 0;
            }

            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                pageCondition = searchTerm;

            const page = await app.model.tcHocPhiSubDetail.searchPage(parseInt(_pageNumber), parseInt(_pageSize), searchTerm, app.utils.stringify(filter, ''));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, totalcurrent: totalCurrent, totalpaid: totalPaid,
                totalmiengiam: totalMienGiam, totalsinhvien: totalSinhVien, totalconlai: totalConLai, totaldadong: totalDaDong, thoigianthanhtoan: thoiGianThanhToan, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, total: { totalCurrent, totalPaid, totalMienGiam, totalSinhVien, totalConLai, totalDaDong, thoiGianThanhToan }, list, filter } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/hoc-phi-theo-mon/thoi-gian-thanh-toan-giang-vien/length', app.permission.check('tcHocPhiTheoMon:export'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            if (!filter) {
                throw ('Dữ liệu gặp sự cố, vui lòng thử lại sau');
            }
            const { rows: data } = await app.model.tcHocPhiSubDetail.downloadExcel(filter);

            res.send({ length: data.length });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoc-phi-theo-mon/thoi-gian-thanh-toan-giang-vien', app.permission.check('tcHocPhiTheoMon:export'), async (req, res) => {
        try {
            let { filter, data } = req.body;
            if (!filter) {
                throw ('Dữ liệu gặp sự cố, vui lòng thử lại sau!');
            }

            const { rows: result } = await app.model.tcHocPhiSubDetail.downloadExcel(filter);
            const ngayTao = data?.ngayThanhToan || '';

            // if (!ngayTao) {
            //     throw ('Dữ liệu gặp sự cố, vui lòng thử lại!');
            // }

            await Promise.all(result.map(item => {
                return app.model.tcHocPhiSubDetail.update({ id: item.subDetailId }, { thoiGianThanhToanGiangVien: ngayTao });
            }));

            res.send({ length: result.length });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/hoc-phi-theo-mon/download-excel', app.permission.check('tcHocPhiTheoMon:export'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            if (!filter) {
                throw ('Dữ liệu gặp sự cố, vui lòng thử lại sau');
            }
            // const searchTerm = `%${req.query.searchTerm || ''}%`;

            const { rows: data, listgroup: listGroup } = await app.model.tcHocPhiSubDetail.downloadExcel(filter);
            const workBook = app.excel.create();
            let fileName = `Thong_ke_theo_mon_hoc_${Date.now()}.xlsx`;

            const ws1 = workBook.addWorksheet('Theo sinh viên');
            let listHeader1 = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'Năm học', key: 'namHoc', width: 10 },
                { header: 'Học kỳ', key: 'hocKy', width: 10 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên', key: 'hoVaTen', width: 45 },
                { header: 'Bậc đào tạo', key: 'bacDaoTaoSv', width: 20 },
                { header: 'Hệ đào tạo', key: 'heDaoTaoSv', width: 20 },
                { header: 'Khoa', key: 'khoa', width: 20 },
                { header: 'Ngành đào tạo', key: 'nganh', width: 20 },
                { header: 'Khóa SV', key: 'khoaSinhVienSv', width: 20 },
                { header: 'Lớp', key: 'lop', width: 15 },
                { header: 'Mã học phần', key: 'maHocPhan', width: 30 },
                { header: 'Mã môn học', key: 'maMonHoc', width: 30 },
                { header: 'Tên môn học', key: 'tenMonHoc', width: 45 },
                { header: 'Đơn vị quản lý', key: 'donViQuanLy', width: 30 },
                { header: 'Cơ sở', key: 'coSo', width: 30 },
                { header: 'Số tiền', key: 'soTien', width: 20 },
                { header: 'Miễn giảm', key: 'soTienMienGiam', width: 20 },
                { header: 'Đã đóng', key: 'soTienDaDong', width: 20 },
                { header: 'Còn lại', key: 'soTienConLai', width: 20 },
                { header: 'Thời gian thanh toán giảng viên', key: 'thanhToanGiangVien', width: 30 }
            ];
            ws1.columns = listHeader1;
            ws1.getRow(1).alignment = { ...ws1.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws1.getRow(1).font = {
                name: 'Times New Roman',
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            data.forEach((item, index) => {
                ws1.addRow({
                    stt: index + 1,
                    ...item,
                    namHoc: `${item.namHoc} - ${item.namHoc + 1}`,
                    hocKy: `HK${item.hocKy}`,
                    tenMonHoc: app.utils.parse(item.tenMonHoc)?.vi || '',
                    coSo: app.utils.parse(item.coSo)?.vi || '',
                    thoiGianThanhToanGiangVien: item.thoiGianThanhToanGiangVien ? app.date.viDateFormat(new Date(Number(item.thoiGianThanhToanGiangVien))) : ''
                });
                ws1.getRow(index + 2).font = { name: 'Times New Roman' };
            });

            const ws2 = workBook.addWorksheet('Theo học phần');
            let listHeader = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'Năm học', key: 'namHoc', width: 20 },
                { header: 'Học kỳ', key: 'hocKy', width: 10 },
                { header: 'Bậc đào tạo', key: 'bacDaoTaoHocPhan', width: 20 },
                { header: 'Hệ đào tạo', key: 'heDaoTaoHocPhan', width: 20 },
                { header: 'Đơn vị quản lý', key: 'donViQuanLy', width: 30 },
                { header: 'Cơ sở', key: 'coSo', width: 30 },
                { header: 'Khóa SV', key: 'khoaSinhVienHocPhan', width: 20 },
                { header: 'Mã học phần', key: 'maHocPhan', width: 30 },
                { header: 'Mã môn học', key: 'maMonHoc', width: 30 },
                { header: 'Tên môn học', key: 'tenMonHoc', width: 45 },
                { header: 'Tổng SV đăng ký', key: 'tongSvDangKy', width: 25 },
                { header: 'Tổng SV đã đóng', key: 'tongSvDaDong', width: 25 },
                { header: 'Số tiền', key: 'soTien', width: 20 },
                { header: 'Miễn giảm', key: 'soTienMienGiam', width: 20 },
                { header: 'Đã đóng', key: 'soTienDaDong', width: 20 },
                { header: 'Còn lại', key: 'soTienConLai', width: 20 },
            ];
            ws2.columns = listHeader;
            ws2.getRow(1).alignment = { ...ws2.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws2.getRow(1).font = {
                name: 'Times New Roman',
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            listGroup.forEach((item, index) => {
                ws2.addRow({
                    stt: index + 1,
                    ...item,
                    namHoc: `${item.namHoc} - ${item.namHoc + 1}`,
                    hocKy: `HK${item.hocKy}`,
                    tenMonHoc: app.utils.parse(item.tenMonHoc)?.vi || '',
                    coSo: app.utils.parse(item.coSo)?.vi || '',
                    thoiGianThanhToanGiangVien: item.thoiGianThanhToanGiangVien ? app.date.viDateFormat(new Date(Number(item.thoiGianThanhToanGiangVien))) : ''
                });
                ws2.getRow(index + 2).font = { name: 'Times New Roman' };
            });

            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.get('/api/khtc/hoc-phi-theo-mon/hoc-phan', app.permission.check('tcHocPhiTheoMon:manage'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let page = await app.model.dtThoiKhoaBieu.searchPage(1, 50, filter, searchTerm);
            const { rows: list } = page;
            res.send({ page: { list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};