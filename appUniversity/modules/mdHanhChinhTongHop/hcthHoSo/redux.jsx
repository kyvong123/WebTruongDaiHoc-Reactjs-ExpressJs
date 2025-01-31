import T from 'view/js/common';

const HcthHoSoSearchPage = 'HcthHoSo:SearchPage';
const HcthHoSoChildPage = 'HcthHoSo:ChildPage';
const HcthHoSoGet = 'HcthHoSo:Get';
const HcthHoSoVanBanDiSelector = 'HcthHoSo:VanBanDiSelector';
const HcthHoSoVanBanDenSelector = 'HcthHoSo:VanBanDenSelector';

const HcthHoSoGetVanBan = 'HcthHoSo:GetVanBan';

export default function hcthHoSoReducer(state = null, data) {
    switch (data.type) {
        case HcthHoSoSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthHoSoChildPage:
            return Object.assign({}, state, { leafPage: data.page });
        case HcthHoSoGet:
            return Object.assign({}, state, { item: data.item });
        case HcthHoSoVanBanDiSelector:
            return Object.assign({}, state, { vanBanDiPage: data.page });
        case HcthHoSoVanBanDenSelector:
            return Object.assign({}, state, { vanBanDenPage: data.page });
        case HcthHoSoGetVanBan:
            return Object.assign({}, state, { item: { ...(state?.item || {}), vanBan: data.vanBan } });
        default:
            return state;
    }
}

T.initPage('pageHcthHoSo');
export function getHoSoSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage('pageHcthHoSo', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        dispatch({ type: HcthHoSoSearchPage, page: null });
        const url = `/api/hcth/ho-so/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hồ sơ bị lỗi', 'danger', data);
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthHoSoSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('pageHcthHoSoChild');
export function getLeafPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage('pageHcthHoSoChild', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        dispatch({ type: HcthHoSoChildPage, page: null });
        const url = `/api/hcth/ho-so/leaf/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hồ sơ bị lỗi', 'danger', data);
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (pageCondition) data.page.pageCondition = page.pageCondition;
                if (filter) data.page.filter = page.filter;
                dispatch({ type: HcthHoSoChildPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createHoSo(data, done) {
    return dispatch => {
        const url = '/api/hcth/ho-so';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hồ sơ bị lỗi', 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.notify('Tạo hồ sơ thành công', 'success');
                dispatch(getHoSoSearchPage());
                done && done();
            }
        }, () => T.notify('Tạo hồ sơ bị lỗi', 'danger'));
    };
}

export function getHoSo(id, done) {
    return dispatch => {
        const url = `/api/hcth/ho-so/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy hồ sơ bị lỗi', 'danger');
                console.error('GET: ' + url + '.', res.error);
            } else {
                dispatch({ type: HcthHoSoGet, item: res.item });
                done && done(res.item);
            }
        });
    };
}

export function updateHoSo(id, changes, done) {
    return () => {
        const url = '/api/hcth/ho-so/add';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hồ sơ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật hồ sơ thành công', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật hồ sơ bị lỗi!', 'danger'));
    };
}

export function deleteHoSo(id, done) {
    return () => {
        const url = '/api/hcth/ho-so';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá hồ sơ bị lỗi', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xoá hồ sơ thành công', 'success');
                done && done();
            }
        }, error => console.error(`DELETE: ${url}.`, error));
    };
}


export function deleteVanBan(id, vanBanId, done) {
    return dispatch => {
        const url = '/api/hcth/ho-so/van-ban';
        T.delete(url, { id, vanBanId }, data => {
            if (data.error) {
                T.notify('Xoá văn bản bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xoá văn bản thành công!', 'success');
                dispatch(getVanBan(id));
                done && done();
            }
        }, () => T.notify('Xoá văn bản bị lỗi', 'danger'));
    };
}

export function addVanBan(id, data, done) {
    return dispatch => {
        const url = '/api/hcth/ho-so/add-van-ban';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Thêm văn bản bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ', res.error);
            } else {
                T.notify('Thêm văn bản thành công!', 'success');
                if (data.edit) dispatch(getVanBan(id));
                else if (data.adPage) dispatch(getHoSoSearchPage());
                else dispatch(getLeafPage());
                done && done(data);
            }
        }, () => T.notify('Thêm văn bản bị lỗi', 'danger'));
    };
}


export function getVanBan(id, done) {
    return dispatch => {
        dispatch({ type: HcthHoSoGetVanBan, vanBan: null });
        const url = `/api/hcth/ho-so/van-ban/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách văn bản bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                dispatch({ type: HcthHoSoGetVanBan, vanBan: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy danh sách văn bản lỗi', 'danger'));
    };
}

export const SelectAdapter_HoSo = (vanBanId, loaiVanBan) => {
    return {
        ajax: true,
        url: '/api/hcth/ho-so/leaf/search/page/1/20',
        data: params => ({ condition: params.term, filter: { isSelector: 1, vanBanId, loaiVanBan } }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: `#${item.id} - Tiêu đề: "${item.tieuDe}" - Loại hồ sơ: ${item.loaiHoSo}` })) : [] })
    };
};

T.initPage('pageLienKetVanBanDi');
export function getVanBanDiSelector(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage('pageLienKetVanBanDi', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        dispatch({ type: HcthHoSoVanBanDiSelector, page: { list: null } });
        const url = `/api/hcth/van-ban-di/selector/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách văn bản đi bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthHoSoVanBanDiSelector, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('pageLienKetVanBanDen');
export function getVanBanDenSelector(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage('pageLienKetVanBanDen', pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        dispatch({ type: HcthHoSoVanBanDenSelector, page: { list: null } });
        const url = `/api/hcth/van-ban-den/selector/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách văn bản đến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthHoSoVanBanDenSelector, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}