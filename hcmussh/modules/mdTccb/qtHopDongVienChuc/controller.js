module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3008: { title: 'Hợp đồng làm việc', link: '/user/tccb/qua-trinh/hop-dong-lam-viec', icon: 'fa-id-badge', backgroundColor: '#016699', groupIndex: 2 }
        }
    };
    app.permission.add(
        { name: 'qtHopDongVienChuc:read', menu },
        { name: 'qtHopDongVienChuc:write' },
        { name: 'qtHopDongVienChuc:delete' },
        { name: 'qtHopDongVienChuc:export' }
    );
    app.get('/user/tccb/qua-trinh/hop-dong-lam-viec/:ma', app.permission.check('qtHopDongVienChuc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-lam-viec', app.permission.check('qtHopDongVienChuc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-lam-viec/group/:shcc', app.permission.check('qtHopDongVienChuc:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtHopDongVienChuc', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtHopDongVienChuc:read', 'qtHopDongVienChuc:write', 'qtHopDongVienChuc:delete', 'qtHopDongVienChuc:export');
        }
        resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/page/:pageNumber/:pageSize', app.permission.check('qtHopDongVienChuc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.utils.stringify(req.query.filter || {}) || '';
        app.model.qtHopDongVienChuc.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/group/page/:pageNumber/:pageSize', app.permission.check('qtHopDongVienChuc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHopDongVienChuc.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/groupShcc/page/:pageNumber/:pageSize', app.permission.check('qtHopDongVienChuc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtHopDongVienChuc.groupPageShcc(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/all', app.permission.check('qtHopDongVienChuc:read'), (req, res) => {
        app.model.qtHopDongVienChuc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/item/:ma', app.permission.check('qtHopDongVienChuc:read'), (req, res) => {
        app.model.qtHopDongVienChuc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/edit/item/:ma', app.permission.check('qtHopDongVienChuc:read'), async (req, res) => {
        try {
            const qtHopDongVienChuc = await app.model.qtHopDongVienChuc.get({ ma: req.params.ma });
            if (qtHopDongVienChuc) {
                const canBoDuocThue = await app.model.tchcCanBo.get({ shcc: qtHopDongVienChuc.nguoiDuocThue });
                if (canBoDuocThue) {
                    const canBo = await app.model.tchcCanBo.get({ shcc: qtHopDongVienChuc.nguoiKy }, 'shcc,ho,ten,maDonVi');
                    const chucVu = await app.model.qtChucVu.get({ shcc: canBo.shcc, chucVuChinh: 1 });
                    res.send({ item: app.clone({ qtHopDongVienChuc }, { canBoDuocThue }, { canBo, maChucVu: chucVu?.maChucVu }) });
                } else {
                    res.send({ error: 'Invalid staff' });
                }
            } else {
                res.send({ error: 'Invalid ID' });
            }
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/qua-trinh/hop-dong-lam-viec', app.permission.check('qtHopDongVienChuc:write'), (req, res) => {
        app.model.qtHopDongVienChuc.create(req.body.item, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Hợp đồng làm việc');
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/qua-trinh/hop-dong-lam-viec', app.permission.check('qtHopDongVienChuc:write'), (req, res) => {
        app.model.qtHopDongVienChuc.update({ ma: req.body.ma }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hợp đồng làm việc');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/hop-dong-lam-viec', app.permission.check('qtHopDongVienChuc:delete'), (req, res) => {
        app.model.qtHopDongVienChuc.delete({ ma: req.body.ma }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hợp đồng làm việc');
            res.send({ error });
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/download-word/:ma', app.permission.check('qtHopDongVienChuc:export'), async (req, res) => {
        try {
            if (req.params && req.params.ma) {
                let data1 = await app.model.qtHopDongVienChuc.download(req.params.ma);
                let hopDong = data1.rows[0];
                const daiDienUyQuyen = 'Đại diện cho Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Thành phố Hồ Chí Minh theo Giấy ủy quyền số 297/GUQ-XHNV-TCCB ngày 05 tháng 4 năm 2022 của Hiệu trưởng Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM về việc giao kết hợp đồng làm việc và hợp đồng lao động đối với viên chức và người lao động có trình độ từ thạc sĩ trở xuống.';
                const data = {
                    soQuyetDinh: hopDong.soQd ? hopDong.soQd : '',
                    soHopDong: hopDong.soHopDong ? hopDong.soHopDong : '',
                    ngayKyDate: (new Date(hopDong.ngayKyHopDong)).getDate(),
                    ngayKyMonth: (new Date(hopDong.ngayKyHopDong)).getMonth() + 1,
                    ngayKyYear: (new Date(hopDong.ngayKyHopDong)).getFullYear(),
                    loaiHopDong: hopDong.loaiHopDong1 ? hopDong.loaiHopDong1 : '',
                    phaiNK: hopDong.phaiNK ? hopDong.phaiNK : '',
                    daiDienKy: (hopDong.hoNguoiKy + ' ' + hopDong.tenNguoiKy).normalizedName(),
                    daiDienUyQuyen: hopDong.maChucVuNguoiKy == '003' ? daiDienUyQuyen : '',
                    chucVuDaiDienKy: hopDong.chucVuNguoiKy,
                    phai: hopDong.phai ? hopDong.phai : '',
                    hoTenCanBo: ((hopDong.ho ? hopDong.ho : '') + ' ' + (hopDong.ten ? hopDong.ten : '')).normalizedName(),
                    ngaySinh: hopDong.ngaySinh ? app.date.viDateFormat(new Date(hopDong.ngaySinh)) : '',
                    noiSinh: hopDong.noiSinh ? hopDong.noiSinh : '',
                    nguyenQuan: hopDong.nguyenQuan ? hopDong.nguyenQuan : '',
                    danToc: hopDong.danToc ? hopDong.danToc : '',
                    tonGiao: hopDong.tonGiao ? hopDong.tonGiao : '',
                    hocVi: hopDong.trinhDoHocVan ? hopDong.trinhDoHocVan : '',
                    chuyenNganh: hopDong.hocVanChuyenNganh ? hopDong.hocVanChuyenNganh : '',
                    namTotNghiep: hopDong.namTotNghiep ? hopDong.namTotNghiep : '',
                    ngheNghiepCu: hopDong.ngheNghiepCu ? hopDong.ngheNghiepCu : '',
                    hienTai: (hopDong.soNhaCuTru ? hopDong.soNhaCuTru + ', ' : '')
                        + (hopDong.xaCuTru ? hopDong.xaCuTru + ', ' : '')
                        + (hopDong.huyenCuTru ? hopDong.huyenCuTru + ', ' : '')
                        + (hopDong.tinhCuTru ? hopDong.tinhCuTru : ''),
                    thuongTru: (hopDong.soNhaThuongTru ? hopDong.soNhaThuongTru + ', ' : '')
                        + (hopDong.xaThuongTru ? hopDong.xaThuongTru + ', ' : '')
                        + (hopDong.huyenThuongTru ? hopDong.huyenThuongTru + ', ' : '')
                        + (hopDong.tinhThuongTru ? hopDong.tinhThuongTru : ''),
                    dienThoai: hopDong.dienThoai ? hopDong.dienThoai : '',
                    cmnd: hopDong.cmnd ? hopDong.cmnd : '',
                    cmndNgayCap: hopDong.ngayCap ? app.date.viDateFormat(new Date(hopDong.ngayCap)) : '',
                    cmndNoiCap: hopDong.cmndNoiCap ? hopDong.cmndNoiCap : '',
                    chucDanhChuyenMon: hopDong.chucDanhChuyenMon ? hopDong.chucDanhChuyenMon : '',
                    maChucDanh: hopDong.maChucDanh ? hopDong.maChucDanh : '',
                    bac: hopDong.bac ? (hopDong.bac.includes('/') ? hopDong.bac : hopDong.bac + '/9') : '',
                    heSo: hopDong.heSo ? hopDong.heSo : '',
                    thoiGianXetNangBacLuong: hopDong.thoiGianXetNangBacLuong ? app.date.viDateFormat(new Date(hopDong.thoiGianXetNangBacLuong)) : '',
                    batDauHopDong: hopDong.batDauHopDong ? app.date.viDateFormat(new Date(hopDong.batDauHopDong)) : '',
                    ngayKyQuyetDinh: hopDong.ngayKyQuyetDinh ? app.date.viDateFormat(new Date(hopDong.ngayKyQuyetDinh)) : '',
                    hieuTruong: hopDong.maChucVuNguoiKy === '003' ? 'TL. HIỆU TRƯỞNG' : 'HIỆU TRƯỞNG',
                    truongPhongTCCB: hopDong.maChucVuNguoiKy === '003' ? 'TRƯỞNG PHÒNG TC-CB' : '',
                    kiTenUyQuyen: hopDong.maChucVuNguoiKy == '003' ? 'TUQ. HIỆU TRƯỞNG' : '',
                    kiTenChucVu: hopDong.maChucVuNguoiKy == '003' ? 'TRƯỞNG PHÒNG TC-CB' : 'HIỆU TRƯỞNG',
                    ngayKetThucHopDong: hopDong.ngayKetThucHopDong ? app.date.viDateFormat(new Date(hopDong.ngayKetThucHopDong)) : ''
                };
                const source = hopDong.isKth == 1 ? app.path.join(__dirname, 'resource', 'hdlv_khongThoiHan.docx') : app.path.join(__dirname, 'resource', 'hdlv_coThoiHan.docx');
                let result = await app.docx.generateFile(source, data);
                res.send({ data: result });
            }
        }
        catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const formatDate = (date) => {
        const fdate = date && date != 0 ? new Date(date) : '';
        return fdate !== '' ? (fdate.getDate()) + '/' + (fdate.getMonth() + 1) + '/' + fdate.getFullYear() : '';
    };

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/download-excel', app.permission.check('qtHopDongVienChuc:export'), (req, res) => {
        const pageNumber = 0,
            pageSize = 1000000,
            searchTerm = '';
        app.model.qtHopDongVienChuc.downloadExcel(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('HDLD');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'SHCC', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Phái', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Ngày sinh', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Nơi sinh', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Nguyên quán', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Thường trú', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Nơi ở hiện nay', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Điện thoại', bold: true, border: '1234' },
                        { cell: 'L1', value: 'Số CMND/CCCD', bold: true, border: '1234' },
                        { cell: 'M1', value: 'Ngày cấp', bold: true, border: '1234' },
                        { cell: 'N1', value: 'Nơi cấp', bold: true, border: '1234' },
                        { cell: 'O1', value: 'Người ký', bold: true, border: '1234' },
                        { cell: 'P1', value: 'Chức vụ người ký', bold: true, border: '1234' },
                        { cell: 'Q1', value: 'Loại hợp đồng', bold: true, border: '1234' },
                        { cell: 'R1', value: 'Số hợp đồng', bold: true, border: '1234' },
                        { cell: 'S1', value: 'Ngày ký hợp đồng', bold: true, border: '1234' },
                        { cell: 'T1', value: 'Bắt đầu làm việc', bold: true, border: '1234' },
                        { cell: 'U1', value: 'Kết thúc hợp đồng', bold: true, border: '1234' },
                        { cell: 'V1', value: 'Ngày ký hợp đồng tiếp theo', bold: true, border: '1234' },
                        { cell: 'W1', value: 'Địa điểm làm việc', bold: true, border: '1234' },
                        { cell: 'X1', value: 'Chịu sự phân công', bold: true, border: '1234' },
                        { cell: 'Y1', value: 'Ngạch', bold: true, border: '1234' },
                        { cell: 'Z1', value: 'Trình độ', bold: true, border: '1234' },
                        { cell: 'AA1', value: 'Chuyên ngành', bold: true, border: '1234' },
                        { cell: 'AB1', value: 'Hệ số lương', bold: true, border: '1234' },
                        { cell: 'AC1', value: 'Bậc lương', bold: true, border: '1234' },
                        { cell: 'AD1', value: 'Phần trăm hưởng', bold: true, border: '1234' }
                    ];
                    page.rows.forEach((item, index) => {
                        let thuongTru = (item.soNhaThuongTru ? item.soNhaThuongTru + ', ' : '')
                            + (item.xaThuongTru ? item.xaThuongTru + ', ' : '')
                            + (item.huyenThuongTru ? item.huyenThuongTru + ', ' : '')
                            + (item.tinhThuongTru ? item.tinhThuongTru : ''),

                            cuTru = (item.soNhaCuTru ? item.soNhaCuTru + ', ' : '')
                                + (item.xaCuTru ? item.xaCuTru + ', ' : '')
                                + (item.huyenCuTru ? item.huyenCuTru + ', ' : '')
                                + (item.tinhCuTru ? item.tinhCuTru : ''),

                            chucVuNK = item.maChucVuNguoiKy == '003' ? (item.chucVuNguoiKy + ' ' + item.donViNguoiKy) : item.chucVuNguoiKy;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.ho });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.ten });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: JSON.parse(item.gioiTinh).vi });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.ngaySinh ? formatDate(item.ngaySinh) : '' });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.noiSinh });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.nguyenQuan });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: thuongTru });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: cuTru });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.dienThoai });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.cmnd });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.ngayCap ? formatDate(item.ngayCap) : '' });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.noiCap });
                        cells.push({ cell: 'O' + (index + 2), border: '1234', value: item.hoNguoiKy + ' ' + item.tenNguoiKy });
                        cells.push({ cell: 'P' + (index + 2), border: '1234', value: chucVuNK });
                        cells.push({ cell: 'Q' + (index + 2), border: '1234', value: item.loaiHopDong });
                        cells.push({ cell: 'R' + (index + 2), border: '1234', value: item.soHopDong });
                        cells.push({ cell: 'S' + (index + 2), border: '1234', value: item.ngayKyHopDong ? formatDate(item.ngayKyHopDong) : '' });
                        cells.push({ cell: 'T' + (index + 2), border: '1234', value: item.batDauLamViec ? formatDate(item.batDauLamViec) : '' });
                        cells.push({ cell: 'U' + (index + 2), border: '1234', value: item.ketThucHopDong ? formatDate(item.ketThucHopDong) : '' });
                        cells.push({ cell: 'V' + (index + 2), border: '1234', value: item.ngayKyHdTiepTheo ? formatDate(item.ngayKyHdTiepTheo) : '' });
                        cells.push({ cell: 'W' + (index + 2), border: '1234', value: item.diaDiemLamViec });
                        cells.push({ cell: 'X' + (index + 2), border: '1234', value: item.chiuSuPhanCong });
                        cells.push({ cell: 'Y' + (index + 2), border: '1234', value: item.ngach });
                        cells.push({ cell: 'Z' + (index + 2), border: '1234', value: item.trinhDoHocVan });
                        cells.push({ cell: 'AA' + (index + 2), border: '1234', value: item.hocVanChuyenNganh });
                        cells.push({ cell: 'AB' + (index + 2), border: '1234', value: item.heSo });
                        cells.push({ cell: 'AC' + (index + 2), border: '1234', value: item.bac });
                        cells.push({ cell: 'AD' + (index + 2), border: '1234', value: item.phanTramHuong });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'HDLD.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/get-truong-phong-tccb', app.permission.check('qtHopDongVienChuc:read'), (req, res) => {
        app.model.tchcCanBo.get({ maChucVu: '003', maDonVi: '30' }, 'shcc', 'shcc DESC', (error, truongPhongTccb) => {
            res.send({ error, truongPhongTccb });
        });
    });
    app.get('/api/tccb/qua-trinh/hop-dong-lam-viec/newest/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtHopDongVienChuc.get({ nguoiDuocThue: req.params.shcc }, 'ngayKyHopDong', 'NGAY_KY_HOP_DONG DESC', (error, result) => res.send({ error, result }));
    });
};