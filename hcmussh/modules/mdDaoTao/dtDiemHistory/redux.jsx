import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDiemHistoryGetPage = 'dtDiemHistory:GetPage';

export default function dtDiemHistoryReducer(state = null, data) {
    switch (data.type) {
        case DtDiemHistoryGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDtDiemHistory');
export function getDtDiemHistoryPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtHiemHistory', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/diem-history/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch sử điểm bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDiemHistoryGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtDiemHistoryModal(pageNumber, pageSize, pageCondition, filter, done) {
    return () => {
        const url = `/api/dt/diem-history/modal/${pageNumber}/${pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch sử điểm bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.page);
            }
        });
    };
}