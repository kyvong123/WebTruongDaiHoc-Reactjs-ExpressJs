import T from 'view/js/common';

// Reducer ------------------------------
const DtSemesterGetAll = 'DtSemester:GetAll';

export default function DtSemesterReducer(state = null, data) {
    switch (data.type) {
        case DtSemesterGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtSemesterAll(done) {
    return dispatch => {
        const url = '/api/dt/semester';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin học kỳ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtSemesterGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtSemester(data, done) {
    return dispatch => {
        const url = '/api/dt/semester';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới thông số học kỳ bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới thông số học kỳ thành công', 'success');
                done && done(data);
                dispatch(getDtSemesterAll());
            }
        });
    };
}

export function updateDtSemester(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/semester';
        T.put(url, { ma, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thông số học kỳ thành công', 'success');
                dispatch(getDtSemesterAll());
                done && done(result.item);
            }
        }, () => T.notify('Lấy thông tin học kỳ bị lỗi!', 'danger'));
    };
}

export function getDtSemesterYear(namHoc, done) {
    return () => {
        const url = `/api/dt/school-year/item/${namHoc}`;
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

export function getDtSemester(ma, done) {
    return () => {
        const url = `/api/dt/semester/item/${ma}`;
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

export function getCurrSemester(done) {
    return () => {
        const url = '/api/dt/semester/current';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu năm học, hoc kỳ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SchoolYear = {
    ajax: true,
    url: '/api/dt/school-year',
    data: params => ({ searchTerm: params.term || '' }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item, text: item })) : [] }),
    fetchOne: (namHoc, done) => (getDtSemesterYear(namHoc, item => done && done({ id: item.namHoc, text: item.namHoc })))(),
};

export const SelectAdapter_SemesterData = (idSem) => ({
    ajax: true,
    url: '/api/dt/semester',
    data: params => ({ searchTerm: params.term || '', idSem }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.namHoc}, ${item.tenHocKy}` })) : [] }),
    fetchOne: (ma, done) => (getDtSemester(ma, item => done && done({ id: item.ma, text: `${item.namHoc}, HK${item.hocKy}` })))(),
});
