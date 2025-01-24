module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3007: { title: 'Hợp đồng lao động', link: '/user/tccb/hop-dong-lao-dong', icon: 'fa-briefcase', backgroundColor: '#9B693B', groupIndex: 2 }
        }
    };
    app.permission.add(
        { name: 'tccbHopDongLaoDong:read', menu },
        { name: 'tccbHopDongLaoDong:write' },
        { name: 'tccbHopDongLaoDong:delete' },
        { name: 'tccbHopDongLaoDong:export' }
    );
    app.get('/user/tccb/hop-dong-lao-dong/:ma', app.permission.check('tccbHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tccb/hop-dong-lao-dong', app.permission.check('tccbHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tccb/hop-dong-lao-dong/group/:shcc', app.permission.check('tccbHopDongLaoDong:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtHopDongLaoDong', async (user, staff) => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbHopDongLaoDong:read', 'tccbHopDongLaoDong:write', 'tccbHopDongLaoDong:delete', 'tccbHopDongLaoDong:export');
        }
    });

    app.readyHooks.add('addSocketListener:ListenHopDongLaoDong', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('tccbHopDongLaoDong', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('tccbHopDongLaoDong:read') && socket.join('tccbHopDongLaoDong');
        })
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tccb/hop-dong-lao-dong/page/:pageNumber/:pageSize', app.permission.check('tccbHopDongLaoDong:read'), (req, res) => {
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
                    if (item.phanTramHuongMoi) {
                        item.phanTramHuongMoi = app.utils.parse(item.phanTramHuongMoi);
                    }
                    return item;
                });
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    // app.get('/api/tccb/hop-dong-lao-dong/group/page/:pageNumber/:pageSize', app.permission.check('tccbHopDongLaoDong:read'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    //     const filter = app.utils.stringify(req.query.filter || {}) || '';
    //     app.model.qtHopDongLaoDong.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
    //         if (error || page == null) {
    //             res.send({ error });
    //         } else {
    //             const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
    //             const pageCondition = searchTerm;
    //             res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
    //         }
    //     });
    // });

    // app.get('/api/tccb/hop-dong-lao-dong/groupShcc/page/:pageNumber/:pageSize', app.permission.check('tccbHopDongLaoDong:read'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    //     const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
    //     app.model.qtHopDongLaoDong.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
    //         if (error || page == null) {
    //             res.send({ error });
    //         } else {
    //             const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
    //             const pageCondition = searchTerm;
    //             res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
    //         }
    //     });
    // });

    app.get('/api/tccb/hop-dong-lao-dong/all', checkGetStaffPermission, (req, res) => {
        app.model.qtHopDongLaoDong.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/hop-dong-lao-dong/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.qtHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tccb/hop-dong-lao-dong/edit/item/:ma', checkGetStaffPermission, async (req, res) => {
        try {
            const hopDong = await app.model.qtHopDongLaoDong.get({ ma: req.params.ma });
            if (!hopDong) throw 'Không tìm thấy hợp đồng lao động';

            const mucHuongLuong = await app.model.qtLuong.getAll({ soHieuVanBan: hopDong.soHopDong, shcc: hopDong.nguoiDuocThue }, 'phanTramHuong, batDau, ketThuc', 'batDau');
            res.send({ ...hopDong, mucHuongLuong });

            // if (tccbHopDongLaoDong) {
            //     const phanTramHuong = await app.model.tccbPhanTramHuong.getAll({ soHopDong: tccbHopDongLaoDong.soHopDong });
            //     if (phanTramHuong.some(item => item.phanTramHuong == '85')) {
            //         const phamTramHuong85 = phanTramHuong.find(item => item.phanTramHuong == '85');
            //         tccbHopDongLaoDong.huongTuNgay1 = phamTramHuong85.ngayBatDau;
            //         tccbHopDongLaoDong.huongDenNgay1 = phamTramHuong85.ngayKetThuc;
            //     }
            //     if (phanTramHuong.some(item => item.phanTramHuong == '100')) {
            //         const phamTramHuong100 = phanTramHuong.find(item => item.phanTramHuong == '100');
            //         tccbHopDongLaoDong.huongTuNgay2 = phamTramHuong100.ngayBatDau;
            //         tccbHopDongLaoDong.huongDenNgay2 = phamTramHuong100.ngayKetThuc;
            //     }

            //     const canBoDuocThue = await app.model.tchcCanBo.get({ shcc: tccbHopDongLaoDong.nguoiDuocThue });
            //     if (canBoDuocThue) {
            //         const daiDien = app.model.tchcCanBo.get({ shcc: tccbHopDongLaoDong.nguoiKy });
            //         return res.send({ item: app.clone({ tccbHopDongLaoDong }, { canBoDuocThue }, { daiDien }) });
            //     } else {
            //         res.send({ error: 'Không tìm thấy cán bộ' });
            //     }
            // } else {
            //     res.send({ error: 'Không tìm thấy hợp đồng lao động' });
            // }
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/hop-dong-lao-dong/get-dai-dien/:shcc', checkGetStaffPermission, (req, res) => {
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

    app.get('/api/tccb/hop-dong-lao-dong/newest/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtHopDongLaoDong.get({ nguoiDuocThue: req.params.shcc }, 'ngayKyHopDong', 'NGAY_KY_HOP_DONG DESC', (error, result) => res.send({ error, result }));
    });

    app.post('/api/tccb/hop-dong-lao-dong', app.permission.check('tccbHopDongLaoDong:write'), async (req, res) => {
        try {
            const { data, dataCanBo } = req.body;
            const userEmail = req.session.user?.email,
                ngayTao = Date.now();
            let checkCanBo = await app.model.tccbCapMaCanBo.get({ mscb: data.nguoiDuocThue });
            if (!checkCanBo) throw 'Không có thông tin mã số cán bộ!';

            const { ho, ten, emailCaNhan, loaiCanBo } = checkCanBo;

            let checkCanBoTchc = await app.model.tchcCanBo.get({ shcc: data.nguoiDuocThue });
            if (!checkCanBoTchc) checkCanBoTchc = await app.model.tchcCanBo.create({ shcc: data.nguoiDuocThue });
            await Promise.all([
                app.model.tchcCanBo.update({ shcc: data.nguoiDuocThue }, { ho, ten, emailCaNhan, loaiCanBo, ...dataCanBo }),
                checkCanBo.trangThai == 'CHO_KY' ? app.model.tccbCapMaCanBo.update({ mscb: data.nguoiDuocThue }, { trangThai: Number(data.batDauLamViec) <= Date.now() ? 'CO_HIEU_LUC' : 'CHO_HIEU_LUC', modifier: userEmail, timeModified: ngayTao }) : null,
                app.model.qtHopDongLaoDong.create(data),
                Promise.all(data.mucHuongLuong.map(mucHuong => app.model.qtLuong.create({
                    shcc: data.nguoiDuocThue,
                    soHieuVanBan: data.soHopDong,
                    chucDanhNgheNghiep: data.maNgach,
                    bac: data.bac,
                    heSoLuong: data.heSo,
                    batDau: mucHuong.batDau,
                    ketThuc: mucHuong.ketThuc,
                    phanTramHuong: mucHuong.phanTramHuong
                })))
            ]);

            app.tccbSaveCRUD(req.session.user.email, 'C', 'Hợp đồng lao động');
            res.send({});
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/hop-dong-lao-dong', app.permission.check('tccbHopDongLaoDong:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const oldData = await app.model.qtHopDongLaoDong.get({ ma });
            if (!oldData) throw 'Không tìm thấy hợp đồng lao động';

            await Promise.all([
                await app.model.qtLuong.delete({ soHieuVanBan: oldData.soHopDong, shcc: oldData.nguoiDuocThue }),
                await app.model.qtHopDongLaoDong.update({ ma }, changes),
                await Promise.all(changes.mucHuongLuong.map(mucHuong => app.model.qtLuong.create({
                    shcc: changes.nguoiDuocThue,
                    soHieuVanBan: changes.soHopDong,
                    chucDanhNgheNghiep: changes.maNgach,
                    bac: changes.bac,
                    heSoLuong: changes.heSo,
                    batDau: mucHuong.batDau,
                    ketThuc: mucHuong.ketThuc,
                    phanTramHuong: mucHuong.phanTramHuong
                })))
            ]);

            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hợp đồng lao động');
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/hop-dong-lao-dong', app.permission.check('tccbHopDongLaoDong:delete'), async (req, res) => {
        try {
            const { ma } = req.body;
            const item = await app.model.qtHopDongLaoDong.get({ ma });
            if (!item) throw 'Không tìm thấy hợp đồng lao động';

            await Promise.all([
                app.model.qtHopDongLaoDong.delete({ ma }),
                await app.model.qtLuong.delete({ soHieuVanBan: item.soHopDong, shcc: item.nguoiDuocThue }),
            ]);

            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hợp đồng lao động');
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/hop-dong-lao-dong/download-word/:ma', app.permission.check('tccbHopDongLaoDong:export'), async (req, res) => {
        try {
            let data = await app.model.qtHopDongLaoDong.download(req.params.ma).then(item => item.rows[0]);

            data.ngayKy = data.ngayKyHopDong ? app.date.viDateFormatString(new Date(Number(data.ngayKyHopDong))) : '';
            data.daiDienKy = data.daiDienKy?.normalizedName();
            data.quocTichKy = data.quocTichKy?.normalizedName() || 'Việt Nam';
            data.chucVuDaiDienKy = data.chucVuNguoiKy + ' Tổ chức - Cán bộ';
            data.hoTenCanBo = data.hoTenCanBo?.normalizedName();
            data.quocTichCanBo = data.quocTichCanBo?.normalizedName() || 'Việt Nam';
            data.ngaySinh = data.ngaySinh ? app.date.dateTimeFormat(new Date(Number(data.ngaySinh)), 'dd/mm/yyyy') : '';
            data.gioiTinh = app.utils.parse(data.gioiTinh)?.vi || '';
            data.cmndNgayCap = data.cmndNgayCap ? app.date.dateTimeFormat(new Date(Number(data.cmndNgayCap)), 'dd/mm/yyyy') : '';
            data.batDauHopDong = data.batDauHopDong ? app.date.dateTimeFormat(new Date(Number(data.batDauHopDong)), 'dd/mm/yyyy') : '';
            data.ketThucHopDong = data.ketThucHopDong ? app.date.dateTimeFormat(new Date(Number(data.ketThucHopDong)), 'dd/mm/yyyy') : '';
            data.phanTramHuong = app.utils.parse(data.phanTramHuong)?.reduce((result, curr, index, arr) => {
                result = result + 'hưởng ' + curr.phanTramHuong
                    + '% từ ngày ' + (curr.batDau ? app.date.dateTimeFormat(new Date(Number(curr.batDau)), 'dd/mm/yyyy') : '')
                    + (curr.ketThuc ? ' đến ngày ' + app.date.dateTimeFormat(new Date(Number(curr.ketThuc)), 'dd/mm/yyyy') : '')
                    + (index < arr.length - 1 ? ', ' : ')');
                return result;
            }, '(') || '';
            data.isThuViec = data.loaiHopDong.includes('thử việc') ? '(Thử việc)' : '';
            data.kiTenUyQuyen = data.maChucVuNguoiKy == '003' ? 'TUQ. HIỆU TRƯỞNG' : '';
            data.kiTenChucVu = data.maChucVuNguoiKy == '003' ? 'TRƯỞNG PHÒNG TC-CB' : 'HIỆU TRƯỞNG';

            const source = app.path.join(app.assetPath, 'tccb', 'template', 'Template_hdld.docx');
            const buffer = await app.docx.generateFile(source, data);
            res.send({ content: buffer, filename: `HDLD_${data.shcc}.docx` });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const formatDate = (date) => {
        const fdate = date && date != 0 ? new Date(date) : '';
        return fdate !== '' ? (fdate.getDate()) + '/' + (fdate.getMonth() + 1) + '/' + fdate.getFullYear() : '';
    };

    app.get('/api/tccb/hop-dong-lao-dong/download-excel', app.permission.check('tccbHopDongLaoDong:export'), async (req, res) => {
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

    app.get('/api/tccb/hop-dong-lao-dong/get-truong-phong-tccb', app.permission.check('tccbHopDongLaoDong:read'), (req, res) => {
        app.model.dmChucVu.get({ ten: 'Trưởng phòng' }, (error, result) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.qtChucVu.get({ maChucVu: result.ma, maDonVi: 30, chucVuChinh: 1 }, (error, truongPhongTCCB) => res.send({ error, truongPhongTCCB }));
            }
        });
    });

    app.get('/api/tccb/hop-dong-lao-dong/suggested-shd', app.permission.check('tccbHopDongLaoDong:write'), (req, res) => {
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
};