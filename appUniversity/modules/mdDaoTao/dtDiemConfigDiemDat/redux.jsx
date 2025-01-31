import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemConfigDatGetAll = 'DtDiemConfigDat:GetAll';
const DtDiemConfigDatUpdate = 'DtDiemConfigDat:UpdateDiem';

export default function DtDiemConfigDatReducer(state = null, data) {
    switch (data.type) {
        case DtDiemConfigDatGetAll:
            return Object.assign({}, state, { diemSemester: data.diemSemester, configDiemDat: data.configDiemDat });
        case DtDiemConfigDatUpdate:
            return Object.assign(state, { diemSemester: data.diemSemester });
        default:
            return state;
    }
}

// Actions ------------------------------

export function getDiemConfigDat(data, done) {
    return dispatch => {
        const url = '/api/dt/diem/diem-config-dat';
        T.get(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy dữ liệu điểm đạt bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done();
                dispatch({ type: DtDiemConfigDatGetAll, diemSemester: result.diemSemester, configDiemDat: result.configDiemDat });
            }
        });
    };
}

export function updateDiemSemesterDat(id, diemDat, done) {
    return dispatch => {
        const url = '/api/dt/diem/semester-config-dat';
        T.put(url, { id, diemDat }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật điểm đạt bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật điểm đạt thành công', 'success');
                done && done();
                dispatch({ type: DtDiemConfigDatUpdate, diemSemester: diemDat.toString() });
            }
        });
    };
}

export function createDtDiemConfigDat(semester, data, done) {
    return dispatch => {
        const url = '/api/dt/diem/diem-config-dat';
        T.post(url, { semester, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật điểm đạt bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật điểm đạt thành công', 'success');
                done && done();
                dispatch(getDiemConfigDat(semester));
            }
        });
    };
}

export function updateDtDiemConfigDat(id, changes, semester, done) {
    return dispatch => {
        const url = '/api/dt/diem/diem-config-dat';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật điểm đạt bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật điểm đạt thành công', 'success');
                done && done();
                dispatch(getDiemConfigDat(semester));
            }
        });
    };
}

export function deleteDtDiemConfigDat(id, semester, done) {
    return dispatch => {
        const url = '/api/dt/diem/diem-config-dat';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa điểm đạt bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xóa điểm đạt thành công', 'success');
                done && done();
                dispatch(getDiemConfigDat(semester));
            }
        });
    };
}