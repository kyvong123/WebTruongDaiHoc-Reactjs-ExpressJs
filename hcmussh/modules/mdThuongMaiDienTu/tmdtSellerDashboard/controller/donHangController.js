module.exports = app => {
    const { tmdtSellerSanPhamDraftRead, tmdtSellerSanPhamDraftWrite } = require('../../permission.js')();

    const { sendNotificationToBuyer } = require('./util.js')(app);
    const { trangThaiMapper, trangThaiGiaoHang, trangThaiThanhToan, trangThaiGiaoHangName, trangThaiThanhToanName, trangThaiName } = require('../../constant.js')();

    app.get('/user/tmdt/y-shop/seller/my-dai-ly/:id/don-hang', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);

    app.get('/api/tmdt/seller/don-hang/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {},
                maDaiLy = parseInt(req.query.maDaiLy);

            const user = req.session.user;
            const thanhVienDaiLyItem = await app.model.tmdtThanhVienDaiLy.get({ maDaiLy, email: user.email });
            if (!thanhVienDaiLyItem) throw 'Bạn không thuộc đại lý này';

            let page = await app.model.tmdtDonHang.sellerSearchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, maDaiLy);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            for (let subDon of list) {
                let itemList = await app.model.tmdtSubDonCauHinhSanPhamMap.getSubDetail(subDon.id);
                subDon.itemList = itemList.rows;
                if (subDon.voucherId)
                    subDon['voucher'] = { id: subDon.voucherId, maDaiLy: subDon.maDaiLy, tenDaiLy: subDon.tenDaiLy, mucGiam: subDon.voucherDiscount, minCondition: subDon.voucherMinCondition, totalNumber: subDon.voucherTotalNumber, currentNumber: subDon.voucherCurrentNumber, startDate: subDon.voucherStartDate, endDate: subDon.voucherEndDate, name: subDon.voucherName, maCode: subDon.voucherMaCode };
            }
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    /**
     * API cũ
     */
    app.put('/api/tmdt/seller/don-hang-con', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const { id, changes } = req.body;
            const item = await updateAllTrangThai(user, id, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    /**
     * Phần API cập nhật 3 loại trạng thái
     */
    app.put('/api/tmdt/seller/trang-thai/update', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user;
            const { id, changes } = req.body;
            const item = await updateTrangThai(user, id, changes.trangThai);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/tmdt/seller/trang-thai-giao-hang/update', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user;
            const { id, changes } = req.body;
            const item = await updateTrangThaiGiaoHang(user, id, changes.trangThaiGiaoHang);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/tmdt/seller/trang-thai-thanh-toan/update', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user;
            const { id, changes } = req.body;
            const item = await updateTrangThaiThanhToan(user, id, changes.trangThaiThanhToan);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    /**
     * Thao tác trạng thái
     */
    app.put('/api/tmdt/seller/confirm-new-order', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user, { id } = req.body;
            const item = await updateTrangThai(user, id, trangThaiMapper.dang_xu_ly);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/tmdt/seller/deny-new-order', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user, { id } = req.body;
            const item = await updateTrangThai(user, id, trangThaiMapper.shop_tu_choi);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/tmdt/seller/close-order', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user, { id } = req.body;
            const item = await updateTrangThai(user, id, trangThaiMapper.ket_thuc);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    /**
     * Thao tác trạng thái giao hàng
     */
    app.put('/api/tmdt/seller/set-order-delivering', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user, { id } = req.body;
            const item = await updateTrangThaiGiaoHang(user, id, trangThaiGiaoHang.dang_giao_hang);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/tmdt/seller/set-order-delivery-done', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user, { id } = req.body;
            const item = await updateTrangThaiGiaoHang(user, id, trangThaiGiaoHang.da_giao_hang);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    /**
     * Thao tác trạng thái thanh toán
     */
    app.put('/api/tmdt/seller/confirm-order-purchase', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user, { id } = req.body;
            const item = await updateTrangThaiThanhToan(user, id, trangThaiThanhToan.da_thanh_toan);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const updateAllTrangThai = async (user, id, changes) => {
        const subDon = await app.model.tmdtSubDon.get({ id });
        if (!subDon) throw 'Không tìm thấy đơn hàng';
        const isValidDaiLy = await app.model.tmdtDaiLy.searchPageByEmail(1, 1, app.utils.stringify({ maDaiLy: subDon.maDaiLy }), '', user.email).then(value => value.rows[0] != null);
        if (!isValidDaiLy) throw 'Đơn hàng này không thuộc đại lý bạn tham gia!';
        const item = await app.model.tmdtSubDon.update({ id }, changes);
        const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
        if (changes.trangThaiGiaoHang) {
            await app.model.tmdtSubDon.update({ id }, { trangThaiGiaoHangLastUpdatedAt: Date.now() });
        }
        if (donHang) {
            let userEmail = donHang.userEmail;
            await sendNotificationToBuyer(userEmail, item);
        }
        return item;
    };

    const updateTrangThai = async (user, id, trangThai) => {
        const subDon = await app.model.tmdtSubDon.get({ id });
        if (!subDon) throw 'Không tìm thấy đơn hàng';
        const isValidDaiLy = await app.model.tmdtDaiLy.searchPageByEmail(1, 1, app.utils.stringify({ maDaiLy: subDon.maDaiLy }), '', user.email).then(value => value.rows[0] != null);
        if (!isValidDaiLy) throw 'Đơn hàng này không thuộc đại lý bạn tham gia!';
        const item = await app.model.tmdtSubDon.update({ id }, { trangThai });
        const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
        if (donHang) {
            let userEmail = donHang.userEmail;
            await sendNotificationToBuyer(userEmail, item);
        }
        return item;
    };

    const updateTrangThaiThanhToan = async (user, id, trangThaiThanhToan) => {
        const subDon = await app.model.tmdtSubDon.get({ id });
        if (!subDon) throw 'Không tìm thấy đơn hàng';
        const isValidDaiLy = await app.model.tmdtDaiLy.searchPageByEmail(1, 1, app.utils.stringify({ maDaiLy: subDon.maDaiLy }), '', user.email).then(value => value.rows[0] != null);
        if (!isValidDaiLy) throw 'Đơn hàng này không thuộc đại lý bạn tham gia!';
        const item = await app.model.tmdtSubDon.update({ id }, { trangThaiThanhToan });
        const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
        if (donHang) {
            let userEmail = donHang.userEmail;
            await sendNotificationToBuyer(userEmail, item);
        }
        return item;
    };

    const updateTrangThaiGiaoHang = async (user, id, trangThaiGiaoHang) => {
        const subDon = await app.model.tmdtSubDon.get({ id });
        if (!subDon) throw 'Không tìm thấy đơn hàng';
        const isValidDaiLy = await app.model.tmdtDaiLy.searchPageByEmail(1, 1, app.utils.stringify({ maDaiLy: subDon.maDaiLy }), '', user.email).then(value => value.rows[0] != null);
        if (!isValidDaiLy) throw 'Đơn hàng này không thuộc đại lý bạn tham gia!';
        const item = await app.model.tmdtSubDon.update({ id }, { trangThaiGiaoHang, trangThaiGiaoHangLastUpdatedAt: Date.now() });
        const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
        if (donHang) {
            let userEmail = donHang.userEmail;
            await sendNotificationToBuyer(userEmail, item);
        }
        return item;
    };

    app.get('/api/tmdt/y-shop/seller/download-excel/du-lieu-don-hang/:maDaiLy/:fromNgayDat/:toNgayDat/:trangThai', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const workbook = app.excel.create();
            await addSheetSellerSubDonToWorkbook(workbook, req.params);
            app.excel.attachment(workbook, res, 'donHang.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.status(400).send({ error });
        }
    });

    const addSheetSellerSubDonToWorkbook = async (workbook, reqParams) => {
        const worksheet = workbook.addWorksheet('donHang');
        let { maDaiLy, fromNgayDat, toNgayDat, trangThai } = reqParams ? reqParams : { maDaiLy: null, fromNgayDat: null, toNgayDat: null, trangThai: null };
        if (maDaiLy == 'null') maDaiLy = null;
        if (fromNgayDat == 'null') fromNgayDat = null;
        if (toNgayDat == 'null') toNgayDat = null;
        if (trangThai == 'null') trangThai = null;
        const donHangDataList = (await app.model.tmdtDonHang.sellerDownloadExcel(maDaiLy, fromNgayDat, toNgayDat, trangThai)).rows;
        let cells = [
            { cell: 'A1', value: 'STT', bold: true, border: '1234' },
            { cell: 'B1', value: 'NGÀY ĐẶT', bold: true, border: '1234' },
            { cell: 'C1', value: 'MÃ ĐƠN THANH TOÁN', bold: true, border: '1234' },
            { cell: 'D1', value: 'HỌ TÊN KHÁCH', bold: true, border: '1234' },
            { cell: 'E1', value: 'EMAIL KHÁCH', bold: true, border: '1234' },
            { cell: 'F1', value: 'SỐ ĐIỆN THOẠI', bold: true, border: '1234' },
            { cell: 'G1', value: 'PHƯƠNG THỨC THANH TOÁN', bold: true, border: '1234' },
            { cell: 'H1', value: 'THÔNG TIN THANH TOÁN', bold: true, border: '1234' },
            { cell: 'I1', value: 'PHƯƠNG THỨC GIAO HÀNG', bold: true, border: '1234' },
            { cell: 'J1', value: 'THÔNG TIN GIAO HÀNG', bold: true, border: '1234' },
            { cell: 'K1', value: 'TÊN MẶT HÀNG', bold: true, border: '1234' },
            { cell: 'L1', value: 'TÊN OPTION (nếu có)', bold: true, border: '1234' },
            { cell: 'M1', value: 'SỐ LƯỢNG', bold: true, border: '1234' },
            { cell: 'N1', value: 'ĐƠN GIÁ', bold: true, border: '1234' },
            { cell: 'O1', value: 'TÊN VOUCHER', bold: true, border: '1234' },
            { cell: 'P1', value: 'MỨC GIẢM GIÁ (nếu có) (TÍNH 1 LẦN CHO 1 ĐƠN THANH TOÁN)', bold: true, border: '1234' },
            { cell: 'Q1', value: 'THÀNH TIỀN', bold: true, border: '1234' },
            { cell: 'R1', value: 'TRẠNG THÁI', bold: true, border: '1234' },
            { cell: 'S1', value: 'TRẠNG THÁI THANH TOÁN', bold: true, border: '1234' },
            { cell: 'T1', value: 'TRẠNG THÁI GIAO HÀNG', bold: true, border: '1234' },
        ];
        for (let i = 0; i < donHangDataList.length; i++) {
            const donHangData = donHangDataList[i];
            cells.push(
                { cell: `A${i + 2}`, value: i + 1 },
                { cell: `B${i + 2}`, value: app.date.dateTimeFormat(new Date(donHangData.ngayDat), 'dd/mm/yyyy HH:MM:ss') },
                { cell: `C${i + 2}`, value: donHangData.maDonThanhToan },
                { cell: `D${i + 2}`, value: `${donHangData.hoKhachDat} ${donHangData.tenKhachDat}` },
                { cell: `E${i + 2}`, value: donHangData.emailKhachDat },
                { cell: `F${i + 2}`, value: donHangData.phone },
                { cell: `G${i + 2}`, value: donHangData.paymentMethodName },
                { cell: `H${i + 2}`, value: donHangData.paymentInfo },
                { cell: `I${i + 2}`, value: donHangData.shippingMethodName },
                { cell: `J${i + 2}`, value: donHangData.shippingInfo },
                { cell: `K${i + 2}`, value: donHangData.tenMatHang },
                { cell: `L${i + 2}`, value: donHangData.tenOptionMatHang },
                { cell: `M${i + 2}`, value: donHangData.soLuong },
                { cell: `N${i + 2}`, value: donHangData.donGia },
                { cell: `O${i + 2}`, value: donHangData.tenVoucher },
                { cell: `P${i + 2}`, value: donHangData.giamGia },
                { cell: `Q${i + 2}`, value: donHangData.thanhTien },
                { cell: `R${i + 2}`, value: trangThaiName[donHangData.trangThai] },
                { cell: `S${i + 2}`, value: trangThaiThanhToanName[donHangData.trangThaiThanhToan] },
                { cell: `T${i + 2}`, value: trangThaiGiaoHangName[donHangData.trangThaiGiaoHang] },
                // { cell: `M${i + 2}`, value: app.date.dateTimeFormat(new Date(donHangData.ngayDat), 'dd/mm/yyyy HH:MM:ss') },
            );
        }
        app.excel.write(worksheet, cells);
    };

    // Schedule cập nhật đơn hàng đã giao tự động ----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('autoSetOrderDeliveryDone', {
        ready: () => app.database.oracle,
        run: () => {
            // 8h00 tối hàng ngày
            app.primaryWorker && app.schedule('0 0 20 * * *', async () => {
                const items = await app.model.tmdtSubDon.getAll({ trangThai: trangThaiMapper.ket_thuc, trangThaiGiaoHang: trangThaiGiaoHang.dang_giao_hang });
                for (const item of items) {
                    if (true) {
                        await app.model.tmdtSubDon.update({ id: item.id }, { trangThaiGiaoHang: trangThaiGiaoHang.da_giao_hang });
                        const donHang = await app.model.tmdtDonHang.get({ id: item.maDon });
                        if (donHang) {
                            let userEmail = donHang.userEmail;
                            await sendNotificationToBuyer(userEmail, item);
                        }
                    }
                }
            });
        },
    });
};