import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const svDrlPhucKhaoGetAll = 'svDrlPhucKhao:GetAll';
export default function svDrlPhucKhaoReducer(state = null, data) {
    switch (data.type) {
        case svDrlPhucKhaoGetAll:
            return Object.assign({}, state, { dsPhucKhao: data.item });
        default:
            return state;
    }
}


// ACTIONS -------------------------------------------------
export function getBoTieuChi(namHoc, hocKy, done) {
    const url = '/api/sv/danh-gia-drl/tieu-chi';
    T.get(url, { namHoc, hocKy }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => () => T.notify('Lấy bộ tiêu chí đánh giá bị lỗi!', 'danger'));
}

export function getSvDrlPhucKhaoAll(namHoc, hocKy, done) {
    return dispatch => {
        const url = '/api/sv/danh-gia-drl/phuc-khao';
        T.get(url, { namHoc, hocKy }, (data) => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error.message);
            } else {
                dispatch({ type: svDrlPhucKhaoGetAll, item: data.items });
                done && done(data);
            }
        }, () => console.log('Lấy danh sách phúc khảo điểm rèn luyện bị lỗi!'));
    };
}

export function createSvDrlPhucKhao(changes, done) {
    return dispatch => {
        const url = '/api/sv/danh-gia-drl/phuc-khao';
        T.alert('Vui lòng đợi giây lát!', 'warning', false, null, true);
        T.post(url, { changes }, (data) => {
            if (data.error) {
                // T.notify(data.error.message, 'danger');
                T.alert(data.error.message, 'error');
                console.error(`GET: ${url}.`, data.error.message);
            } else {
                T.alert('Đăng ký mới phúc khảo điểm rèn luyện thành công !', 'success');
                dispatch(getSvDrlPhucKhaoAll(changes.namHoc, changes.hocKy));
                done && done(data);
            }
        }, () => T.alert('Đăng ký mới phúc khảo điểm rèn luyện thất bại !', 'error'));
    };
}

export function huySvDrlPhucKhao(id, namHoc, hocKy, done) {
    return dispatch => {
        const url = '/api/sv/danh-gia-drl/phuc-khao';
        T.delete(url, { id }, (data) => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error.message);
            } else {
                T.notify('Hủy phúc khảo điểm rèn luyện thành công !', 'success');
                dispatch(getSvDrlPhucKhaoAll(namHoc, hocKy));
                done && done(data);
            }
        }, () => console.log('Hủy phúc khảo điểm rèn luyện bị lỗi !'));
    };
}

export function submitBangDanhGia(bangDanhGia, mssv, done) {
    const url = '/api/sv/danh-gia-drl';
    T.alert('Vui lòng đợi giây lát!', 'warning', false, null, true);
    T.post(url, { bangDanhGia }, result => {
        if (result.error) {
            T.alert(result.error.message, 'error');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            T.alert('Lưu thông tin thành công', 'success');
            done && done(result.items);
        }
    }, () => T.alert('Lấy bộ tiêu chí đánh giá bị lỗi!', 'danger'));
}

export function deleteMinhChung(condition, filePath, done) {
    const url = '/api/sv/danh-gia-drl/minh-chung';
    T.delete(url, { condition, filePath }, result => {
        if (result.error) {
            T.notify(result.error.message || 'Xóa minh chứng bị lỗi', 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Xóa minh chứng thành công!', 'danger'));
}



export function getDrlKienNghi(namHoc, hocKy, done) {
    return () => {
        const url = '/api/sv/danh-gia-drl/kien-nghi';
        T.get(url, { namHoc, hocKy }, data => {
            if (data.error) {
                T.notify('Lấy thông tin kiến nghị không thành công!', 'danger');
                console.error('GET: ', data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function createGiaHan(data, done) {
    return () => {
        const url = '/api/sv/danh-gia-drl/kien-nghi';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Kiến nghị không thành công!', 'danger');
                console.error('POST: ', data.error);
            } else if (data.failed) {
                T.notify(data.failed || 'Bạn không thể kiến nghị vào lúc này', 'warning');
            } else {
                T.notify('Đơn của bạn đã được gửi đến khoa!', 'success');
                done && done();
            }
        });
    };
}

export function updateGiaHan(id, data, done) {
    return () => {
        const url = '/api/sv/danh-gia-drl/kien-nghi';
        T.put(url, { id, data }, data => {
            if (data.error) {
                T.notify('Kiến nghị không thành công!', 'danger');
                console.error('PUT: ', data.error);
            } else if (data.failed) {
                T.notify(data.failed || 'Bạn không thể kiến nghị vào lúc này', 'warning');
            } else {
                T.notify('Đơn của bạn đã được gửi đến khoa!', 'success');
                done && done();
            }
        });
    };
}

export function deleteKienNghi(id, done) {
    return () => {
        const url = '/api/sv/danh-gia-drl/kien-nghi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Thu hồi không thành công!', 'danger');
                console.error('PUT: ', data.error);
            } else {
                T.notify('Đơn của bạn đã được thu hồi!', 'success');
                done && done();
            }
        });
    };
}
export function createHoatDong(data, done) {
    const url = '/api/sv/danh-gia-drl/hoat-dong';
    T.post(url, { data }, result => {
        if (result.error) {
            T.notify(result.error.message || 'Thêm minh chứng bị lỗi', 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Thêm minh chứng bị lỗi!', 'danger'));
}

export function updateHoatDong(condition, data, done) {
    const url = '/api/sv/danh-gia-drl/hoat-dong';
    T.put(url, { condition, data }, result => {
        if (result.error) {
            T.notify(result.error.message || 'Chỉnh sửa hoạt động bị lỗi', 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Chỉnh sửa hoạt động bị lỗi!', 'danger'));
}

export function deleteHoatDong(condition, filePath, done) {
    const url = '/api/sv/danh-gia-drl/hoat-dong';
    T.delete(url, { condition, filePath }, result => {
        if (result.error) {
            T.notify(result.error.message || 'Xóa hoạt động bị lỗi', 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result.items);
        }
    }, () => T.notify('Xóa hoạt động bị lỗi!', 'danger'));
}