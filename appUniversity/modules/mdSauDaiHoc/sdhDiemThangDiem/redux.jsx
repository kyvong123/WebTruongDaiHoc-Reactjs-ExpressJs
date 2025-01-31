import T from 'view/js/common';

// Reducer ------------------------------
const SdhDiemThangDiemGetAll = 'SdhDiemThangDiem:GetAll';
const SdhDiemThangDiemGetKhoaAll = 'SdhDiemThangDiem:GetKhoaAll';

export default function SdhDiemThangDiemReducer(state = null, data) {
    switch (data.type) {
        case SdhDiemThangDiemGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhDiemThangDiemGetKhoaAll:
            return Object.assign({}, state, { thangDiemKhoa: data.thangDiemKhoa });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getSdhDiemThangDiemAll(done) {
    return dispatch => {
        const url = '/api/sdh/diem/thang-diem/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu thang điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemThangDiemGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhDiemThangDiem(done) {
    return () => {
        const url = '/api/sdh/diem/thang-diem';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu thang điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function createSdhDiemThangDiem(thangDiem, thangDiemDetail, done) {
    return dispatch => {
        const url = '/api/sdh/diem/thang-diem';
        T.post(url, { thangDiem, thangDiemDetail }, result => {
            if (result.error) {
                T.notify('Tạo dữ liệu thang điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Tạo dữ liệu thang điểm thành công', 'success');
                dispatch(getSdhDiemThangDiemAll());
                done && done();
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function updateSdhDiemThangDiem(id, thangDiem, thangDiemDetail, done) {
    return dispatch => {
        const url = '/api/sdh/diem/thang-diem';
        T.put(url, { id, thangDiem, thangDiemDetail }, result => {
            if (result.error) {
                T.notify('Cập nhật dữ liệu thang điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getSdhDiemThangDiemAll());
                done && done(result);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhThangDiemKhoaHv(khoaHocVien, idThangDiem, done) {
    return dispatch => {
        const url = '/api/sdh/diem/thang-diem-khoa-hoc-vien';
        T.post(url, { khoaHocVien, idThangDiem }, result => {
            if (result.error) {
                T.notify('Tạo dữ liệu thang điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Tạo dữ liệu thang điểm thành công', 'success');
                dispatch(getSdhThangDiemKhoaAll());
                done && done(result.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function updateSdhThangDiemKhoaHv(id, idThangDiem, done) {
    return dispatch => {
        const url = '/api/sdh/diem/thang-diem-khoa-hoc-vien';
        T.put(url, { id, idThangDiem }, result => {
            if (result.error) {
                T.notify('Cập nhật dữ liệu thang điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getSdhThangDiemKhoaAll());
                done && done(result);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhThangDiemKhoaAll(done) {
    return dispatch => {
        const url = '/api/sdh/diem/thang-diem-hoc-vien/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu thang điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemThangDiemGetKhoaAll, thangDiemKhoa: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}