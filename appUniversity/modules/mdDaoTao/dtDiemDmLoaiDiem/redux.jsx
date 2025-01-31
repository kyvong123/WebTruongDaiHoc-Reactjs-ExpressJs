import T from 'view/js/common';

// Reducer ------------------------------
const DtDmLoaiDiemGetAll = 'DtDmLoaiDiem:GetAll';

export default function DtDmLoaiDiemReducer(state = null, data) {
    switch (data.type) {
        case DtDmLoaiDiemGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtDmLoaiDiemAll(done) {
    return dispatch => {
        const url = '/api/dt/loai-diem';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu loại điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtDmLoaiDiemGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDtDmLoaiDiem(ma, done) {
    return () => {
        const url = `/api/dt/loai-diem/item/${ma}`;
        T.get(url, { ma }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu loại điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmLoaiDiem(data, done) {
    return dispatch => {
        const url = '/api/dt/loai-diem';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới loại điểm bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới loại điểm thành công', 'success');
                done && done(data);
                dispatch(getDtDmLoaiDiemAll());
            }
        });
    };
}

export function updateDtDmLoaiDiem(changes, done) {
    return dispatch => {
        const url = '/api/dt/loai-diem';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getDtDmLoaiDiemAll());
                done && done(result.item);
            }
        }, () => T.notify('Lấy dữ liệu loại điểm bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_LoaiDiem = {
    ajax: true,
    url: '/api/dt/loai-diem/active',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDmLoaiDiem(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};

export const SelectAdapter_LoaiDiemThanhPhan = {
    ajax: true,
    url: '/api/dt/loai-diem/active',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.filter(e => e.ma != 'TK').map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDmLoaiDiem(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};