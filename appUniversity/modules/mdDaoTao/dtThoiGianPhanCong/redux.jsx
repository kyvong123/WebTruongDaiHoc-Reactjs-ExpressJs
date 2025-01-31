import T from 'view/js/common';

// Reducer-------------------------------
const DtThoiGianPhanCongGetAll = 'DtThoiGianPhanCong:All';

export default function DtThoiGianPhanCongReducer(state = null, data) {
    switch (data.type) {
        case DtThoiGianPhanCongGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}


// Actions -----------------------------
export function getDtThoiGianPhanCong(done) {
    return dispatch => {
        const url = '/api/dt/thoi-gian-phan-cong';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin thời gian phân công bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtThoiGianPhanCongGetAll, items: result.data });
                done && done(result.data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtThoiGianPhanCong(data, done) {
    return dispatch => {
        const url = '/api/dt/thoi-gian-phan-cong';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo mới thời gian phân công bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới thời gian phân công thành công', 'success');
                dispatch(getDtThoiGianPhanCong());
                done && done(data);
            }
        });
    };
}

export function updateDtThoiGianPhanCong(id, changes, done) {
    return dispatch => {
        const url = '/api/dt/thoi-gian-phan-cong';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thông tin thời gian phân công bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thông tin thời gian phân công thành công', 'success');
                dispatch(getDtThoiGianPhanCong());
                done && done(result.item);
            }
        }, () => T.notify('Lấy thông tin thời gian phân công bị lỗi!', 'danger'));
    };
}