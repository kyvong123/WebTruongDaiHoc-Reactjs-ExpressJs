import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtChungChiTinHocSinhVienGetPage = 'DtChungChiTinHocSinhVien:GetAll';

export default function DtChungChiTinHocSinhVienReducer(state = null, data) {
    switch (data.type) {
        case DtChungChiTinHocSinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageDtChungChiTinHocSinhVien');
export function getDtChungChiTinHocSinhVienPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtChungChiTinHocSinhVien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/chung-chi-tin-hoc-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtChungChiTinHocSinhVienGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDtChungChiTinHocSinhVien(item, done) {
    const cookie = T.updatePage('pageDtChungChiTinHocSinhVien');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/chung-chi-tin-hoc-sinh-vien';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo chứng chỉ tin học cho sinh viên bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo chứng chỉ tin học cho sinh viên thành công!', 'success');
                dispatch(getDtChungChiTinHocSinhVienPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done(data);
        });
    };
}

export function updateDtChungChiTinHocSinhVien(id, changes, done) {
    const cookie = T.updatePage('pageDtChungChiTinHocSinhVien');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/chung-chi-tin-hoc-sinh-vien';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Cập nhật chứng chỉ tin học cho sinh viên bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật chứng chỉ tin học cho sinh viên thành công!', 'success');
                dispatch(getDtChungChiTinHocSinhVienPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done(data);
        });
    };
}

export function deleteDtChungChiTinHocSinhVien(item, done) {
    const cookie = T.updatePage('pageDtChungChiTinHocSinhVien');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/chung-chi-tin-hoc-sinh-vien';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Xóa chứng chỉ tin học cho sinh viên bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${data.error}`);
            } else {
                T.notify('Xóa chứng chỉ tin học cho sinh viên thành công!', 'success');
                dispatch(getDtChungChiTinHocSinhVienPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done(data);
        });
    };
}

export function saveImportChungChi(data, done) {
    return () => {
        const url = '/api/dt/chung-chi-tin-hoc-sinh-vien/save-import';
        T.post(url, { data }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Lưu dữ liệu import bị lỗi!', 'error', false, 1000);
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function updateStatusChungChi(listId, changes, done) {
    return () => {
        const url = '/api/dt/chung-chi-tin-hoc-sinh-vien/status';
        T.put(url, { listId, changes }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cập nhật xét duyệt chứng chỉ bị lỗi!', 'error', false, 1000);
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}