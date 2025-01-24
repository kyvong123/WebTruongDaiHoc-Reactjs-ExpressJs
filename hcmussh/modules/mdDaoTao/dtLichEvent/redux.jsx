import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtLichEventGetAll = 'dtLichEvent:GetAll';
const DtLichEventGetPage = 'dtLichEvent:GetPage';
const DtLichEventUpdate = 'dtLichEvent:Update';

export default function DtLichEventReducer(state = null, data) {
    switch (data.type) {
        case DtLichEventGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtLichEventGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtLichEventUpdate:
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
export function getDtLichEventAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/lich-event/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.data);
                dispatch({ type: DtLichEventGetAll, items: data.data ? data.data : [] });
            }
        });
    };
}

T.initPage('pageDtLichEvent');
export function getDtLichEventPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtLichEvent', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/lich-event/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtLichEventGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDtLichEvent(changes, done) {
    const cookie = T.updatePage('pageDtLichEvent');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/lich-event';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Tạo mới sự kiện thất bại', 'error', false, 1000);
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo sự kiện thành công!', 'success');
                dispatch(getDtLichEventPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        });
    };
}

export function updateDtLichEvent(id, changes, done) {
    const cookie = T.updatePage('pageDtLichEvent');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/lich-event';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin sự kiện bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật thông tin sự kiện thành công!', 'success');
                dispatch(getDtLichEventPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin sự kiện bị lỗi!', 'danger'));
    };
}

export function deleteDtLichEvent(id, done) {
    const cookie = T.updatePage('pageDtLichEvent');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/lich-event';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Hủy sự kiện bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hủy sự kiện thành công!', 'success', false, 800);
                dispatch(getDtLichEventPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done();
        }, () => T.notify('Hủy sự kiện bị lỗi!', 'danger'));
    };
}

export function deleteDtLichEventItem(id, done) {
    return () => {
        const url = '/api/dt/lich-event/item';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.alert('Hủy sự kiện bị lỗi!', 'error', false, 800);
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hủy sự kiện thành công!', 'success', false, 800);
                done && done();
            }
        });
    };
}

export function checkNgayLe(ngayBatDau, soTuanLap, done) {
    return () => {
        const url = '/api/dt/lich-event/check-ngay-le';
        T.get(url, { ngayBatDau, soTuanLap }, data => {
            if (data.error) {
                T.notify('Kiểm tra ngày lễ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            }
            done && done(data);
        });
    };
}

export function dtLichEventGetData(idEvent, done) {
    return () => {
        const url = '/api/dt/lich-event/data';
        T.get(url, { idEvent }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu lịch sự kiện bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        });
    };
}

export function dtLichEventCreateNew(idEvent, changes, done) {
    return () => {
        const url = '/api/dt/lich-event/new';
        T.post(url, { idEvent, changes }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Tạo mới sự kiện thất bại', 'error', false, 1000);
                console.error(`POST ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        });
    };
}