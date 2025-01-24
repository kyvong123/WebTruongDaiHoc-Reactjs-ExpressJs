import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemChuyenAll = 'DtDiemChuyen:GetAll';
const DtThangDiemInfo = 'DtDiemChuyen:GetThangDiem';

export default function DtDiemChuyenReducer(state = null, data) {
    switch (data.type) {
        case DtDiemChuyenAll:
            return Object.assign({}, state, { items: data.items, listHeDiem: data.heDiem, listXepLoai: data.xepLoai });
        case DtThangDiemInfo:
            return Object.assign({}, state, { items: data.items, listKhoaSinhVien: data.listKhoaSinhVien, listHeDiem: data.listHeDiem });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtDiemChuyenAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-chuyen';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm chuyển bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtDiemChuyenAll, items: result.items, heDiem: result.heDiem, xepLoai: result.xepLoai });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getThongTinThangDiem(done) {
    return dispatch => {
        const url = '/api/dt/diem-config/thang-diem';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm chuyển bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtThangDiemInfo, items: result.items, listHeDiem: result.listHeDiem, listKhoaSinhVien: result.listKhoaSinhVien });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDiemChuyen(maThangDiem, data, done) {
    return (dispatch) => {
        const url = '/api/dt/diem-config/diem-chuyen';
        T.post(url, { maThangDiem, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới thang điểm bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thang điểm thành công', 'success');
                dispatch(getThongTinThangDiem());
                done && done(result);
            }
        });
    };
}

export function updateDtDiemChuyen(info, id, data, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-chuyen';
        T.put(url, { info, id, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getDtDiemChuyenAll(info));
                done && done(result.item);
            }
        }, () => T.notify('Lấy dữ liệu điểm chuyển bị lỗi!', 'danger'));
    };
}

export function deleteDtDiemChuyen(info, id, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-chuyen';
        T.delete(url, { info, id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xoá bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thành công', 'success');
                dispatch(getDtDiemChuyenAll(info));
                done && done(result.item);
            }
        }, () => T.notify('Lấy dữ liệu điểm chuyển bị lỗi!', 'danger'));
    };
}

export function createThangDiemKhoaSV(khoaSinhVien, maThangDiem, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/thang-diem-khoa-sv';
        T.post(url, { khoaSinhVien, maThangDiem }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getThongTinThangDiem());
                done && done(result.item);
            }
        });
    };
}
