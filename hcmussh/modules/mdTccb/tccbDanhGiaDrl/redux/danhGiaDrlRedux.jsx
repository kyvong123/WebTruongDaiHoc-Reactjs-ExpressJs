import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetAll = 'sinhVien:GetAll';
const sinhVienGetPage = 'sinhVien:GetPage';
const sinhVienSetNull = 'sinhVien:SetNull';

export default function tccbDanhGiaDrlReducer(state = null, data) {
    switch (data.type) {
        case sinhVienSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case sinhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case sinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageTccbDanhGiaDrl');
export function getStudentsPage(idDot, pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageTccbDanhGiaDrl', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienSetNull });
        const url = `/api/tccb/danh-gia-drl/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { idDot, condition: page.pageCondition, filter: page.filter, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienGetPage, page: result.page });
                done && done(result);
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}

export function getSvDotDanhGiaDrlLatest(namHoc, hocKy, done) {
    return () => {
        const url = '/api/ctsv/dot-danh-gia-drl/page/1/1';
        T.get(url, { filter: { namHoc, hocKy } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt đánh giá bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.page?.list ? data.page?.list[0] : null);
            }
        });
    };
}

export function getBoTieuChi(namHoc, hocKy, mssv, done) {
    const url = '/api/tccb/danh-gia-drl/tieu-chi';
    T.get(url, { namHoc, hocKy, mssv }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Lấy bộ tiêu chí đánh giá bị lỗi!', 'danger'));
}

export function submitBangDanhGiaKhoa(bangDanhGiaKhoa, mssv, done) {
    const url = `/api/tccb/danh-gia-drl/${mssv}`;
    T.alert('Vui lòng đợi giây lát!', 'warning', false, null, true);
    T.post(url, { bangDanhGiaKhoa }, result => {
        if (result.error) {
            T.alert(result.error.message, 'danger');
            console.error(`POST: ${url}.`, result.error.message);
        } else {
            T.alert('Lưu thông tin thành công', 'success');
            done && done(result.items);
        }
    }, () => T.alert('Lưu thông tin bị lỗi!', 'danger'));
}

export function saoChepDiemLop(idDot, listMssv, filter, done) {
    const url = '/api/tccb/danh-gia-drl/sao-chep/diem-lop';
    return () => {
        T.post(url, { idDot, listMssv, filter }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`POST: ${url}.`, result.error.message);
            } else {
                T.notify('Sao chép thông tin thành công', 'success');
                // dispatch(getStudentsPage());
                done && done(result.items);
            }
        }, () => T.notify('Sao chép thông tin bị lỗi!', 'danger'));
    };
}

export function editDrlTongKetKhoa(listSinhVienUpdate, namHoc, hocKy, done) {
    return dispatch => {
        const url = '/api/tccb/danh-gia-drl/edit/diem-tong-ket';
        T.post(url, { listSinhVienUpdate, namHoc, hocKy }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`POST: ${url}.`, result.error.message);
            } else {
                T.notify('Lưu thông tin thành công', 'success');
                dispatch(getStudentsPage());
                done && done(result.items);
            }
        }, () => T.notify('Lưu thông tin bị lỗi!', 'danger'));
    };
}

export function createDrlGiaHanKhoa(changes, done) {
    const url = '/api/tccb/danh-gia-drl/gia-han/khoa';
    return () => {
        T.post(url, { changes }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`POST: ${url}.`, result.error.message);
            } else {
                T.notify('Đăng ký gia hạn thành công', 'success');
                done && done(result.items);
            }
        }, () => T.notify('Đăng ký gia hạn bị lỗi!', 'danger'));
    };
}

export function updateDrlGiaHanKhoa(id, changes, done) {
    const url = '/api/tccb/danh-gia-drl/gia-han/khoa';
    return () => {
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`PUT: ${url}.`, result.error.message);
            } else {
                T.notify('Cập nhật đăng ký gia hạn thành công', 'success');
                done && done(result.items);
            }
        }, () => T.notify('Cập nhật đăng ký gia hạn bị lỗi!', 'danger'));
    };
}

export function updateDrlThoiGianPhucKhao(changes, done) {
    const url = '/api/tccb/danh-gia-drl/thoi-gian-phuc-khao/khoa';
    return () => {
        T.post(url, { changes }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`PUT: ${url}.`, result.error.message);
            } else {
                T.notify('Cập nhật thời gian phúc khảo thành công', 'success');
                done && done(result.items);
            }
        }, () => T.notify('Cập nhật thời gian phúc khảo bị lỗi!', 'danger'));
    };
}

export function getDrlGiaHanKhoa(idDot, done) {
    const url = '/api/tccb/danh-gia-drl/gia-han/khoa';
    T.get(url, { idDot }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Lấy lịch sử gia hạn bị lỗi!', 'danger'));
}

export function getDrlGiaHanKhoaDssv(idGiaHan, done) {
    const url = '/api/tccb/danh-gia-drl/gia-han/khoa/dssv';
    return () => {
        T.get(url, { idGiaHan }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.items);
            }
        }, () => T.notify('Đăng ký gia hạn bị lỗi!', 'danger'));
    };
}

export function deleteDrlGiaHanKhoa(idGiaHan, done) {
    const url = '/api/tccb/danh-gia-drl/gia-han/khoa/huy-dang-ky';
    return () => {
        T.delete(url, { idGiaHan }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                T.notify('Hủy đăng ký gia hạn thành công', 'success');
                done && done(result.items);
            }
        }, () => T.notify('Hủy đăng ký gia hạn bị lỗi!', 'danger'));
    };
}