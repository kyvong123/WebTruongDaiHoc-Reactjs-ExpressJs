import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChucVuGetAll = 'DmChucVu:GetAll';
const DmChucVuGetPage = 'DmChucVu:GetPage';
const DmChucVuUpdate = 'DmChucVu:Update';

export default function DmChucVuReducer(state = null, data) {
    switch (data.type) {
        case DmChucVuGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmChucVuGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChucVuUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmChucVu');
export function getDmChucVuPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmChucVu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/chuc-vu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmChucVuGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách chức vụ bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmChucVuAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-vu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chức vụ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmChucVuGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách chức vụ bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function getDmChucVu(ma, done) {
    return () => {
        const url = `/api/danh-muc/chuc-vu/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chức vụ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmChucVu(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-vu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmChucVuPage());
                done && done(data);
            }
        }, error => T.notify('Tạo dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function deleteDmChucVu(ma) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-vu';
        T.delete(url, { ma }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                dispatch(getDmChucVuPage());
            }
        }, error => T.notify('Xóa dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function updateDmChucVu(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/chuc-vu';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật dữ liệu thành công!', 'success');
                done && done(data.item);
                dispatch(getDmChucVuPage());
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export function createMultiDmChucVu(dmChucVu, isOverride, done) {
    return () => {
        const url = '/api/danh-muc/chuc-vu/multiple';
        T.post(url, { dmChucVu, isOverride }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, error => T.notify('Cập nhật dữ liệu bị lỗi' + (error.error.message && (':<br>' + error.message)), 'danger'));
    };
}

export const SelectAdapter_DmChucVu = {
    ajax: false,
    getAll: getDmChucVuAll,
    processResults: response => ({ results: response ? response.map(item => ({ value: item.ma, text: item.ten })) : [] }),
    condition: { kichHoat: 1 },
};

export const SelectAdapter_DmChucVuV2 = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1, loaiChucVu: 1 }),
    url: '/api/danh-muc/chuc-vu/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmChucVu(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
    getOne: getDmChucVu,
    processResultOne: response => response && ({ value: response.ma, text: `${response.ma}: ${response.ten}` }),
};

export const SelectAdapter_DmChucVuV1 = {
    ajax: false,
    data: () => ({ condition: { kichHoat: 1 } }),
    url: '/api/danh-muc/chuc-vu/all',
    getOne: getDmChucVu,
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmChucVu(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};

export const SelectAdapter_DmChucVuV0 = {
    ajax: true,
    data: () => ({ condition: { kichHoat: 1 } }),
    url: '/api/danh-muc/chuc-vu/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
};

export const SelectAdapter_DmChucVuPhoTruong = {
    ajax: true,
    data: () => ({ condition: { statement: 'ma in (:listMa)', parameter: { listMa: ['004', '003'] } } }),
    url: '/api/danh-muc/chuc-vu/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
};