import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtLichSuDkhpGetPage = 'dtLichSuDkhp:GetPage';
export default function DtLichSuDkhpReducer(state = null, data) {
    switch (data.type) {
        case DtLichSuDkhpGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}
// ACTIONS -------------------------------------------------
T.initPage('pageDtLichSuDkhp');
export function getDtLichSuDkhpPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtLichSuDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sv/lich-su-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch sử đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtLichSuDkhpGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
