module.exports = app => {
    const { tmdtUserSanPhamHomePage } = require('../../permission.js')();
    const { sendNotificationToSeller } = require('./util.js')(app);
    const { trangThai, trangThaiGiaoHang, trangThaiThanhToan, shippingMethod: shippingMethodMapper, paymentMethod: paymentMethodMapper } = require('../../constant.js')();

    app.get('/api/tmdt/user/don-hang/page/:pageNumber/:pageSize', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {},
                email = req.session.user.email;
            let page = await app.model.tmdtDonHang.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, email);
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
     * API tạo order kiểu cũ
     */
    app.post('/api/tmdt/user/create-order', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const user = req.session.user;
            const { orderList, totalPrice } = req.body;
            const now = Date.now();
            let donHang = await app.model.tmdtDonHang.create({ userEmail: user.email, ngayDat: now, tongTien: totalPrice, ho: user.lastName, ten: user.firstName });
            for (let item of orderList) {
                let subId = null;
                let check = await app.model.tmdtSubDon.get({ maDon: donHang.id, maDaiLy: item.maDaiLy }, 'id');
                if (check) {
                    subId = check.id;
                } else {
                    let sum = orderList.filter((cart) => cart.maDaiLy == item.maDaiLy).reduce((acc, cur) => acc + (cur.gia * cur.soLuong), 0);
                    let subDon = await app.model.tmdtSubDon.create({ maDon: donHang.id, maDaiLy: item.maDaiLy, trangThai: trangThai.cho_xac_nhan, tongTien: sum, tenDaiLy: item.tenDaiLy });
                    subId = subDon.id;
                    if (subDon) await sendNotificationToSeller(subDon.maDaiLy, { ...subDon, userEmail: user.email });
                }
                await app.model.tmdtSubDonCauHinhSanPhamMap.create({ maSubDon: subId, maSanPham: item.maSanPham, maConfig: item.maConfig, gia: item.gia, soLuong: item.soLuong, trangThai: 1 });
                await app.model.tmdtGioHang.delete({ id: item.id });
            }
            res.send(donHang);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    /**
     * API tạo order kiểu mới
     */
    app.post('/api/tmdt/user/create-confirm-order', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const user = req.session.user;
            const { confirmOrderList } = req.body;
            const now = Date.now();
            // Check các voucher sub đơn còn số lượng không
            for (let confirmOrder of confirmOrderList) {
                if (confirmOrder.voucher) {
                    let currentVoucherNumber = (await app.model.tmdtVoucher.get({ id: confirmOrder.voucher?.id, kichHoat: 1 }))?.currentNumber;
                    if (currentVoucherNumber == null || currentVoucherNumber < 1) throw 'Voucher không còn hợp lệ!';
                }
            }
            let donHang = await app.model.tmdtDonHang.create({ userEmail: user.email, ngayDat: now, tongTien: confirmOrderList.reduce((previous, current) => previous + current.tongThanhToan, 0), ho: user.lastName, ten: user.firstName });
            for (let confirmOrder of confirmOrderList) {
                let subDon = await app.model.tmdtSubDon.create({
                    maDon: donHang.id,
                    maDaiLy: confirmOrder.maDaiLy,
                    trangThai: trangThai.cho_xac_nhan,
                    trangThaiGiaoHang: trangThaiGiaoHang.dang_trong_kho,
                    trangThaiThanhToan: trangThaiThanhToan.cho_thanh_toan,
                    tongTien: confirmOrder.tongThanhToan,
                    tongTienHang: confirmOrder.tongTien,
                    tenDaiLy: confirmOrder.tenDaiLy,
                    maVoucher: confirmOrder.voucher?.id,
                    ho: confirmOrder.ho,
                    ten: confirmOrder.ten,
                    shippingInfo: confirmOrder.shippingInfo,
                    paymentInfo: confirmOrder.paymentInfo,
                    email: confirmOrder.email,
                    phone: confirmOrder.phone,
                    shippingMethod: confirmOrder.shippingMethod,
                    shippingMethodName: shippingMethodMapper[confirmOrder.shippingMethod],
                    paymentMethod: confirmOrder.paymentMethod,
                    paymentMethodName: paymentMethodMapper[confirmOrder.paymentMethod],
                    maTinhThanh: confirmOrder.maTinhThanh,
                    maQuanHuyen: confirmOrder.maQuanHuyen,
                    maPhuongXa: confirmOrder.maPhuongXa,
                    duongSoNha: confirmOrder.duongSoNha,
                    ghiChuDiaChi: confirmOrder.ghiChuDiaChi,
                    trangThaiGiaoHangLastUpdatedAt: now
                });
                if (subDon) {
                    await sendNotificationToSeller(subDon.maDaiLy, { ...subDon, userEmail: user.email });
                    if (subDon.maVoucher) {
                        let currentVoucherNumber = (await app.model.tmdtVoucher.get({ id: confirmOrder.voucher?.id })).currentNumber;
                        await app.model.tmdtVoucher.update({ id: confirmOrder.voucher?.id }, { currentNumber: currentVoucherNumber - 1 });
                    }
                }
                for (let cartItem of confirmOrder.cartItemList) {
                    await app.model.tmdtSubDonCauHinhSanPhamMap.create({ maSubDon: subDon.id, maSanPham: cartItem.maSanPham, maConfig: cartItem.maConfig, gia: cartItem.gia, soLuong: cartItem.soLuong, trangThai: 1 });
                    await app.model.tmdtGioHang.delete({ id: cartItem.id });
                }
            }
            res.send(donHang);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/user/trang-thai/update', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
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

    app.put('/api/tmdt/user/trang-thai-giao-hang/update', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
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

    app.put('/api/tmdt/user/trang-thai-thanh-toan/update', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
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

    const updateAllTrangThai = async (user, id, changes) => {
        const subDon = await app.model.tmdtSubDon.get({ id });
        if (!subDon) throw 'Không tìm thấy đơn hàng';
        const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
        if (donHang?.userEmail != user.email) throw 'Đơn hàng này không thuộc về bạn';
        const item = await app.model.tmdtSubDon.update({ id }, changes);
        if (item) await sendNotificationToSeller(item.maDaiLy, item);
        return item;
    };

    // const updateTrangThai = async (user, id, trangThai) => {
    //     const subDon = await app.model.tmdtSubDon.get({ id });
    //     if (!subDon) throw 'Không tìm thấy đơn hàng';
    //     const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
    //     if (donHang?.userEmail != user.email) throw 'Đơn hàng này không thuộc về bạn';
    //     const item = await app.model.tmdtSubDon.update({ id }, { trangThai });
    //     if (item) await sendNotificationToSeller(item.maDaiLy, item);
    //     return item;
    // };

    const updateTrangThaiGiaoHang = async (user, id, trangThaiGiaoHang) => {
        const subDon = await app.model.tmdtSubDon.get({ id });
        if (!subDon) throw 'Không tìm thấy đơn hàng';
        const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
        if (donHang?.userEmail != user.email) throw 'Đơn hàng này không thuộc về bạn';
        const item = await app.model.tmdtSubDon.update({ id }, { trangThaiGiaoHang });
        if (item) await sendNotificationToSeller(item.maDaiLy, item);
        return item;
    };

    const updateTrangThaiThanhToan = async (user, id, trangThaiThanhToan) => {
        const subDon = await app.model.tmdtSubDon.get({ id });
        if (!subDon) throw 'Không tìm thấy đơn hàng';
        const donHang = await app.model.tmdtDonHang.get({ id: subDon.maDon });
        if (donHang?.userEmail != user.email) throw 'Đơn hàng này không thuộc về bạn';
        const item = await app.model.tmdtSubDon.update({ id }, { trangThaiThanhToan });
        if (item) await sendNotificationToSeller(item.maDaiLy, item);
        return item;
    };
};