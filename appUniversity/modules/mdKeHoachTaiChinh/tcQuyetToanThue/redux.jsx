import T from 'view/js/common';

export const TcQuyetToanThueGetPage = 'TcQuyetToanThue:GetPage';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function tcQuyetToanThue(state = null, data) {
    switch (data.type) {
        case TcQuyetToanThueGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageTcQuyetToanThue');
export function getPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcQuyetToanThue', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/khtc/quyet-toan-thue/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh quyết toán thuế bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcQuyetToanThueGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function deleteItems(body, nam, done) {
    return dispatch => {
        const url = '/api/khtc/quyet-toan-thue/delete';
        const cookie = T.updatePage('pageTcQuyetToanThue');
        T.delete(url, { listShcc: body, nam }, data => {
            if (data.error) {
                T.notify('Xóa danh sách thuế lỗi!', 'danger');
                console.error(`DELETE ${url}.`, data.error);
            } else {
                const { pageNumber, pageSize, pageCondition, filter } = cookie;
                dispatch(getPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        });
    };
}

export function getDetailDotDongThue(shcc, nam, done) {
    return () => {
        const url = '/api/khtc/quyet-toan-thue/detail';
        T.get(url, { shcc, nam }, res => {
            if (res.error) {
                T.notify('Lấy chi tiết đợt đóng thuế lỗi!', 'danger');
                console.error(`GET ${url}.`, res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.notify(`Lấy chi tiết đợt đóng thuế lỗi!:: ${error}`, 'danger'));
    };
}

export function updateDetailThue(shcc, nam, changes, done) {
    return (dispatch) => {
        const url = '/api/khtc/quyet-toan-thue/detail';
        const cookie = T.updatePage('pageTcQuyetToanThue');
        T.put(url, { shcc, nam, changes }, res => {
            if (res.error) {
                T.notify('Chỉnh sửa chi tiết đợt đóng thuế lỗi!', 'danger');
                console.error(`PUT ${url}.`, res.error);
            } else {
                const { pageNumber, pageSize, pageCondition, filter } = cookie;
                dispatch(getPage(pageNumber, pageSize, pageCondition, filter));
                done && done(res);
            }
        }, (error) => T.notify(`Chỉnh sửa tiết đợt đóng thuế lỗi!:: ${error}`, 'danger'));
    };
}