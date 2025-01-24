import T from 'view/js/common';

const TmdtAdminSanPhamGetPage = 'TmdtAdminSanPham:GetPage';
const TmdtAdminSanPhamGetItem = 'TmdtAdminSanPham:GetItem';

export default function TmdtAdminSanPhamReducer(state = null, data) {
    switch (data.type) {
        case TmdtAdminSanPhamGetPage:
            return Object.assign({}, state, { page: data.page });
        case TmdtAdminSanPhamGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

T.initPage('pageTmdtAdminSanPham');

export function getTmdtAdminSanPhamPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtAdminSanPham', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/san-pham/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                // if (page.filter) data.page.filter = page.filter;
                // if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TmdtAdminSanPhamGetPage, page: data.page });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function getTmdtAdminSanPhamItem(id, done) {
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/san-pham/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                dispatch({ type: TmdtAdminSanPhamGetItem, item: data.item });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}


export function createTmdtAdminSanPham(item, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/san-pham';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo sản phẩm bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới sản phẩm thành công!', 'success');
                dispatch(getTmdtAdminSanPhamPage());
                done && done(data);
            }
        }, () => T.notify('Tạo sản phẩm bị lỗi!', 'danger'));
    };
}

export function updateTmdtAdminSanPham(id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/san-pham';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin sản phẩm bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin sản phẩm thành công!', 'success');
                dispatch(getTmdtAdminSanPhamPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin sản phẩm bị lỗi!', 'danger'));
    };
}

export function toggleKichHoatTmdtAdminSanPham(id, kichHoat, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/san-pham/toggle/kich-hoat';
        T.put(url, { id, kichHoat }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật thông tin sản phẩm bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin sản phẩm thành công!', 'success');
                dispatch(getTmdtAdminSanPhamPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin sản phẩm bị lỗi!', 'danger'));
    };
}


export function deleteTmdtAdminSanPham(id) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/san-pham';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sản phẩm bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa sản phẩm thành công!', 'success', false, 800);
                dispatch(getTmdtAdminSanPhamPage());
            }
        }, () => T.notify('Xóa sản phẩm bị lỗi!', 'danger'));
    };
}

// Xóa ảnh đã upload nhưng chưa lưu
export function clearUnsaveImages(done) {
    return () => {
        const url = '/api/tmdt/y-shop/san-pham/clear-unsave';
        T.delete(url, { imgList: [] }, data => {
            if (data.error) {
                T.notify('Xóa hình tạm bị lỗi!', 'danger');
            } else {
                done && done(data.page);
            }
        }, () => T.notify('Xóa hình tạm bị lỗi!', 'danger'));
    };
}
