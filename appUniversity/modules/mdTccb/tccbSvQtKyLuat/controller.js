module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6176: { title: 'Kỷ luật sinh viên', icon: 'fa-gavel', link: '/user/tccb/sv-ky-luat', groupIndex: 2, backgroundColor: '#3A8342' }
        }
    };

    app.permission.add(
        { name: 'tccbSvKyLuat:manage', menu },
    );

    app.assignRoleHooks.addRoles('tccbSvKyLuat',
        { id: 'tccbSvKyLuat:manage', text: 'Công tác sinh viên: Kỷ luật sinh viên' }
    );

    app.assignRoleHooks.addHook('tccbSvKyLuat', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === 'tccbSvKyLuat' && userPermissions.includes('manager:login')) {
            const assignRolesList = app.assignRoleHooks.get('tccbSvKyLuat').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'addRoleTccbSvKyLuat', (user) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'tccbSvKyLuat:manage');
            resolve();
        } else {
            resolve();
        }
    }));

    app.permissionHooks.add('assignRole', 'checkRoleManageSvKyLuat', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tccbSvKyLuat');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tccbSvKyLuat:manage' && user.permissions.includes('faculty:login')) {
                app.permissionHooks.pushUserPermission(user, 'tccbSvKyLuat:manage');
            }
        });
        resolve();
    }));

    const maHinhThucCanhCao = app.isDebug ? 61 : 41;

    app.get('/user/tccb/sv-ky-luat', app.permission.check('tccbSvKyLuat:manage'), app.templates.admin);

    app.get('/api/tccb/sv-ky-luat/cau-hinh/page/:pageNumber/:pageSize', app.permission.check('tccbSvKyLuat:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let listDonViQuanLy = req.session.user.staff.donViQuanLy;
            (!listDonViQuanLy || listDonViQuanLy.length == 0) && (listDonViQuanLy = [{ maDonVi: req.session.user.maDonVi }]);
            const filter = { ...req.query.filter, listFaculty: listDonViQuanLy.map(item => item.maDonVi).join(','), kichHoat: 1 };
            const page = await app.model.svQtKyLuatCauHinhXet.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/sv-ky-luat/cau-hinh/item', app.permission.check('tccbSvKyLuat:manage'), async (req, res) => {
        try {
            const { id } = req.query;
            const cauHinh = await app.model.svQtKyLuatCauHinhXet.get({ id }, '*');
            const dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId: cauHinh.dmCauHinhId }, '*', 'thuTu ASC');
            const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({});
            let hinhThucKyLuatMap = {};
            hinhThucKyLuat.forEach(ht => {
                hinhThucKyLuatMap[ht.id] = {
                    ...ht
                };
            });

            cauHinh.dsDieuKien = dsDieuKien.map(dk => ({ ...dk, hinhThucKyLuatText: hinhThucKyLuatMap[dk.hinhThucKyLuat].ten }));
            let listDonViQuanLy = req.session.user.staff.donViQuanLy;
            (!listDonViQuanLy || listDonViQuanLy.length == 0) && (listDonViQuanLy = [{ maDonVi: req.session.user.maDonVi }]);
            const filter = { listFaculty: listDonViQuanLy.map(item => item.maDonVi).join(',') };
            const dssvDuKien = await app.model.svQtKyLuatCauHinhXet.getDssvDuKien(id, app.utils.stringify(filter));
            const { namHoc, hocKy } = cauHinh;
            const listSinhVien = dssvDuKien.rows;
            // const lichSuKyLuat = await app.model.svDsKyLuat.getSvDsKyLuatLichSuCanhCaoHocVu(listSinhVien.length ? listSinhVien.map(item => item.mssv) : ['-1']);
            let { rows: lichSuKyLuat } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ hinhThucKyLuat: maHinhThucCanhCao }));
            lichSuKyLuat = lichSuKyLuat.groupBy('mssv');
            cauHinh.dssvDuKien = listSinhVien.map(sv => ({
                ...sv,
                ...app.model.svQtKyLuatDssvDuKien.checkHinhThucKyLuat(sv, dsDieuKien, hinhThucKyLuat, lichSuKyLuat[sv.mssv] || [], namHoc, hocKy)
            }));
            res.send({ item: cauHinh });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/sv-ky-luat/dssv/download-excel', app.permission.check('tccbSvKyLuat:manage'), async (req, res) => {
        try {
            const { id } = req.query;
            const cauHinh = await app.model.svQtKyLuatCauHinhXet.get({ id }, '*');
            const dsDieuKien = await app.model.svQtKyLuatDieuKien.getAll({ cauHinhId: cauHinh.dmCauHinhId }, '*', 'thuTu ASC');
            const hinhThucKyLuat = await app.model.svDmHinhThucKyLuat.getAll({});
            let hinhThucKyLuatMap = {};
            hinhThucKyLuat.forEach(ht => {
                hinhThucKyLuatMap[ht.id] = {
                    ...ht
                };
            });
            cauHinh.dsDieuKien = dsDieuKien.map(dk => ({ ...dk, hinhThucKyLuatText: hinhThucKyLuatMap[dk.hinhThucKyLuat].ten }));
            let listDonViQuanLy = req.session.user.staff.donViQuanLy;
            (!listDonViQuanLy || listDonViQuanLy.length == 0) && (listDonViQuanLy = [{ maDonVi: req.session.user.maDonVi }]);
            const filter = { listFaculty: listDonViQuanLy.map(item => item.maDonVi).join(',') };
            const dssvDuKien = await app.model.svQtKyLuatCauHinhXet.getDssvDuKien(id, app.utils.stringify(filter));
            const { namHoc, hocKy } = cauHinh;
            const listSinhVien = dssvDuKien.rows;
            // const lichSuKyLuat = await app.model.svDsKyLuat.getSvDsKyLuatLichSuCanhCaoHocVu(listSinhVien.length ? listSinhVien.map(item => item.mssv) : ['-1']);
            let { rows: lichSuKyLuat } = await app.model.svDsKyLuat.getDssv(app.utils.stringify({ hinhThucKyLuat: maHinhThucCanhCao }));
            lichSuKyLuat = lichSuKyLuat.groupBy('mssv');
            cauHinh.dssvDuKien = listSinhVien.map(sv => ({
                ...sv,
                ...app.model.svQtKyLuatDssvDuKien.checkHinhThucKyLuat(sv, dsDieuKien, hinhThucKyLuat, lichSuKyLuat[sv.mssv] || [], namHoc, hocKy)
            }));
            const khoa = cauHinh.dssvDuKien.reduce((acc, sv) => {
                const { tenKhoa } = sv;
                if (!acc[tenKhoa]) {
                    acc[tenKhoa] = [];
                }
                acc[tenKhoa].push(sv);
                return acc;
            }, {});
            const dsKhoa = Object.keys(khoa);
            const workSheetKhoa = {};
            new Promise(resolve => {
                const workBook = app.excel.create();
                dsKhoa.forEach(khoa => {
                    workSheetKhoa[khoa] = workBook.addWorksheet(khoa);
                    workSheetKhoa[khoa].columns = [
                        { header: 'STT', key: 'stt', width: 8 },
                        { header: 'MSSV', key: 'mssv', width: 15 },
                        { header: 'HỌ TÊN', key: 'hoTenSinhVien', width: 20 },
                        { header: 'KHOA', key: 'khoa', width: 15, wrapText: false },
                        { header: 'KHÓA SINH VIÊN', key: 'khoaSinhVien', width: 15, wrapText: false },
                        { header: 'ĐIỂM TRUNG BÌNH', key: 'diemTrungBinh', width: 15, wrapText: false },
                        { header: 'ĐIỂM TRUNG BÌNH TÍCH LŨY', key: 'diemTrungBinhTichLuy', width: 15, wrapText: false },
                        { header: 'HÌNH THỨC KỶ LUẬT', key: 'hinhThucKyLuat', width: 15, wrapText: false },
                        { header: 'HÌNH THỨC KỶ LUẬT BỔ SUNG', key: 'hinhThucKyLuatBoSung', width: 20, wrapText: false },
                        { header: 'GHI CHÚ KHOA', key: 'ghiChuKhoa', width: 20, wrapText: false },
                    ];
                    workSheetKhoa[khoa].getRow(1).alignment = { ...workSheetKhoa[khoa].getRow(1).alignment, vertical: 'middle', wrapText: false };
                    workSheetKhoa[khoa].getRow(1).font = { name: 'Times New Roman' };
                    const data = cauHinh.dssvDuKien.filter(sv => sv.tenKhoa == khoa);
                    data.forEach((item, index) => {
                        workSheetKhoa[khoa].addRow({
                            stt: index + 1,
                            mssv: item.mssv,
                            hoTenSinhVien: item.hoTen,
                            khoa: item.tenKhoa,
                            khoaSinhVien: item.khoaSinhVien,
                            diemTrungBinh: item.diemTrungBinh,
                            diemTrungBinhTichLuy: item.diemTrungBinhTichLuy,
                            hinhThucKyLuat: item.hinhThucKyLuatText,
                            hinhThucKyLuatBoSung: item.hinhThucKyLuatBoSungText,
                            ghiChuKhoa: item.ghiChuKhoa
                        }, 'i');
                    });
                });
                resolve(workBook);
            }).then(workBook => {
                const fileName = 'DS_SV_KY_LUAT.xlsx';
                app.excel.attachment(workBook, res, fileName);
            });
        } catch (error) {
            res.send({ error });
        }
    });


    app.put('/api/tccb/sv-ky-luat/them-ghi-chu-khoa', app.permission.check('tccbSvKyLuat:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const svKyLuatUpdate = await app.model.svQtKyLuatDssvDuKien.update({ id }, { ...changes });
            res.send({ item: svKyLuatUpdate });
        } catch (error) {
            res.send({ error });
        }
    });
};