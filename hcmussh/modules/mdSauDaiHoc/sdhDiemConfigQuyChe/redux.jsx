import T from 'view/js/common';

// Reducer ------------------------------
const SdhDiemConfigQuyCheGetAll = 'SdhDiemConfigQuyChe:GetAll';

export default function SdhDiemConfigQuyCheReducer(state = null, data) {
    switch (data.type) {
        case SdhDiemConfigQuyCheGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getSdhDiemConfigQuyCheAll(semester, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/quy-che/all';
        T.get(url, { semester }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu cấu hình quy chế điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemConfigQuyCheGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateSdhDiemQuyCheItem(id, changes, semester, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/quy-che/item';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công điểm quy chế' + result.item.ma, 'success');
                dispatch(getSdhDiemConfigQuyCheAll(semester, done));
                done && done(result.items);
            }
        }, () => T.notify('Lấy dữ liệu điểm thành phần bị lỗi!', 'danger'));
    };
}

export function createSdhDiemQuyChe(semester, data, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/quy-che';
        T.post(url, { semester, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới điểm quy chế bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới điểm quy chế thành công', 'success');
                dispatch(getSdhDiemConfigQuyCheAll(semester, done));
                done && done(result.items);
            }
        });
    };
}

export function deleteSdhDiemQuyChe(id, semester, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/quy-che';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa điểm quy chế bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xóa điểm quy chế thành công', 'success');
                dispatch(getSdhDiemConfigQuyCheAll(semester, done));
                done && done(result.items);
            }
        });
    };
}