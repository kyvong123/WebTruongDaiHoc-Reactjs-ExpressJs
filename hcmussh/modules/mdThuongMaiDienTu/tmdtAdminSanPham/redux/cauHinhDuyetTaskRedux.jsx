import T from 'view/js/common';

const TmdtAdminCauHinhDuyetTaskGetPage = 'TmdtAdminCauHinhDuyetTask:GetPage';

export default function TmdtAdminCauHinhDuyetTaskReducer(state = null, data) {
    switch (data.type) {
        case TmdtAdminCauHinhDuyetTaskGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageTmdtAdminCauHinhDuyetTask');

export function getTmdtAdminCauHinhDuyetTask(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtAdminCauHinhDuyetTask', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/cau-hinh-duyet-task/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TmdtAdminCauHinhDuyetTaskGetPage, page: data.page });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function rejectCauHinhDuyetTask(id, rejectComment, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/cau-hinh-duyet-task/reject';
        T.put(url, { id, rejectComment }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tiến trình reject cấu hình sản phẩm trên hệ thống đã bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tiến trình reject cấu hình sản phẩm trên hệ thống thành công!', 'success');
                done && done(data);
                dispatch(getTmdtAdminCauHinhDuyetTask());
            }
        }, () => T.notify('Tiến trình reject cấu hình sản phẩm trên hệ thống đã bị lỗi!', 'danger'));
    };
}

export function approveCreateCauHinhDuyetTask(id, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/cau-hinh-duyet-task/approve/create-san-pham';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tiến trình approve tạo mới cấu hình sản phẩm trên hệ thống đã bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tiến trình approve tạo mới cấu hình sản phẩm trên hệ thống thành công!', 'success');
                done && done(data);
                dispatch(getTmdtAdminCauHinhDuyetTask());
            }
        }, () => T.notify('Tiến trình approve tạo mới cấu hình sản phẩm trên hệ thống đã bị lỗi!', 'danger'));
    };
}

export function approveUpdateCauHinhDuyetTask(id, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/cau-hinh-duyet-task/approve/update-san-pham';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tiến trình approve cập nhật cấu hình sản phẩm trên hệ thống đã bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tiến trình approve cập nhật cấu hình sản phẩm trên hệ thống thành công!', 'success');
                done && done(data);
                dispatch(getTmdtAdminCauHinhDuyetTask());
            }
        }, () => T.notify('Tiến trình approve cập nhật cấu hình sản phẩm trên hệ thống đã bị lỗi!', 'danger'));
    };
}