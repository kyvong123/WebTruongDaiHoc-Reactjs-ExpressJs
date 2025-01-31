import T from 'view/js/common';

const TmdtUserSanPhamGetHomePage = 'TmdtUserSanPham:GetHomePage';
const TmdtUserSanPhamGetItem = 'TmdtUserSanPham:GetItem';

export default function TmdtUserSanPhamReducer(state = null, data) {
    switch (data.type) {
        case TmdtUserSanPhamGetHomePage:
            return Object.assign({}, state, { page: data.page });
        case TmdtUserSanPhamGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

T.initPage('pageTmdtUserSanPham');

export function getTmdtUserSanPhamPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtUserSanPham', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/user/home/san-pham/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                // if (page.filter) data.page.filter = page.filter;
                // if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TmdtUserSanPhamGetHomePage, page: data.page });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function getTmdtUserSanPhamItem(id, done) {
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/san-pham/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                dispatch({ type: TmdtUserSanPhamGetItem, item: data.item });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}