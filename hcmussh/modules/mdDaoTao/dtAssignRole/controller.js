module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7061: { title: 'Phân quyền cán bộ', link: '/user/dao-tao/assign-role', groupIndex: 1, icon: 'fa-briefcase', backgroundColor: '#CFFF8D', color: 'black' },
        },
    };
    app.permission.add(
        { name: 'dtAssignRole:manage', menu },
    );

    app.assignRoleHooks.addRoles('quanLyDaoTao', { id: 'quanLyDaoTao:assignRole', text: 'Quản lý đào tạo: Phân quyền' });

    app.get('/user/dao-tao/assign-role', app.permission.check('dtAssignRole:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleAssignRole', (user, staff) => new Promise(resolve => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '80') {
            app.permissionHooks.pushUserPermission(user, 'dtAssignRole:manage');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleDtAssignRole', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'quanLyDaoTao');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'quanLyDaoTao:assignRole' && user.permissions.includes('staff:login')) {
                app.permissionHooks.pushUserPermission(user, 'dtAssignRole:manage', 'dtInstruction:manage');
            }
        });
        resolve();
    }));

    app.get('/api/dt/assign-role/all', app.permission.check('dtAssignRole:manage'), async (req, res) => {
        try {
            const mapperRole = {
                'dtDaoTaoDashBoard:manage': 'Quản lý Dashboard tổng',
                'dtSettings:manage': 'Quản lý cấu hình',
                'dtDiemConfig:manage': 'Quản lý cấu hình điểm',
                'dtNganhDaoTao:manage': 'Quản lý ngành - chuyên ngành',
                'dtNganhDaoTao:read': 'Xem danh sách ngành - chuyên ngành',
                'dmMonHoc:manage': 'Quản lý môn học',
                'dmMonHoc:read': 'Xem danh sách môn học',
                'dtQuanLyQuyetDinh:manage': 'Quản lý quyết định',
                'dtDictionary:manage': 'Quản lý từ điển dữ liệu',
                'dtLuongGiangDay:manage': 'Quản lý thù lao giảng dạy',
                'dtCanBoNgoaiTruong:manage': 'Quản lý cán bộ ngoài trường',
                'dtQuanLyHocPhan:manage': 'Quản lý danh sách sinh viên',
                'dtLop:manage': 'Quản lý lớp',
                'dtEduProgram:manage': 'Quản lý chương trình đào tạo',
                'dtEduProgram:read': 'Xem chương trình đào tạo',
                'dtEduProgram:write': 'Chỉnh sửa chương trình đào tạo',
                'dtMoPhongDangKy:manage': 'Mô phỏng sinh viên',
                'dtKiemTraMaLoaiDangKy:manage': 'Kiểm tra mã loại đăng ký',
                'dtLichSuDkhp:manage': 'Lịch sử đăng ký học phần',
                'dtDiemHistory:manage': 'Lịch sử nhập điểm',
                'dtInPhieuDiem:manage': 'Quản lý in phiếu điểm',
                'dtLichEvent:manage': 'Quản lý sự kiện',
                'dtDiemSinhVien:manage': 'Quản lý điểm sinh viên',
                'dtDiemMien:manage': 'Quản lý điểm miễn',
                'dtDiemHoan:manage': 'Quản lý điểm hoãn',
                'dtDiemScan:manage': 'Quản lý điểm scan',
                'dtTinhTrangDiem:manage': 'Quản lý tình trạng nhập điểm',
                'dtDiemNhapDiem:manage': 'Quản lý nhập điểm',
                'dtBangDiem:manage': 'Quản lý bảng điểm',
                'dtExam:manage': 'Quản lý lịch thi',
                'dtExam:read': 'Xem lịch thi',
                'dtCauHinhDotDkhp:manage': 'Cấu hình đợt đăng ký',
                'dtThongKeDiem:manage': 'Thống kê điểm',
                'dtThongKeDiem:avr': 'Thống kê điểm trung bình',
                'dtThongKeDKHP:manage': 'Thống kê đăng ký học phần',
                'dtThongKeChung:manage': 'Thống kê',
                'dtDangKyHocPhan:manage': 'Quản lý đăng ký học phần',
                'dtDangKyHocPhan:lop': 'Đăng ký học phần theo lớp',
                'dtDangKyHocPhan:sinhVien': 'Đăng ký học phần theo sinh viên',
                'dtDangKyHocPhan:import': 'Import đăng ký học phần',
                'dtDangKyHocPhan:huyImport': 'Import hủy đăng ký học phần',
                'dtDangKyHocPhan:huyChuyen': 'Hủy/Chuyển đăng ký học phần',
                'dtQuanLyNghiBu:manage': 'Quản lý nghỉ - bù',
                'dtThoiKhoaBieu:manage': 'Quản lý thời khóa biểu',
                'dtThoiKhoaBieu:read': 'Xem thời khóa biểu',
                'dtThoiKhoaBieu:sapXep': 'Sắp xếp thời khóa biểu',
                'dtThoiKhoaBieu:traCuuPhong': 'Tra cứu phòng',
                'dtThoiKhoaBieu:traCuuTKB': 'Tra cứu thời khóa biểu',
                'dtThoiKhoaBieu:export': 'Export thời khóa biểu',
                'dtThoiKhoaBieu:thongKe': 'Thống kê thời khóa biểu',
                'dtThoiKhoaBieu:lichPhong': 'Lịch phòng',
                'dtCertificate:manage': 'Quản lý chứng chỉ',
                'quanLyDaoTao:assignRole': 'Quản lý đào tạo: Phân quyền',
                'quanLyDaoTao:DaiHoc': 'Quản lý đào tạo: Đại học',
                'dtGraduation:manage': 'Xét tốt nghiệp',
                'dtVerifyDiem:manage': 'Xác nhận bảng điểm',
            };

            let { shcc, permissions } = req.session.user;

            if (permissions.includes('quanLyDaoTao:DaiHoc')) shcc = '';

            let [dataAssign, dmDonVi] = await Promise.all([
                app.model.dtAssignRole.searchAll(app.utils.stringify({ shcc, user: req.session.user.shcc })),
                app.model.dmDonVi.getAll({ maPl: 1 }, 'ma,ten', 'ma')
            ]), { rows: items, datauser: listUser } = dataAssign;

            dmDonVi = dmDonVi.reduce((obj, dv) => Object.assign(obj, { [dv.ma]: dv.ten }), {});

            items = items.map(item => {
                let tenRole = item.role.split(','), tenKhoa = item.khoa ? item.khoa.split(',') : [];

                tenRole = [...new Set(tenRole)];
                tenRole = tenRole.map(i => mapperRole[i]);

                tenKhoa = tenKhoa.map(i => dmDonVi[i]);

                return { ...item, tenRole: tenRole.join(', '), role: [...new Set(item.role.split(','))], tenKhoa: tenKhoa.join(',') };
            });
            res.send({ items, listUser });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/assign-role/item', app.permission.orCheck('dtAssignRole:manage', 'dtThongKeDiem:avr'), async (req, res) => {
        try {
            const item = await app.model.dtAssignRole.get({ shcc: req.query.shccCanBo });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/assign-role/item', app.permission.check('dtAssignRole:manage'), async (req, res) => {
        try {
            const data = req.body.data;
            const { shccCanBo, listRole, ngayKetThuc = '', group, khoaSinhVien, loaiHinhDaoTao, khoa = '', nguoiGan } = data;

            if (await app.model.dtAssignRole.get({ nhomUser: group })) throw 'Tên nhóm cán bộ đã tồn tại!';

            for (const shcc of shccCanBo) {
                for (const role of listRole) {
                    await Promise.all([
                        app.model.dtAssignRole.create({ role: role.role, khoaSinhVien, loaiHinhDaoTao, khoa, nhomUser: group, shcc, ngayBatDau: Date.now(), ngayKetThuc, modifier: req.session.user.email, timeModified: Date.now(), nguoiGan: nguoiGan || req.session.user.shcc }),
                        app.model.fwAssignRole.create({ nguoiDuocGan: shcc, nguoiGan: nguoiGan || req.session.user.shcc, tenRole: role.role, nhomRole: role.nhomRole, ngayBatDau: Date.now(), ngayKetThuc }),
                    ]);
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/assign-role/item', app.permission.check('dtAssignRole:manage'), async (req, res) => {
        try {
            const { data, changes } = req.body,
                { shccCanBo, listRole, ngayKetThuc = '', khoaSinhVien, loaiHinhDaoTao, khoa = '', nguoiGan } = changes,
                { group, nhomUser } = data;

            await app.model.dtAssignRole.delete({ nhomUser: group });

            for (let i of nhomUser) {
                if (!(await app.model.dtAssignRole.get({ shcc: i.shccCanBo, role: i.role }))) {
                    await app.model.fwAssignRole.delete({ nguoiDuocGan: i.shccCanBo, tenRole: i.role });
                }
            }

            for (const shcc of shccCanBo) {
                for (const role of listRole) {
                    await Promise.all([
                        app.model.dtAssignRole.create({ role: role.role, khoaSinhVien, loaiHinhDaoTao, khoa, nhomUser: group, shcc, ngayBatDau: Date.now(), ngayKetThuc, modifier: req.session.user.email, timeModified: Date.now(), nguoiGan: nguoiGan || req.session.user.shcc }),
                        app.model.fwAssignRole.create({ nguoiDuocGan: shcc, nguoiGan: nguoiGan || req.session.user.shcc, tenRole: role.role, nhomRole: role.nhomRole, ngayBatDau: Date.now(), ngayKetThuc }),
                    ]);
                }
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/assign-role/item', app.permission.check('dtAssignRole:manage'), async (req, res) => {
        try {
            const { group, nhomUser } = req.body;
            await app.model.dtAssignRole.delete({ nhomUser: group });

            for (let i of nhomUser) {
                if (!(await app.model.dtAssignRole.get({ shcc: i.shcc, role: i.role }))) {
                    await app.model.fwAssignRole.delete({ nguoiDuocGan: i.shcc, tenRole: i.role });
                }
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/assign-role/staff/page/:pageNumber/:pageSize', app.permission.orCheck('dtAssignRole:manage', 'staff:login'), async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter || {}, user = req.session.user;

            if (!(filter.isNhapDiem || Number(user.isPhongDaoTao))) {
                filter.listDonVi = [user.maDonVi].toString();
            }

            if (user.isStaffTest || Number(user.isPhongDaoTao)) filter.isTest = 1;
            const [{ totalitem: totalItem, pagesize, pagetotal: pageTotal, pagenumber, rows: list }, { rows: cbnt }] = await Promise.all([
                app.model.tchcCanBo.searchPage(pageNumber, pageSize, app.utils.stringify(filter), searchTerm),
                app.model.dtCanBoNgoaiTruong.getData(app.utils.stringify({ searchTerm })),
            ]);
            if (Number(user.isPhongDaoTao) && searchTerm) {
                list.push(...cbnt);
            }
            res.send({ page: { totalItem, pageSize: pagesize, pageTotal, pageNumber: pagenumber, pageCondition: '', list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/assign-role/staff/item/:shcc', app.permission.orCheck('dtAssignRole:manage', 'sdhTsAssignRole:manage'), async (req, res) => {
        try {
            let canBo = await app.model.tchcCanBo.get({ shcc: req.params.shcc }) || { maDonVi: '', donVi: '' };
            let donVi = await app.model.dmDonVi.get({ ma: canBo.maDonVi || canBo.donVi });

            res.send({ item: { ...canBo, tenDonVi: donVi ? donVi.ten : '' } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/list-assign-role', app.permission.check('dtAssignRole:manage'), async (req, res) => {
        let items = [
            { id: 'dtDaoTaoDashBoard:manage', text: 'Quản lý Dashboard tổng', nhomRole: 'daoTao' },
            { id: 'dtSettings:manage', text: 'Quản lý cấu hình', nhomRole: 'daoTao' },
            { id: 'dtDiemConfig:manage', text: 'Quản lý cấu hình điểm', nhomRole: 'daoTao' },
            { id: 'dtNganhDaoTao:manage', text: 'Quản lý ngành - chuyên ngành', nhomRole: 'daoTao' },
            { id: 'dtNganhDaoTao:read', text: 'Xem danh sách ngành - chuyên ngành', nhomRole: 'daoTao' },
            { id: 'dmMonHoc:manage', text: 'Quản lý môn học', nhomRole: 'daoTao' },
            { id: 'dmMonHoc:read', text: 'Xem danh sách môn học', nhomRole: 'daoTao' },
            { id: 'dtQuanLyQuyetDinh:manage', text: 'Quản lý quyết định', nhomRole: 'daoTao' },
            { id: 'dtDictionary:manage', text: 'Quản lý từ điển dữ liệu', nhomRole: 'daoTao' },
            { id: 'dtLuongGiangDay:manage', text: 'Quản lý thù lao giảng dạy', nhomRole: 'daoTao' },
            { id: 'dtCanBoNgoaiTruong:manage', text: 'Quản lý cán bộ ngoài trường', nhomRole: 'daoTao' },
            { id: 'dtQuanLyHocPhan:manage', text: 'Quản lý danh sách sinh viên', nhomRole: 'daoTao' },
            { id: 'dtLop:manage', text: 'Quản lý lớp', nhomRole: 'daoTao' },
            { id: 'dtEduProgram:manage', text: 'Quản lý chương trình đào tạo', nhomRole: 'daoTao' },
            { id: 'dtEduProgram:read', text: 'Xem chương trình đào tạo', nhomRole: 'daoTao' },
            { id: 'dtEduProgram:write', text: 'Chỉnh sửa chương trình đào tạo', nhomRole: 'daoTao' },
            { id: 'dtMoPhongDangKy:manage', text: 'Mô phỏng sinh viên', nhomRole: 'daoTao' },
            { id: 'dtKiemTraMaLoaiDangKy:manage', text: 'Kiểm tra mã loại đăng ký', nhomRole: 'daoTao' },
            { id: 'dtLichSuDkhp:manage', text: 'Lịch sử đăng ký học phần', nhomRole: 'daoTao' },
            { id: 'dtDiemHistory:manage', text: 'Lịch sử nhập điểm', nhomRole: 'daoTao' },
            { id: 'dtInPhieuDiem:manage', text: 'Quản lý in phiếu điểm', nhomRole: 'daoTao' },
            { id: 'dtLichEvent:manage', text: 'Quản lý sự kiện', nhomRole: 'daoTao' },
            { id: 'dtDiemSinhVien:manage', text: 'Quản lý điểm sinh viên', nhomRole: 'daoTao' },
            { id: 'dtDiemMien:manage', text: 'Quản lý điểm miễn', nhomRole: 'daoTao' },
            { id: 'dtDiemHoan:manage', text: 'Quản lý điểm hoãn', nhomRole: 'daoTao' },
            { id: 'dtDiemScan:manage', text: 'Quản lý điểm scan', nhomRole: 'daoTao' },
            { id: 'dtDiemNhapDiem:manage', text: 'Quản lý nhập điểm', nhomRole: 'daoTao' },
            { id: 'dtTinhTrangDiem:manage', text: 'Quản lý tình trạng nhập điểm', nhomRole: 'daoTao' },
            { id: 'dtBangDiem:manage', text: 'Quản lý bảng điểm', nhomRole: 'daoTao' },
            { id: 'dtExam:manage', text: 'Quản lý lịch thi', nhomRole: 'daoTao' },
            { id: 'dtExam:read', text: 'Xem lịch thi', nhomRole: 'daoTao' },
            { id: 'dtCauHinhDotDkhp:manage', text: 'Cấu hình đợt đăng ký', nhomRole: 'daoTao' },
            { id: 'dtThongKeDiem:manage', text: 'Thống kê điểm', nhomRole: 'daoTao' },
            { id: 'dtThongKeDiem:avr', text: 'Thống kê điểm trung bình', nhomRole: 'daoTao' },
            { id: 'dtThongKeDKHP:manage', text: 'Thống kê đăng ký học phần', nhomRole: 'daoTao' },
            { id: 'dtThongKeChung:manage', text: 'Thống kê', nhomRole: 'daoTao' },
            { id: 'dtDangKyHocPhan:manage', text: 'Quản lý đăng ký học phần', nhomRole: 'daoTao' },
            { id: 'dtDangKyHocPhan:lop', text: 'Đăng ký học phần theo lớp', nhomRole: 'daoTao' },
            { id: 'dtDangKyHocPhan:sinhVien', text: 'Đăng ký học phần theo sinh viên', nhomRole: 'daoTao' },
            { id: 'dtDangKyHocPhan:import', text: 'Import đăng ký học phần', nhomRole: 'daoTao' },
            { id: 'dtDangKyHocPhan:huyImport', text: 'Import hủy đăng ký học phần', nhomRole: 'daoTao' },
            { id: 'dtDangKyHocPhan:huyChuyen', text: 'Hủy/Chuyển đăng ký học phần', nhomRole: 'daoTao' },
            { id: 'dtQuanLyNghiBu:manage', text: 'Quản lý nghỉ - bù', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:manage', text: 'Quản lý thời khóa biểu', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:read', text: 'Xem thời khóa biểu', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:sapXep', text: 'Sắp xếp thời khóa biểu', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:traCuuPhong', text: 'Tra cứu phòng', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:traCuuTKB', text: 'Tra cứu thời khóa biểu', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:export', text: 'Export thời khóa biểu', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:thongKe', text: 'Thống kê thời khóa biểu', nhomRole: 'daoTao' },
            { id: 'dtThoiKhoaBieu:lichPhong', text: 'Lịch phòng', nhomRole: 'daoTao' },
            { id: 'dtCertificate:manage', text: 'Quản lý chứng chỉ', nhomRole: 'daoTao' },
            { id: 'dtGraduation:manage', text: 'Xét tốt nghiệp', nhomRole: 'daoTao' },
            { id: 'dtVerifyDiem:manage', text: 'Xác nhận bảng điểm', nhomRole: 'daoTao' },
        ], { shcc, permissions = [] } = req.session.user,
            checkHaveAssignRole = await app.model.dtAssignRole.get({ shcc, role: 'quanLyDaoTao:assignRole' });

        if (permissions.includes('quanLyDaoTao:DaiHoc')) {
            items.push(
                { id: 'quanLyDaoTao:assignRole', text: 'Quản lý đào tạo: Phân quyền', nhomRole: 'quanLyDaoTao' },
                { id: 'quanLyDaoTao:DaiHoc', text: 'Quản lý đào tạo: Đại học', nhomRole: 'quanLyDaoTao' }
            );
        }

        if (checkHaveAssignRole && !permissions.includes('quanLyDaoTao:DaiHoc')) {
            const listRole = await app.model.dtAssignRole.getAll({ shcc }, 'role, ngayKetThuc');
            items = items.filter(item => {
                const role = listRole.find(i => i.role == item.id);
                return role && (!role.ngayKetThuc || role.ngayKetThuc > Date.now());
            });
        }
        res.send({ items });
    });

    // DECLARE NHOM ROLE
    const nhomRoleDaoTao = {
        // Cấu hình
        'dtSettings:manage': ['dtSettings:manage', 'dtSettings:write', 'dtSemester:write', 'dtSemester:read', 'dtDiemSemester:read', 'dtDiemSemester:write', 'dtDiemSemester:delete'],
        // Dashboard tổng
        'dtDaoTaoDashBoard:manage': ['dtDaoTaoDashBoard:manage'],
        // Cấu hình điểm
        'dtDiemConfig:manage': ['dtCauHinhDiem:write', 'dtCauHinhDiem:read', 'dtDiemConfig:write', 'dtDiemConfig:read', 'dtDiemConfig:delete',
            'dtDiemConfigChuyen:write', 'dtDiemConfigChuyen:read', 'dtDiemConfigChuyen:delete',
            'dtDiemDacBiet:manage', 'dtDiemDacBiet:write', 'dtDiemDacBiet:read',
            'dtDiemDmHeDiem:manage', 'dtDiemDmHeDiem:write', 'dtDiemDmHeDiem:delete',
            'dtDiemDmLoaiDiem:manage', 'dtDiemDmLoaiDiem:write', 'dtDiemDmLoaiDiem:read',
            'dtDiemDmTinhTrang:manage', 'dtDiemDmTinhTrang:write', 'dtDiemDmTinhTrang:delete',
            'dtDiemDmXepLoai:manage', 'dtDiemDmXepLoai:write', 'dtDiemDmXepLoai:read', 'dtGrade:manage'],
        // Ngành - Chuyên ngành
        'dtNganhDaoTao:manage': ['dtNganhDaoTao:read', 'dtNganhDaoTao:write', 'dtNganhDaoTao:manage'],
        'dtNganhDaoTao:read': ['dtNganhDaoTao:read'],
        // Danh sách môn học
        'dmMonHoc:manage': ['dmMonHoc:read', 'dmMonHoc:write', 'dmMonHoc:delete', 'dmMonHoc:upload', 'dmMonHoc:manage'],
        'dmMonHoc:read': ['dmMonHoc:read'],
        // Quản lý quyết định
        'dtQuanLyQuyetDinh:manage': ['dtQuanLyQuyetDinh:manage', 'dtQuanLyQuyetDinh:write', 'dtQuanLyQuyetDinh:delete'],
        // Từ điển dữ liệu
        'dtDictionary:manage': [
            'dtDictionary:manage',
            'dtCaHoc:read', 'dmCaHoc:write', 'dmCaHoc:delete',
            'dmCoSo:write', 'dtCoSo:read', 'dmCoSo:delete',
            'dtNgayLe:read', 'dmNgayLe:write', 'dmNgayLe:delete',
            'dtPhong:read', 'dmPhong:write', 'dmPhong:delete', 'dtLichEvent:manage',
            'dtSvBacDaoTao:read',
            'dtSvKhuVucTuyenSinh:read',
            'dtSvLoaiHinhDaoTao:read', 'dmSvLoaiHinhDaoTao:write',
            'dtToaNha:read', 'dmToaNha:write', 'dmToaNha:delete',
            'dtChuanDauRa:read', 'dtChuanDauRa:write', 'dtChuanDauRa:delete',
            'dtDmBuoiHoc:manage', 'dtDmBuoiHoc:write',
            'dtDmHinhThucThi:manage', 'dtDmHinhThucThi:write', 'dtDmHinhThucThi:delete',
            'dtDmHocKy:manage', 'dtDmHocKy:write', 'dtDmHocKy:delete',
            'dtDmMonHocKhongTinhPhi:manage', 'dtDmMonHocKhongTinhPhi:write', 'dtDmMonHocKhongTinhPhi:delete',
            'dtDmMonHocKhongTinhTb:manage', 'dtDmMonHocKhongTinhTb:write', 'dtDmMonHocKhongTinhTb:delete',
            'dtDmThoiGianDaoTao:read', 'dtDmThoiGianDaoTao:write', 'dtDmThoiGianDaoTao:delete',
            'dtDmThu:manage', 'dtDmThu:write', 'dtDmThu:delete',
            'dtKhoaDaoTao:read', 'dtKhoaDaoTao:write',
            'dmTinhTrangPhong:manage', 'dmTinhTrangPhong:write', 'dmTinhTrangPhong:delete',
        ],
        // Thù lao
        'dtLuongGiangDay:manage': [
            'dtLuongGiangDay:manage',
            'dtDmDonGiaGiangDay:manage', 'dtDmDonGiaGiangDay:write', 'dtDmDonGiaGiangDay:delete',
            'dtDmHeSoChatLuong:manage', 'dtDmHeSoChatLuong:write', 'dtDmHeSoChatLuong:delete',
            'dtDmHeSoKhoiLuong:manage', 'dtDmHeSoKhoiLuong:write', 'dtDmHeSoKhoiLuong:delete',
        ],
        // Môn thi
        // Tổ hợp thi
        // Đối tượng tuyển sinh
        // Tuyển sinh
        // Quản lý chứng chỉ
        'dtCertificate:manage': [
            'dtCertificate:manage', 'dtDmChungChiNgoaiNgu:manage', 'dtDmChungChiNgoaiNgu:write', 'dtDmChungChiNgoaiNgu:delete',
            'dtDmCefr:manage', 'dtDmCefr:write', 'dtDmCefr:delete',
            'dtDmNgoaiNgu:read', 'dtDmNgoaiNgu:write', 'dtDmNgoaiNgu:delete',
            'dtDmChungChiTinHoc:read', 'dtDmChungChiTinHoc:write', 'dtDmChungChiTinHoc:delete', 'dtDmChungChiTinHoc:manage',
            'dtChungChiTinHocSinhVien:manage', 'dtChungChiTinHocSinhVien:read', 'dtChungChiTinHocSinhVien:write', 'dtChungChiTinHocSinhVien:delete',
            'dtDmLoaiChungChi:manage', 'dtDmLoaiChungChi:write', 'dtDmLoaiChungChi:delete',
            'dtNgoaiNguKhongChuyen:manage', 'dtNgoaiNguKhongChuyen:write', 'dtNgoaiNguKhongChuyen:delete',
            'dtChungChiSinhVien:manage', 'dtChungChiSinhVien:write', 'dtChungChiSinhVien:export',
        ],
        // Quản lý cán bộ
        'dtCanBoNgoaiTruong:manage': ['dtCanBoNgoaiTruong:manage', 'dtCanBoNgoaiTruong:read', 'dtCanBoNgoaiTruong:write', 'dtCanBoNgoaiTruong:delete', 'dtCanBoNgoaiTruong:export'],
        // Danh sách sinh viên
        'dtQuanLyHocPhan:manage': ['dtQuanLyHocPhan:manage', 'dtQuanLyHocPhan:delete', 'dtQuanLyHocPhan:write'],
        // Quản lý lớp
        'dtLop:manage': ['dtLop:read', 'dtLop:write'],
        // Chương trình đào tạo
        'dtEduProgram:manage': [
            'dtEduProgram:manage',
            'dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:delete', 'dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:import', 'dtChuongTrinhDaoTao:export',
            'dtCauTrucKhungDaoTao:read', 'dtCauTrucKhungDaoTao:write', 'dtCauTrucKhungDaoTao:delete',
            'dtKeHoachDaoTao:manage', 'dtKeHoachDaoTao:write', 'dtKeHoachDaoTao:delete',
        ],
        'dtEduProgram:read': ['dtChuongTrinhDaoTao:read', 'dtEduProgram:manage'],
        'dtEduProgram:write': ['dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:write', 'dtEduProgram:manage'],
        // Mô phỏng
        'dtMoPhongDangKy:manage': ['dtSchedule:manage', 'dtMoPhongDangKy:manage', 'dtMoPhongDangKy:delete', 'dtMoPhongDangKy:write', 'dtMoPhongDangKy:read'],
        // Kiểm tra mã loại
        'dtKiemTraMaLoaiDangKy:manage': ['dtSchedule:manage', 'dtKiemTraMaLoaiDangKy:manage', 'dtKiemTraMaLoaiDangKy:write', 'dtKiemTraMaLoaiDangKy:delete'],
        // Lịch sử đăng ký
        'dtLichSuDkhp:manage': ['dtSchedule:manage', 'dtLichSuDkhp:manage', 'dtLichSuDkhp:write', 'dtLichSuDkhp:delete', 'dtLichSuDkhp:export'],
        // Lịch sử nhập điểm
        'dtDiemHistory:manage': ['dtDiemHistory:read', 'dtDiemHistory:write', 'dtDiemHistory:delete', 'dtDiemHistory:export', 'dtGrade:manage'],
        // In phiếu điểm
        'dtInPhieuDiem:manage': ['dtDiemInBangDiem:manage', 'dtDiemInBangDiem:write', 'dtDiemInBangDiem:delete', 'dtDiemInBangDiem:export', 'dtGrade:manage'],
        // Quản lý sự kiện
        'dtLichEvent:manage': ['dtSchedule:manage', 'dtLichEvent:manage', 'dtLichEvent:write', 'dtLichEvent:delete', 'dtLichEvent:export'],
        // Quản lý điểm sinh viên
        'dtDiemSinhVien:manage': ['dtGrade:manage', 'dtDiem:data'],
        // Quản lý điểm miễn
        'dtDiemMien:manage': ['dtGrade:manage', 'dtDiemMien:write'],
        // Quản lý điểm hoãn
        'dtDiemHoan:manage': ['dtGrade:manage', 'dtDiemHoan:write'],
        // Quản lý scan bảng điểm
        'dtDiemScan:manage': ['dtGrade:manage', 'dtDiemFolderScan:read', 'dtDiemFolderScan:write', 'dtDiemFolderScan:delete', 'dtDiemScan:manage'],
        // Quản lý nhập điểm
        'dtDiemNhapDiem:manage': ['dtGrade:manage', 'dtDiemAll:read', 'dtDiemAll:write', 'dtDiemAll:delete', 'dtDiemAll:export'],
        // Quản lý bảng điểm
        'dtBangDiem:manage': ['dtGrade:manage', 'dtDiem:manage', 'dtDiem:write', 'dtDiem:delete', 'dtDiem:export'],
        // 
        'dtTinhTrangDiem:manage': ['dtGrade:manage', 'dtTinhTrangDiem:manage'],
        // Lịch thi
        'dtExam:manage': ['dtSchedule:manage', 'dtExam:manage', 'dtExam:write', 'dtExam:delete', 'dtExam:import', 'dtExam:export'],
        'dtExam:read': ['dtSchedule:manage', 'dtExam:read'],
        // Cấu hình đợt đăng ký
        'dtCauHinhDotDkhp:manage': ['dtSchedule:manage', 'dtCauHinhDotDkhp:manage', 'dtCauHinhDotDkhp:write', 'dtCauHinhDotDkhp:delete', 'dtCauHinhDotDkhp:active'],
        // Thống kê điểm
        'dtThongKeDiem:manage': ['dtGrade:manage', 'dtThongKeDiem:manage', 'dtThongKeDiem:export'],
        'dtThongKeDiem:avr': ['dtGrade:manage', 'dtThongKeDiem:export', 'dtThongKeDiem:avr'],
        // Thống kê đkhp
        'dtThongKeDKHP:manage': ['dtThongKeDkhp:manage', 'dtThongKeDkhp:read', 'dtThongKeDkhp:export'],
        // Thống kê
        'dtThongKeChung:manage': ['dtThongKe:manage', 'dtThongKe:export'],
        // Đăng ký học phần
        'dtDangKyHocPhan:manage': ['dtSchedule:manage', 'dtDangKyHocPhan:lop', 'dtDangKyHocPhan:sinhVien', 'dtDangKyHocPhan:import', 'dtDangKyHocPhan:huyImport', 'dtDangKyHocPhan:huyChuyen', 'dtDangKyHocPhan:manage', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export'],
        'dtDangKyHocPhan:lop': ['dtSchedule:manage', 'dtDangKyHocPhan:lop', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export'],
        'dtDangKyHocPhan:sinhVien': ['dtSchedule:manage', 'dtDangKyHocPhan:sinhVien', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export'],
        'dtDangKyHocPhan:import': ['dtSchedule:manage', 'dtDangKyHocPhan:import', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export'],
        'dtDangKyHocPhan:huyImport': ['dtSchedule:manage', 'dtDangKyHocPhan:huyImport', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export'],
        'dtDangKyHocPhan:huyChuyen': ['dtSchedule:manage', 'dtDangKyHocPhan:huyChuyen', 'dtDangKyHocPhan:write', 'dtDangKyHocPhan:delete', 'dtDangKyHocPhan:export'],
        // Quản lý nghỉ bù
        'dtQuanLyNghiBu:manage': ['dtSchedule:manage', 'dtThoiKhoaBieu:nghiBu'],
        // Thời khóa biểu 
        'dtThoiKhoaBieu:manage': ['dtSchedule:manage', 'dtDmTinhTrangHocPhan:manage',
            'dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:delete', 'dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:import', 'dtThoiKhoaBieu:traCuu', 'dtThoiKhoaBieu:traCuuPhong', 'dtThoiKhoaBieu:traCuuTKB',
            'dtChuongTrinhDaoTao:read', 'dmMonHoc:read', 'dtNganhDaoTao:read', 'dtLop:read'],
        'dtThoiKhoaBieu:read': ['dtSchedule:manage', 'dtThoiKhoaBieu:read'],
        'dtThoiKhoaBieu:sapXep': ['dtSchedule:manage', 'dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:write'],
        'dtThoiKhoaBieu:traCuuPhong': ['dtSchedule:manage', 'dtThoiKhoaBieu:traCuuPhong', 'dtThoiKhoaBieu:traCuu'],
        'dtThoiKhoaBieu:traCuuTKB': ['dtSchedule:manage', 'dtThoiKhoaBieu:traCuuTKB', 'dtThoiKhoaBieu:traCuu'],
        'dtThoiKhoaBieu:export': ['dtSchedule:manage', 'dtThoiKhoaBieu:traCuu', 'dtThoiKhoaBieu:export'],
        'dtThoiKhoaBieu:thongKe': ['dtSchedule:manage', 'dtThoiKhoaBieu:traCuu', 'dtThoiKhoaBieu:thongKe'],
        'dtThoiKhoaBieu:lichPhong': ['dtSchedule:manage', 'dtThoiKhoaBieu:traCuu', 'dtThoiKhoaBieu:lichPhong'],
        // Xet tot nghiep
        'dtGraduation:manage': ['dtGraduation:manage',
            'dtDanhSachXetTotNghiep:manage', 'dtDanhSachXetTotNghiep:write', 'dtDanhSachXetTotNghiep:delete',
            'dtCauHinhDotXetTotNghiep:manage', 'dtCauHinhDotXetTotNghiep:write', 'dtCauHinhDotXetTotNghiep:delete',
            'dtKetQuaTotNghiep:manage', 'dtMonTuongDuong:manage',
        ],
        'dtVerifyDiem:manage': [
            'dtGrade:manage', 'dtDiemVerifyCode:manage',
        ]
    };


    // ASSIGN ROLE
    app.permissionHooks.add('assignRole', 'checkDtAssignRole', (user, assignRoles) => new Promise(resolve => {
        assignRoles.filter(role => role.nhomRole == 'daoTao').forEach(role => {
            const roles = nhomRoleDaoTao[role.tenRole];
            if (roles && user.permissions.includes('staff:login')) {
                app.permissionHooks.pushUserPermission(user, ...roles, 'dtInstruction:manage');
            }
        });
        resolve();
    }));
};