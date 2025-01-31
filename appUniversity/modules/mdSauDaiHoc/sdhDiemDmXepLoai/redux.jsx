import T from 'view/js/common';

// Reducer ------------------------------
const SdhDiemXepLoaiGetAll = 'SdhDiemXepLoai:GetAll';

export default function SdhDiemXepLoaiReducer(state = null, data) {
    switch (data.type) {
        case SdhDiemXepLoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getSdhDiemDmXepLoaiAll(done) {
    return dispatch => {
        const url = '/api/sdh/diem-xep-loai';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu xếp loại bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemXepLoaiGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhDiemDmXepLoaiActive(done) {
    return () => {
        const url = '/api/sdh/diem-xep-loai/active';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu xếp loại bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhDiemDmXepLoai(id, done) {
    return () => {
        const url = `/api/sdh/diem-xep-loai/item/${id}`;
        T.get(url, { id }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu xếp loại bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhDiemDmXepLoai(data, done) {
    return dispatch => {
        const url = '/api/sdh/diem-xep-loai';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới xếp loại bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới xếp loại thành công', 'success');
                dispatch(getSdhDiemDmXepLoaiAll());
                done && done(data);
            }
        });
    };
}

export function updateSdhDiemDmXepLoai(id, changes, done) {
    return dispatch => {
        const url = '/api/sdh/diem-xep-loai';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getSdhDiemDmXepLoaiAll());
                done && done(result.item);
            }
        }, () => T.notify('Lấy dữ liệu xếp loại bị lỗi!', 'danger'));
    };
}



