module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7610: { title: 'Phân quyền cán bộ', link: '/user/sau-dai-hoc/tuyen-sinh/assign-role', parentKey: 7544, groupIndex: 1, icon: 'fa-briefcase', backgroundColor: '#CFFF8D', color: 'black' },
        },
    }, permission = [
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
        // addRolesDtTrongSoDiem
        'sdhTrongSoDiem:manage', 'sdhTrongSoDiem:write', 'sdhTrongSoDiem:delete',
        // addRolesDtTinhTrangHocPhan
        'sdhTinhTrangHocPhan:delete', 'sdhTinhTrangHocPhan:write', 'sdhTinhTrangHocPhan:manage',
        // dmDot
        // 'sdhDmDotTuyenSinh:manage', 'sdhDmDotTuyenSinh:read',
        // dtThoiKhoaBieu
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
        'sdhDmQuanLyDeTai:manage', 'sdhDmQuanLyDeTai:write', 'sdhDmQuanLyDeTai:delete', 'sdhDmQuanLyDeTai:import',
        // dmThu
        'sdhDmThu:manage', 'sdhDmThu:write', 'sdhDmThu:delete',
        // sdhDmTinhTrangDeTai
        'sdhDmTinhTrangDeTai:write', 'sdhDmTinhTrangDeTai:delete', 'sdhDmTinhTrangDeTai:manage',
        // sdhDmTinhTrangDiem
        'sdhDmTinhTrangDiem:manage', 'sdhDmTinhTrangDiem:write', 'sdhDmTinhTrangDiem:delete',
        // sdhDoiTuongUuTien
        'sdhDoiTuongUuTien:read', 'sdhDoiTuongUuTien:write', 'sdhDoiTuongUuTien:delete',
        // sdhDmDotDangKy
        'sdhDmDotDangKy:write', 'sdhDmDotDangKy:delete', 'sdhDmDotDangKy:manage',
        // sdhKyLuat:read', 'sdhKyLuat:write', 'sdhKyLuat:delete
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
        'sdhTsThiSinhMoPhong:read'
    ];
    app.permission.add(
        { name: 'sdhTsAssignRole:manage', menu },
    );

    app.assignRoleHooks.addRoles('quanLyTsSdh', { id: 'quanLyTsSdh:assignRole', text: 'Quản lý tuyển sinh sau đại học: Phân quyền' });

    app.get('/user/sau-dai-hoc/tuyen-sinh/assign-role', app.permission.check('sdhTsAssignRole:manage'), app.templates.admin);

    app.permissionHooks.add('assignRole', 'checkRoleSdhTsAssignRole', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'quanLyTsSdh');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'quanLyTsSdh:assignRole' && user.permissions.includes('staff:login')) {
                app.permissionHooks.pushUserPermission(user, 'sdhTsAssignRole:manage');
            }
        });
        const inScopeRolesStaff = assignRoles.filter(role => role.nhomRole == 'tuyenSinhSdh');
        inScopeRolesStaff.forEach(role => {
            if (user.permissions.includes('staff:login')) {
                const [ten, quyen] = role.tenRole.split(':');
                if (quyen == 'manage') {
                    const nhomQuyen = ['read', 'write', 'import', 'export'].filter(item => permission.includes(`${ten}:${item}`)).map(item => `${ten}:${item}`);
                    app.permissionHooks.pushUserPermission(user, ...nhomQuyen);
                }
                if (user.shcc == role.nguoiDuocGan && !user.permissions.includes(role.tenRole)) {
                    app.permissionHooks.pushUserPermission(user, role.tenRole, 'sdhEnrollment:manage', 'sdhDmDotTuyenSinh:read');
                }
            }
        });
        resolve();
    }));

    app.get('/api/sdh/ts/assign-role/all', app.permission.check('sdhTsAssignRole:manage'), async (req, res) => {
        try {
            const mapperRole = {
                'sdhDsTs:manage': 'Quản lý hồ sơ',//toàn quyền bao gồm đánh số báo danh
                'sdhDsTs:read': 'Xem hồ sơ',// chỉ xem hồ sơ
                'sdhDsTs:write': 'Nhập hồ sơ',// chỉ nhập/điều chỉnh hồ sơ
                'sdhDsTs:delete': 'Xóa hồ sơ',// chỉ xóa hồ sơ
                'sdhDsTs:export': 'In hồ sơ',
                'sdhDsTs:adminManage': 'Admin quản lý hồ sơ SBD',
                'sdhTuyenSinhLichThi:manage': 'Quản lý lịch thi',
                'sdhTuyenSinhLichThi:read': 'Xem lịch thi',
                'sdhTuyenSinhLichThi:write': 'Chỉnh sửa lịch thi',
                'sdhTuyenSinhLichThi:export': 'In lịch thi', //bao gồm dán phòng ký tên
                'sdhTsKyLuat:manage': 'Quản lý kỷ luật',
                'sdhTsKyLuat:read': 'Xem trạng thái kỷ luật',
                'sdhTsKyLuat:write': 'Chỉnh sửa kỷ luật',
                'sdhTsDanhPhach:manage': 'Đánh phách',
                'sdhTsDanhPhach:export': 'In biểu mẫu phách',
                'sdhTsXetTrungTuyen:manage': 'Xét trúng tuyển',
                'sdhTsKetQuaThi:manage': 'Quản lý điểm',
                'sdhTsKetQuaThi:write': 'Nhập điểm thi',
                'sdhTsKetQuaThi:read': 'Xem điểm thi',
                'sdhTsQuanLyPhucTra:manage': 'Quản lý đơn phúc tra',
                'sdhTsDashboard:manage': 'Dashboard',
                'sdhTsThongKe:manage': 'Thống kê',
                'sdhHinhThucTuyenSinh:read': 'Xem hình thức tuyển sinh',
                'sdhTsThiSinhMoPhong:read': 'Mô phỏng thí sinh'
            };

            let [listUser, items] = await Promise.all([
                app.model.sdhTsAssignRole.getTTCB(''),
                app.model.sdhTsNhomRole.getAll(),
            ]);
            items = items.map(item => {
                let tenRole = item.role.split(',');
                tenRole = [...new Set(tenRole)];
                tenRole = tenRole.map(i => mapperRole[i]);
                return { ...item, tenRole: tenRole.join(', '), role: [...new Set(item.role.split(','))] };
            });
            res.send({ items, listUser: listUser.rows });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/assign-role/staff/item/:shcc', app.permission.check('sdhTsAssignRole:manage'), async (req, res) => {
        try {
            let canBo = await app.model.tchcCanBo.get({ shcc: req.params.shcc });
            const { shcc, ho, ten, email } = canBo || { ho: '### ', ten: '### ', email: '### ' };

            res.send({ item: { shcc, ho, ten, email } });
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/list-assign-role', app.permission.check('sdhTsAssignRole:manage'), async (req, res) => {
        try {
            let items = [
                { id: 'sdhDsTs:manage', text: 'Quản lý hồ sơ', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhDsTs:adminManage', text: 'Quản lý SBD hồ sơ', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhDsTs:read', text: 'Xem hồ sơ', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhDsTs:write', text: 'Nhập hồ sơ', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhDsTs:delete', text: 'Xoá hồ sơ', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhDsTs:export', text: 'In hồ sơ', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTuyenSinhLichThi:manage', text: 'Quản lý lịch thi', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTuyenSinhLichThi:read', text: 'Xem lịch thi', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTuyenSinhLichThi:write', text: 'Chỉnh sửa lịch thi', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTuyenSinhLichThi:export', text: 'In lịch thi', nhomRole: 'tuyenSinhSdh' },//bao gồm dán phòng, ký tên
                { id: 'sdhTsKyLuat:manage', text: 'Quản lý kỷ luật', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsKyLuat:read', text: 'Xem trạng thái kỷ luật', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsKyLuat:write', text: 'Chỉnh sửa kỷ luật', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsDanhPhach:manage', text: 'Quản lý đánh phách', nhomRole: 'tuyenSinhSdh' },//bao gồm đánh phách, in  ko tách nhỏ
                { id: 'sdhTsXetTrungTuyen:manage', text: 'Xét trúng tuyển', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsKetQuaThi:manage', text: 'Quản lý điểm', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsKetQuaThi:write', text: 'Nhập điểm thi', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsKetQuaThi:read', text: 'Xem điểm thi', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsQuanLyPhucTra:manage', text: 'Quản lý đơn phúc tra', nhomRole: 'tuyenSinhSdh' }, //duyệt đơn, xử lý đơn, nhập điểm phúc tra
                { id: 'sdhTsDashboard:manage', text: 'Dashboard', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsThongKe:manage', text: 'Thống kê', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhHinhThucTuyenSinh:read', text: 'Xem hình thức tuyển sinh', nhomRole: 'tuyenSinhSdh' },
                { id: 'sdhTsThiSinhMoPhong:read', text: 'Mô phỏng thí sinh', nhomRole: 'tuyenSinhSdh' },
            ];
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts/assign-role/item', app.permission.check('sdhTsAssignRole:manage'), async (req, res) => {
        try {
            const { nhomUser } = req.body;
            let data = req.body.data;
            const { listRole = [], shccCanBo = [], ngayKetThuc } = data;
            const role = listRole.map(i => i.role).join(',');
            const nhomRoleFw = listRole.map(i => i.nhomRole)[0];
            data = { ...data, timeModified: Date.now(), modifier: req.session.user.email, role, ngayBatDau: data.ngayBatDau ? data.ngayBatDau : Date.now() };
            const nhomRole = await app.model.sdhTsNhomRole.create(data);
            for (const i of shccCanBo) {
                await app.model.sdhTsAssignRole.create({ shcc: i, idNhomRole: nhomRole.id });
            }
            for (const i of nhomUser) {
                app.model.fwAssignRole.create({ nguoiDuocGan: i.shcc, nguoiGan: req.session.user.shcc, tenRole: i.role, nhomRole: nhomRoleFw, ngayBatDau: Date.now(), ngayKetThuc, nhomRoleId: nhomRole.id });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/assign-role/item', app.permission.check('sdhTsAssignRole:manage'), async (req, res) => {
        try {
            const { data, changes } = req.body,
                { id, nhomUser } = data,
                { tenNhomRole = '', shccCanBo = '', ngayKetThuc = '', ngayBatDau = '', listRole = [], idDot = '' } = changes;
            const role = listRole.map(i => i.role).join(',');
            const nhomRoleFw = listRole.map(i => i.nhomRole)[0];
            await app.model.sdhTsAssignRole.delete({ idNhomRole: id });
            await app.model.fwAssignRole.delete({ idNhomRole: id, nhomRole: nhomRoleFw });
            const nhomRole = await app.model.sdhTsNhomRole.update({ id }, { tenNhomRole, role, idDot, ngayBatDau, ngayKetThuc, modifier: req.session.user.email, timeModified: Date.now() });
            for (const i of shccCanBo) {
                await app.model.sdhTsAssignRole.create({ shcc: i, idNhomRole: nhomRole.id });
            }
            for (const i of nhomUser) {
                await app.model.fwAssignRole.create({ nguoiDuocGan: i.shcc, nguoiGan: req.session.user.shcc, tenRole: i.role, nhomRole: nhomRoleFw, ngayBatDau: ngayBatDau || Date.now(), ngayKetThuc, nhomRoleId: id });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/assign-role/staff/page/:pageNumber/:pageSize', app.permission.orCheck('sdhTsAssignRole:manage', 'staff:login'), async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize, pagetotal: pageTotal, pagenumber, rows: list } = await app.model.sdhTsAssignRole.canBoSearchPage(pageNumber, pageSize, '', searchTerm);
            res.send({ page: { totalItem, pageSize: pagesize, pageTotal, pageNumber: pagenumber, pageCondition: '', list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/ts/assign-role/item', app.permission.check('sdhTsAssignRole:manage'), async (req, res) => {
        try {
            const { id } = req.body;
            let { role: tenRole } = await app.model.sdhTsNhomRole.get({ id });
            tenRole = tenRole.split(',');
            await Promise.all([app.model.sdhTsAssignRole.delete({ idNhomRole: id }), app.model.sdhTsNhomRole.delete({ id })]);
            await app.model.fwAssignRole.delete({ statement: 'tenRole in (:tenRole)', parameter: { tenRole } });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

};