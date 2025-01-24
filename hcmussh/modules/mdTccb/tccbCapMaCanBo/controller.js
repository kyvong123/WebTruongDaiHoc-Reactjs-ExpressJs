module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3011: { title: 'Quản lý mã số cán bộ', link: '/user/tccb/ma-so-can-bo', icon: 'fa-id-badge', backgroundColor: '#fecc2c', groupIndex: 0 }
        }
    };

    app.permission.add(
        { name: 'tccbCapMaCanBo:read', menu },
        { name: 'tccbCapMaCanBo:write' },
    );

    app.permissionHooks.add('staff', 'tccbCapMaCanBo', async (user, staff) => {
        if (user.permissions.includes('manager:login') && staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbCapMaCanBo:read', 'tccbCapMaCanBo:write');
        }
    });

    app.get('/user/tccb/ma-so-can-bo', app.permission.check('tccbCapMaCanBo:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------

    app.get('/api/tccb/ma-so-can-bo/page/:pageNumber/:pageSize', app.permission.check('tccbCapMaCanBo:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            let searchTerm = `%${req.query.searchTerm || ''}%`,
                filter = req.query.filter || {};
            const page = await app.model.tccbCapMaCanBo.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            const { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, listtotalitem: listTotalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, listTotalItem, list }
            });

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/loai-can-bo/all', app.permission.check('tccbCapMaCanBo:read'), async (req, res) => {
        try {
            const item = await app.model.tccbLoaiCanBo.getAll({
                statement: 'LOWER(TEN) LIKE LOWER(:searchTerm)',
                parameter: { searchTerm: `%${req.query.condition || ''}%` }
            });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/loai-can-bo/item/:ma', app.permission.check('tccbCapMaCanBo:read'), async (req, res) => {
        try {
            const item = await app.model.tccbLoaiCanBo.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/ma-so-can-bo/all', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const item = await app.model.tccbCapMaCanBo.getAll({
                statement: '(LOWER(HO) LIKE LOWER(:searchTerm)) OR (LOWER(TEN) LIKE LOWER(:searchTerm)) OR (LOWER(MSCB) LIKE LOWER(:searchTerm))',
                parameter: { searchTerm: `%${req.query.condition || ''}%` }
            });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/ma-so-can-bo/item/:mscb', app.permission.check('tccbCapMaCanBo:read'), async (req, res) => {
        try {
            const item = await app.model.tccbCapMaCanBo.get({ mscb: req.params.mscb });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/ma-so-can-bo/init-ma-so', app.permission.check('tccbCapMaCanBo:read'), async (req, res) => {
        try {
            const dinhDanh = await app.model.tccbCapMaCanBo.initMaSo();
            res.send({ dinhDanh });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/ma-so-can-bo/check-exist', app.permission.check('tccbCapMaCanBo:read'), async (req, res) => {
        try {
            let { data } = req.query;
            if (!data) throw 'Dữ liệu không hợp lệ';

            const { ho, ten, ngaySinh } = data;
            let result = [];

            const checkHoVaTen = await app.model.tccbCapMaCanBo.get({
                statement: 'UPPER(TRIM(HO)) = :ho AND UPPER(TRIM(TEN)) = :ten',
                parameter: { ho: ho.toUpperCase().trim(), ten: ten.toUpperCase().trim() }
            });
            if (checkHoVaTen) result = [...result, 'Trùng thông tin Họ và tên'];

            const checkNgaySinh = await app.model.tccbCapMaCanBo.get({
                statement: 'NGAY_SINH IS NOT NULL AND NGAY_SINH BETWEEN :dateStart AND :dateEnd',
                parameter: { dateStart: app.date.dateToNumber(new Date(ngaySinh)), dateEnd: app.date.dateToNumber(new Date(ngaySinh), 23, 59, 59, 999) }
            });
            if (checkNgaySinh) result = [...result, 'Trùng thông tin Ngày sinh'];

            res.send({ result });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/ma-so-can-bo/create', app.permission.check('tccbCapMaCanBo:write'), async (req, res) => {
        try {
            const userEmail = req.session.user?.email,
                ngayTao = Date.now();
            let { data } = req.body;
            if (!data) throw 'Dữ liệu không hợp lệ';

            const { ho, ten, gioiTinh, ngaySinh, emailCaNhan, maDonVi, loaiCanBo, emailTruongSuggest } = data;
            if (!(ten && (gioiTinh != null) && ngaySinh && emailCaNhan && maDonVi && loaiCanBo && emailTruongSuggest)) throw 'Thông tin kiểm tra không hợp lệ!';

            const dinhDanh = await app.model.tccbCapMaCanBo.initMaSo();
            if (!dinhDanh) throw 'Không thể khởi tạo định danh cán bộ!';

            const dateNgaySinh = new Date(Number(ngaySinh)).getFullYear().toString();
            const mscb = `QSX${dateNgaySinh.substring(2)}${gioiTinh}${dinhDanh.toString().padStart(4, '0')}`;
            const item = await app.model.tccbCapMaCanBo.create({ ho, ten, gioiTinh, ngaySinh, emailCaNhan, donVi: maDonVi, loaiCanBo, mscb, thoiGianTao: ngayTao, nguoiGui: userEmail, trangThai: 'CHO_KY', dinhDanh, emailTruongSuggest });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/ma-so-can-bo/accept', app.permission.check('tccbCapMaCanBo:write'), async (req, res) => {
        try {
            const userEmail = req.session.user?.email,
                ngayTao = Date.now();
            let { data } = req.body;
            if (!data) throw 'Dữ liệu không hợp lệ';

            const { id, ghiChu } = data;
            if (!id) throw 'Thông tin yêu cầu không hợp lệ!';

            const thongTinCapMa = await app.model.tccbCapMaCanBo.get({ id });
            if (!thongTinCapMa) throw 'Thông tin kiểm tra không hợp lệ!';

            await app.model.tccbCapMaCanBo.update({ id }, { modifier: userEmail, timeModified: ngayTao, trangThai: 'CO_HIEU_LUC', ghiChu });
            let checkCanBo = await app.model.tchcCanBo.get({ shcc: thongTinCapMa.mscb });
            if (checkCanBo) throw 'Mã cán bộ đã tồn tại trong hệ thống!!!';
            else await app.model.tchcCanBo.create({
                shcc: thongTinCapMa.mscb,
                phai: thongTinCapMa.gioiTinh == 1 ? '01' : '02',
                ho: thongTinCapMa.ho,
                ten: thongTinCapMa.ten,
                ngaySinh: thongTinCapMa.ngaySinh,
                maDonVi: thongTinCapMa.donVi,
                loaiCanBo: thongTinCapMa.loaiCanBo,
                email: thongTinCapMa.emailTruong || '',
                emailCaNhan: thongTinCapMa.emailCaNhan
            });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/ma-so-can-bo/delete', app.permission.check('tccbCapMaCanBo:write'), async (req, res) => {
        try {
            const userEmail = req.session.user?.email,
                ngayTao = Date.now();
            const { id, ghiChu } = req.body;
            if (!id) throw 'Thông tin yêu cầu không hợp lệ!';

            const thongTinCapMa = await app.model.tccbCapMaCanBo.get({ id });
            if (!(thongTinCapMa && thongTinCapMa.mscb)) throw 'Thông tin kiểm tra không hợp lệ!';

            await app.model.tccbCapMaCanBo.update({ id }, { dinhDanh: null, modifier: userEmail, timeModified: ngayTao, trangThai: 'HUY', ghiChu });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};