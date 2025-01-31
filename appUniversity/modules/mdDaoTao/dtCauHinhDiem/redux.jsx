import T from 'view/js/common';

// Reducer ------------------------------
const DtCauHinhDiemKey = 'DtCauHinhDiemKey';
const DtCauHinhDiemConfig = 'DtCauHinhDiemConfig';

export default function DtCauHinhDiemReducer(state = null, data) {
    switch (data.type) {
        case DtCauHinhDiemKey:
            return Object.assign({}, state, { dtCauHinhDiem: data.items });
        case DtCauHinhDiemConfig:
            return Object.assign({}, state, data.items);
        default:
            return state;
    }
}

export function getAllDtCauHinhDiem(done) {
    return () => {
        const url = '/api/dt/cau-hinh-diem/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình điểm bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình điểm bị lỗi!', 'danger'));
    };
}

export function getDtCauHinhDiemKeys(keys, done) {
    return dispatch => {
        const url = '/api/dt/cau-hinh-diem/keys';
        T.get(url, { keys }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình điểm bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtCauHinhDiemKey, items: result.items });
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình điểm bị lỗi!', 'danger'));
    };
}

export function updateDtCauHinhDiemKeys(changes, done) {
    return () => {
        const url = '/api/dt/cau-hinh-diem';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật cấu hình điểm bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật cấu hình điểm thành công', 'success');
                done && done();
            }
        }, () => T.notify('Lấy thông tin cấu hình điểm bị lỗi!', 'danger'));
    };
}