import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDmThuAll = 'SdhDmThu:GetAll';

export default function SdhDmThuReducer(state = null, data) {
    switch (data.type) {
        case SdhDmThuAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getSdhDmThuAll(done) {
    return dispatch => {
        const url = '/api/sdh/thu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhDmThuAll, items: data.items });
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhDmThuActive(done) {
    return dispatch => {
        const url = '/api/sdh/thu/active';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhDmThuAll, items: data.items });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function createSdhDmThu(item, done) {
    return dispatch => {
        const url = '/api/sdh/thu';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo thứ bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới thông tin thứ thành công!', 'success');
                dispatch(getSdhDmThuAll());
                done && done();
            }
        }, () => T.notify('Tạo thứ bị lỗi!', 'danger'));
    };
}

export function deleteSdhDmThu(ma) {
    return dispatch => {
        const url = '/api/sdh/thu';
        T.delete(url, { ma: ma }, data => {
            if (data.error) {
                T.notify('Xóa thứ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa thứ thành công!', 'success', false, 800);
                dispatch(getSdhDmThuAll());
            }
        }, () => T.notify('Xóa thứ bị lỗi!', 'danger'));
    };
}

export function updateSdhDmThu(ma, changes, done) {
    return dispatch => {
        const url = '/api/sdh/thu';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin thứ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin thứ thành công!', 'success');
                dispatch(getSdhDmThuAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin thứ bị lỗi!', 'danger'));
    };
}

