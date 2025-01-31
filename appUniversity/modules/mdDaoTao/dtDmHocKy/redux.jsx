import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmHocKyGetAll = 'DtDmHocKy:GetAll';
const DtDmHocKyGetPage = 'DtDmHocKy:GetPage';
const DtDmHocKyUpdate = 'DtDmHocKy:Update';

export default function dtDmHocKyReducer(state = null, data) {
    switch (data.type) {
        case DtDmHocKyGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDmHocKyGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDmHocKyUpdate:
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
export function getDtDmHocKyAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/hoc-ky/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học kỳ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDmHocKyGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDmHocKy');
export function getDtDmHocKyPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDtDmHocKy', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/dt/hoc-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách học kỳ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DtDmHocKyGetPage, page: data.page });
            }
        });
    };
}

export function createDtDmHocKy(item, done) {
    return dispatch => {
        const url = '/api/dt/hoc-ky';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo học kỳ bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thông tin học kỳ thành công!', 'success');
                dispatch(getDtDmHocKyAll());
                done && done(data.items);
            }
        });
    };
}

export function deleteDtDmHocKy(ma) {
    return dispatch => {
        const url = '/api/dt/hoc-ky/';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa học kỳ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Học kỳ đã xóa thành công!', 'success', false, 800);
                dispatch(getDtDmHocKyAll());
            }
        }, () => T.notify('Xóa học kỳ bị lỗi!', 'danger'));
    };
}

export function updateDtDmHocKy(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/hoc-ky';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật học kỳ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin học kỳ thành công!', 'success');
                dispatch(getDtDmHocKyAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin học kỳ bị lỗi!', 'danger'));
    };
}

export function changeDtDmHocKy(item) {
    return { type: DtDmHocKyUpdate, item };
}
export function getDtDmHocKy(ma, done) {
    return () => {
        const url = `/api/dt/hoc-ky/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin học kỳ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_DtDmHocKy = {
    ajax: true,
    url: '/api/dt/hoc-ky/all',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDmHocKy(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};