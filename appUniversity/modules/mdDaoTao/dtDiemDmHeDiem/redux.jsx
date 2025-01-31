import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDiemDmHeDiemGetAll = 'DtDiemDmHeDiem:GetAll';
const DtDiemDmHeDiemUpdate = 'DtDiemDmHeDiem:Update';

export default function dtDiemDmHeDiemReducer(state = null, data) {
    switch (data.type) {
        case DtDiemDmHeDiemGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDiemDmHeDiemUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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
export function getDtDiemDmHeDiemAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/he-diem/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hệ điểm bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDiemDmHeDiemGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDiemDmHeDiem');

export function createDtDiemDmHeDiem(item, done) {
    return dispatch => {
        const url = '/api/dt/he-diem';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo hệ điểm bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo hệ điểm thành công!', 'success');
                dispatch(getDtDiemDmHeDiemAll());
                done && done(data.item);
            }
        });
    };
}

export function updateDtDiemDmHeDiem(id, changes, done) {
    return dispatch => {
        const url = '/api/dt/he-diem';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật hệ điểm bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hệ điểm thành công!', 'success');
                dispatch(getDtDiemDmHeDiemAll());
                done && done();
            }
        }, () => T.notify('Cập nhật hệ điểm bị lỗi!', 'danger'));
    };
}

export function deleteDtDiemDmHeDiem(id) {
    return dispatch => {
        const url = '/api/dt/he-diem/';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa hệ điểm bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Hệ điểm đã xóa thành công!', 'success', false, 800);
                dispatch(getDtDiemDmHeDiemAll());
            }
        }, () => T.notify('Xóa hệ điểm bị lỗi!', 'danger'));
    };
}



export function changeDtDiemDmHeDiem(item) {
    return { type: DtDiemDmHeDiemUpdate, item };
}
export function getDtDiemDmHeDiem(id, done) {
    return () => {
        const url = `/api/dt/he-diem/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin hệ điểm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_DtDiemDmHeDiem = {
    ajax: true,
    url: '/api/dt/he-diem/all',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten, data: item })) : [] }),
    fetchOne: (id, done) => (getDtDiemDmHeDiem(id, item => item && done && done({ id: item.id, text: item.ten, item })))(),
};

export function getHeDiemActive(done) {
    return () => {
        const url = '/api/dt/he-diem/get-active';
        T.get(url, data => {
            if (data.error) {
                console.error(`POST ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}