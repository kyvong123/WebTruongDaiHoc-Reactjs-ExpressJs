import T from 'view/js/common';

// Reducer ------------------------------
const SdhDiemDacBietGetAll = 'SdhDiemDacBiet:GetAll';

export default function SdhDiemDacBietReducer(state = null, data) {
    switch (data.type) {
        case SdhDiemDacBietGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getSdhDiemDacBietAll(done) {
    return dispatch => {
        const url = '/api/sdh/diem-dac-biet';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm đặc biệt bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemDacBietGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhDiemDacBiet(ma, done) {
    return () => {
        const url = `/api/sdh/diem-dac-biet/item/${ma}`;
        T.get(url, { ma }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm đặc biệt bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhDiemDacBiet(data, done) {
    return dispatch => {
        const url = '/api/sdh/diem-dac-biet';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới điểm đặc biệt bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới điểm đặc biệt thành công', 'success');
                done && done(data);
                dispatch(getSdhDiemDacBietAll());
            }
        });
    };
}

export function updateSdhDiemDacBiet(changes, done) {
    return dispatch => {
        const url = '/api/sdh/diem-dac-biet';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getSdhDiemDacBietAll());
                done && done(result.item);
            }
        }, () => T.notify('Lấy dữ liệu điểm đặc biệt bị lỗi!', 'danger'));
    };
}
export function getSdhDiemDacBietTongKet(done) {
    return () => {
        const url = '/api/sdh/diem-dac-biet/tong-ket';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm đặc biệt bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export const SelectAdapter_DiemDacBietSdh = {
    ajax: true,
    url: '/api/sdh/diem-dac-biet/active',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.moTa })) : [] }),
    fetchOne: (ma, done) => (getSdhDiemDacBiet(ma, item => item && done && done({ id: item.ma, text: item.moTa })))(),
};

