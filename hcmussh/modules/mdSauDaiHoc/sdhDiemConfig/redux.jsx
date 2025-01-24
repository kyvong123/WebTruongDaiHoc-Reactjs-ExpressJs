import T from 'view/js/common';

// Reducer ------------------------------
const SdhDiemConfigGetAll = 'SdhDiemConfig:GetAll';
const SdhDiemConfigGetSemester = 'SdhDiemConfig:GetSemester';

export default function SdhDiemConfigReducer(state = null, data) {
    switch (data.type) {
        case SdhDiemConfigGetAll:
            return Object.assign({}, state, {
                items: data.items,
                dataClone: data.items.filter(i => i.configThanhPhan.length || i.configQuyChe.length).map(i => ({ id: i.ma, text: `Cấu hình NH: ${i.namHoc} - HK: ${i.hocKy}`, data: { configQuyChe: i.configQuyChe, configThanhPhan: i.configThanhPhan } }))
            });
        case SdhDiemConfigGetSemester:
            return Object.assign({}, state, { semester: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getSdhDiemConfigAll(done) {
    return dispatch => {
        const url = '/api/sdh/grade-manage/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu cấu hình điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemConfigGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhDiemConfigBySemester(namHoc, hocKy, done) {
    return dispatch => {
        const url = '/api/sdh/grade-manage/semester';
        T.get(url, { namHoc, hocKy }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu cấu hình điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemConfigGetSemester, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhDiemConfig(data, done) {
    return dispatch => {
        const url = '/api/sdh/grade-manage/semester/phan-he';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới cấu hình điểm bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới điểm cấu hình điểm thành công', 'success');
                dispatch(getSdhDiemConfigBySemester(data.namHoc, data.hocKy));
                done && done(data.items);
            }
        });
    };
}

export function updateSdhDiemConfig(id, data, done) {
    return dispatch => {
        const url = '/api/sdh/grade-manage/semester/phan-he';
        T.put(url, { id, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật cấu hình điểm bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật cấu hình thành công', 'success');
                dispatch(getSdhDiemConfigBySemester(data.namHoc, data.hocKy));
                done && done(result.items);
            }
        }, () => T.notify('Lấy dữ liệu cấu hình điểm bị lỗi!', 'danger'));
    };
}

export function cloneSdhDiemConfig(semester, data, done) {
    return () => {
        const url = '/api/sdh/grade-manage/semester/clone';
        T.post(url, { semester, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Sao chép cấu hình điểm bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Sao chép cấu hình điểm thành công', 'success');
                done && done(result.items);
            }
        }, () => T.notify('Lấy dữ liệu cấu hình điểm bị lỗi!', 'danger'));
    };
}


