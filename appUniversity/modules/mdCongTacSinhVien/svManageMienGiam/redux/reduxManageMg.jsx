import T from 'view/js/common';
import { getSvDsMienGiamPage } from './reduxDsmg';

// Reducer ------------------------------------------------------------------------------------------------------------
const svManageMienGiamGetAll = 'svManageMienGiam:GetAll';
const svManageMienGiamGetPage = 'svManageMienGiam:GetPage';
export default function svManageMienGiamReducer(state = null, data) {
    switch (data.type) {
        case svManageMienGiamGetAll:
            return Object.assign({}, state, { items: data.items });
        case svManageMienGiamGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('svManageMienGiamPage');
export function getSvManageMienGiamAll(done) {
    return dispatch => {
        const url = '/api/ctsv/mien-giam/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách quyết định miễn giảm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: svManageMienGiamGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách quyết định miễn giảm bị lỗi!', 'danger'));
    };
}

export function getSvManageMienGiamPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('svManageMienGiamPage', pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/ctsv/mien-giam/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách quyết định miễn giảm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: svManageMienGiamGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quyết định miễn giảm bị lỗi!', 'danger'));
    };
}

export function updateSvManageMienGiam(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/mien-giam';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin quyết định miễn giảm bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
                data.isSubmit && T.notify('Cập nhật thông tin quyết định miễn giảm thành công!', 'success');
                dispatch(getSvManageMienGiamPage());
            }
        }, () => T.notify('Cập nhật thông tin quyết định miễn giảm bị lỗi!', 'danger'));
    };
}

export function createSvManageMienGiam(svManageMienGiam, done) {
    return dispatch => {
        const url = '/api/ctsv/mien-giam';
        T.post(url, { svManageMienGiam }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới quyết định miễn giảm thành công!', 'success');
                done && done(data.item);
                dispatch(getSvDsMienGiamPage());
                dispatch(getSvManageMienGiamPage());
            }
        }, () => T.notify('Tạo mới quyết định miễn giảm bị lỗi!', 'danger'));
    };
}

export function deleteSvManageMienGiam(id, soQuyetDinh) {
    return dispatch => {
        const url = '/api/ctsv/mien-giam';
        T.delete(url, { id, soQuyetDinh }, data => {
            if (data.error) {
                T.notify('Xóa quyết định miễn giảm bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa quyết định miễn giảm thành công!', 'success', false, 800);
                dispatch(getSvManageMienGiamPage());
            }
        }, () => T.notify('Xóa quyết định miễn giảm bị lỗi!', 'danger'));
    };
}

export function huyQuyetDinhMienGiam(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/mien-giam/huy';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Hủy quyết định miễn giảm bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Hủy quyết định miễn giảm thành công!', 'success');
                done && done(data.item);
                dispatch(getSvDsMienGiamPage());
                dispatch(getSvManageMienGiamPage());
            }
        }, () => T.notify('Cập nhật thông tin quyết định miễn giảm bị lỗi!', 'danger'));
    };
}

export function checkDsMienGiam(mssv, loaiMienGiam, qdId, namHoc, hocKy, done) {
    return () => {
        const url = '/api/ctsv/mien-giam/ds-mien-giam/check-mssv';
        T.get(url, { mssv, loaiMienGiam, qdId, namHoc, hocKy }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger');
            } else {
                done && done();
            }
        }, () => T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger'));
    };
}

export function downloadWord(id, namHoc, hocKy, done) {
    return () => {
        const url = `/api/ctsv/mien-giam/download/${id}`;
        T.get(url, { namHoc, hocKy }, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

export function svCheckSoQuyetDinh(soQuyetDinh, done) {
    return () => {
        const url = `/api/ctsv/mien-giam/check/${soQuyetDinh}`;
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                done && done(data);
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Số quyết định hợp lệ', 'success');
                done && done({});
            }
        }, () => T.notify('Số quyết định đã tồn tại!', 'danger'));
    };
}
