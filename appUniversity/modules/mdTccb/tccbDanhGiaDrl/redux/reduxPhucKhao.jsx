import T from 'view/js/common';

const sinhVienPhucKhaoGetPage = 'sinhVienPhucKhao:GetPage';
const sinhVienPhucKhaoSetNull = 'sinhVienPhucKhao:SetNull';
const sinhVienPhucKhaoGetAll = 'sinhVienPhucKhao:GetAll';

export default function tccbDanhGiaDrlPhucKhaoReducer(state = null, data) {
    switch (data.type) {
        case sinhVienPhucKhaoSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case sinhVienPhucKhaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case sinhVienPhucKhaoGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}


T.initPage('pageTccbDanhGiaDrlPhucKhao');
export function getStudentsPagePhucKhao(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageTccbDanhGiaDrlPhucKhao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienPhucKhaoSetNull });
        const url = `/api/tccb/danh-gia-drl/phuc-khao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên phúc khảo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienPhucKhaoGetPage, page: result.page });
                done && done(result.page);
            }
        }, () => T.notify('Lấy danh sách sinh viên phúc khảo bị lỗi!', 'danger'));
    };
}

export function getStudentsPhucKhaoAll(mssv, namHoc, hocKy, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia-drl/sv-phuc-khao';
        T.get(url, { mssv, namHoc, hocKy }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên phúc khảo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienPhucKhaoGetAll, items: result.items });
                done && done(result.items);
            }
        }, () => T.notify('Lấy danh sách sinh viên phúc khảo bị lỗi!', 'danger'));
    };
}

export function submitBangDanhGiaPhucKhao(bangDanhGiaKhoa, mssv, done) {
    return dispatch => {
        const url = `/api/tccb/danh-gia-drl/phuc-khao/${mssv}`;
        T.alert('Vui lòng đợi giây lát!', 'warning', false, null, true);
        T.post(url, { bangDanhGiaKhoa }, result => {
            if (result.error) {
                T.alert(result.error.message, 'error');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                T.alert('Lưu thông tin thành công', 'success');
                dispatch(getStudentsPhucKhaoAll(mssv, bangDanhGiaKhoa.namHoc, bangDanhGiaKhoa.hocKy));
                done && done(result.items);
            }
        }, () => T.alert('Lưu thông tin bị lỗi!', 'error'));
    };
}