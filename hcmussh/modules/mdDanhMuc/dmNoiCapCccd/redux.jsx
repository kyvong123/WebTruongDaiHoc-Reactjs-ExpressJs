import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNoiCapCccdGetAll = 'DmNoiCapCccd:GetAll';
const DmNoiCapCccdGetPage = 'DmNoiCapCccd:GetPage';
const DmNoiCapCccdUpdate = 'DmNoiCapCccd:Update';

export default function dmNoiCapCccdReducer(state = null, data) {
    switch (data.type) {
        case DmNoiCapCccdGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNoiCapCccdGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNoiCapCccdUpdate:
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
T.initPage('dmNoiCapCccdPage', true);
export function getDmNoiCapCccdPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmNoiCapCccdPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/noi-cap-cccd/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nơi cấp cccd bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmNoiCapCccdGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách nơi cấp cccd bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmNoiCapCccdAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/noi-cap-cccd/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nơi cấp cccd bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmNoiCapCccdGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách nơi cấp cccd bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmNoiCapCccd(ma, done) {
    return () => {
        const url = `/api/danh-muc/noi-cap-cccd/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nơi cấp cccd bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNoiCapCccd(dmNoiCapCccd, done) {
    return dispatch => {
        const url = '/api/danh-muc/noi-cap-cccd';
        T.post(url, { dmNoiCapCccd }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một nơi cấp cccd bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo nơi cấp cccd thành công!', 'success');
                dispatch(getDmNoiCapCccdPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một nơi cấp cccd bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmNoiCapCccd(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/noi-cap-cccd';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu nơi cấp cccd bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật nơi cấp cccd thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNoiCapCccdPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu nơi cấp cccd bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmNoiCapCccd(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/noi-cap-cccd';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa nơi cấp cccd bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa nơi cấp cccd thành công!', 'success', false, 800);
                dispatch(getDmNoiCapCccdPage());
            }
            done && done();
        }, () => T.notify('Xóa nơi cấp cccd bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmNoiCapCccd = {
    ajax: true,
    url: '/api/danh-muc/noi-cap-cccd/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmNoiCapCccd(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};
