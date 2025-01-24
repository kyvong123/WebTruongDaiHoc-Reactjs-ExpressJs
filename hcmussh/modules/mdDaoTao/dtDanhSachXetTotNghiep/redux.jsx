import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDanhSachXetTotNghiepGetAll = 'dtDanhSachXetTotNghiep:GetAll';
const DtDanhSachXetTotNghiepGetPage = 'dtDanhSachXetTotNghiep:GetPage';

export default function DtDanhSachXetTotNghiepReducer(state = null, data) {
    switch (data.type) {
        case DtDanhSachXetTotNghiepGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDanhSachXetTotNghiepGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDanhSachXetTotNghiepAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/xet-tot-nghiep/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên xét tốt nghiệp!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.data);
                dispatch({ type: DtDanhSachXetTotNghiepGetAll, items: data.data ? data.data : [] });
            }
        });
    };
}

T.initPage('pageDtDanhSachXetTotNghiep');
export function getDtDanhSachXetTotNghiepPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDanhSachXetTotNghiep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/xet-tot-nghiep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên xét tốt nghiệp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDanhSachXetTotNghiepGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function dtDanhSachXetTotNghiepGetDetail(filter, done) {
    return () => {
        T.get('/api/dt/xet-tot-nghiep/detail', { filter }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy dữ liệu xét tốt nghiệp bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function saveChangeTotNghiep(data, done) {
    return () => {
        T.post('/api/dt/xet-tot-nghiep/change', { data }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Lưu thay đổi bị lỗi!', 'error', false, 2000);
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function checkDieuKienTotNghiep(data, done) {
    return () => {
        T.post('/api/dt/xet-tot-nghiep/check-condition', { data }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Xét điều kiện tốt nghiệp bị lỗi!', 'error', false, 2000);
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}