import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dtThongKeDkhpGetPage = 'dtThongKeDkhp:GetPage';
const dtThongKeDkhpGetAll = 'dtThongKeDkhp:GetAll';

export default function dtThongKeDkhpReducer(state = null, data) {
    switch (data.type) {
        case dtThongKeDkhpGetPage:
            return Object.assign({}, state, { page: data.page });
        case dtThongKeDkhpGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

T.initPage('pageDtThongKeDkhp');
export function getDtThongKeDangKyPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKeDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-dkhp/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeDkhpGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}