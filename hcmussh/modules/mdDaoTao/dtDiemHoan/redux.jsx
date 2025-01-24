import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemHoanGetPage = 'DtDiemHoan:GetPage';
export default function DtDiemMienReducer(state = null, data) {
    switch (data.type) {
        case DtDiemHoanGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//ACTIONS-------------------------------------------------------------------------------------------------------------
T.initPage('pageDiemHoan');
export function getPageDiemHoan(pageNumber, pageSize, pageCondition, filter, done) {
    return dispatch => {
        const page = T.updatePage('pageDiemHoan', pageNumber, pageSize, pageCondition, filter);
        const url = `/api/dt/exam/dinh-chi-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu hoãn thi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtDiemHoanGetPage, page: result.page });
                done && done(result.page);
            }
        });
    };
}

export function dtDiemHoanSaveImport(data, done) {
    return () => {
        T.post('/api/dt/diem-hoan/save-import', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function createDtDiemHoan(data, done) {
    return () => {
        T.post('/api/dt/diem-hoan', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                T.notify('Tạo mới điểm hoãn thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function deleteDtDiemHoan(data, done) {
    return () => {
        T.delete('/api/dt/diem-hoan', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                T.notify('Hủy điểm hoãn thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function getDtDiemHoanBySinhVien(filter, done) {
    return () => {
        T.get('/api/dt/diem-hoan/sinh-vien', { filter }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function getDtDinhChiThiDangKyThi(filter, done) {
    return () => {
        T.get('/api/dt/diem-hoan/hoc-phan', { filter }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function createDtDinhChiThiDangKyThi(data, done) {
    return () => {
        T.post('/api/dt/diem-hoan/hoc-phan', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                T.notify('Đăng ký thi cho sinh viên hoãn thành công', 'success');
                done && done(result);
            }
        });
    };
}