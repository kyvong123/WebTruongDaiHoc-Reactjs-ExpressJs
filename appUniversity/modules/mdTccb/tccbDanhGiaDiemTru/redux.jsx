import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDiemTruGetAll = 'TccbDiemTru:GetAll';
const TccbDiemTruUpdate = 'TccbDiemTru:Update';

export default function TccbDiemTruReducer(state = null, data) {
    switch (data.type) {
        case TccbDiemTruGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbDiemTruUpdate:
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
export function getTccbDiemTruAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/tccb/danh-gia/diem-tru/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm trừ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: TccbDiemTruGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getTccbDiemTru(id, done) {
    return () => {
        const url = `/api/tccb/danh-gia/diem-tru/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy mục điểm trừ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function createTccbDiemTru(item, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/diem-tru';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo mới điểm trừ thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getTccbDiemTruAll());
                done && done(data.item);
            }
        });
    };
}

export function deleteTccbDiemTru(id, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/diem-tru';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa điểm trừ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá điểm trừ thành công!', 'success', false, 800);
                dispatch(getTccbDiemTruAll());
                done && done();
            }
        }, () => T.notify('Xóa điểm trừ bị lỗi!', 'danger'));
    };
}

export function updateTccbDiemTru(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia/diem-tru';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật điểm trừ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật điểm trừ thành công!', 'success');
                dispatch(getTccbDiemTruAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật điểm trừ bị lỗi!', 'danger'));
    };
}

export function changeTccbDiemTru(item) {
    return { type: TccbDiemTruUpdate, item };
}

export const SelectAdapter_TccbDiemTru = (nam) => ({
    ajax: true,
    url: `/api/tccb/danh-gia/diem-tru/${nam}`,
    getOne: getTccbDiemTru,
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.noiDung}: ${item.diemQuyDinh} điểm` })) : [] }),
    fetchOne: (id, done) => (getTccbDiemTru(id, item => done && done({ id: item.id, text: `${item.noiDung}: ${item.diemQuyDinh} điểm` })))(),
});