module.exports = app => {
    const quanLySdh = 'quanLySauDaiHoc', sdhPermission = 'quanLySauDaiHoc:SauDaiHoc',
        permission = [
            // MenuPage
            'sdhEduProgram:manage', 'sdhFacultyProgram:manage', 'sdhSubjectProgram:manage', 'sdhTopicProgram:manage', 'sdhEnrollment:manage', 'sdhMenuDiem:manage', 'sdhEnrollmentPeriod:manage',
            //thoiKhoaBieu
            'sdhThoiKhoaBieu:read', 'sdhThoiKhoaBieu:write', 'sdhThoiKhoaBieu:manage',
            //manager
            'sdhTsKetQuaThi:manage', 'sdhKyThiTuyenSinh:manage', 'sdhTsAssignRole:manage', 'sdhTsDmKyLuat:manage',
            // addRoleSdhTsInfo
            'sdhTsInfo:manage', 'sdhTsInfo:write',
            'sdhTsInfoTime:manage', 'sdhTsInfoTime:write',

            // addRoleDmChucVu === addRolesDtMonHoc
            // 'dmMonHoc:read', 'dmMonHoc:write', 'dmMonHoc:delete', 'dmMonHoc:upload',
            //dmKyLuat
            'sdhTsDmKyLuat:read', 'sdhTsDmKyLuat:write', 'sdhTsDmKyLuat:delete',
            //dmHinhThuc
            'sdhHinhThucTuyenSinh:read', 'sdhHinhThucTuyenSinh:write', 'sdhHinhThucTuyenSinh:delete',
            // dmHoSoDangKy
            'sdhTsHsdk:read', 'sdhTsHsdk:write', 'sdhTsHsdk:delete', 'sdhTsHsdk:export',
            // addRoleLichThi
            'sdhTuyenSinhLichThi:manage', 'sdhTuyenSinhLichThi:write', 'sdhTuyenSinhLichThi:read', 'sdhTuyenSinhLichThi:delete', 'sdhTuyenSinhLichThi:import', 'sdhTuyenSinhLichThi:export',
            // addRolesKetQuaThi
            'sdhTsKetQuaThi:manage', 'sdhTsKetQuaThi:write', 'sdhTsKetQuaThi:read', 'sdhTsKetQuaThi:import', 'sdhTsKetQuaThi:export',
            // addRolesKyLuat
            'sdhTsKyLuat:manage', 'sdhTsKyLuat:write', 'sdhTsKyLuat:read', 'sdhTsKyLuat:delete',
            // addRolesLoaiBieuMau
            'sdhTsLoaiBieuMau:manage', 'sdhTsLoaiBieuMau:write', 'sdhTsLoaiBieuMau:delete',
            // addRolesTsSetting
            'sdhTsSetting:read', 'sdhTsSetting:write',
            // addRolesThongKe
            'sdhTsThongKe:manage',
            // addRoleThongTinBieuMau
            'sdhTsThongTinBieuMau:write', 'sdhTsThongTinBieuMau:delete', 'sdhTsThongTinBieuMau:manage',
            // addRoleThongTinBieuMau
            'sdhDsTs:write', 'sdhDsTs:delete', 'sdhDsTs:read', 'sdhDsTs:export', 'sdhDsTs:import', 'sdhDsTs:manage', 'sdhDsTs:adminManage',
            // addRolesXetTrungTuyen
            'sdhTsXetTrungTuyen:manage', 'sdhTsXetTrungTuyen:write', 'sdhTsXetTrungTuyen:read', 'sdhTsXetTrungTuyen:import', 'sdhTsXetTrungTuyen:export',

            // addRolesDtTinhTrangHocPhan
            'sdhTinhTrangHocPhan:delete', 'sdhTinhTrangHocPhan:write', 'sdhTinhTrangHocPhan:manage',
            // dmDot
            // 'sdhDmDotTuyenSinh:manage', 'sdhDmDotTuyenSinh:read',
            'sdhThoiKhoaBieu:read', 'sdhThoiKhoaBieu:write',
            // dtDiem
            'sdhDiemManage:manage', 'sdhDiemManage:write', 'sdhDiemManage:read', 'sdhDiemManage:delete',
            // dmPhanHe
            'dmHocSdh:read', 'dmHocSdh:write', 'dmHocSdh:delete',
            // dmKhoa
            'dmKhoaSdh:read', 'dmKhoaSdh:write', 'dmKhoaSdh:delete', 'dmKhoaSdh:manage',
            // dmMonHoc
            'dmMonHocSdh:manage', 'dmMonHocSdh:write', 'dmMonHocSdh:delete',
            // dmNganhSdh
            'dmNganhSdh:write', 'dmNganhSdh:delete', 'dmNganhSdh:manage',
            // sv
            'svSdh:manage', 'svSdh:write', 'svSdh:delete', 'svSdh:export', 'svSdh:import', 'studentSdh:login',
            // khungDaoTao
            'sdhCauTrucKhungDaoTao:write', 'sdhCauTrucKhungDaoTao:delete', 'sdhCauTrucKhungDaoTao:manage',
            // sdhChungChiNgoaiNgu
            'sdhChungChiNgoaiNgu:read', 'sdhChungChiNgoaiNgu:write', 'sdhChungChiNgoaiNgu:delete',
            // sdhChuongTrinhDaoTao
            'sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:delete',
            // dtDangKyHocPhan
            'sdhDangKyHocPhan:write', 'sdhDangKyHocPhan:delete', 'sdhDangKyHocPhan:manage', 'sdhDangKyHocPhan:import', 'sdhDangKyHocPhan:export',
            // dtConfigDiem
            'sdhDiemConfig:manage', 'sdhDiemConfig:write', 'sdhDiemConfig:delete', 'sdhDiemConfig:read',
            // dtDiemDacBiet
            'sdhDiemDacBiet:manage', 'sdhDiemDacBiet:write', 'sdhDiemDacBiet:read',
            // diemXepLoai
            'sdhDiemXepLoai:manage', 'sdhDiemXepLoai:write', 'sdhDiemXepLoai:read',
            // dtDiemThangDiem
            'sdhDiemThangDiem:manage', 'sdhDiemThangDiem:write', 'sdhDiemThangDiem:read', 'sdhDiemThangDiem:delete',
            // dtDiemDmCaHoc
            'sdhDmCaHoc:read', 'sdhDmCaHoc:write', 'sdhDmCaHoc:delete',
            // dmGiangvienHd
            'sdhDmGiangVienHd:manage', 'sdhDmGiangVienHd:write', 'sdhDmGiangVienHd:delete',
            // dmKhoiKienThuc
            'sdhDmKhoiKienThuc:write', 'sdhDmKhoiKienThuc:delete', 'sdhDmKhoiKienThuc:manage',
            // dmLoaiDiem
            'sdhDmLoaiDiem:manage', 'sdhDmLoaiDiem:write', 'sdhDmLoaiDiem:delete',
            // dmLoaiMonHoc
            'dmMonHocSdhMoi:manage', 'dmMonHocSdhMoi:write', 'dmMonHocSdhMoi:delete',
            // dmQuanLyDeTai
            // 'sdhDmQuanLyDeTai:manage', 'sdhDmQuanLyDeTai:write', 'sdhDmQuanLyDeTai:delete', 'sdhDmQuanLyDeTai:import',
            // 'sdhDmThu:manage', 'sdhDmThu:write', 'sdhDmThu:delete',
            // dmThu
            'sdhDmThu:read',
            // sdhDmTinhTrangDeTai
            'sdhDmTinhTrangDeTai:write', 'sdhDmTinhTrangDeTai:delete', 'sdhDmTinhTrangDeTai:manage',
            // sdhDmTinhTrangDiem
            'sdhDmTinhTrangDiem:manage', 'sdhDmTinhTrangDiem:write', 'sdhDmTinhTrangDiem:delete',
            // sdhDoiTuongUuTien
            'sdhDoiTuongUuTien:read', 'sdhDoiTuongUuTien:write', 'sdhDoiTuongUuTien:delete',
            // sdhDmDotDangKy
            'sdhDmDotDangKy:write', 'sdhDmDotDangKy:delete', 'sdhDmDotDangKy:manage',
            'sdhKyLuat:read', 'sdhKyLuat:write', 'sdhKyLuat:delete',
            'sdhKhoaDaoTao:read', 'sdhKhoaDaoTao:write', 'sdhKhoaDaoTao:delete',
            // sdhLoaiMonThi
            'sdhLoaiMonThi:read', 'sdhLoaiMonThi:write', 'sdhLoaiMonThi:delete',
            //sdhMonThiTuyenSinh
            'sdhMonThiTuyenSinh:read', 'sdhMonThiTuyenSinh:write', 'sdhMonThiTuyenSinh:delete',
            //sdhTsDanhPhach
            'sdhTsDanhPhach:export', 'sdhTsDanhPhach:write', 'sdhTsDanhPhach:manage',
            //sdhTsDashboard
            'sdhTsDashboard:manage',
            //sdhTsDotPhucTra
            'sdhTsDotPhucTra:manage',
            //sdhTsQuanLyDotPhucTra
            'sdhTsQuanLyPhucTra:manage', 'sdhTsQuanLyPhucTra:read', 'sdhTsQuanLyPhucTra:write', 'sdhTsQuanLyPhucTra:delete',
            //sdhTsDmBieuMau
            'sdhTsDmBieuMau:read', 'sdhTsDmBieuMau:write', 'sdhTsDmBieuMau:delete', 'sdhTsDmBieuMau:download', 'sdhTsDmBieuMau:upload',
            //thiSinhMode
            'sdhTsThiSinhMode:read',
            //sdhSemester
            'sdhSemester:read', 'sdhSemester:write', 'sdhSemester:delete',
            //sdhDiemHistory
            'sdhDiemHistory:read', 'sdhDiemHistory:write', 'sdhDiemHistory:delete', 'sdhDiemHistory:manage',
            //dtDmBuoiHoc
            'sdhDmBuoiHoc:read',
            //sdhLopHocVien
            'sdhLopHocVien:read', 'sdhLopHocVien:write', 'sdhLopHocVien:delete',
            //sdhLoaiHocVien
            'sdhLoaiHocVien:manage', 'sdhLoaiHocVien:write', 'sdhLoaiHocVien:delete',
            //sdhLoaiQuyetDinh
            'sdhLoaiQuyetDinh:manage', 'sdhLoaiQuyetDinh:write', 'sdhLoaiQuyetDinh:delete',
            //sdhTuDienDuLieu
            'sdhTuDienDuLieu:manage',
            //sdhPhong ,sdhCoSo ,sdhToaNha
            'sdhPhong:read', 'sdhCoSo:read', 'sdhToaNha:read',
            //sdhNgayLe , 'cahoc'  'chuanDauRa'
            'sdhNgayLe:read', 'sdhCaHoc:read', 'sdhDmThoiGianDaoTao:read',
            'sdhTsThiSinhMoPhong:read'
        ];

    app.assignRoleHooks.addRoles(quanLySdh, { id: sdhPermission, text: 'Quản lý sau đại học: Sau đại học' });

    app.assignRoleHooks.addHook(quanLySdh, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        // Tạm cấp quyền chị Trâm, Hạnh
        if (req.query.nhomRole && req.query.nhomRole === quanLySdh && (req.session.user.email == 'leminhtram@hcmussh.edu.vn' || req.session.user.email == 'huyhanh@hcmussh.edu.vn')) {
            const assignRolesList = app.assignRoleHooks.get(quanLySdh).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
        // End Tạm cấp quyền chị Trâm, Hạnh
        if (req.query.nhomRole && req.query.nhomRole === quanLySdh && userPermissions.includes('manager:login')) {
            const assignRolesList = app.assignRoleHooks.get(quanLySdh).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'addRoleQuanLySauDaiHoc', (user, staff) => new Promise(resolve => {
        // Tạm cấp quyền chị Trâm, Hạnh
        if (user.email == 'leminhtram@hcmussh.edu.vn' || user.email == 'huyhanh@hcmussh.edu.vn') {
            app.permissionHooks.pushUserPermission(user, ...permission, sdhPermission);
        }
        // End Tạm cấp quyền chị Trâm, Hạnh
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '80') {
            app.permissionHooks.pushUserPermission(user, ...permission, sdhPermission);
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLySauDaiHoc', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == quanLySdh);
        inScopeRoles.forEach(role => {
            if (role.tenRole == sdhPermission && user.permissions.includes('staff:login')) {
                app.permissionHooks.pushUserPermission(user, ...permission, sdhPermission);

            }
        });
        resolve();
    }));
};