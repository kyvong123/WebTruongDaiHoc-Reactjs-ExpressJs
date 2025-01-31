import T from 'view/js/common';
// Reducer ------------------------------
const SdhSemesterGetAll = 'SdhSemester:GetAll';

export default function SdhSemesterReducer(state = null, data) {
    switch (data.type) {
        case SdhSemesterGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
// Actions ------------------------------
export function getSdhSemesterAll(done) {
    return dispatch => {
        const url = '/api/sdh/semester';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin học kỳ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhSemesterGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhSemester(data, done) {
    return dispatch => {
        const url = '/api/sdh/semester';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới thông số học kỳ bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới thông số học kỳ thành công', 'success');
                done && done(data);
                dispatch(getSdhSemesterAll());
            }
        });
    };
}

export function updateSdhSemester(ma, changes, done) {
    return dispatch => {
        const url = '/api/sdh/semester';
        T.put(url, { ma, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thông số học kỳ thành công', 'success');
                dispatch(getSdhSemesterAll());
                done && done(result.item);
            }
        }, () => T.notify('Lấy thông tin học kỳ bị lỗi!', 'danger'));
    };
}

export function getSdhSemesterYear(namHoc, done) {
    return () => {
        const url = `/api/sdh/school-year/item/${namHoc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhSemesterKhoaSv(khoaSv, done) {
    return () => {
        const url = `/api/sdh/school-year/${khoaSv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhSemester(ma, done) {
    return () => {
        const url = `/api/sdh/semester/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu học kỳ - năm học', 'error');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export function getSdhSemesterFrom(maHocKy, done) {
    return () => {
        const url = `/api/sdh/semester/from/${maHocKy}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu học kỳ - năm học', 'error');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function getSdhSemesterCurrent(done) {
    return () => {
        const url = '/api/sdh/semester/current';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu năm học', 'error');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SchoolYear = {
    ajax: true,
    url: '/api/sdh/school-year',
    data: params => ({ searchTerm: params.term || '' }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item, text: item })) : [] }),
    fetchOne: (namHoc, done) => (getSdhSemesterYear(namHoc, item => done && done({ id: item.namHoc, text: item.namHoc })))(),
};

export const SelectAdapter_SemesterData = {
    ajax: true,
    url: '/api/sdh/semester',
    data: params => ({ searchTerm: params.term || '' }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: Học Kỳ ${item.hocKy} - Năm học ${item.namHoc}` })) : [] }),
    fetchOne: (ma, done) => (getSdhSemester(ma, item => done && done({ id: item.ma, text: `${item.ma}: Học Kỳ ${item.hocKy} - Năm học ${item.namHoc}` })))(),
};
