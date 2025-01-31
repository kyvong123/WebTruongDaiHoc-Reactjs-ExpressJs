import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dtQuanLyQuyetDinhGetAll = 'dtQuanLyQuyetDinh:GetAll';
const dtQuanLyQuyetDinhGetPage = 'dtQuanLyQuyetDinh:GetPage';
export default function dtQuanLyQuyetDinhReducer(state = null, data) {
    switch (data.type) {
        case dtQuanLyQuyetDinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case dtQuanLyQuyetDinhGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('dtQuanLyQuyetDinhPage');
export function getDtQuanLyQuyetDinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('dtQuanLyQuyetDinhPage', pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/dt/quan-ly-quyet-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: dtQuanLyQuyetDinhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quyết định bị lỗi!', 'danger'));
    };
}

export function getThongTinHienTaiSinhVien(mssv, done) {
    return () => {
        const url = '/api/dt/quan-ly-quyet-dinh/thong-tin-sinh-vien';
        T.get(url, { mssv }, (data) => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger'));
    };
}

export function getDanhSachSinhVien(idQd, done) {
    return () => {
        const url = '/api/dt/quan-ly-quyet-dinh/danh-sach-sinh-vien';
        T.get(url, { idQd }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger'));
    };
}

export function createDtQuanLyQuyetDinh(dtQuanLyQuyetDinh, done) {
    return (dispatch) => {
        const url = '/api/dt/quan-ly-quyet-dinh';
        T.post(url, { dtQuanLyQuyetDinh }, (data) => {
            if (data.error) {
                T.notify('Tạo quyết định mới bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Tạo quyết định mới thành công!', 'success');
                dispatch(getDtQuanLyQuyetDinhPage());
                done && done(data.item);
            }
        }, () => T.notify('Tạo quyết định mới bị lỗi!', 'danger'));
    };
}

export function createDtQuanLyQuyetDinhMultiple(dtQuanLyQuyetDinh, done) {
    return (dispatch) => {
        const url = '/api/dt/quan-ly-quyet-dinh/multiple';
        T.post(url, { dtQuanLyQuyetDinh }, (data) => {
            if (data.error) {
                T.notify('Tạo quyết định mới bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Tạo quyết định mới thành công!', 'success');
                dispatch(getDtQuanLyQuyetDinhPage());
                done && done(data.item);
            }
        }, () => T.notify('Tạo quyết định mới bị lỗi!', 'danger'));
    };
}

export function updateDtQuanLyQuyetDinh(id, dtQuanLyQuyetDinh, done) {
    return (dispatch) => {
        const url = '/api/dt/quan-ly-quyet-dinh';
        T.put(url, { id, dtQuanLyQuyetDinh }, (data) => {
            if (data.error) {
                T.notify('Cập nhật quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật quyết định thành công!', 'success');
                dispatch(getDtQuanLyQuyetDinhPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật quyết định bị lỗi!', 'danger'));
    };
}

export function updateDtQuanLyQuyetDinhMultiple(id, dtQuanLyQuyetDinh, done) {
    return (dispatch) => {
        const url = '/api/dt/quan-ly-quyet-dinh/multiple';
        T.put(url, { id, dtQuanLyQuyetDinh }, (data) => {
            if (data.error) {
                T.notify('Cập nhật quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật quyết định thành công!', 'success');
                dispatch(getDtQuanLyQuyetDinhPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật quyết định bị lỗi!', 'danger'));
    };
}

export function huyDtQuanLyQuyetDinh(id, idSoQuyetDinh, done) {
    return (dispatch) => {
        const url = '/api/dt/quan-ly-quyet-dinh/huy';
        T.delete(url, { id, idSoQuyetDinh }, data => {
            if (data.error) {
                T.notify('Hủy quyết định bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Hủy quyết định thành công!', 'success');
                dispatch(getDtQuanLyQuyetDinhPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin quyết định bị lỗi!', 'danger'));
    };
}

export function downloadWordDaoTao(id, done) {
    return () => {
        const url = `/api/dt/quan-ly-quyet-dinh/download/${id}`;
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

export function dtCheckSoQuyetDinh(soQuyetDinh, done) {
    return () => {
        const url = `/api/dt/quan-ly-quyet-dinh/check/${soQuyetDinh}`;
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