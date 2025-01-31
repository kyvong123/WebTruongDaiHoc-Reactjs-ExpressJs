import T from 'view/js/common';

const HcthSoVanBanRequestSearchPage = 'HcthSoVanBanRequest:SearchPage';


export default function soVanBanRequestReducer(state = null, data) {
    switch (data.type) {
        case HcthSoVanBanRequestSearchPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

const pageName = 'pageHcthSoVanBanRequest';
T.initPage(pageName);
export function getPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage(pageName, pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        dispatch({ type: HcthSoVanBanRequestSearchPage, page: null });
        const url = `/api/hcth/so-van-ban/request/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách yêu cầu cấp số văn bản bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthSoVanBanRequestSearchPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách yêu cầu cấp số văn bản bị lỗi', 'danger'));
    };
}


const adminPageName = 'pageHcthSoVanBanAdminRequest';
T.initPage(adminPageName);
export function getAdminPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage(adminPageName, pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        dispatch({ type: HcthSoVanBanRequestSearchPage, page: null });
        const url = `/api/hcth/so-van-ban/request/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách yêu cầu cấp số văn bản bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthSoVanBanRequestSearchPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách yêu cầu cấp số văn bản bị lỗi', 'danger'));
    };
}


export function createRequest(data, done, onFinish) {
    return () => {
        const url = '/api/hcth/so-van-ban/request';
        T.post(url, data, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Tạo yêu cầu lỗi. ' + (res.error.message ? res.error.message : ''), 'danger');
                console.error('POST: ' + url, res.error);
            } else {
                T.notify('Tạo yêu cầu số văn bản thành công', 'success');
                done && done(res.item);
            }
        }, () => T.notify('Tạo yêu cầu lỗi. ', 'danger'));
    };
}

export function acceptRequest(id, done, onFinish) {
    return () => {
        const url = '/api/hcth/so-van-ban/request/accept';
        T.put(url, { id }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Cập nhật yêu cầu lỗi. ' + (res.error.message ? res.error.message : ''), 'danger');
                console.error('PUT: ' + url, res.error);
            } else {
                T.notify('Cập nhật cầu số văn bản thành công', 'success');
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật yêu cầu lỗi. ', 'danger'));
    };
}

export function declineRequest(id, done, onFinish) {
    return () => {
        const url = '/api/hcth/so-van-ban/request/decline';
        T.put(url, { id }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Cập nhật yêu cầu lỗi. ' + (res.error.message ? res.error.message : ''), 'danger');
                console.error('PUT: ' + url, res.error);
            } else {
                T.notify('Cập nhật cầu số văn bản thành công', 'success');
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật yêu cầu lỗi. ', 'danger'));
    };
}


export function deleteRequest(id, done) {
    return () => {
        const url = `/api/hcth/so-van-ban/request/${id}`;
        T.delete(url, (res) => {
            if (res.error) {
                T.notify('Xóa yêu cầu lỗi.', 'danger');
                console.error('GET: ' + url, res.error);
            }
            else {
                T.notify('Xóa yêu cầu thành công.', 'success');
                done && done();
            }
        }, () => T.notify('Xóa yêu cầu lỗi.', 'danger'));
    };
}




