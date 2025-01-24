import T from 'view/js/common';

const TmdtAdminDuyetTaskGetPage = 'TmdtAdminDuyetTask:GetPage';
const TmdtAdminDuyetTaskDetailItem = 'TmdtAdminDuyetTask:DetailItem';

export default function TmdtAdminDuyetTaskReducer(state = null, data) {
    switch (data.type) {
        case TmdtAdminDuyetTaskGetPage:
            return Object.assign({}, state, { page: data.page });
        case TmdtAdminDuyetTaskDetailItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

T.initPage('pageTmdtAdminDuyetTask');

export function getTmdtAdminDuyetTaskPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtAdminDuyetTask', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/duyet-task/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TmdtAdminDuyetTaskGetPage, page: data.page });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function rejectSanPhamDuyetTask(id, rejectComment, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/duyet-task/reject';
        T.put(url, { id, rejectComment }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tiến trình reject sản phẩm trên hệ thống đã bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tiến trình reject sản phẩm trên hệ thống thành công!', 'success');
                done && done(data);
                dispatch(getTmdtAdminDuyetTaskPage());
            }
        }, () => T.notify('Tiến trình reject sản phẩm trên hệ thống đã bị lỗi!', 'danger'));
    };
}

export function approveCreateSanPhamDuyetTask(id, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/duyet-task/approve/create-san-pham';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tiến trình approve tạo mới sản phẩm trên hệ thống đã bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tiến trình approve tạo mới sản phẩm trên hệ thống thành công!', 'success');
                done && done(data);
                dispatch(getTmdtAdminDuyetTaskPage());
            }
        }, () => T.notify('Tiến trình approve tạo mới sản phẩm trên hệ thống đã bị lỗi!', 'danger'));
    };
}

export function approveUpdateSanPhamDuyetTask(id, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/duyet-task/approve/update-san-pham';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tiến trình approve cập nhật sản phẩm trên hệ thống đã bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tiến trình approve cập nhật sản phẩm trên hệ thống thành công!', 'success');
                done && done(data);
                dispatch(getTmdtAdminDuyetTaskPage());
            }
        }, () => T.notify('Tiến trình approve cập nhật sản phẩm trên hệ thống đã bị lỗi!', 'danger'));
    };
}

export function getTmdtSanPhamDuyet(id, done) {
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/san-pham-duyet/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                dispatch({ type: TmdtAdminDuyetTaskDetailItem, item: data.item });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}