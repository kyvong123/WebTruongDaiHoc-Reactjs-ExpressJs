import T from 'view/js/common';

const TmdtSellerGetMyDaiLy = 'TmdtSeller:GetMyDaiLy';
const TmdtDaiLyGetItem = 'TmdtDaiLy:GetItem';

export default function TmdtSellerCauHinhSanPhamReducer(state = null, data) {
    switch (data.type) {
        case TmdtSellerGetMyDaiLy:
            return Object.assign({}, state, { items: data.items });
        case TmdtDaiLyGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

export function getTmdtSellerMyDaiLyList(done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/get-my-dai-ly/all';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy thông tin đại lý bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TmdtSellerGetMyDaiLy, items: data && data.page ? data.page.list : [] });
            }
        }, () => T.notify('Lấy thông tin đại lý bị lỗi!', 'danger'));
    };
}


export function getTmdtDaiLy(id, done) {
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/my-dai-ly/info/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy thông tin đại lý bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                dispatch({ type: TmdtDaiLyGetItem, item: data.item });
            }
        }, () => T.notify('Lấy thông tin đại lý bị lỗi!', 'danger'));
    };
}

export function updateTmdtDaiLy(maDaiLy, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/my-dai-ly/info';
        T.put(url, { maDaiLy, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin đại lý bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đại lý thành công!', 'success');
                dispatch(getTmdtDaiLy(maDaiLy));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin đại lý bị lỗi!', 'danger'));
    };
}