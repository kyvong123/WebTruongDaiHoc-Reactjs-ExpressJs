import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetAll = 'sinhVien:GetAll';
const sinhVienGetPage = 'sinhVien:GetPage';
const sinhVienSetNull = 'sinhVien:SetNull';

export default function ctsvDanhGiaDrlReducer(state = null, data) {
    switch (data.type) {
        case sinhVienSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case sinhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case sinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageCtsvDanhGiaDrl:all');
export function getStudentsPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageCtsvDanhGiaDrl:all', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienSetNull });
        const url = `/api/ctsv/danh-gia-drl/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienGetPage, page: result.page });
                done && done(result);
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}

T.initPage('pageCtsvDanhGiaDrl:complete');
T.initPage('pageCtsvDanhGiaDrl:incomplete');
export function getDrlPage(pageNumber, pageSize, pageCondition, filter, sortTerm, isComplete, done) {
    const page = T.updatePage(isComplete ? 'pageCtsvDanhGiaDrl:complete' : 'pageCtsvDanhGiaDrl:incomplete', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienSetNull });
        const url = `/api/ctsv/danh-gia-drl/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: { ...page.filter, isComplete: Number(isComplete) }, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienGetPage, page: result.page });
                done && done(result);
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}

export function getBoTieuChi(namHoc, hocKy, mssv, done) {
    const url = '/api/ctsv/danh-gia-drl/tieu-chi';
    T.get(url, { namHoc, hocKy, mssv }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Lấy bộ tiêu chí đánh giá bị lỗi!', 'danger'));
}

export function submitBangDanhGiaKhoa(bangDanhGiaKhoa, mssv, done) {
    const url = `/api/ctsv/danh-gia-drl/${mssv}`;
    T.post(url, { bangDanhGiaKhoa }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            T.notify('Lưu thông tin thành công', 'success');
            done && done(result.items);
        }
    }, () => T.notify('Lấy bộ tiêu chí đánh giá bị lỗi!', 'danger'));
}

export function editDrlTongKet(listSinhVienUpdate, namHoc, hocKy, done) {
    return () => {
        const url = '/api/ctsv/diem-tong-ket';
        const page = T.updatePage('pageCtsvDanhGiaDrl', pageNumber, pageSize, pageCondition, filter, sortTerm);
        const { pageNumber, pageSize, pageCondition, filter, sortTerm } = page;
        T.post(url, { listSinhVienUpdate, namHoc, hocKy }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`POST: ${url}.`, result.error.message);
            } else {
                T.notify('Lưu thông tin thành công', 'success');
                done && done();
            }
        }, () => T.notify('Lưu thông tin bị lỗi!', 'danger'));
    };
}

export function lockDrlTongKet(namHoc, hocKy, filter, done, error) {
    return () => {
        const url = '/api/ctsv/diem-tong-ket/calc';
        T.post(url, { namHoc, hocKy, filter }, result => {
            if (result.error) {
                error && error();
                console.error(`POST: ${url}.`, result.error.message);
            } else {
                done && done();
            }
        }, () => error && error());
    };
}

export function multiAddDssvDrl(dssv, namHoc, hocKy, done) {
    return () => {
        const url = '/api/ctsv/danh-gia-drl/update/multiple/dssv-excel';
        T.post(url, { dssv, namHoc, hocKy }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`POST: ${url}.`, result.error.message);
            } else {
                done && done();
            }
        }, () => T.notify('Lưu thông tin bị lỗi!', 'danger'));
    };
}