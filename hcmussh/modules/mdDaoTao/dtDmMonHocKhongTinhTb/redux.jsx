import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const getMonHoc = 'getMonHocKhongTinhTB';

export default function DtDmMonHocKhongTinhTBReducer(state = null, data) {
    switch (data.type) {
        case getMonHoc:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getMonHocKhongTinhTB(done) {
    return dispatch => {
        const url = '/api/dt/mon-hoc-khong-tinh-tb';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: getMonHoc, items: data.items });
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createNhomMonHocKhongTinhTB(item, done) {
    return dispatch => {
        const url = '/api/dt/nhom-mon-hoc-khong-tinh-tb';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo nhóm môn học không tính trung bình bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo nhóm môn học không tính trung bình thành công!', 'success');
                dispatch(getMonHocKhongTinhTB());
                done && done();
            }
        }, () => T.notify('Tạo nhóm môn học không tính trung bình bị lỗi!', 'danger'));
    };
}

export function updateNhomMonHocKhongTinhTB(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/nhom-mon-hoc-khong-tinh-tb';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật nhóm môn học không tính trung bình bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nhóm môn học không tính trung bình thành công!', 'success');
                dispatch(getMonHocKhongTinhTB());
                done && done();
            }
        }, () => T.notify('Cập nhật nhóm môn học không tính trung bình bị lỗi!', 'danger'));
    };
}

export function deleteNhomMonHocKhongTinhTB(ma, done) {
    return dispatch => {
        const url = '/api/dt/nhom-mon-hoc-khong-tinh-tb';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa nhóm môn học không tính trung bình bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Xóa nhóm môn học không tính trung bình thành công!', 'success');
                dispatch(getMonHocKhongTinhTB());
                done && done();
            }
        }, () => T.notify('Xóa nhóm môn học không tính trung bình bị lỗi!', 'danger'));
    };
}

export function createMonHocKhongTinhTB(item, done) {
    return dispatch => {
        const url = '/api/dt/mon-hoc-khong-tinh-tb';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo môn học không tính trung bình bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                if (data.message.failed) T.notify(data.message.failed, 'danger');
                if (data.message.success) T.notify(data.message.success, 'success');
                dispatch(getMonHocKhongTinhTB());
                done && done();
            }
        }, () => T.notify('Tạo môn học không tính trung bình bị lỗi!', 'danger'));
    };
}

export function updateMonHocKhongTinhTB(id, changes, done) {
    return dispatch => {
        const url = '/api/dt/mon-hoc-khong-tinh-tb';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật môn học không tính trung bình bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật môn học không tính trung bình thành công!', 'success');
                dispatch(getMonHocKhongTinhTB());
                done && done();
            }
        }, () => T.notify('Cập nhật môn học không tính trung bình bị lỗi!', 'danger'));
    };
}

export function deleteMonHocKhongTinhTB(id, done) {
    return dispatch => {
        const url = '/api/dt/mon-hoc-khong-tinh-tb';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa môn học không tính trung bình bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Xóa môn học không tính trung bình thành công!', 'success');
                dispatch(getMonHocKhongTinhTB());
                done && done();
            }
        }, () => T.notify('Xóa môn học không tính trung bình bị lỗi!', 'danger'));
    };
}
