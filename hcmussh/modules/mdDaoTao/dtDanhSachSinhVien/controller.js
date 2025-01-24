module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7107: { title: 'Thống kê sinh viên', link: '/user/dao-tao/manage-student', icon: 'fa-users', backgroundColor: '#eb9834', groupIndex: 1 }
        }
    };

    app.permission.add(
        { name: 'dtDanhSachSinhVien:manage', menu },
    );

    app.get('/user/dao-tao/manage-student', app.permission.check('dtDanhSachSinhVien:manage'), app.templates.admin);

    // APIS ===============================================================
    app.get('/api/dt/manage-student/page/:pageNumber/:pageSize', app.permission.orCheck('dtDanhSachSinhVien:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query,
                user = req.session.user;
            const searchTerm = typeof condition === 'string' ? condition : '';

            await app.model.dtAssignRole.getDataRole('dtDanhSachSinhVien', user, filter);
            let page = await app.model.dtDangKyHocPhan.fwStudentSearchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/manage-student/export-danh-sach', app.permission.check('dtDanhSachSinhVien:manage'), async (req, res) => {
        try {
            let { filter = {}, sortTerm = 'mssv_DESC' } = req.query;
            filter = app.utils.parse(filter);
            await app.model.dtAssignRole.getDataRole('dtDanhSachSinhVien', req.session.user, filter);
            filter.isNhapHoc = 1;
            filter.isAll = 1;
            let { rows } = await app.model.dtDangKyHocPhan.fwStudentSearchPage(1, 50, '', app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DanhSachSinhVien');

            const defaultColumns = [
                { header: 'MSSV', key: 'mssv', width: 20 },
                { header: 'HỌ VÀ TÊN LÓT', key: 'ho', width: 20 },
                { header: 'TÊN', key: 'ten', width: 20 },
                { header: 'GIỚI TÍNH', key: 'gioiTinh', width: 25 },
                { header: 'NGÀY SINH', key: 'ngaySinh', width: 25 },
                { header: 'NƠI SINH', key: 'noiSinh', width: 25 },
                { header: 'LỚP', key: 'lop', width: 25 },
                { header: 'CTDT', key: 'ctdt', width: 25 },
                { header: 'KHOA', key: 'khoa', width: 25 },
                { header: 'MÃ NGÀNH', key: 'maNganh', width: 25 },
                { header: 'TÊN NGÀNH', key: 'tenNganh', width: 25 },
                { header: 'NĂM TUYỂN SINH', key: 'namTuyenSinh', width: 25 },
                { header: 'KHÓA SINH VIÊN', key: 'khoaSinhVien', width: 25 },
                { header: 'LHDT', key: 'loaiHinhDaoTao', width: 25 },
                { header: 'DÂN TỘC', key: 'danToc', width: 25 },
                { header: 'TÔN GIÁO', key: 'tonGiao', width: 25 },
                { header: 'QUỐC TỊCH', key: 'quocTich', width: 25 },
                { header: 'THƯỜNG TRÚ', key: 'thuongTru', width: 25 },
                { header: 'TẠM TRÚ', key: 'tamTru', width: 25 },
                { header: 'ĐIA CHỈ LIÊN LẠC', key: 'diaChi', width: 25 },
                { header: 'NGÀY NHẬP HỌC', key: 'ngayNhapHoc', width: 25 },
                { header: 'ĐỐI TƯỢNG TUYỂN SINH', key: 'doiTuongTuyenSinh', width: 25 },
                { header: 'KHU VỰC TUYỂN SINH', key: 'khuVucTuyenSinh', width: 25 },
                { header: 'PHƯƠNG THỨC TUYỂN SINH', key: 'phuongThucTuyenSinh', width: 25 },
                { header: 'ĐIỂM THI', key: 'diemThi', width: 25 },
                { header: 'TÌNH TRẠNG SINH VIÊN', key: 'tinhTrangSinhVien', width: 25 },
            ];

            ws.columns = defaultColumns;

            rows.forEach((item, index) => {
                let rowData = {
                    mssv: item.mssv,
                    ho: item.ho,
                    ten: item.ten,
                    gioiTinh: item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : '',
                    ngaySinh: app.date.viDateFormat(new Date(item.ngaySinh), 'dd/mm/yyyy'),
                    noiSinh: item.noiSinhQuocGia ? (item.noiSinhQuocGia + (item.noiSinh ? `, ${item.noiSinh}` : '')) : '',
                    lop: item.lop || '',
                    ctdt: item.maCtdt || '',
                    maNganh: item.maNganh || '',
                    tenNganh: item.tenNganh || '',
                    loaiHinhDaoTao: item.loaiHinhDaoTao || '',
                    khoa: item.tenKhoa || '',
                    khoaSinhVien: item.khoaSinhVien || '',
                    namTuyenSinh: item.namTuyenSinh || '',
                    danToc: item.danToc || '',
                    tonGiao: item.tonGiao || '',
                    quocTich: item.quocTich || '',
                    thuongTru: (item.soNhaThuongTru ? item.soNhaThuongTru + ', ' : '')
                        + (item.xaThuongTru ? item.xaThuongTru + ', ' : '')
                        + (item.huyenThuongTru ? item.huyenThuongTru + ', ' : '')
                        + (item.tinhThuongTru ? item.tinhThuongTru : ''),
                    tamTru: (item.soNhaTamTru ? item.soNhaTamTru + ', ' : '')
                        + (item.xaTamTru ? item.xaTamTru + ', ' : '')
                        + (item.huyenTamTru ? item.huyenTamTru + ', ' : '')
                        + (item.tinhTamTru ? item.tinhTamTru : ''),
                    diaChi: (item.soNhaLienLac ? item.soNhaLienLac + ', ' : '')
                        + (item.xaLienLac ? item.xaLienLac + ', ' : '')
                        + (item.huyenLienLac ? item.huyenLienLac + ', ' : '')
                        + (item.tinhLienLac ? item.tinhLienLac : ''),
                    ngayNhapHoc: item.ngayNhapHoc ? (item.ngayNhapHoc == -1 ? 'Đang chờ nhập học'
                        : (item.ngayNhapHoc.toString().length > 10 ? app.date.viDateFormat(new Date(item.ngayNhapHoc), 'dd/mm/yyyy') : '')) : '',
                    doiTuongTuyenSinh: item.doiTuongTuyenSinh || '',
                    khuVucTuyenSinh: item.khuVucTuyenSinh || '',
                    phuongThucTuyenSinh: item.phuongThucTuyenSinh || '',
                    diemThi: item.diemThi || '',
                    tinhTrangSinhVien: item.tinhTrangSinhVien || '',
                };
                ws.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'DanhSachSinhVien.xlsx';
            app.excel.attachment(workBook, res, fileName);

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};