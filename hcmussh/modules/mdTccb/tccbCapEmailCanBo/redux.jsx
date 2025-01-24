import T from 'view/js/common';

const TccbCapMaCanBoEmailGetPage = 'TccbCapMaCanBoEmail:GetPage';

export default function tccbCapEmailCanBoReducer(state = null, data) {
    switch (data.type) {
        case TccbCapMaCanBoEmailGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const PageName = 'pageTccbCapEmailMaCanBo';
T.initPage(PageName);

export function getTccbCapEmailCanBoPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/tccb/ma-so-can-bo/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấp email cán bộ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TccbCapMaCanBoEmailGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách cấp email cán bộ lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function xacNhanEmail(id, emailTruong, done) {
    return dispatch => {
        const url = '/api/tccb/cap-email-can-bo/xac-nhan';
        T.post(url, { id, emailTruong }, data => {
            if (data.error) {
                T.notify('Xác nhận email cán bộ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTccbCapEmailCanBoPage());
            }
        }, (error) => T.notify('Xác nhận email cán bộ lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}