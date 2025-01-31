import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvQuyetDinhGetPage = 'SvQuyetDinh:GetPage';
const SvKhenThuongPage = 'SvQuyetDinh:GetKhenThuongPage';
export default function SvQuyetDinhReducer(state = null, data) {
    switch (data.type) {
        case SvQuyetDinhGetPage:
            return Object.assign({}, state, { page: data.page, dataSinhVien: data.dataSinhVien });
        case SvKhenThuongPage:
            return Object.assign({}, state, { khenThuongPage: data.page });
        default:
            return state;
    }
}
// USER -------------------------------------------------

T.initPage('svQuyetDinhPage');
export function getPageSvQuyetDinhStudent(pageNumber, pageSize, done) {
    const page = T.updatePage('svQuyetDinhPage', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/sv/manage-quyet-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy danh sách quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                dispatch({ type: SvQuyetDinhGetPage, page: result.page, dataSinhVien: result.dataSinhVien });
                done && done(result.page);
            }
        });
        const urlKhenThuong = `/api/sv/danh-sach-khen-thuong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(urlKhenThuong, result => {
            if (result.error) {
                T.notify('Lấy danh sách quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                dispatch({ type: SvKhenThuongPage, page: result.page });
                done && done(result.page);
            }
        });
    };
}

