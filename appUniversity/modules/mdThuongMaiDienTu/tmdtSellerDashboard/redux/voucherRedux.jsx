import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TmdtVoucherGetPage = 'TmdtSellerVoucher:GetPage';

export default function TmdtSellerVoucherReducer(state = null, data) {
    if (data.type == TmdtVoucherGetPage) {
        return Object.assign({}, state, { page: data.page });
    } else {
        return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageTmdtVoucher');

export function getTmdtVoucherPage(maDaiLy, pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtVoucher', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/voucher/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter: page.filter, maDaiLy }, data => {
            if (data.error) {
                T.notify('Lấy danh sách voucher bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TmdtVoucherGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách voucher bị lỗi!', 'danger'));
    };
}

export function getVoucher(id, done) {
    return () => {
        const url = `/api/tmdt/y-shop/seller/voucher/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy voucher bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createVoucher(maDaiLy, item, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/voucher';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo chủ đề bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới voucher thành công!', 'success');
                dispatch(getTmdtVoucherPage(maDaiLy));
                done && done(data);
            }
        }, () => T.notify('Tạo voucher bị lỗi!', 'danger'));
    };
}

export function deleteVoucher(maDaiLy, id) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/voucher';
        T.delete(url, { id: id }, data => {
            if (data.error) {
                T.notify('Xóa voucher bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Voucher đã xóa thành công!', 'success', false, 800);
                dispatch(getTmdtVoucherPage(maDaiLy));
            }
        }, () => T.notify('Xóa voucher bị lỗi!', 'danger'));
    };
}

export function updateVoucher(maDaiLy, id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/voucher';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật voucher bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật voucher thành công!', 'success');
                dispatch(getTmdtVoucherPage(maDaiLy));
                done && done();
            }
        }, () => T.notify('Cập nhật voucher bị lỗi!', 'danger'));
    };
}