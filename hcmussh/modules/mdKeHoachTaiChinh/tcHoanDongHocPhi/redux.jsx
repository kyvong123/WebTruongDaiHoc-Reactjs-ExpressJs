import T from 'view/js/common';
// export const PageName = 'HAA';
// T.initPage(PageName);


const TcHoanDongHocPhiGetPage = 'TcHoanDongHocPhi:GetPage';

export default function tcHoanDongHocPhiReducer(state = null, data) {
    switch (data.type) {
        case TcHoanDongHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const PageName = 'pageTcHoanDongHocPhi';
T.initPage(PageName);
export function getTcHoanDongHocPhiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khtc/hoan-dong-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hoãn đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: TcHoanDongHocPhiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách hoãn đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createTcHoanDongHocPhi(item, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-dong-hoc-phi';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify('Tạo thông tin hoãn đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin hoãn đóng học phí thành công!', 'success');
                done && done(data.item);
                dispatch(getTcHoanDongHocPhiPage());
            }
        }, (error) => T.notify('Tạo thông tin hoãn đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTcHoanDongHocPhi(id, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-dong-hoc-phi/delete';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa đơn hoãn đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                done && done(data);
                console.error(`POST: ${url}.`, data.error);
            } else {
                // T.alert('Đơn hoãn đóng học phí đã xóa thành công!', 'success', false, 800);
                done && done();
                dispatch(getTcHoanDongHocPhiPage());
            }
        }, (error) => T.notify('Xóa đơn hoãn đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTcHoanDongHocPhi(keys, changes, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-dong-hoc-phi';
        T.put(url, { keys, changes }, res => {
            if (res.error) {
                T.notify('Cập nhật thông tin hoãn đóng học phí bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`PUT: ${url}.`, res.error);
                done && done(res.error);
            } else {
                T.notify('Cập nhật thông tin hoãn đóng học phí thành công!', 'success');
                done && done();
                dispatch(getTcHoanDongHocPhiPage());
            }
        }, (error) => T.notify('Cập nhật thông tin hoãn đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function xacNhanHoanDongHocPhi(id, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-dong-hoc-phi/xac-nhan';
        T.post(url, { id }, res => {
            if (res.error) {
                T.notify('Xác nhận hoãn đóng học phí bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
                done && done(res.error);
            } else {
                T.notify('Xác nhận hoãn đóng học phí thành công!', 'success');
                done && done();
                dispatch(getTcHoanDongHocPhiPage());
            }
        }, (error) => T.notify('Xác nhận hoãn đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function exportFileWord(item, done) {
    return () => {
        const url = '/api/khtc/hoan-dong-hoc-phi/export-don-hoan-dong';
        T.get(url, { id: item.id }, res => {
            if (res.error) {
                T.notify('Tải phiếu hoãn đóng học phí bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
                done && done(res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.notify('Tải phiếu hoãn đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}