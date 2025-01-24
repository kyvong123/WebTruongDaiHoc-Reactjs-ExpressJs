import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemAllGetPage = 'DtDiemConfig:GetPage';
export default function DtDiemConfigReducer(state = null, data) {
    switch (data.type) {
        case DtDiemAllGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//ACTIONS-------------------------------------------------------------------------------------------------------------
export function getDataDiem(filter, done) {
    return () => {
        const url = '/api/dt/diem-all/get-data-diem';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu điểm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy dữ liệu điểm bị lỗi!', 'danger'));
    };
}

export function dtDiemAllSinhVien(changes, done) {
    return () => {
        const url = '/api/dt/diem-all/nhap-diem-sinh-vien';
        T.post(url, { changes }, result => {
            if (result.error) {
                console.error(`POST ${url}: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function updateDtDiemSinhVien(condition, dataHocPhan, done) {
    return () => {
        const url = '/api/dt/diem-all/nhap-diem';
        T.post(url, { condition, dataHocPhan }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật điểm', 'danger');
                console.error(`POST ${url}: ${result.error}`);
            } else {
                T.notify('Cập nhật thành công', 'success');
                done && done(result);
            }
        });
    };
}

T.initPage('pageDtDiemAll');
export function dtDiemAllGetPage(pageNumber, pageSize, pageCondition = '', filter, done) {
    const page = T.updatePage('pageDtDiemAll', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: DtDiemAllGetPage, page: { totalItem: page.totalItem, pageNumber, pageTotal: page.pageTotal, pageSize, list: null } });
        const url = `/api/dt/diem/data/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lỗi lấy dữ liệu điểm', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtDiemAllGetPage, page: result.page });
                done && done(result.page);
            }
        });
    };
}

export function getLichSuNhapDiemSv(mssv, maHocPhan, done) {
    return () => {
        const url = '/api/dt/diem/lich-su-nhap-diem';
        T.get(url, { mssv, maHocPhan }, result => {
            if (result.error) {
                T.notify('Lỗi lấy lịch sử nhập điểm', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function dtDiemUpdateFilter(condition, changes, done) {
    return dispatch => {
        const url = '/api/dt/diem/condition';
        T.put(url, { condition, changes }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật điểm', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                const { pageNumber, pageSize, pageCondition, filter } = T.updatePage('pageDtDiemAll');
                done && done();
                dispatch(dtDiemAllGetPage(pageNumber, pageSize, pageCondition, filter));
            }
        });
    };
}


export function createDtDiemAllMultiple(data, done) {
    return () => {
        T.post('/api/dt/diem/multiple', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                T.notify('Tạo thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function dtDiemAllSaveImport(dataDiem, config, done) {
    return () => {
        T.post('/api/dt/diem-all/save-import', { dataDiem, config }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function dtDiemAllGetDataScan(maHocPhan, done) {
    return () => {
        const url = '/api/dt/diem-all/get-data-scan';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function dtDiemAllResaveDataScan(data, dataHocPhan, done) {
    return () => {
        const url = '/api/dt/diem-all/resave-data-scan';
        T.post(url, { dataHocPhan, data }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, null);
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}