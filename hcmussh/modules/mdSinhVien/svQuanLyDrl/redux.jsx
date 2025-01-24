import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetAll = 'sinhVien:GetAll';
const sinhVienGetPage = 'sinhVien:GetPage';
const sinhVienSetNull = 'sinhVien:SetNull';

export default function ltDanhGiaDrlReducer(state = null, data) {
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
T.initPage('pageLtDanhGiaDrl');
export function getStudentsPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageLtDanhGiaDrl', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienSetNull });
        const url = `/api/sv/lop-truong/quan-ly-drl/page/${page.pageNumber}/${page.pageSize}`;
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

export function saoChepDiemSinhVien(namHoc, hocKy, done) {
    const url = '/api/sv/lop-truong/sao-chep-sinh-vien';
    return dispatch => {
        T.get(url, { namHoc, hocKy }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                T.notify('Sao chép thông tin thành công', 'success');
                dispatch(getStudentsPage());
                done && done(result.items);
            }
        }, () => T.notify('Sao chép thông tin bị lỗi!', 'danger'));
    };
}

export function getBoTieuChi(namHoc, hocKy, mssv, done) {
    const url = '/api/sv/lop-truong/bo-tieu-chi';
    T.get(url, { namHoc, hocKy, mssv }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Lấy bộ tiêu chí đánh giá bị lỗi!', 'danger'));
}

export function submitBangDanhGiaLt(bangDanhGiaLt, mssv, done) {
    const url = `/api/sv/lop-truong/danh-gia-drl/${mssv}`;
    T.alert('Vui lòng đợi giây lát!', 'warning', false, null, true);
    T.post(url, { bangDanhGiaLt }, result => {
        if (result.error) {
            T.alert(result.error.message ?? 'Lưu thông tin bị lỗi', 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            T.alert('Lưu thông tin thành công', 'success');
            done && done(result.items);
        }
    }, () => T.alert('Lưu thông tin bị lỗi', 'danger'));
}