import T from 'view/js/common';

const TmdtSellerDonHangGetPage = 'TmdtSellerDonHang:GetPage';

export default function TmdtSellerDonHangReducer(state = null, data) {
    switch (data.type) {
        case TmdtSellerDonHangGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageTmdtSellerDonHang');
export function getTmdtSellerDonHangDaiLyPage(maDaiLy, pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtSellerDonHang', pageNumber, pageSize, pageCondition, filter);
    if (filter && filter['trangThai'] == '0') filter['trangThai'] = null;
    return dispatch => {
        const url = `/api/tmdt/seller/don-hang/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, maDaiLy }, data => {
            if (data.error) {
                T.notify('Lấy đơn hàng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TmdtSellerDonHangGetPage, page: data.page });
            }
        }, () => T.notify('Lấy đơn hàng bị lỗi!', 'danger'));
    };
}

/**
 * Các hàm redux trạng thái cũ
 */
export function confirmTmdtOrderPurchase(maDaiLy, id, done) {
    return dispatch => {
        // const url = '/api/tmdt/seller/confirm-order-purchase';
        const url = '';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật đơn hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTmdtSellerDonHangDaiLyPage(maDaiLy));
            }
        }, () => T.notify('Cập nhật đơn hàng bị lỗi!', 'danger'));
    };
}

/**
 * ******************************************************
 */

/**
 * Cập nhật trạng thái
 */
export function confirmTmdtNewOrder(maDaiLy, id, done) {
    return dispatch => {
        const url = '/api/tmdt/seller/confirm-new-order';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật đơn hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTmdtSellerDonHangDaiLyPage(maDaiLy));
            }
        }, () => T.notify('Cập nhật đơn hàng bị lỗi!', 'danger'));
    };
}

export function denyTmdtNewOrder(maDaiLy, id, done) {
    return dispatch => {
        const url = '/api/tmdt/seller/deny-new-order';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật đơn hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTmdtSellerDonHangDaiLyPage(maDaiLy));
            }
        }, () => T.notify('Cập nhật đơn hàng bị lỗi!', 'danger'));
    };
}

export function closeTmdtOrder(maDaiLy, id, done) {
    return dispatch => {
        const url = '/api/tmdt/seller/close-order';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật đơn hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTmdtSellerDonHangDaiLyPage(maDaiLy));
            }
        }, () => T.notify('Cập nhật đơn hàng bị lỗi!', 'danger'));
    };
}

/**
 * Cập nhật trạng thái thanh toán
 */
export function confirmPurchaseTmdtOrder(maDaiLy, id, done) {
    return dispatch => {
        const url = '/api/tmdt/seller/confirm-order-purchase';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật đơn hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTmdtSellerDonHangDaiLyPage(maDaiLy));
            }
        }, () => T.notify('Cập nhật đơn hàng bị lỗi!', 'danger'));
    };
}

/**
 * Cập nhât trạng thái giao hàng
 */
export function setTmdtOrderDelivering(maDaiLy, id, done) {
    return dispatch => {
        const url = '/api/tmdt/seller/set-order-delivering';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật đơn hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTmdtSellerDonHangDaiLyPage(maDaiLy));
            }
        }, () => T.notify('Cập nhật đơn hàng bị lỗi!', 'danger'));
    };
}

export function setTmdtOrderDeliveryDone(maDaiLy, id, done) {
    return dispatch => {
        const url = '/api/tmdt/seller/set-order-delivery-done';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật đơn hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTmdtSellerDonHangDaiLyPage(maDaiLy));
            }
        }, () => T.notify('Cập nhật đơn hàng bị lỗi!', 'danger'));
    };
}