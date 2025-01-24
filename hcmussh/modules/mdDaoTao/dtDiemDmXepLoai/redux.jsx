import T from 'view/js/common';

// Reducer ------------------------------
const DtDmXepLoaiGetAll = 'DtDmXepLoai:GetAll';

export default function DtDmXepLoaiReducer(state = null, data) {
    switch (data.type) {
        case DtDmXepLoaiGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtDmXepLoaiAll(done) {
    return dispatch => {
        const url = '/api/dt/diem/xep-loai';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm xếp loại bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtDmXepLoaiGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDtDmXepLoai(id, done) {
    return () => {
        const url = `/api/dt/diem/xep-loai/item/${id}`;
        T.get(url, { id }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm xếp loại bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmXepLoai(data, done) {
    return dispatch => {
        const url = '/api/dt/diem/xep-loai';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới điểm xếp loại bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới điểm xếp loại thành công', 'success');
                done && done(data);
                dispatch(getDtDmXepLoaiAll());
            }
        });
    };
}

export function updateDtDmXepLoai(id, changes, done) {
    return dispatch => {
        const url = '/api/dt/diem/xep-loai';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getDtDmXepLoaiAll());
                done && done(result.item);
            }
        }, () => T.notify('Lấy dữ liệu điểm xếp loại bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_XepLoai = {
    ajax: true,
    url: '/api/dt/diem/xep-loai/active',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDtDmXepLoai(id, item => item && done && done({ id: item.id, text: item.ten })))(),
};
