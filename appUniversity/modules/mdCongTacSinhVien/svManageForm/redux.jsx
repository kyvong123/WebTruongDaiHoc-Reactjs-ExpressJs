import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const svManageFormGetAll = 'svManageForm:GetAll';
const svManageFormGetPage = 'svManageForm:GetPage';
export default function ctsvManageFormReducer(state = null, data) {
    switch (data.type) {
        case svManageFormGetAll:
            return Object.assign({}, state, { items: data.items });
        case svManageFormGetPage:
            return Object.assign({}, state, { page: data.page, dataSinhVien: data.dataSinhVien, soDangKyQuaHan: data.soDangKyQuaHan, soDangKyMoi: data.soDangKyMoi });
        default:
            return state;
    }
}
// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('fwFormManagePage');
export function getSvManageFormPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('fwFormManagePage', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/ctsv/form-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách chứng nhận bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: svManageFormGetPage, page: data.page, soDangKyQuaHan: data.soDangKyQuaHan, soDangKyMoi: data.soDangKyMoi });
            }
        }, () => T.notify('Lấy danh sách chứng nhận bị lỗi!', 'danger'));
    };
}

export function updateSvManageForm(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/form-dang-ky';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin chứng nhận bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
                dispatch(getSvManageFormPage());
            }
        }, () => T.notify('Cập nhật thông tin chứng bị lỗi!', 'danger'));
    };
}

export function createsvManageForm(svManageForm, done) {
    return dispatch => {
        const url = '/api/ctsv/form-dang-ky';
        T.post(url, { svManageForm }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Đăng kí chứng nhận bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                // done && done(data.error);
            } else {
                T.notify('Đăng kí chứng nhận thành công!', 'success');
                done && done(data.item);
                dispatch(getSvManageFormPage());
            }
        }, () => T.notify('Đăng kí chứng nhận bị lỗi!', 'danger'));
    };
}

export function deleteSvManageForm(id) {
    return dispatch => {
        const url = '/api/ctsv/form-dang-ky/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa chứng nhận  bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa chứng nhận thành công!', 'success', false, 800);
                dispatch(getSvManageFormPage());
            }
        }, () => T.notify('Xóa chứng nhận bị lỗi!', 'danger'));
    };
}

export function downloadWord(id, done) {
    return () => {
        const url = `/api/ctsv/manage-form/download/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

export function checkMssv(mssv, done) {
    return () => {
        const url = `/api/ctsv/manage-form/check-mssv/${mssv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Hệ thống bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (data.data) {
                    done && done(data.data);
                } else {
                    T.notify(`Không tìm thấy mssv ${mssv}`, 'danger');
                }
            }
        }, () => T.notify('Hệ thống bị lỗi', 'danger'));
    };
}