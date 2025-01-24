import T from 'view/js/common';

const SuKienGetPage = 'SuKien:GetPage';
const SuKienNguoiThamDuGetPage = 'SuKienNguoiThamDu:GetPage';
const DuyetSuKienGetPage = 'DuyetSuKien:GetPage';
const SuKienQuyenDuyetGetPage = 'SuKienQuyenDuyet:GetPage';

export default function SuKienReducer(state = null, data) {
    switch (data.type) {
        case SuKienGetPage:
            return Object.assign({}, state, { page: data.page });
        case SuKienNguoiThamDuGetPage:
            return Object.assign({}, state, { suKienNguoiThamDu: data.page });
        case DuyetSuKienGetPage:
            return Object.assign({}, state, { duyetSuKien: data.page });
        case SuKienQuyenDuyetGetPage:
            return Object.assign({}, state, { suKienQuyenDuyet: data.page });
        default:
            return state;
    }
}

T.initPage('PageCtsvSuKien');
export function getPageSuKien(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('PageCtsvSuKien', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/ctsv/danh-sach-su-kien/page';
        T.get(url, { ...page }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sự kiện bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SuKienGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function getSuKienInfo(id, done) {
    return () => {
        const url = `/api/ctsv/su-kien/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sự kiện không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}
export function getSuKienVersion(id, version, done) {
    return () => {
        let url = `/api/ctsv/su-kien/view-history/${id}/${version}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sự kiện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function getSuKienAllVersion(id, done) {
    return () => {
        const url = `/api/ctsv/danh-sach-su-kien/all-item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tất cả phiên bản sự kiện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function createSuKien(data, done) {
    return dispatch => {
        const url = '/api/ctsv/danh-sach-su-kien';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thêm sự kiện bị lỗi', 'danger');
                console.error('POST: ', data.error.message);
            } else {
                T.notify('Tạo thêm sự kiện thành công', 'success');
                dispatch(getPageSuKienNguoiThamDu(null, null, null, data.idSuKien));
                done && done(data);
            }
        });
    };
}
export function updateSuKien(id, changes, isDuyet, done) {
    return () => {
        const url = '/api/ctsv/danh-sach-su-kien';
        T.put(url, { id, changes, isDuyet }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Cập nhật thông tin sự kiện bị lỗi!', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin sự kiện thành công!', 'success');
                done && done(data);
            }
        });
    };
}


export function updateQrCodeTime(idSuKien, versionNumber, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/danh-sach-su-kien/qr-code';
        T.put(url, { idSuKien, versionNumber, changes }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Cập nhật sự kiện bị lỗi!', 'error');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                dispatch(getPageSuKien());
                T.notify('Cập nhật sự kiện thành công!', 'success');
                done && done();
            }
        });
    };
}
export function deleteSuKien(id, done) {
    return dispatch => {
        const url = '/api/ctsv/danh-sach-su-kien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sự kiện bị lỗi hoặc đã có danh sách người tham dự ', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                T.notify('Xóa sự kiện thành công', 'success');
                dispatch(getPageSuKien());
                done && done();
            }
        });
    };
}

export function updateDuyetSuKien(idSuKien, versionNumber, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/duyet-su-kien/update';
        T.put(url, { idSuKien, versionNumber, changes }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Cập nhật thông tin sự kiện bị lỗi!', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                dispatch(getPageSuKien());
                T.notify('Cập nhật thông tin sự kiện thành công!', 'success');
                done && done(data);
            }
        });
    };
}

T.initPage('PageCtsvSuKienNguoiThamDu');

export function getPageSuKienNguoiThamDu(pageNumber, pageSize, pageCondition, idSuKien, filter, done) {
    const page = T.updatePage('PageCtsvSuKienNguoiThamDu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/ctsv/su-kien-nguoi-tham-du/page';
        T.get(url, { ...page, filter: { idSuKien, ...filter } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách người tham dự sự kiện bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SuKienNguoiThamDuGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createNguoiThamDu(idSuKien, data, done) {
    data.idSuKien = idSuKien;
    return dispatch => {
        const url = '/api/ctsv/su-kien-nguoi-tham-du/create';
        T.post(url, { data }, data => {
            if (data.exist) {
                T.notify('Thêm người tham dự không thành công, người tham dự đã tồn tại trong danh sách', 'danger');
                console.error(`POST: ${url}.`, data.error);
            }
            else if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getPageSuKienNguoiThamDu(null, null, null, idSuKien));
                T.notify('Thêm người tham dự thành công', 'success');
                done && done();
            }
        }, () => T.notify('Thêm người tham dự bị lỗi!', 'danger'));
    };
}

export function updateNguoiThamDu(idSuKien, id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/su-kien-nguoi-tham-du/update';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch(getPageSuKienNguoiThamDu(null, null, null, idSuKien));
                T.notify('Cập nhật người tham dự thành công', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật người tham dự bị lỗi!', 'danger'));
    };
}


export function deleteNguoiThamDu(idSuKien, id, done) {
    return dispatch => {
        const url = '/api/ctsv/su-kien-nguoi-tham-du/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch(getPageSuKienNguoiThamDu(null, null, null, idSuKien));
                T.notify('Xóa người tham dự thành công', 'success');
                done && done();
            }
        }, () => T.notify('Xóa người tham dự bị lỗi!', 'danger'));
    };
}

export function downloadDanhSachNguoiThamDu(fileName, pageCondition, filter) {
    return () => {
        const url = '/api/ctsv/su-kien-nguoi-tham-du/download-excel';
        T.get(url, { pageCondition, filter }, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), `${fileName}.xlsx`);
            }
        });
    };
}

export function suKienDiemDanh(data, done) {
    const idSuKien = data.idSuKien;
    return dispatch => {
        const url = '/api/ctsv/danh-sach-su-kien/diem-danh';
        T.put(url, { data }, response => {
            if (response.error) {
                T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${response.error}`);
            } else {
                dispatch(getPageSuKienNguoiThamDu(null, null, null, idSuKien));
                T.notify(response.response, response.status);
                done && done(response);
            }
        }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
    };
}
export function getSuKienQr(id, done) {
    return () => {
        const url = '/api/ctsv/danh-sach-su-kien/qr-code';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy sự kiện bị lỗi', 'danger');
                console.error('GET', data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function getAllTieuChiDanhGia(done) {
    return () => {
        const url = '/api/ctsv/danh-muc-the-tieu-chi/get-all';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy tiêu chí đánh giá bị lỗi', 'danger');
                console.error('GET', data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}


T.initPage('PageCtsvSuKienQuyenDuyet');
export function getPagePhanQuyenDuyetSuKien(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('PageCtsvSuKienQuyenDuyet', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = '/api/ctsv/phan-quyen-duyet-su-kien/page';
        T.get(url, { ...page, filter, sortTerm }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ có quyền duyệt sự kiện bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SuKienQuyenDuyetGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createNguoiDuyet(data, done) {
    return dispatch => {
        const url = '/api/ctsv/phan-quyen-duyet-su-kien';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thêm người duyệt bị lỗi', 'danger');
                console.error('POST: ', data.error.message);
            } else {
                T.notify('Tạo thêm người duyệt thành công', 'success');
                dispatch(getPagePhanQuyenDuyetSuKien(null, null, null, null));
                done && done(data);
            }
        });
    };
}

export function deleteNguoiDuyet(id, done) {
    return dispatch => {
        const url = '/api/ctsv/phan-quyen-duyet-su-kien/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch(getPagePhanQuyenDuyetSuKien(null, null, null, null));
                T.notify('Xóa người duyệt thành công', 'success');
                done && done();
            }
        }, () => T.notify('Xóa người duyệt bị lỗi!', 'danger'));
    };
}