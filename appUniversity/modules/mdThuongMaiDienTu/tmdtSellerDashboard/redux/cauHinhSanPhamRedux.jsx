import T from 'view/js/common';

const TmdtSellerCauHinhBySanPhamGetPage = 'TmdtSellerCauHinhSanPham:GetPage';
const TmdtSellerCauHinhDraftBySanPhamGetPage = 'TmdtSellerCauHinhDraftBySanPham:GetPage';
const TmdtSellerCauHinhDraftByDaiLyGetPage = 'TmdtSellerCauHinhDraftByDaiLy:GetPage';
const TmdtSellerCauHinhSanPhamGetSanPham = 'TmdtSellerCauHinhSanPham:GetSanPham';

export default function TmdtSellerCauHinhSanPhamReducer(state = null, data) {
    switch (data.type) {
        case TmdtSellerCauHinhBySanPhamGetPage:
            return Object.assign({}, state, { items: data.items });
        case TmdtSellerCauHinhDraftBySanPhamGetPage:
            return Object.assign({}, state, { draftItems: data.items });
        case TmdtSellerCauHinhDraftByDaiLyGetPage:
            return Object.assign({}, state, { cauHinhDraftPage: data.page });
        case TmdtSellerCauHinhSanPhamGetSanPham:
            return Object.assign({}, state, { spItem: data.spItem });
        default:
            return state;
    }
}

export function getTmdtSellerCauHinhBySanPham(id, done) {
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/san-pham/cau-hinh/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                dispatch({ type: TmdtSellerCauHinhBySanPhamGetPage, items: data.items });
                dispatch({ type: TmdtSellerCauHinhDraftBySanPhamGetPage, items: data.draftItems });
                dispatch({ type: TmdtSellerCauHinhSanPhamGetSanPham, spItem: data.spItem });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

T.initPage('pageTmdtSellerCauHinhDraftByDaiLy');
export function getTmdtSellerCauHinhDraftByDaiLyPage(maDaiLy, pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtSellerCauHinhDraftByDaiLy', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/san-pham/cau-hinh/draft/by-dai-ly/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, maDaiLy }, data => {
            if (data.error) {
                T.notify('Lấy cấu hình sản phẩm nháp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TmdtSellerCauHinhDraftByDaiLyGetPage, page: data.page });
            }
        }, () => T.notify('Lấy cấu hình sản phẩm nháp bị lỗi!', 'danger'));
    };
}

export function createTmdtSellerCauHinhDraft(maSanPham, data, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham/cau-hinh/draft/create';
        T.post(url, { data: { ...data, maSanPham } }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo yêu cầu thêm cấu hình sản phẩm bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo yêu cầu thêm cấu hình sản phẩm thành công! Vui lòng chờ kết quả duyệt từ Admin Y-Shop!', 'success');
                dispatch(getTmdtSellerCauHinhBySanPham(maSanPham));
                done && done(data);
            }
        }, () => T.notify('Tạo sản phẩm bị lỗi!', 'danger'));
    };
}

export function updateTmdtSellerCauHinhDraft(maSanPham, maCauHinhSanPham, data, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham/cau-hinh/draft/update';
        T.post(url, { data: { ...data, maSanPham, maCauHinhSanPham } }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo yêu cầu cập nhật cấu hình sản phẩm bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo yêu cầu cập nhật cấu hình sản phẩm thành công! Vui lòng chờ kết quả duyệt từ Admin Y-Shop', 'success');
                dispatch(getTmdtSellerCauHinhBySanPham(maSanPham));
                done && done(data);
            }
        }, () => T.notify('Tạo yêu cầu cập nhật cấu hình sản phẩm bị lỗi!', 'danger'));
    };
}

export function toggleKichHoatTmdtSellerCauHinhSanPham(maSanPham, maCauHinh, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/san-pham/cau-hinh';
        T.put(url, { id: maCauHinh, changes: { ...changes } }, data => {
            if (data.error || changes == null) {
                T.notify('Bật/tắt cấu hình sản phẩm bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Bật/tắt cấu hình sản phẩm thành công!', 'success');
                dispatch(getTmdtSellerCauHinhBySanPham(maSanPham));
                done && done();
            }
        }, () => T.notify('Bật/tắt sản phẩm bị lỗi!', 'danger'));
    };
}