// import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtKiemTraMaLoaiDangKyGetAll = 'DtKiemTraMaLoaiDangKy:GetAll';

export default function DtKiemTraMaLoaiDangKyReducer(state = null, data) {
    switch (data.type) {
        case DtKiemTraMaLoaiDangKyGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDetailMonHoc(filter, done) {
    return () => {
        T.get('/api/dt/kiem-tra-ma-loai-dang-ky', { filter }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy chi tiết học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.listHocPhan);
            }
        });
    };
}

export function updateMaLoaiDangKy(filter, done) {
    return dispatch => {
        const url = '/api/dt/kiem-tra-ma-loai-dang-ky';
        T.put(url, { filter }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Cập nhật mã loại đăng ký bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật mã loại đăng ký thành công!', 'success');
                dispatch({ type: DtKiemTraMaLoaiDangKyGetAll });
                done && done(data);
            }
        }, () => T.notify('Cập nhật mã loại đăng ký bị lỗi!', 'danger'));
    };
}

export function checkMaLoaiHocPhan(data, done) {
    return () => {
        const url = '/api/dt/kiem-tra-ma-loai-dang-ky/hoc-phan';
        T.get(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Kiểm tra mã loại đăng ký bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                done && done(data);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function checkMaLoaiLop(data, done) {
    return () => {
        const url = '/api/dt/kiem-tra-ma-loai-dang-ky/lop';
        T.get(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Kiểm tra mã loại đăng ký bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                done && done(data);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function updateMaLoaiDangKyMultiple(items, done) {
    return () => {
        const url = '/api/dt/kiem-tra-ma-loai-dang-ky/multiple';
        T.put(url, { items }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Cập nhật mã loại đăng ký bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.alert('Cập nhật mã loại đăng ký thành công!', 'success', false, 2000);
                done && done(data);
            }
        });
    };
}