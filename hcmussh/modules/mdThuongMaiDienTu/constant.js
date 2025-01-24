module.exports = () => ({
    trangThaiCu: {
        'cho_xac_nhan': 1,
        'cho_thanh_toan': 2,
        'da_thanh_toan': 3,
        'da_nhan_hang': 4,
        'huy': 5,
        'shop_tu_choi': 6,
        'dang_giao_hang': 7,
    },

    trangThaiMapper: {
        'pending': 0,
        'cho_xac_nhan': 1,
        'dang_xu_ly': 2,
        'ket_thuc': 3,
        'huy': 4,
        'shop_tu_choi': 5,
    },

    trangThaiName: {
        0: 'Chưa xác nhận',
        1: 'Chờ xác nhận',
        2: 'Đang xử lý',
        3: 'Kết thúc',
        4: 'Hủy',
        5: 'Shop từ chối',
    },

    trangThaiGiaoHang: {
        'pending': 0,
        'dang_trong_kho': 1,
        'dang_giao_hang': 2,
        'da_giao_hang': 3,
        'giao_hang_that_bai': 4,
    },

    trangThaiGiaoHangName: {
        0: 'Chưa xác nhận',
        1: 'Trong kho',
        2: 'Đang giao hàng',
        3: 'Đã giao hàng',
        4: 'Giao hàng thất bại',
    },

    trangThaiThanhToan: {
        'pending': 0,
        'cho_thanh_toan': 1,
        'da_thanh_toan': 2,
    },

    trangThaiThanhToanName: {
        0: 'Chưa xác nhận',
        1: 'Chờ thanh toán',
        2: 'Đã thanh toán',
    },

    shippingMethod: {
        '1': 'Lấy hàng tại Shop',
        '2': 'Giao hàng tận nơi',
    },

    paymentMethod: {
        '1': 'Thanh toán khi nhận hàng',
        '2': 'Chuyển khoản',
    }

});