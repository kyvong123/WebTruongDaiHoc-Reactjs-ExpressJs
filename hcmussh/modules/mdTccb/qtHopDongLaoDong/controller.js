module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.tccb,
    //     menus: {
    //         3007: { title: 'Hợp đồng lao động', link: '/user/tccb/qua-trinh/hop-dong-lao-dong', icon: 'fa-briefcase', backgroundColor: '#9B693B', groupIndex: 2 }
    //     }
    // };
    // app.permission.add(
    //     { name: 'qtHopDongLaoDong:read', menu },
    //     { name: 'qtHopDongLaoDong:write' },
    //     { name: 'qtHopDongLaoDong:delete' },
    //     { name: 'qtHopDongLaoDong:export' }
    // );
    app.permission.add(
        { name: 'qtHopDongLaoDong:read' },
        { name: 'qtHopDongLaoDong:write' },
        { name: 'qtHopDongLaoDong:delete' },
        { name: 'qtHopDongLaoDong:export' }
    );
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong/:ma', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong/group/:shcc', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtHopDongLaoDong', async (user, staff) => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtHopDongLaoDong:read', 'qtHopDongLaoDong:write', 'qtHopDongLaoDong:delete', 'qtHopDongLaoDong:export');
        }
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

        const filter = app.utils.stringify(app.clone({ ks_now: Date.now() }, req.query.filter));
        app.model.qtHopDongLaoDong.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                list = list.map(item => {
                    if (item.newPhanTramHuong) {
                        item.newPhanTramHuong = app.utils.parse(item.newPhanTramHuong);
                    }
                    return item;
                });
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/group/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.utils.stringify(req.query.filter || {}) || '';
        app.model.qtHopDongLaoDong.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/groupShcc/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHopDongLaoDong.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/all', checkGetStaffPermission, (req, res) => {
        app.model.qtHopDongLaoDong.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.qtHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/edit/item/:ma', checkGetStaffPermission, async (req, res) => {
        try {
            const qtHopDongLaoDong = await app.model.qtHopDongLaoDong.get({ ma: req.params.ma });
            if (qtHopDongLaoDong) {
                const phanTramHuong = await app.model.tccbPhanTramHuong.getAll({ soHopDong: qtHopDongLaoDong.soHopDong });
                if (phanTramHuong.some(item => item.phanTramHuong == '85')) {
                    const phamTramHuong85 = phanTramHuong.find(item => item.phanTramHuong == '85');
                    qtHopDongLaoDong.huongTuNgay1 = phamTramHuong85.ngayBatDau;
                    qtHopDongLaoDong.huongDenNgay1 = phamTramHuong85.ngayKetThuc;
                }
                if (phanTramHuong.some(item => item.phanTramHuong == '100')) {
                    const phamTramHuong100 = phanTramHuong.find(item => item.phanTramHuong == '100');
                    qtHopDongLaoDong.huongTuNgay2 = phamTramHuong100.ngayBatDau;
                    qtHopDongLaoDong.huongDenNgay2 = phamTramHuong100.ngayKetThuc;
                }

                const canBoDuocThue = await app.model.tchcCanBo.get({ shcc: qtHopDongLaoDong.nguoiDuocThue });
                if (canBoDuocThue) {
                    const daiDien = app.model.tchcCanBo.get({ shcc: qtHopDongLaoDong.nguoiKy });
                    return res.send({ item: app.clone({ qtHopDongLaoDong }, { canBoDuocThue }, { daiDien }) });
                } else {
                    res.send({ error: 'Không tìm thấy cán bộ' });
                }
            } else {
                res.send({ error: 'Không tìm thấy hợp đồng lao động' });
            }
        }
        catch (e) {
            res.send({ error: e });
        }
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/get-dai-dien/:shcc', checkGetStaffPermission, (req, res) => {
        app.model.tchcCanBo.get({ shcc: req.params.shcc }, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.qtChucVu.get({ shcc: item.shcc, }, (error, result) => {
                    res.send({ error, item: app.clone(item, { chucVu: result.maChucVu }) });
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/newest/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtHopDongLaoDong.get({ nguoiDuocThue: req.params.shcc }, 'ngayKyHopDong', 'NGAY_KY_HOP_DONG DESC', (error, result) => res.send({ error, result }));
    });

    app.post('/api/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:write'), async (req, res) => {
        try {
            const data = req.body.item;
            await app.model.qtHopDongLaoDong.create(data);
            data.huongDenNgay1 && data.huongTuNgay1 && await app.model.tccbPhanTramHuong.create({ soHopDong: data.soHopDong, ngayBatDau: data.huongTuNgay1, ngayKetThuc: data.huongDenNgay1, phanTramHuong: data.phanTramHuong1, loaiHopDong: 'Hợp đồng lao động' });
            data.huongTuNgay2 && await app.model.tccbPhanTramHuong.create({ soHopDong: data.soHopDong, ngayBatDau: data.huongTuNgay2, ngayKetThuc: data.huongDenNgay2, phanTramHuong: data.phanTramHuong2, loaiHopDong: 'Hợp đồng lao động' });
            res.end();
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const item = await app.model.qtHopDongLaoDong.update({ ma }, changes);
            if (changes.huongDenNgay1 && changes.huongTuNgay1) {
                await app.model.tccbPhanTramHuong.update({ soHopDong: changes.soHopDong }, { phanTramHuong: changes.phanTramHuong1, ngayBatDau: changes.huongTuNgay1, ngayKetThuc: changes.huongDenNgay1, });
            }
            if (changes.huongDenNgay2 && changes.huongTuNgay2) {
                await app.model.tccbPhanTramHuong.update({ soHopDong: changes.soHopDong }, { phanTramHuong: changes.phanTramHuong2, ngayBatDau: changes.huongTuNgay2, ngayKetThuc: changes.huongDenNgay2, });
            }
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hợp đồng lao động');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:delete'), async (req, res) => {
        try {
            const { ma } = req.body;
            const item = await app.model.qtHopDongLaoDong.get({ ma });
            if (item) {
                await Promise.all([
                    app.model.qtHopDongLaoDong.delete({ ma }),
                    app.model.tccbPhanTramHuong.delete({ soHopDong: item.soHopDong })
                ]);
            }
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hợp đồng lao động');
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/download-word/:ma', app.permission.check('qtHopDongLaoDong:export'), (req, res) => {
        if (req.params && req.params.ma) {
            app.model.qtHopDongLaoDong.download(req.params.ma, (error, item) => {
                if (error || !item) {
                    res.send({ error });
                } else {
                    const source = app.path.join(__dirname, 'resource', 'hdld_word.docx');
                    const daiDienUyQuyen = 'Đại diện cho Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Thành phố Hồ Chí Minh theo Giấy ủy quyền số 297/GUQ-XHNV-TCCB ngày 05 tháng 4 năm 2022 của Hiệu trưởng Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM về việc giao kết hợp đồng làm việc và hợp đồng lao động đối với viên chức và người lao động có trình độ từ thạc sĩ trở xuống.';
                    new Promise(resolve => {
                        let hopDong = item.rows[0];
                        const data = {
                            daiDienUyQuyen: hopDong.maChucVuNguoiKy == '003' ? daiDienUyQuyen : '',
                            soHopDong: hopDong.soHopDong,
                            daiDienKy: (hopDong.hoNguoiKy + ' ' + hopDong.tenNguoiKy).normalizedName(),
                            chucVuDaiDienKy: hopDong.chucVuNguoiKy + ' Tổ chức - Cán bộ',
                            phaiNK: hopDong.phaiNK,
                            quocTichKy: hopDong.quocTichKy ? hopDong.quocTichKy.normalizedName() : 'Việt Nam',
                            hoTenCanBo: (hopDong.ho + ' ' + hopDong.ten).normalizedName(),
                            phai: hopDong.phai,
                            gioiTinh: hopDong.phai == 'Ông' ? 'Nam' : 'Nữ',
                            quocTichCanBo: hopDong.quocTich ? hopDong.quocTich.normalizedName() : '',
                            tonGiao: hopDong.tonGiao ? hopDong.tonGiao : '',
                            danToc: hopDong.danToc ? hopDong.danToc : '',
                            ngaySinh: hopDong.ngaySinh ? app.date.viDateFormat(new Date(hopDong.ngaySinh)) : '',
                            noiSinh: hopDong.noiSinh ? hopDong.noiSinh : '',
                            nguyenQuan: hopDong.nguyenQuan ? hopDong.nguyenQuan : '',
                            hienTai: (hopDong.soNhaCuTru ? hopDong.soNhaCuTru + ', ' : '')
                                + (hopDong.xaCuTru ? hopDong.xaCuTru + ', ' : '')
                                + (hopDong.huyenCuTru ? hopDong.huyenCuTru + ', ' : '')
                                + (hopDong.tinhCuTru ? hopDong.tinhCuTru : ''),
                            thuongTru: (hopDong.soNhaThuongTru ? hopDong.soNhaThuongTru + ', ' : '')
                                + (hopDong.xaThuongTru ? hopDong.xaThuongTru + ', ' : '')
                                + (hopDong.huyenThuongTru ? hopDong.huyenThuongTru + ', ' : '')
                                + (hopDong.tinhThuongTru ? hopDong.tinhThuongTru : ''),

                            dienThoai: hopDong.dienThoai ? hopDong.dienThoai : '',
                            hocVi: hopDong.trinhDoHocVan ? hopDong.trinhDoHocVan : '',
                            chuyenNganh: hopDong.hocVanChuyenNganh ? hopDong.hocVanChuyenNganh : '',

                            cmnd: hopDong.cmnd ? hopDong.cmnd : '',
                            cmndNgayCap: hopDong.ngayCap ? app.date.viDateFormat(new Date(hopDong.ngayCap)) : '',
                            cmndNoiCap: hopDong.cmndNoiCap ? hopDong.cmndNoiCap : '',

                            loaiHopDong: hopDong.loaiHopDong ? hopDong.loaiHopDong : '',
                            batDauHopDong: hopDong.batDauHopDong ? app.date.viDateFormat(new Date(hopDong.batDauHopDong)) : '',
                            ketThucHopDong: hopDong.ketThucHopDong ? app.date.viDateFormat(new Date(hopDong.ketThucHopDong)) : '',
                            diaDiemLamViec: hopDong.diaDiemLamViec ? hopDong.diaDiemLamViec.normalizedName() : '',
                            chucDanhChuyenMon: hopDong.chucDanhChuyenMon,
                            chiuSuPhanCong: hopDong.chiuSuPhanCong ? (hopDong.chiuSuPhanCong.length < 15 ? 'Theo sự phân công của Trưởng đơn vị: ' + hopDong.diaDiemLamViec.normalizedName() : hopDong.chiuSuPhanCong) : '',
                            chiuTrachNhiem: 'Trưởng đơn vị: ' + hopDong.diaDiemLamViec.normalizedName(),
                            bac: hopDong.bac ? hopDong.bac : '',
                            heSo: hopDong.heSo ? hopDong.heSo : '',
                            ngayKyHopDong: hopDong.ngayKyHopDong ? app.date.viDateFormat(new Date(hopDong.ngayKyHopDong)) : '',
                            ngayKyDate: (new Date(hopDong.ngayKyHopDong)).getDate(),
                            ngayKyMonth: (new Date(hopDong.ngayKyHopDong)).getMonth() + 1,
                            ngayKyYear: (new Date(hopDong.ngayKyHopDong)).getFullYear(),
                            phanTramHuong: hopDong.phanTramHuong ? hopDong.phanTramHuong : '',
                            hieuTruong: hopDong.maChucVuNguoiKy === '003' ? 'TL. HIỆU TRƯỞNG' : 'HIỆU TRƯỞNG',
                            truongPhongTCCB: hopDong.maChucVuNguoiKy === '003' ? 'TRƯỞNG PHÒNG TC-CB' : '',
                            isThuViec: hopDong.loaiHopDong.includes('thử việc') ? '(Thử việc)' : '',
                            kiTenUyQuyen: hopDong.maChucVuNguoiKy == '003' ? 'TUQ. HIỆU TRƯỞNG' : '',
                            kiTenChucVu: hopDong.maChucVuNguoiKy == '003' ? 'TRƯỞNG PHÒNG TC-CB' : 'HIỆU TRƯỞNG',
                            baoHiem: hopDong.maLoaiHopDong == '01' ? 'Không tham gia bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp trong thời gian thử việc.' : 'Được tham gia bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp trong thời gian làm việc tại Trường theo quy định của pháp luật.'
                        };
                        resolve(data);
                    }).then((data) => {
                        app.docx.generateFile(source, data, (error, data) => res.send({ error, data }));
                    });
                }
            });
        }
    });

    const formatDate = (date) => {
        const fdate = date && date != 0 ? new Date(date) : '';
        return fdate !== '' ? (fdate.getDate()) + '/' + (fdate.getMonth() + 1) + '/' + fdate.getFullYear() : '';
    };

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/download-excel', app.permission.check('qtHopDongLaoDong:export'), async (req, res) => {
        const pageNumber = 0,
            pageSize = 1000000,
            searchTerm = '';
        try {
            const page = await app.model.qtHopDongLaoDong.downloadExcel(pageNumber, pageSize, searchTerm);
            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('HDLD');
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
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.gioiTinh ? JSON.parse(item.gioiTinh).vi : '' });
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
            app.excel.write(worksheet, cells);
            app.excel.attachment(workbook, res, 'HDLD.xlsx');
        }
        catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/get-truong-phong-tccb', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        app.model.dmChucVu.get({ ten: 'Trưởng phòng' }, (error, result) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.qtChucVu.get({ maChucVu: result.ma, maDonVi: 30, chucVuChinh: 1 }, (error, truongPhongTCCB) => res.send({ error, truongPhongTCCB }));
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/suggested-shd', app.permission.check('qtHopDongLaoDong:write'), (req, res) => {
        app.model.qtHopDongLaoDong.getAll({}, 'soHopDong', 'soHopDong DESC', (error, items) => {
            let maxSoHD = 0, curYear = new Date().getFullYear();
            items.forEach((item) => {
                let soHopDong = Number(item.soHopDong.substring(0, item.soHopDong.indexOf('/'))),
                    hopDongYear = Number(item.soHopDong.substring(item.soHopDong.indexOf('/') + 1, item.soHopDong.lastIndexOf('/')));
                if (curYear == hopDongYear) {
                    if (soHopDong > maxSoHD) maxSoHD = soHopDong;
                }
            });
            res.send({ error, soHopDongSuggested: maxSoHD + 1 });
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong/pre-shcc/:maDonVi', app.permission.check('qtHopDongLaoDong:write'), async (req, res) => {
        let result = await app.model.qtHopDongLaoDong.getShccAuto(req.params.maDonVi);
        res.send(result);
    });
};