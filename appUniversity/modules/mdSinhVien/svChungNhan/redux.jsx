import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const svManageFormGetPage = 'svManageForm:GetPage';
export default function svManageFormReducer(state = null, data) {
    switch (data.type) {
        case svManageFormGetPage:
            return Object.assign({}, state, { page: data.page, dataSinhVien: data.dataSinhVien });
        default:
            return state;
    }
}
// USER -------------------------------------------------
export function createSvManageForm(svManageForm, done) {
    return dispatch => {
        const url = '/api/sv/manage-form';
        T.post(url, svManageForm, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                T.notify('Đăng kí xác nhận thành công!', 'success');
                dispatch(getPageSvManageFormStudent());
                done && done(result);
            }
        }, () => () => T.notify('Đăng kí xác nhận bị lỗi!', 'danger'));
    };
}

export function updateSvManageFormStudent(id, changes, done) {
    return dispatch => {
        const url = '/api/sv/manage-form';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin form bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
                dispatch(getPageSvManageFormStudent());
            }
        }, () => T.notify('Cập nhật thông tin form bị lỗi!', 'danger'));
    };
}

T.initPage('fwFormManagePage');
export function getPageSvManageFormStudent(pageNumber, pageSize, done) {
    const page = T.updatePage('fwFormManagePage', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/sv/manage-form/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy danh sách biểu mẫu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                dispatch({ type: svManageFormGetPage, page: result.page, dataSinhVien: result.dataSinhVien });
                done && done(result.page);
            }
        });
    };
}

export function downloadWordSvManageFormStudent(id, done) {
    return () => {
        const url = '/api/sv/manage-form/download';
        T.get(url, { id }, result => {
            if (result.error) {
                T.notify('Tải xuống biểu mẫu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.data);
            }
        }, error => {
            T.notify('Tải xuống biểu mẫu bị lỗi!', 'danger');
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getScheduleSettings(done) {
    return () => {
        const url = '/api/sv/settings/schedule-settings';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy cấu hình thời khoá biểu bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

