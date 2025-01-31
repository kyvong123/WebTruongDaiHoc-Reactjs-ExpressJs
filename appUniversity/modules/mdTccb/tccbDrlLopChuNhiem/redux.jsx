import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const tccbSinhVienLopDrlGetPage = 'sinhVien:GetPage';
const tccbsinhVienLopDrlSetNull = 'sinhVien:SetNull';

export default function tccbGvcnDanhGiaDrlReducer(state = null, data) {
    switch (data.type) {
        case tccbsinhVienLopDrlSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case tccbSinhVienLopDrlGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageGvcnDanhGiaDrl');
export function getStudentsPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageGvcnDanhGiaDrl', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: tccbsinhVienLopDrlSetNull });
        const url = `/api/tccb/lop-chu-nhiem/quan-ly-drl/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: tccbSinhVienLopDrlGetPage, page: result.page });
                done && done(result);
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}

export function getBoTieuChi(namHoc, hocKy, mssv, done) {
    const url = '/api/tccb/lop-chu-nhiem/danh-gia-drl/tieu-chi';
    T.get(url, { namHoc, hocKy, mssv }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Lấy bộ tiêu chí đánh giá bị lỗi!', 'danger'));
}