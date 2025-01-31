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
        const url = `/api/dt/lich-su-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
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

export function getDtLichSuDkhpDashBoard(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtLichSuDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/lich-su-dang-ky/dash-board/${page.pageNumber}/${page.pageSize}`;
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

export function deleteDtLichSuDkhp(id) {
    const cookie = T.updatePage('pageDtLichSuDkhp');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/lich-su-dang-ky/';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa lịch sử đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Lịch sử đăng ký học phần đã xóa thành công!', 'success', false, 800);
                dispatch(getDtLichSuDkhpPage(pageNumber, pageSize, pageCondition, filter));
            }
        }, () => T.notify('Xóa lịch sử đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function hoanTacDtLichSuDkhpXoa(data) {
    const cookie = T.updatePage('pageDtLichSuDkhp');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/lich-su-dang-ky/hoan-tac-xoa';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Hoàn tác lịch sử đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Lịch sử đăng ký học phần đã hoàn tác thành công!', 'success', false, 800);
                dispatch(getDtLichSuDkhpPage(pageNumber, pageSize, pageCondition, filter));
            }
        }, () => T.notify('Hoàn tác lịch sử đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function hoanTacDtLichSuDkhpChuyen(data) {
    const cookie = T.updatePage('pageDtLichSuDkhp');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/lich-su-dang-ky/hoan-tac-chuyen';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Hoàn tác lịch sử đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Lịch sử đăng ký học phần đã hoàn tác thành công!', 'success', false, 800);
                dispatch(getDtLichSuDkhpPage(pageNumber, pageSize, pageCondition, filter));
            }
        }, () => T.notify('Hoàn tác lịch sử đăng ký học phần bị lỗi!', 'danger'));
    };
}