import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvQtKyLuatGetPage = 'SvQtKyLuat:GetPage';
const SvQtKyLuatGetGroupPage = 'SvQtKyLuat:GetGroupPage';
const SvQtKyLuatGetGroupPageMa = 'SvQtKyLuat:GetGroupPageMa';
const SvQtKyLuatGet = 'SvQtKyLuat:Get';
const SvQtKyLuatCauHinhGetPage = 'SvQtKyLuat:GetCauHinhPage';


export default function QtKyLuatReducer(state = null, data) {
    switch (data.type) {
        case SvQtKyLuatGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case SvQtKyLuatGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case SvQtKyLuatGetPage:
            return Object.assign({}, state, { page: data.page });
        case SvQtKyLuatCauHinhGetPage:
            return Object.assign({}, state, { pageCauHinh: data.page });
        case SvQtKyLuatGet:
            return Object.assign({}, state, { selectedItem: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------

T.initPage('pageSvQtKyLuat');
export function getSvQtKyLuatPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSvQtKyLuat', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/qua-trinh/ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kỷ luật sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: SvQtKyLuatGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

T.initPage('pageSvQtKyLuatGroup');
export function getSvQtKyLuatGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSvQtKyLuatGroup', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/qua-trinh/ky-luat/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình kỷ luật bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: SvQtKyLuatGetGroupPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

// export function createQtKyLuatStaff(data, done) {
//     return dispatch => {
//         const url = '/api/tccb/qua-trinh/ky-luat';
//         T.post(url, { data }, res => {
//             if (res.error) {
//                 T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger');
//                 console.error(`POST: ${url}.`, res.error);
//             } else {
//                 T.notify('Tạo quá trình kỷ luật thành công!', 'success');
//                 dispatch(getSvQtKyLuatPage());
//                 done && done(data);
//             }
//         }, () => T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger'));
//     };
// }

export function createSvQtKyLuatMultiple(data, done) {
    return dispatch => {
        const url = '/api/ctsv/qua-trinh/ky-luat/create-multiple';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Tạo quá trình kỷ luật thành công!', 'success');
                dispatch(getSvQtKyLuatPage());
                done && done(data);
            }
        }, () => T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function deleteSvQtKyLuat(id, done) {
    return dispatch => {
        const url = '/api/ctsv/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('quá trình kỷ luật đã xóa thành công!', 'success', false, 800);
                dispatch(getSvQtKyLuatPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateSvQtKyLuat(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/qua-trinh/ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật quá trình kỷ luật thành công!', 'success');
                dispatch(getSvQtKyLuatPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function createQtKyLuatGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/ctsv/qua-trinh/ky-luat';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo quá trình kỷ luật thành công!', 'success');
                    dispatch(getSvQtKyLuatPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function deleteQtKyLuatGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/ctsv/qua-trinh/ky-luat';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('quá trình kỷ luật đã xóa thành công!', 'success', false, 800);
                dispatch(getSvQtKyLuatPage());
                done && done(data.item);
            }
        }, () => T.notify('Xóa quá trình kỷ luật bị lỗi!', 'danger'));
    };
}

export function downloadWord(id, done) {
    return () => {
        const url = `/api/ctsv/qua-trinh/ky-luat/download/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done({ data: data.data, hasManyStudent: data.hasManyStudent });
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

export function checkSinhVien(mssv, done) {
    return () => {
        const url = '/api/ctsv/qua-trinh/ky-luat/check-mssv';
        T.get(url, { mssv }, data => {
            if (data.error) {
                T.notify('Lấy hệ thống bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                data.notFound && data.notFound.length && T.notify(`Không tìm thấy các MSSV sau ${data.notFound.join(', ')}!`, 'danger');
                done && done(data.items);
            }
        }, () => T.notify('Lấy hệ thống bị lỗi!', 'danger'));
    };
}

export function fetchDsSinhVien(qdId, done) {
    return () => {
        const url = '/api/ctsv/qua-trinh/ky-luat/get-dssv';
        T.get(url, { qdId }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách bị lỗi!', 'danger'));
    };
}

export function getSvQtKyLuatDssvTheoCauHinh(cauHinh, done) {
    return () => {
        const url = '/api/ctsv/qua-trinh/ky-luat/dssv-cau-hinh';
        T.post(url, { cauHinh }, res => {
            if (res.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Lấy danh sách sinh viên thành công!', 'success');
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger'));
    };
}

export function getSvQtKyLuatCauHinhDssv(id, done) {
    return () => {
        const url = '/api/ctsv/qua-trinh/ky-luat/cau-hinh/dssv';
        T.get(url, { id }, res => {
            if (res.error) {
                T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function getSvQtKyLuatCauHinh(id, done) {
    return () => {
        const url = '/api/ctsv/qua-trinh/ky-luat/cau-hinh/item';
        T.get(url, { id }, res => {
            if (res.error) {
                T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function createSvQtKyLuatCauHinh(cauHinh, done) {
    return (dispatch) => {
        const url = '/api/ctsv/qua-trinh/ky-luat/cau-hinh-tao-moi';
        T.post(url, { cauHinh }, res => {
            if (res.error) {
                T.notify('Tạo cấu hình xét kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Tạo cấu hình xét kỷ luật thành công!', 'success');
                dispatch(getSvQtKyLuatCauHinhPage());
                done && done(res.item);
            }
        }, () => T.notify('Tạo cấu hình xét kỷ luật bị lỗi!', 'danger'));
    };
}

export function updateSvQtKyLuatCauHinh(id, cauHinh, done) {
    return (dispatch) => {
        const url = '/api/ctsv/qua-trinh/ky-luat/cau-hinh-update';
        T.put(url, { id, cauHinh }, res => {
            if (res.error) {
                T.notify('Cập nhật cấu hình xét kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật cấu hình xét kỷ luật thành công!', 'success');
                dispatch(getSvQtKyLuatCauHinhPage());
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật cấu hình xét kỷ luật bị lỗi!', 'danger'));
    };
}

export function congBoKhoaSvQtKyLuatCauHinh(id, cauHinh, done) {
    return (dispatch) => {
        const url = '/api/ctsv/qua-trinh/ky-luat/cong-bo-khoa';
        T.put(url, { id, cauHinh }, res => {
            if (res.error) {
                T.notify('Cập nhật cấu hình xét kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật cấu hình xét kỷ luật thành công!', 'success');
                dispatch(getSvQtKyLuatCauHinhPage());
                done && done(res.items);
            }
        }, () => T.notify('Cập nhật cấu hình xét kỷ luật bị lỗi!', 'danger'));
    };
}

export function deleteSvQtKyLuatCauHinh(id) {
    return (dispatch) => {
        const url = '/api/ctsv/qua-trinh/ky-luat/cau-hinh/delete';
        T.delete(url, { id }, res => {
            if (res.error) {
                T.notify('Xóa cấu hình xét kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Xóa cấu hình xét kỷ luật thành công!', 'success');
                dispatch(getSvQtKyLuatCauHinhPage());
            }
        }, () => T.notify('Xóa cấu hình xét kỷ luật bị lỗi!', 'danger'));
    };
}

T.initPage('pageSvQtKyLuatCauHinh');
export function getSvQtKyLuatCauHinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSvQtKyLuatCauHinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/qua-trinh/ky-luat/cau-hinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình kỷ luật sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: SvQtKyLuatCauHinhGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách cấu hình kỷ luật bị lỗi!', 'danger'));
    };
}

export function svCheckSoQuyetDinh(soQuyetDinh, done) {
    return () => {
        const url = `/api/ctsv/qua-trinh/ky-luat/check/${soQuyetDinh}`;
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

export function ghiChuSvKyLuatDssvDuKien(id, changes, done) {
    return () => {
        const url = '/api/ctsv/qua-trinh/ky-luat/them-ghi-chu-ctsv';
        T.put(url, { id, changes }, res => {
            if (res.error) {
                T.notify('Cập nhật ghi chú cho kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật ghi chú cho kỷ luật thành công!', 'success');
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật ghi chú cho kỷ luật bị lỗi!', 'danger'));
    };
}