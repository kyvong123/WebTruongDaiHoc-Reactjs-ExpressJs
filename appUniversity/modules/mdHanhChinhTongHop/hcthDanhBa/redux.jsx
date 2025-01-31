import T from 'view/js/common.js';

const HcthDanhBaGetUserPage = 'HcthDanhBa:GetUserPage';
const HcthDanhBaGetPublicPage = 'HcthDanhBa:GetPublicPage';
const HcthDanhBaGetItemPage = 'HcthDanhBa:GetItemPage';
const HcthDanhBaGetItemAll = 'HcthDanhBa:GetItemAll';
export default function reducers(state = null, data) {
    switch (data.type) {
        case HcthDanhBaGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case HcthDanhBaGetPublicPage:
            return Object.assign({}, state, { publicPage: data.page });
        case HcthDanhBaGetItemPage:
            return Object.assign({}, state, { itemPage: data.page });
        case HcthDanhBaGetItemAll:
            return Object.assign({}, state, { itemAll: data.items });
        default:
            return state;
    }
}

T.initPage('HcthDanhBaUserPage');
T.initPage('HcthDanhBaPublicPage');
T.initPage('HcthDanhBaItem');

export function createHcthDanhBa(data, done) {
    const cookie = T.updatePage('HcthDanhBaUserPage');
    const publicCookie = T.updatePage('HcthDanhBaPublicPage');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    const { pageNumber: publicPageNumber, pageSize: publicPageSize, pageCondition: publicPageCondition, filter: publicFilter } = publicCookie;
    return (dispatch) => {
        const url = '/api/hcth/vpdt/danh-ba';
        T.post(url, { data }, (res) => {
            if (res.error) {
                const { message } = res.error;
                T.notify(`Thêm danh bạ bị lỗi: '${message}'`, 'danger');
                console.error('POST: ' + url + '. ' + message);
            } else {
                T.notify('Thêm danh bạ thành công!', 'info');
                dispatch(getHcthDanhBaUserPage(pageNumber, pageSize, pageCondition, filter));
                dispatch(getHcthDanhBaPublicPage(publicPageNumber, publicPageSize, publicPageCondition, publicFilter));
                done && done(data);
            }
        }, () => T.notify('Thêm danh bạ bị lỗi', 'danger'));
    };
}

export function getHcthDanhBaUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {}; // TODO: filter JSON in DB routine
    }

    const page = T.updatePage('HcthDanhBaUserPage', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        const url = `/api/hcth/vpdt/danh-ba/user/page/${page.pageNumber}/${page.pageSize}`; // TODO: implement CRUD + Search Page API in controller
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify(`Lấy danh bạ của người dùng bị lỗi: ${data.error.message}`);
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthDanhBaGetUserPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getHcthDanhBaPublicPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {}; // TODO: filter JSON in DB routine
    }

    const page = T.updatePage('HcthDanhBaPublicPage', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/vpdt/danh-ba/public/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify(`Lấy danh bạ của người dùng bị lỗi: ${data.error.message}`);
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthDanhBaGetPublicPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getHcthDanhBaByMa(ma, done) {
    return () => {
        const url = `/api/hcth/vpdt/danh-ba/${ma}`;
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy loại đơn vị bị lỗi', 'danger');
                console.log('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getHcthDanhBaItemPage(maDanhBa, pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {}; // TODO: filter JSON in DB routine
    }
    const page = T.updatePage('HcthDanhBaItem', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/vpdt/danh-ba/detail/${maDanhBa}/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify(`Lấy danh sách cán bộ trong danh bạ bị lỗi: ${data.error.message}`);
                console.error(`GET: ${url}`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthDanhBaGetItemPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getHcthDanhBaItemAll(maDanhBa, done) {
    return dispatch => {
        const url = `/api/hcth/vpdt/danh-ba/detail/${maDanhBa}/all`;
        T.get(url, {}, (data) => {
            if (data.error) {
                T.notify(`Lấy danh sách cán bộ trong danh bạ bị lỗi: ${data.error.message}`);
                console.error(`GET: ${url}`, data.error);
            } else {
                dispatch({ type: HcthDanhBaGetItemAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}

export function updateHcthDanhBa(ma, changes) {
    changes = JSON.stringify(changes);
    const cookie = T.updatePage('HcthDanhBaUserPage');
    const publicCookie = T.updatePage('HcthDanhBaPublicPage');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    const { pageNumber: publicPageNumber, pageSize: publicPageSize, pageCondition: publicPageCondition, filter: publicFilter } = publicCookie;
    return (dispatch) => {
        const url = '/api/hcth/vpdt/danh-ba';
        T.put(url, { ma, changes }, (res) => {
            if (res.error) {
                const { message } = res.error;
                T.notify(`Chỉnh sửa danh bạ bị lỗi: '${message}'`, 'danger');
                console.error('POST: ' + url + '. ' + message);
            } else {
                T.notify('Chỉnh sửa danh bạ thành công!', 'info');
                dispatch(getHcthDanhBaUserPage(pageNumber, pageSize, pageCondition, filter));
                dispatch(getHcthDanhBaPublicPage(publicPageNumber, publicPageSize, publicPageCondition, publicFilter));
                dispatch(getHcthDanhBaItemPage(ma, pageNumber, pageSize, pageCondition, filter));
                dispatch(getHcthDanhBaItemAll(ma));
            }
        });
    };
}

export function deleteHcthDanhBa(ma) {
    const cookie = T.updatePage('HcthDanhBaUserPage');
    const publicCookie = T.updatePage('HcthDanhBaPublicPage');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    const { pageNumber: publicPageNumber, pageSize: publicPageSize, pageCondition: publicPageCondition, filter: publicFilter } = publicCookie;
    return (dispatch) => {
        const url = '/api/hcth/vpdt/danh-ba';
        T.delete(url, { ma }, (res) => {
            if (res.error) {
                const { message } = res.error;
                T.notify(`Chỉnh sửa danh bạ bị lỗi: '${message}'`, 'danger');
                console.error('POST: ' + url + '. ' + message);
            } else {
                T.notify('Chỉnh sửa danh bạ thành công!', 'info');
                dispatch(getHcthDanhBaUserPage(pageNumber, pageSize, pageCondition, filter));
                dispatch(getHcthDanhBaPublicPage(publicPageNumber, publicPageSize, publicPageCondition, publicFilter));
            }
        });
    };
}

export function deleteHcthDanhBaItem(maDanhBa, shcc) {
    const cookie = T.updatePage('HcthDanhBaItem');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return (dispatch) => {
        const url = '/api/hcth/vpdt/danh-ba-item';
        T.delete(url, { maDanhBa, shcc }, (res) => {
            if (res.error) {
                const { message } = res.error;
                T.notify(`Chỉnh sửa danh bạ bị lỗi: '${message}'`, 'danger');
                console.error('POST: ' + url + '. ' + message);
            } else {
                T.notify('Chỉnh sửa danh bạ thành công!', 'info');
                dispatch(getHcthDanhBaItemPage(maDanhBa, pageNumber, pageSize, pageCondition, filter));
                dispatch(getHcthDanhBaItemAll(maDanhBa));
            }
        });
    };
}

export const SelectAdapter_HcthDanhBa = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/hcth/vpdt/danh-ba/select-adapter/all',
    processResults: response => ({
        results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : []
    }),
    fetchOne: (ma, done) => getHcthDanhBaByMa(ma, item => done && done({ id: item.ma, text: item.ten }))
};