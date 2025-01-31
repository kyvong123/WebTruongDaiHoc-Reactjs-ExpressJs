import T from 'view/js/common';
// export const PageName = 'HAA';
// T.initPage(PageName);


const TcTncnGetPage = 'TcTncn:GetPage';

export default function tcTncnReducer(state = null, data) {
    switch (data.type) {
        case TcTncnGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const PageName = 'pageTcTncn';
T.initPage(PageName);
export function getTcTncnPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khtc/tncn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký MST bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: TcTncnGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đăng ký MST bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTcTncn(id, done) {
    return dispatch => {
        const url = '/api/khtc/tncn/delete';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa yêu cầu đăng ký MST không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                done && done(data);
                console.error(`POST: ${url}.`, data.error);
            } else {
                // T.alert('Đơn hoãn đóng học phí đã xóa thành công!', 'success', false, 800);
                done && done();
                dispatch(getTcTncnPage());
            }
        }, (error) => T.notify('Xóa yêu cầu đăng ký MST không thành công' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTcTncn(keys, changes, done) {
    return dispatch => {
        const url = '/api/khtc/tncn';
        T.put(url, { keys, changes }, res => {
            if (res.error) {
                T.notify('Cập nhật yêu cầu đăng ký MST không thành công' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`PUT: ${url}.`, res.error);
                done && done(res.error);
            } else {
                T.notify('Cập nhật yêu cầu đăng ký MST thành công!', 'success');
                done && done();
                dispatch(getTcTncnPage());
            }
        }, (error) => T.notify('Cập nhật yêu cầu đăng ký MST không thành công' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function tiepNhanTncn(id, done) {
    return dispatch => {
        const url = '/api/khtc/tncn/tiep-nhan';
        T.post(url, { id }, res => {
            if (res.error) {
                T.notify('Xác nhận yêu cầu đăng ký MST không thành công' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
                done && done(res.error);
            } else {
                T.notify('Xác nhận yêu cầu đăng ký MST thành công!', 'success');
                done && done();
                dispatch(getTcTncnPage());
            }
        }, (error) => T.notify('Xác nhận yêu cầu đăng ký MST không thành công' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function xacNhanTncn(id, done) {
    return dispatch => {
        const url = '/api/khtc/tncn/xac-nhan';
        T.post(url, { id }, res => {
            if (res.error) {
                T.notify('Xác nhận yêu cầu đăng ký MST không thành công' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
                done && done(res.error);
            } else {
                T.notify('Xác nhận yêu cầu đăng ký MST thành công!', 'success');
                done && done();
                dispatch(getTcTncnPage());
            }
        }, (error) => T.notify('Xác nhận yêu cầu đăng ký MST không thành công' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}
