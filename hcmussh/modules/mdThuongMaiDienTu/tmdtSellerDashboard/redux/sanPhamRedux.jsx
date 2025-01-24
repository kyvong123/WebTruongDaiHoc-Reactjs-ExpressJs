import T from 'view/js/common';
import { getTmdtAdminDaiLyItem } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux';

const TmdtSellerSanPhamGetPage = 'TmdtSellerSanPham:GetPage';
const TmdtSellerSanPhamGetItem = 'TmdtSellerSanPham:GetItem';
const TmdtSellerSanPhamDraftGetPage = 'TmdtSellerSanPhamDraft:GetPage';

export default function TmdtSellerSanPhamReducer(state = null, data) {
    switch (data.type) {
        case TmdtSellerSanPhamGetPage:
            return Object.assign({}, state, { page: data.page });
        case TmdtSellerSanPhamGetItem:
            return Object.assign({}, state, { item: data.item });
        case TmdtSellerSanPhamDraftGetPage:
            return Object.assign({}, state, { draftPage: data.page });
        default:
            return state;
    }
}

T.initPage('pageTmdtSellerSanPham');
export function getTmdtSellerSanPhamPage(maDaiLy, pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtSellerSanPham', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/san-pham/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, maDaiLy }, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TmdtSellerSanPhamGetPage, page: data.page });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function getTmdtSellerSanPhamItem(id, done) {
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/san-pham/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                dispatch({ type: TmdtSellerSanPhamGetItem, item: data.item });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

// Đẩy qua bảng TMDT_SAN_PHAM_DRAFT
T.initPage('pageTmdtSellerSanPhamDraft');
export function getTmdtSellerSanPhamDraftPage(maDaiLy, pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtSellerSanPhamDraft', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/san-pham/draft/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, maDaiLy }, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TmdtSellerSanPhamDraftGetPage, page: data.page });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function createTmdtSellerSanPhamDraft(maDaiLy, item, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham/draft/create';
        T.post(url, { data: { ...item, maDaiLy } }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo sản phẩm nháp bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới sản phẩm nháp thành công!', 'success');
                dispatch(getTmdtSellerSanPhamPage(maDaiLy));
                dispatch(getTmdtSellerSanPhamDraftPage(maDaiLy));
                done && done(data);
            }
        }, () => T.notify('Tạo sản phẩm nháp bị lỗi!', 'danger'));
    };
}

export function updateTmdtSellerSanPhamDraft(maDaiLy, id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham/draft/update';
        T.post(url, { id, changes: { ...changes, maDaiLy } }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin sản phẩm nháp bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin sản phẩm nháp thành công!', 'success');
                dispatch(getTmdtSellerSanPhamPage(maDaiLy));
                dispatch(getTmdtSellerSanPhamDraftPage(maDaiLy));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin sản phẩm nháp bị lỗi!', 'danger'));
    };
}

export function toggleKichHoatTmdtSellerSanPham(maDaiLy, id, kichHoat, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham/toggle/kich-hoat';
        T.put(url, { id, kichHoat }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật thông tin sản phẩm bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin sản phẩm thành công!', 'success');
                dispatch(getTmdtSellerSanPhamPage(maDaiLy));
                dispatch(getTmdtSellerSanPhamDraftPage(maDaiLy));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin sản phẩm bị lỗi!', 'danger'));
    };
}

// Cập nhật thẳng vô bảng TMDT_SAN_PHAM

export function createTmdtSellerSanPham(maDaiLy, item, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham';
        T.post(url, { data: { ...item, maDaiLy } }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo sản phẩm bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới sản phẩm thành công!', 'success');
                dispatch(getTmdtSellerSanPhamPage(maDaiLy));
                done && done(data);
            }
        }, () => T.notify('Tạo sản phẩm bị lỗi!', 'danger'));
    };
}

export function updateTmdtSellerSanPham(maDaiLy, id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham';
        T.put(url, { id, changes: { ...changes, maDaiLy } }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin sản phẩm bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin sản phẩm thành công!', 'success');
                dispatch(getTmdtSellerSanPhamPage(maDaiLy));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin sản phẩm bị lỗi!', 'danger'));
    };
}

export function deleteTmdtSellerSanPham(maDaiLy, id) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sản phẩm bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa sản phẩm thành công!', 'success', false, 800);
                dispatch(getTmdtSellerSanPhamPage(maDaiLy));
            }
        }, () => T.notify('Xóa sản phẩm bị lỗi!', 'danger'));
    };
}

// Select Dai Ly mà người dùng có tham gia
export const SelectAdapter_TmdtDaiLy_MyDaiLy = {
    ajax: true,
    url: '/api/tmdt/y-shop/seller/get-my-dai-ly/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.id, text: item.ten
        })) : []
    }),
    fetchOne: (id, done) => {
        (getTmdtAdminDaiLyItem(id, (item) => {
            const { id, ten } = item;
            done && done({ id, text: ten });
        }))();
    },
};

// Xóa ảnh đã upload nhưng chưa lưu
export function clearUnsaveImages(done) {
    return () => {
        const url = '/api/tmdt/y-shop/seller/clear-unsave';
        T.delete(url, { imgList: [] }, data => {
            if (data.error) {
                T.notify('Xóa hình tạm bị lỗi!', 'danger');
            } else {
                done && done(data.page);
            }
        }, () => T.notify('Xóa hình tạm bị lỗi!', 'danger'));
    };
}