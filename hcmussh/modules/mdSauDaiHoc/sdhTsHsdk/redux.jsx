import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const SdhTsHsdkGetAll = 'SdhTsHsdk:GetAll';
const SdhTsHsdkUpdate = 'SdhTsHsdk:Update';

export default function SdhTsHsdkReducer(state = null, data) {
    switch (data.type) {
        case SdhTsHsdkGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhTsHsdkUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),

                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------

export function getSdhTsHsdkAll(done) {
    return (dispatch) => {
        const url = '/api/sdh/ts/hsdk/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy bộ hồ sơ lưu trữ bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhTsHsdkGetAll, items: data.items });
                done && done(data.items);
            }
        }, (error) => T.notify('Lấy bộ hồ sơ lưu trữ bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}


export function getSdhTsHsdk(id, done) {
    return () => {
        const url = `/api/sdh/ts/hsdk/item/${id}`;
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy bộ hồ sơ lưu trữ bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.item);
            }
        }, (error) => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhTsHsdk(changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/ts/hsdk';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Tạo mới bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thành công!', 'success');
                dispatch(getSdhTsHsdkAll());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function updateSdhTsHsdk(id, changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/ts/hsdk';
        T.put(url, { id, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin thành công!', 'success');
                done && done(data.item);
                dispatch(getSdhTsHsdkAll());
            }
        }, (error) => T.notify('Cập nhật thông tin bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteSdhTsHsdk(id, path) {
    return (dispatch) => {
        const url = '/api/sdh/ts/hsdk';
        T.delete(url, { id, path }, (data) => {
            if (data.error) {
                T.notify('Xóa thông tin bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thông tin thành công!', 'success', false, 800);
                dispatch(getSdhTsHsdkAll());
            }
        }, (error) => T.notify('Xóa thông tin bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}
