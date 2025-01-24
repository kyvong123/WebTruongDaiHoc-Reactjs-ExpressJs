import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhLichSuDkhpGetPage = 'sdhLichSuDkhp:GetPage';
export default function SdhLichSuDkhpReducer(state = null, data) {
    switch (data.type) {
        case SdhLichSuDkhpGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}
// ACTIONS -------------------------------------------------
T.initPage('pageSdhLichSuDkhp');
export function getSdhLichSuDkhpPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSdhLichSuDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-su-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch sử đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SdhLichSuDkhpGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getSdhLichSuDkhpDashBoard(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSdhLichSuDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-su-dang-ky/dash-board/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch sử đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SdhLichSuDkhpGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
