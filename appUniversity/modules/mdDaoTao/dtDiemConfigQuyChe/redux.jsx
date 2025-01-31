import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemQuyCheGetAll = 'DtDiemQuyChe:GetAll';

export default function DtDiemQuyCheReducer(state = null, data) {
    switch (data.type) {
        case DtDiemQuyCheGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtDiemQuyCheAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-quy-che';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm quy chế bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtDiemQuyCheGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDiemQuyChe(semester, data, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-quy-che';
        T.post(url, { semester, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới điểm quy chế bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới điểm quy chế thành công', 'success');
                dispatch(getDtDiemQuyCheAll(semester, done));
            }
        });
    };
}

export function updateDtDiemQuyCheItem(id, changes, semester, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-quy-che/item';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công điểm quy chế ' + result.item.ma, 'success');
                dispatch(getDtDiemQuyCheAll(semester));
                done && done();
            }
        }, () => T.notify('Lấy dữ liệu điểm quy chế bị lỗi!', 'danger'));
    };
}

export function deleteDtDiemQuyCheItem(id, semester, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-quy-che/item';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thành công điểm quy chế', 'success');
                dispatch(getDtDiemQuyCheAll(semester, done));
            }
        }, () => T.notify('Lấy dữ liệu điểm quy chế bị lỗi!', 'danger'));
    };
}
