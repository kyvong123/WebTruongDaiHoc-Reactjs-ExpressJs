module.exports = app => {
    const quanLyDaoTao = 'quanLyDaoTao', daoTaoPermission = 'quanLyDaoTao:DaiHoc',
        permission = [
            // MenuPage
            'dtDictionary:manage', 'dtEduProgram:manage', 'dtSchedule:manage', 'dtGrade:manage', 'dtTuyenSinh:manage', 'dtLuongGiangDay:manage',
            // addRolesCaHoc
            'dtCaHoc:read', 'dmCaHoc:write', 'dmCaHoc:delete',
            // addRoleDmChucVu === addRolesDtMonHoc
            // 'dmMonHoc:read', 'dmMonHoc:write', 'dmMonHoc:delete', 'dmMonHoc:upload',
            // addRoleCoSo
            'dmCoSo:write', 'dtCoSo:read', 'dmCoSo:delete',
            // addRolesDmNgayLe
            'dtNgayLe:read', 'dmNgayLe:write', 'dmNgayLe:delete',
            // addRolesPhong
            'dtPhong:read', 'dmPhong:write', 'dmPhong:delete', 'dtLichEvent:manage',
            // addRolesBacDaoTao
            'dtSvBacDaoTao:read',
            // addRolesKhuVucTs
            'dtSvKhuVucTuyenSinh:read',
            // addRolesLoaiHinhDaoTao
            'dtSvLoaiHinhDaoTao:read', 'dmSvLoaiHinhDaoTao:write',
            // addRolesToaNha
            'dtToaNha:read', 'dmToaNha:write', 'dmToaNha:delete',
            // addRolesDtKhoiKienThuc
            'dmKhoiKienThuc:read', 'dmKhoiKienThuc:write', 'dmKhoiKienThuc:delete',
            // addRolesDtMonHoc
            'dmMonHoc:read', 'dmMonHoc:write', 'dmMonHoc:delete', 'dmMonHoc:upload', 'dmMonHoc:download',
            // addRoleDtCanBoNgoaiTruong
            'dtCanBoNgoaiTruong:manage', 'dtCanBoNgoaiTruong:read', 'dtCanBoNgoaiTruong:write', 'dtCanBoNgoaiTruong:delete', 'dtCanBoNgoaiTruong:export',
            // addRoleDtCauHinhDiem
            'dtCauHinhDiem:write', 'dtCauHinhDiem:read',
            // addRolesDtCauHinhDotDkhp
            'dtCauHinhDotDkhp:manage', 'dtCauHinhDotDkhp:write', 'dtCauHinhDotDkhp:delete', 'dtCauHinhDotDkhp:active',
            // addRolesDtCauTrucKhungDaoTao
            'dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:write', 'dtCauTrucKhungDaoTao:delete',
            // addRolesDtChuanDauRa
            'dtChuanDauRa:read', 'dtChuanDauRa:write', 'dtChuanDauRa:delete',
            // addRolesDtChuongTrinhDaoTao
            'dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:delete', 'dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:import', 'dtChuongTrinhDaoTao:export',
            // addRolesDtDangKyHocPhan
            'dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export',
            // addRolesDtDaoTaoDashBoard
            'dtDaoTaoDashBoard:manage',
            // addRolesDtDiem
            'dtDiem:manage', 'dtDiem:write', 'dtDiem:delete', 'dtDiem:export',
            // addRolesDtDiemFolder
            'dtDiemFolderScan:read', 'dtDiemFolderScan:write', 'dtDiemFolderScan:delete', 'dtDiemScan:manage',
            // addRoleDtDiemAll
            'dtDiemAll:read', 'dtDiemAll:write', 'dtDiemAll:delete', 'dtDiemAll:export',
            // addRoleDtDiemConfig
            'dtDiemConfig:write', 'dtDiemConfig:read', 'dtDiemConfig:delete', 'dtDiem:data',
            // addRoledtDiemConfigChuyen
            'dtDiemConfigChuyen:write', 'dtDiemConfigChuyen:read', 'dtDiemConfigChuyen:delete',
            // addRolesDtDiemDacBiet
            'dtDiemDacBiet:manage', 'dtDiemDacBiet:write', 'dtDiemDacBiet:read',
            // addRolesDtDiemDmHeDiem
            'dtDiemDmHeDiem:manage', 'dtDiemDmHeDiem:write', 'dtDiemDmHeDiem:delete',
            // addRolesdtDiemDmLoaiDiem
            'dtDiemDmLoaiDiem:manage', 'dtDiemDmLoaiDiem:write', 'dtDiemDmLoaiDiem:read',
            // addRolesdtDiemDmTinhTrang
            'dtDiemDmTinhTrang:manage', 'dtDiemDmTinhTrang:write', 'dtDiemDmTinhTrang:delete',
            // addRolesdtDiemDmXepLoai
            'dtDiemDmXepLoai:manage', 'dtDiemDmXepLoai:write', 'dtDiemDmXepLoai:read',
            // addRoleDtDiemHistory
            'dtDiemHistory:read', 'dtDiemHistory:write', 'dtDiemHistory:delete', 'dtDiemHistory:export',
            // addRolesDtDiemInBangDiem
            'dtDiemInBangDiem:manage', 'dtDiemInBangDiem:write', 'dtDiemInBangDiem:delete', 'dtDiemInBangDiem:export',
            // diem Mien
            'dtDiemMien:write',
            // diem hoan
            'dtDiemHoan:write',
            // verify code
            'dtDiemVerifyCode:manage',
            // addRolesDtDmBuoiHoc
            'dtDmBuoiHoc:manage', 'dtDmBuoiHoc:write',
            // addRolesDtDmDonGiaGiangDay
            'dtDmDonGiaGiangDay:manage', 'dtDmDonGiaGiangDay:write', 'dtDmDonGiaGiangDay:delete',
            // addRolesDtDmDotTrungTuyen
            'dtDmDotTrungTuyen:manage', 'dtDmDotTrungTuyen:write', 'dtDmDotTrungTuyen:delete',
            // addRolesDtDmHeSoChatLuong
            'dtDmHeSoChatLuong:manage', 'dtDmHeSoChatLuong:write', 'dtDmHeSoChatLuong:delete',
            // addRolesDtDmHeSoKhoiLuong
            'dtDmHeSoKhoiLuong:manage', 'dtDmHeSoKhoiLuong:write', 'dtDmHeSoKhoiLuong:delete',
            // addRolesDtDmHinhThucThi
            'dtDmHinhThucThi:manage', 'dtDmHinhThucThi:write', 'dtDmHinhThucThi:delete',
            // addRolesDtDmHocKy
            'dtDmHocKy:manage', 'dtDmHocKy:write', 'dtDmHocKy:delete',
            // addRolesDtDmMonHocKhongTinhPhi
            'dtDmMonHocKhongTinhPhi:manage', 'dtDmMonHocKhongTinhPhi:write', 'dtDmMonHocKhongTinhPhi:delete',
            // addRolesdtDmMonHocKhongTinhTb
            'dtDmMonHocKhongTinhTb:manage', 'dtDmMonHocKhongTinhTb:write', 'dtDmMonHocKhongTinhTb:delete',
            // addRolesDtThoiGian
            'dtDmThoiGianDaoTao:read', 'dtDmThoiGianDaoTao:write', 'dtDmThoiGianDaoTao:delete',
            // addRolesDtDmThu
            'dtDmThu:manage', 'dtDmThu:write', 'dtDmThu:delete',
            // addRolesDtExam
            'dtExam:manage', 'dtExam:write', 'dtExam:delete', 'dtExam:import', 'dtExam:export',
            // addRolesDtKeHoachDaoTao
            'dtKeHoachDaoTao:read', 'dtKeHoachDaoTao:write', 'dtKeHoachDaoTao:delete',
            // addRoleKhoaDaoTao
            'dtKhoaDaoTao:read', 'dtKhoaDaoTao:write',
            // addRolesDtKiemTraMaLoaiDangKy
            'dtKiemTraMaLoaiDangKy:manage', 'dtKiemTraMaLoaiDangKy:write', 'dtKiemTraMaLoaiDangKy:delete',
            // addRolesDtLichEvent
            'dtLichEvent:manage', 'dtLichEvent:write', 'dtLichEvent:delete', 'dtLichEvent:export',
            // addRoleDtLichSuDkhp
            'dtLichSuDkhp:manage', 'dtLichSuDkhp:write', 'dtLichSuDkhp:delete', 'dtLichSuDkhp:export',
            // addRolesDtThuLaoGiangDay
            'dtThuLaoGiangDay:manage', 'dtThuLaoGiangDay:write', 'dtThuLaoGiangDay:delete',
            // addRolesDtDataDictionary == menuPage
            // 'dtTuyenSinh:manage', 'dtDictionary:manage', 'dtEduProgram:manage', 'dtSchedule:manage', 'dtDiem:manage', 'dtLuongGiangDay:manage',
            // addRolesDtMoPhongDangKy
            'dtMoPhongDangKy:manage', 'dtMoPhongDangKy:delete', 'dtMoPhongDangKy:write', 'dtMoPhongDangKy:read',
            // addRolesDtNganhDaoTao
            'dtNganhDaoTao:read', 'dtNganhDaoTao:write',
            // addRolesDtNganhToHop
            'dtNganhToHop:read', 'dtNganhToHop:write', 'dtNganhToHop:delete',
            // addRolesDtNgoaiNgu
            'dtNgoaiNgu:manage', 'dtNgoaiNgu:write', 'dtNgoaiNgu:delete',
            // addRolesDtQuanLyHocPhan
            'dtQuanLyHocPhan:manage', 'dtQuanLyHocPhan:delete', 'dtQuanLyHocPhan:write',
            // addRolesDtQuanLyNghiBu
            'dtThoiKhoaBieu:nghiBu',
            // addRolesDtQuanLyQuyetDinh
            'dtQuanLyQuyetDinh:manage', 'dtQuanLyQuyetDinh:write', 'dtQuanLyQuyetDinh:delete',
            // addRoleDtSemester
            'dtSemester:write', 'dtSemester:read', 'dtDiemSemester:read', 'dtDiemSemester:write', 'dtDiemSemester:delete',
            // addRoleDtSettings
            'dtSettings:manage', 'dtSettings:write',
            // addRolesDtThoiGianMoMon
            'dtThoiGianMoMon:write', 'dtThoiGianMoMon:delete',
            // addRolesDtThoiGianPhanCong
            'dtThoiGianPhanCong:write', 'dtThoiGianPhanCong:delete',
            // addRolesDtThoiKhoaBieu
            'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:delete', 'dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:import', 'dtDmTinhTrangHocPhan:manage', 'dtThoiKhoaBieu:thongKe',
            // addRolesDtThongKe
            'dtThongKe:manage', 'dtThongKe:export',
            // addRolesDtThongKeDiem
            'dtThongKeDiem:manage', 'dtThongKeDiem:export', 'dtThongKeDiem:avr',
            // addRolesDtThongKeDkhp
            'dtThongKeDkhp:manage', 'dtThongKeDkhp:read', 'dtThongKeDkhp:export',
            // addRoleDtLop
            'dtLop:read', 'dtLop:write',
            // certificate
            'dtChungChiSinhVien:manage', 'dtChungChiSinhVien:write', 'dtChungChiSinhVien:export',
            // addRolesDtDmChungChiNgoaiNgu
            'dtCertificate:manage', 'dtDmChungChiNgoaiNgu:manage', 'dtDmChungChiNgoaiNgu:write', 'dtDmChungChiNgoaiNgu:delete',
            // addRolesDtDmCefr
            'dtDmCefr:manage', 'dtDmCefr:write', 'dtDmCefr:delete',
            // addRolesDtDmNgoaiNgu
            'dtDmNgoaiNgu:read', 'dtDmNgoaiNgu:write', 'dtDmNgoaiNgu:delete',
            // addRolesDtXetTotNgiep
            'dtDanhSachXetTotNghiep:manage', 'dtDanhSachXetTotNghiep:write', 'dtDanhSachXetTotNghiep:delete',
            // addRolesDtDmChungChiTinHoc
            'dtDmChungChiTinHoc:read', 'dtDmChungChiTinHoc:write', 'dtDmChungChiTinHoc:delete', 'dtDmChungChiTinHoc:manage',
            // addRolesDtChungChiTinHocSinhVien
            'dtChungChiTinHocSinhVien:manage', 'dtChungChiTinHocSinhVien:read', 'dtChungChiTinHocSinhVien:write', 'dtChungChiTinHocSinhVien:delete', 'dtChungChiTinHocSinhVien:export',
            // DmLoaiChungChi
            'dtDmLoaiChungChi:manage', 'dtDmLoaiChungChi:write', 'dtDmLoaiChungChi:delete',
            // Graduation
            'dtGraduation:manage',
            // dtDanhSachXetTotNghiep
            'dtCauHinhDotXetTotNghiep:manage', 'dtCauHinhDotXetTotNghiep:write', 'dtCauHinhDotXetTotNghiep:delete',
            // AssignRoleNhapDiem
            'dtAssignRoleNhapDiem:manage',
            // MonTuongDuong
            'dtMonTuongDuong:manage',
            // dtInstruction
            'dtInstruction:manage',
            // dtSvChuongTrinhDaoTao
            'dtSvCtdt:manage',
            // dtDmTruongBoMon
            'dtDmTruongBoMon:manage',
            // dtTinhTrangDiem
            'dtTinhTrangDiem:manage',
            'staff:teacher',
            'dtDanhSachSinhVien:manage',
            // dtNgoaiNguKhongChuyen
            'dtNgoaiNguKhongChuyen:manage',
            'dtNgoaiNguKhongChuyen:write',
            'dtNgoaiNguKhongChuyen:delete',
            'dtThoiKhoaBieu:lichPhong',
            // dmTinhTrangPhong
            'dmTinhTrangPhong:manage',
            'dmTinhTrangPhong:write',
            'dmTinhTrangPhong:delete',
            'dtKetQuaTotNghiep:manage',
        ];

    app.assignRoleHooks.addRoles(quanLyDaoTao, { id: daoTaoPermission, text: 'Quản lý đào tạo: Đại học' });

    app.assignRoleHooks.addHook(quanLyDaoTao, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === quanLyDaoTao && userPermissions.includes('manager:login')) {
            const assignRolesList = app.assignRoleHooks.get(quanLyDaoTao).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'addRoleQuanLyDaoTao', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '80') {
            app.permissionHooks.pushUserPermission(user, ...permission, daoTaoPermission);
        }
        if (staff.maDonVi && staff.maDonVi == '80') {
            app.permissionHooks.pushUserPermission(user, 'quanLyDaoTao:login');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyDaoTao', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == quanLyDaoTao);
        inScopeRoles.forEach(role => {
            if (role.tenRole == daoTaoPermission && user.permissions.includes('staff:login')) {
                app.permissionHooks.pushUserPermission(user, ...permission, daoTaoPermission);
            }
        });
        resolve();
    }));
};