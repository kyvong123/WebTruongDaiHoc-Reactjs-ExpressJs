import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhTsDiemHistoryGetPage = 'sdhTsDiemHistory:GetPage';

export default function sdhTsDiemHistoryReducer(state = null, data) {
    switch (data.type) {
        case SdhTsDiemHistoryGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageSdhTsDiemHistory');
export function getSdhTsDiemHistoryPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSdhTsDiemHistory', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts/diem-history/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch sử điểm bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SdhTsDiemHistoryGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}