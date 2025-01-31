import T from 'view/js/common';

const TmdtAdminCauHinhSanPhamGetPage = 'TmdtAdminCauHinhSanPham:GetPage';
const TmdtAdminCauHinhSanPhamGetSanPham = 'TmdtAdminCauHinhSanPham:GetSanPham';

export default function TmdtAdminCauHinhSanPhamReducer(state = null, data) {
    switch (data.type) {
        case TmdtAdminCauHinhSanPhamGetPage:
            return Object.assign({}, state, { items: data.items });
        case TmdtAdminCauHinhSanPhamGetSanPham:
            return Object.assign({}, state, { spItem: data.spItem });
        default:
            return state;
    }
}

T.initPage('pageTmdtAdminCauHinhSanPham');

export function getTmdtAdminCauHinhBySanPhamId(maSanPham, done) {
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/san-pham/cau-hinh/${maSanPham}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                dispatch({ type: TmdtAdminCauHinhSanPhamGetPage, items: data.items });
                dispatch({ type: TmdtAdminCauHinhSanPhamGetSanPham, spItem: data.spItem });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function createTmdtAdminCauHinh(maSanPham, data, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/san-pham/cau-hinh';
        T.post(url, { data: { ...data, maSanPham } }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo sản phẩm bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới sản phẩm thành công!', 'success');
                dispatch(getTmdtAdminCauHinhBySanPhamId(maSanPham));
                done && done(data);
            }
        }, () => T.notify('Tạo sản phẩm bị lỗi!', 'danger'));
    };
}

export function updateTmdtAdminCauHinh(maSanPham, maCauHinh, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/san-pham/cau-hinh';
        T.put(url, { id: maCauHinh, changes: { ...changes, maSanPham } }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin cấu hình sản phẩm bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin cấu hình sản phẩm thành công!', 'success');
                dispatch(getTmdtAdminCauHinhBySanPhamId(maSanPham));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin sản phẩm bị lỗi!', 'danger'));
    };
}

export function deleteTmdtAdminCauHinh(maSanPham, id, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/san-pham/cau-hinh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sản phẩm bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa sản phẩm thành công!', 'success', false, 800);
                dispatch(getTmdtAdminCauHinhBySanPhamId(maSanPham));
                done && done();
            }
        }, () => T.notify('Xóa sản phẩm bị lỗi!', 'danger'));
    };
}
