import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dtDaoTaoDashBoardGetPage = 'dtDaoTaoDashBoard:GetPage';
const dtDaoTaoDashBoardGet = 'dtDaoTaoDashBoard:Get';

export default function dtDaoTaoDashBoardReducer(state = null, data) {
    switch (data.type) {
        case dtDaoTaoDashBoardGetPage:
            return Object.assign({}, state, { page: data.page });
        case dtDaoTaoDashBoardGet:
            return Object.assign({}, state, { selectedItem: data.item });
        default:
            return state;
    }
}

T.initPage('pageDtDaoTaoDashBoardGet');
export function getDashboardData(filter, done) {
    return dispatch => {
        const url = '/api/dt/dao-tao-dashboard';
        T.get(url, { filter }, item => {
            if (item.error) {
                T.notify('Lấy dữ liệu bị lỗi', 'danger');
                console.error(`GET: ${url}.`, item.error);
            } else {
                done && done(item.data);
                dispatch({ type: dtDaoTaoDashBoardGetPage, page: item.data });
            }
        });
    };
}