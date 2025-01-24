import T from 'view/js/common';
// export const PageName = 'HAA';
// T.initPage(PageName);


const TcHoanTraGetPage = 'TcHoanTra:GetPage';
export default function tcHoanTraReducer(state = null, data) {
    switch (data.type) {
        case TcHoanTraGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const PageName = 'pageTcHoanTra';
T.initPage(PageName);
export function getTcHoanTraPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khtc/hoan-tra/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: TcHoanTraGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách nhóm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createTcHoanTra(item, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-tra';
        T.post(url, { data: item }, res => {
            if (res.error) {
                T.notify('Tạo thông tin hoàn trả bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
                done && done(res);
            } else {
                T.notify('Tạo thông tin hoàn trả thành công!', 'success');
                done && done(res.item);
                dispatch(getTcHoanTraPage());
            }
        }, (error) => T.notify('Tạo thông tin hoàn trả bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTcHoanTra(keys, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-tra';
        T.delete(url, { mssv: keys.mssv, namHoc: keys.namHoc, hocKy: keys.hocKy }, res => {
            if (res.error) {
                T.notify('Xóa hoàn trả bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                done && done(res.error);
                console.error(`DELETE: ${url}.`, res.error);
            } else {
                T.alert('Hoàn trả đã xóa thành công!', 'success', false, 800);
                done && done();
                dispatch(getTcHoanTraPage());
            }
        }, (error) => T.notify('Xóa hoàn trả bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTcHoanTra(keys, changes, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-tra';
        T.put(url, { keys, changes }, res => {
            if (res.error || changes == null) {
                T.notify('Cập nhật thông tin hoàn trả bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`PUT: ${url}.`, res.error);
                done && done(res);
            } else {
                T.notify('Cập nhật thông tin hoàn trả thành công!', 'success');
                done && done(res.item);
                dispatch(getTcHoanTraPage());
            }
        }, (error) => T.notify('Cập nhật thông tin hoàn trả bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSoDuHocPhi(mssv, done) {
    return () => {
        const url = '/api/khtc/hoan-tra/so-du-hoc-phi';
        T.get(url, { mssv }, res => {
            if (res.error) {
                T.notify('Lấy số dư học phí bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
                done && done(res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.notify('Lấy số dư học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function exportFileWord(data, done) {
    return () => {
        const url = '/api/khtc/hoan-tra/get-don-xin-rut-hoc-phi';
        T.get(url, data, res => {
            if (res.error) {
                T.notify('Xác nhận hoàn trả bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
                done && done(res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.notify('Xác nhận hoàn trả bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function xacNhanHoanTra(filter, done) {
    return dispatch => {
        const url = '/api/khtc/hoan-tra/xac-nhan';
        T.post(url, filter, res => {
            if (res.error) {
                T.notify('Xác nhận hoàn trả bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
                done && done(res.error);
            } else {
                done && done();
                dispatch(getTcHoanTraPage());
            }
        }, (error) => T.notify('Xác nhận hoàn trả bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDuLieuFwStudent(mssv, done) {
    return () => {
        const url = '/api/khtc/hoan-tra/get-ngan-hang';
        T.get(url, { mssv }, res => {
            if (res.error) {
                T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.item);
            }
        }, (error) => T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}