module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7101: {
                title: 'Quản lý nghỉ - bù học phần', groupIndex: 0, parentKey: 7029,
                link: '/user/dao-tao/quan-ly-nghi-bu', icon: 'fa-power-off', backgroundColor: '#366384'
            }
        }
    };
    app.permission.add(
        { name: 'dtThoiKhoaBieu:nghiBu', menu },
    );

    app.get('/user/dao-tao/quan-ly-nghi-bu', app.permission.check('dtThoiKhoaBieu:nghiBu'), app.templates.admin);

    // API

    app.get('/api/dt/thoi-khoa-bieu/bao-bu/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                user = req.session.user;

            let filter = req.query.filter || {}, sort = filter.sort || 'maHocPhan_ASC';
            if (filter.ks_thu?.toString().toLowerCase() == 'cn') filter.ks_thu = '8';

            const roles = await app.model.dtAssignRole.getAll({
                statement: 'shcc = :shcc AND role LIKE :role',
                parameter: { shcc: user.shcc, role: '%dtQuanLyNghiBu:manage%' }
            });

            if (roles.length && !user.permissions.includes('quanLyDaoTao:DaiHoc')) {
                filter.listKhoaSinhVienFilter = [...new Set(roles.flatMap(i => i.khoaSinhVien.split(',')))].toString();
                filter.listHeFilter = [...new Set(roles.flatMap(i => i.loaiHinhDaoTao.split(',')))].toString();
            }

            if (!Number(user.isPhongDaoTao)) {
                filter.donViFilter = user.maDonVi;
            }

            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtThoiKhoaBieuCustom.searchPageBu(_pageNumber, _pageSize, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/bao-nghi/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                user = req.session.user;

            let filter = req.query.filter || {}, sort = filter.sort || 'maHocPhan_ASC';

            if (filter.ks_thu?.toString().toLowerCase() == 'cn') filter.ks_thu = '8';

            const roles = await app.model.dtAssignRole.getAll({
                statement: 'shcc = :shcc AND role LIKE :role',
                parameter: { shcc: user.shcc, role: '%dtQuanLyNghiBu:manage%' }
            });

            if (roles.length && !user.permissions.includes('quanLyDaoTao:DaiHoc')) {
                filter.listKhoaSinhVienFilter = [...new Set(roles.flatMap(i => i.khoaSinhVien.split(',')))].toString();
                filter.listHeFilter = [...new Set(roles.flatMap(i => i.loaiHinhDaoTao.split(',')))].toString();
            }

            if (!Number(user.isPhongDaoTao)) {
                filter.donViFilter = user.maDonVi;
            }

            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtThoiKhoaBieuCustom.searchPageNghi(_pageNumber, _pageSize, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-giang-vien/bao-bu/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                user = req.session.user;

            let filter = req.query.filter || {}, sort = filter.sort || 'thoiGian_ASC';

            await app.model.dtAssignRole.getDataRole('dtQuanLyNghiBu:manage', user, filter);

            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtThoiKhoaBieuBaoBu.searchPage(_pageNumber, _pageSize, filter);
            let { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;

            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/quan-ly-nghi-bu/export-lich-bu', app.permission.check('dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            let { rows } = await app.model.dtThoiKhoaBieuCustom.searchPageBu(1, 100000, req.query.filter);

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('LichBu');

            const defaultColumns = [
                { header: 'Mã học phần', key: 'ma', width: 20 },
                { header: 'Tên môn học', key: 'tenMon', width: 20 },
                { header: 'Ngày bù', key: 'ngayBu', width: 20 },
                { header: 'Cơ sở', key: 'coSo', width: 20 },
                { header: 'Phòng', key: 'phong', width: 25 },
                { header: 'Thứ', key: 'thu', width: 25 },
                { header: 'Tiết', key: 'tiet', width: 25 },
                { header: 'Giảng viên', key: 'giangVien', width: 25 },
                { header: 'Trợ giảng', key: 'troGiang', width: 25 },
                { header: 'Ngày nghỉ', key: 'ngayNghi', width: 25 },
                { header: 'Thứ nghỉ', key: 'thuNghi', width: 25 },
                { header: 'Tiết nghỉ', key: 'tietNghi', width: 25 },
                { header: 'Người thao tác', key: 'userMod', width: 25 },
                { header: 'Thời gian thao tác', key: 'timeMod', width: 25 },
            ];

            worksheet.columns = defaultColumns;

            rows.forEach((item, index) => {
                let rowData = {
                    ma: item.maHocPhan,
                    tenMon: app.utils.parse(item.tenMonHoc || { vi: '' }).vi,
                    ngayBu: item.ngayBu ? app.date.viDateFormat(new Date(item.ngayBu)) : '',
                    coSo: item.coSo,
                    phong: item.phong,
                    thu: item.thu,
                    tiet: `${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}`,
                    giangVien: item.giangVien,
                    troGiang: item.troGiang,
                    ngayNghi: item.ngayNghi ? app.date.viDateFormat(new Date(item.ngayNghi)) : '',
                    thuNghi: item.thuNghi,
                    tietNghi: `${item.tietNghi} - ${parseInt(item.tietNghi) + parseInt(item.soTietNghi) - 1}`,
                    userMod: item.userModified,
                    timeMod: item.timeModified ? app.date.viDateFormat(new Date(item.timeModified)) : '',

                };
                worksheet.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'LichBu.xlsx';
            app.excel.attachment(workbook, res, fileName);

        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/quan-ly-nghi-bu/export-lich-nghi', app.permission.check('dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            let { rows } = await app.model.dtThoiKhoaBieuCustom.searchPageNghi(1, 100000, req.query.filter);

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('LichNghi');

            const defaultColumns = [
                { header: 'Mã học phần', key: 'ma', width: 20 },
                { header: 'Tên môn học', key: 'tenMon', width: 20 },
                { header: 'Ngày nghỉ', key: 'ngayNghi', width: 25 },
                { header: 'Cơ sở', key: 'coSo', width: 20 },
                { header: 'Phòng', key: 'phong', width: 25 },
                { header: 'Thứ', key: 'thu', width: 25 },
                { header: 'Tiết', key: 'tiet', width: 25 },
                { header: 'Ghi chú', key: 'ghiChu', width: 25 },
                { header: 'GV Báo nghỉ', key: 'isGiangVienBaoNghi', width: 25 },
                { header: 'Giảng viên', key: 'giangVien', width: 25 },
                { header: 'Trợ giảng', key: 'troGiang', width: 25 },
                { header: 'Người thao tác', key: 'userMod', width: 25 },
                { header: 'Thời gian thao tác', key: 'timeMod', width: 25 },
            ];

            worksheet.columns = defaultColumns;

            rows.forEach((item, index) => {
                let rowData = {
                    ma: item.maHocPhan,
                    tenMon: app.utils.parse(item.tenMonHoc || { vi: '' }).vi,
                    ngayNghi: item.ngayNghi ? app.date.viDateFormat(new Date(item.ngayNghi)) : '',
                    coSo: item.coSo,
                    phong: item.phong,
                    thu: item.thu,
                    tiet: `${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}`,
                    giangVien: item.giangVien,
                    troGiang: item.troGiang,
                    ghiChu: item.isHoanTac ? 'Hoàn tác' : item.ghiChu,
                    isGiangVienBaoNghi: Number(item.isGiangVienBaoNghi) ? 'Báo nghỉ' : '',
                    userMod: item.userModified,
                    timeMod: item.timeModified ? app.date.viDateFormat(new Date(item.timeModified)) : '',

                };
                worksheet.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'LichNghi.xlsx';
            app.excel.attachment(workbook, res, fileName);

        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-giang-vien/export-lich-bu', app.permission.check('dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter);

            await app.model.dtAssignRole.getDataRole('dtQuanLyNghiBu:manage', req.session.user, filter);
            filter.isAll = 1;
            let { rows } = await app.model.dtThoiKhoaBieuBaoBu.searchPage(1, 50, app.utils.stringify(filter));

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('LichBu');

            const defaultColumns = [
                { header: 'Mã học phần', key: 'ma', width: 20 },
                { header: 'Tên môn học', key: 'tenMon', width: 20 },
                { header: 'Ngày bù', key: 'ngayBu', width: 20 },
                { header: 'Cơ sở', key: 'coSo', width: 20 },
                { header: 'Phòng', key: 'phong', width: 25 },
                { header: 'Thứ', key: 'thu', width: 25 },
                { header: 'Tiết', key: 'tiet', width: 25 },
                { header: 'Thời gian', key: 'thoiGian', width: 25 },
                { header: 'Tình trạng', key: 'tinhTrang', width: 25 },
                { header: 'Ghi chú', key: 'ghiChu', width: 25 },
                { header: 'Ngày nghỉ', key: 'ngayNghi', width: 25 },
                { header: 'Thứ nghỉ', key: 'thuNghi', width: 25 },
                { header: 'Tiết nghỉ', key: 'tietNghi', width: 25 },
                { header: 'Người đăng ký', key: 'userMod', width: 25 },
                { header: 'Thời gian đăng ký', key: 'timeMod', width: 25 },
            ];

            worksheet.columns = defaultColumns;

            const mapperStatus = {
                0: 'Đang xử lý',
                1: 'Thành công',
                2: 'Từ chối',
            };

            rows.forEach((item, index) => {
                let rowData = {
                    ma: item.maHocPhan,
                    tenMon: app.utils.parse(item.tenMonHoc || { vi: '' }).vi,
                    ngayBu: item.ngayHoc ? app.date.viDateFormat(new Date(item.ngayHoc)) : '',
                    coSo: app.utils.parse(item.tenCoSo || { vi: '' }).vi,
                    phong: item.phong,
                    thu: item.thu == 8 ? 'Chủ nhật' : item.thu,
                    tiet: `${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}`,
                    thoiGian: `${app.date.viTimeFormat(new Date(item.thoiGianBatDau))} - ${app.date.viTimeFormat(new Date(item.thoiGianKetThuc))}`,
                    tinhTrang: mapperStatus[item.status],
                    ghiChu: item.ghiChu,
                    ngayNghi: item.ngayNghi ? app.date.viDateFormat(new Date(item.ngayNghi)) : '',
                    thuNghi: item.thuNghi == 8 ? 'Chủ nhật' : item.thuNghi,
                    tietNghi: `${item.tietNghi} - ${parseInt(item.tietNghi) + parseInt(item.soTietNghi) - 1}`,
                    userMod: item.tenGiangVien,
                    timeMod: item.timeCreated ? app.date.viDateFormat(new Date(item.timeCreated)) : '',
                };
                worksheet.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = 'LichBu.xlsx';
            app.excel.attachment(workbook, res, fileName);

        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-giang-vien/bao-bu/cancel', app.permission.check('dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            const { userCreated, ghiChu, idTuan, ngayHoc, thu, tietBatDau, soTietBuoi, phong, maHocPhan } = req.body.item,
                modifier = req.session.user.email;
            await app.model.dtThoiKhoaBieuBaoBu.update({ id: idTuan }, { modifier, timeModified: Date.now(), ghiChu, status: 2 });
            app.notification.send({
                toEmail: userCreated, title: `Lịch bù cho học phần ${maHocPhan}: ngày ${app.date.viDateFormat(new Date(parseInt(ngayHoc)))}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong} đã bị từ chối`,
                iconColor: 'danger', subTitle: `Lý do: ${ghiChu}`, link: `/user/affair/lich-giang-day/detail/${maHocPhan}`,
            });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-giang-vien/bao-bu/verify', app.permission.check('dtThoiKhoaBieu:nghiBu'), async (req, res) => {
        try {
            const { userCreated, idTuan, ngayHoc, thu, tietBatDau, soTietBuoi, phong, maHocPhan, noiDung, subject, mailCc } = req.body.item,
                modifier = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtThoiKhoaBieuBaoBu.update({ id: idTuan }, { modifier, timeModified: Date.now(), status: 1, phong });
            app.notification.send({
                toEmail: userCreated, title: `Lịch bù cho học phần ${maHocPhan}: ngày ${app.date.viDateFormat(new Date(parseInt(ngayHoc)))}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong} đã được chấp nhận`,
                iconColor: 'success', link: `/user/affair/lich-giang-day/detail/${maHocPhan}`,
            });

            const item = await app.model.dtThoiKhoaBieuBaoBu.get({ id: idTuan });
            delete item.id;
            let tuanBu = await app.model.dtThoiKhoaBieuCustom.create({ ...item, phong, isBu: 1, isAccept: 1, modifier, timeModified, timeAction: timeModified, userAction: modifier });

            await app.model.dtThoiKhoaBieuGiangVien.create({
                idThoiKhoaBieu: item.idThoiKhoaBieu,
                giangVien: item.shcc, idTuan: tuanBu.id,
                type: 'GV', idNgayBu: tuanBu.id,
                ngayBatDau: item.thoiGianBatDau,
                ngayKetThuc: item.thoiGianKetThuc,
                userModified: modifier, timeModified,
            });

            const listDangKy = await app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv');

            listDangKy.map(async i => app.notification.send({
                toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Giảng viên đăng ký dạy bù học phần ${maHocPhan}`,
                subTitle: `Ngày ${app.date.viDateFormat(new Date(parseInt(ngayHoc)))}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`
            }));

            if (item.thoiGianKetThuc >= Date.now()) {
                let listMail = listDangKy.map(i => `${i.mssv.toLowerCase()}@hcmussh.edu.vn`);
                if (mailCc) listMail.push(mailCc);
                app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', userCreated, listMail.toString(), null, subject, '', noiDung, null);
            }

            let listTuan = await app.model.dtThoiKhoaBieuCustom.getAll({
                statement: 'maHocPhan = :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL',
                parameter: { maHocPhan }
            }, 'ngayHoc', 'ngayHoc');
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { ngayBatDau: listTuan[0].ngayHoc, ngayKetThuc: listTuan.slice(-1)[0].ngayHoc });

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};