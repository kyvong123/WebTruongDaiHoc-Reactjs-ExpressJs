import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmNgoaiNguGetAll = 'dtDmNgoaiNgu:GetAll';
const DtDmNgoaiNguUpdate = 'dtDmNgoaiNgu:Update';

export default function dtDmNgoaiNguReducer(state = null, data) {
    switch (data.type) {
        case DtDmNgoaiNguGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDmNgoaiNguUpdate:
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
export function getDtDmNgoaiNguAll(done) {
    return dispatch => {
        const url = '/api/dt/ngoai-ngu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngoại ngữ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDmNgoaiNguGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDmNgoaiNgu');
export function createDtDmNgoaiNgu(item, done) {
    return dispatch => {
        const url = '/api/dt/ngoai-ngu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo ngoại ngữ bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thông tin ngoại ngữ thành công!', 'success');
                dispatch(getDtDmNgoaiNguAll());
                done && done(data.items);
            }
        });
    };
}

export function deleteDtDmNgoaiNgu(ma) {
    return dispatch => {
        const url = '/api/dt/ngoai-ngu';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa ngoại ngữ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Ngoại ngữ đã xóa thành công!', 'success', false, 800);
                dispatch(getDtDmNgoaiNguAll());
            }
        }, () => T.notify('Xóa ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function updateDtDmNgoaiNgu(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/ngoai-ngu';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật ngoại ngữ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ngoại ngữ thành công!', 'success');
                dispatch(getDtDmNgoaiNguAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function changeDtDmNgoaiNgu(item) {
    return { type: DtDmNgoaiNguUpdate, item };
}
export function getDtDmNgoaiNgu(ma, done) {
    return () => {
        const url = `/api/dt/ngoai-ngu/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngoại ngữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_DtDmNgoaiNgu = {
    ajax: true,
    url: '/api/dt/ngoai-ngu/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDmNgoaiNgu(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};