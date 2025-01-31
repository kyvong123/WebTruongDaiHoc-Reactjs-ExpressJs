import T from 'view/js/common';

// Reducer ------------------------------
const SdhDiemConfigThanhPhanGetAll = 'SdhDiemConfigThanhPhan:GetAll';

export default function SdhDiemConfigThanhPhanReducer(state = null, data) {
    switch (data.type) {
        case SdhDiemConfigThanhPhanGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getSdhDiemConfigThanhPhanAll(semester, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/thanh-phan/all';
        T.get(url, { semester }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu cấu hình thành phần điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemConfigThanhPhanGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateSdhDiemThanhPhanItem(id, changes, semester, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/thanh-phan/item';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công điểm thành phần ' + result.item.ma, 'success');
                dispatch(getSdhDiemConfigThanhPhanAll(semester, done));
                done && done(result.item);
            }
        }, () => T.notify('Lấy dữ liệu điểm thành phần bị lỗi!', 'danger'));
    };
}

export function createSdhDiemThanhPhan(semester, data, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/thanh-phan';
        T.post(url, { semester, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới điểm thành phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới điểm thành phần thành công', 'success');
                dispatch(getSdhDiemConfigThanhPhanAll(semester, done));
                done && done(result.items);
            }
        });
    };
}
export function deleteSdhDiemThanhPhan(id, semester, done) {
    return dispatch => {
        const url = '/api/sdh/diem-config/thanh-phan';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa điểm thành phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xóa điểm thành phần thành công', 'success');
                dispatch(getSdhDiemConfigThanhPhanAll(semester, done));
                done && done(result.items);
            }
        });
    };
}