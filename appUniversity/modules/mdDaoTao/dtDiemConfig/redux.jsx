import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemConfigGetAll = 'DtDiemConfig:GetAll';
const DtDiemConfigGetFilter = 'DtDiemConfig:GetFilter';

export default function DtDiemConfigReducer(state = null, data) {
    switch (data.type) {
        case DtDiemConfigGetAll:
            return Object.assign({}, state, {
                items: data.items,
                dataClone: data.items.filter(i => i.configThanhPhan || i.configQuyChe).map(i => ({ id: i.idSemester, text: `Cấu hình NH${i.namHoc} - HK${i.hocKy}`, data: i }))
            });
        case DtDiemConfigGetFilter:
            return Object.assign({}, state, { dataFilter: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtDiemConfigAll(done) {
    return dispatch => {
        const url = '/api/dt/diem/semester-config';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông số cấu hình điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtDiemConfigGetAll, items: result.semester });
                done && done(result.semester);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDtDiemConfigFilter(filter, done) {
    return dispatch => {
        const url = '/api/dt/diem/semester-config/filter';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy thông số cấu hình điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtDiemConfigGetFilter, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getConfigDiemByHocPhan(filter, done) {
    return () => {
        const url = '/api/dt/diem/diem-config/hoc-phan';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy thông số cấu hình điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDtDiemConfigActive(done) {
    return () => {
        const url = '/api/dt/diem/semester/active';
        T.get(url, result => {
            if (result.error) {
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDiemConfig(data, done) {
    return dispatch => {
        const url = '/api/dt/diem/semester-config';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới thông số cấu hình điểm bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới thông số cấu hình điểm thành công', 'success');
                done && done(data);
                dispatch(getDtDiemConfigFilter({ namHoc: data.namHoc, hocKy: data.hocKy }));
            }
        });
    };
}


export function updateTimeConfig(data, done) {
    return () => {
        const url = '/api/dt/diem/config-time-hoc-phan';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật thông số điểm học phần bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Cập nhật thông số điểm học phần thành công', 'success');
                done && done(data);
            }
        });
    };
}

export function cloneDtDiemConfig(data, done) {
    return dispatch => {
        const url = '/api/dt/diem/clone-config';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Sao chép cấu hình điểm bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Sao chép cấu hình điểm thành công', 'success');
                dispatch(getDtDiemConfigAll());
                done && done(result);
            }
        });
    };
}

export function updateMultipleTimeConfig(data, done) {
    return () => {
        const url = '/api/dt/diem/time-config-multiple';
        T.post(url, { data }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Cập nhật thời gian nhập điểm bị lỗi!', 'error', false, 2000);
                console.error(data.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getDtConfigThanhPhan(filter, done) {
    return () => {
        const url = '/api/dt/diem/config-thanh-phan';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy cấu hình thành phần bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                done && done(result.data);
            }
        });
    };
}