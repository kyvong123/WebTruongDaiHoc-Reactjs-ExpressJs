import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmCefrGetAll = 'dtDmCefr:GetAll';
const DtDmCefrUpdate = 'dtDmCefr:Update';

export default function dtDmCefrReducer(state = null, data) {
    switch (data.type) {
        case DtDmCefrGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDmCefrUpdate:
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
export function getDtDmCefrAll(done) {
    return dispatch => {
        const url = '/api/dt/cefr/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khung trình độ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDmCefrGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDmCefr');
export function createDtDmCefr(item, done) {
    return dispatch => {
        const url = '/api/dt/cefr';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo khung trình độ bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thông tin khung trình độ thành công!', 'success');
                dispatch(getDtDmCefrAll());
                done && done(data.items);
            }
        });
    };
}

export function deleteDtDmCefr(ma) {
    return dispatch => {
        const url = '/api/dt/cefr';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa khung trình độ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khung trình độ đã xóa thành công!', 'success', false, 800);
                dispatch(getDtDmCefrAll());
            }
        }, () => T.notify('Xóa khung trình độ bị lỗi!', 'danger'));
    };
}

export function updateDtDmCefr(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/cefr';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật khung trình độ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khung trình độ thành công!', 'success');
                dispatch(getDtDmCefrAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin khung trình độ bị lỗi!', 'danger'));
    };
}

export function changeDtDmCefr(item) {
    return { type: DtDmCefrUpdate, item };
}
export function getDtDmCefr(ma, done) {
    return () => {
        const url = `/api/dt/cefr/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin khung trình độ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_DtDmCefr = {
    ajax: true,
    url: '/api/dt/cefr/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.description}` })) : [] }),
    fetchOne: (ma, done) => (getDtDmCefr(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.description}` })))(),
};