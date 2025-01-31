import T from 'view/js/common.js';

const ctsvHoSoNhapHocGetAll = 'ctsvHoSoNhapHoc:GetAll';

export default function CtsvHoSoNhapHocReducer(state = null, data) {
    switch (data.type) {
        case ctsvHoSoNhapHocGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getAllCtsvHoSoNhapHoc(condition, done) {
    return dispatch => {
        const url = '/api/ctsv/danh-muc/ho-so-nhap-hoc/all';
        T.get(url, condition, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu hồ sơ nhập học bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: ctsvHoSoNhapHocGetAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}

export function createCtsvHoSoNhapHoc(data, done) {
    return () => {
        const url = '/api/ctsv/danh-muc/ho-so-nhap-hoc';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo dữ liệu hồ sơ nhập học bị lỗi', 'danger');
                console.error('POST: ', data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function updateCtsvHoSoNhapHoc(id, changes, done) {
    return () => {
        const url = '/api/ctsv/danh-muc/ho-so-nhap-hoc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật dữ liệu hồ sơ nhập học bị lỗi', 'danger');
                console.error('PUT: ', data.error);
            } else {
                T.notify('Cập nhật dữ liệu hồ sơ nhập học thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

export function deleteCtsvHoSoNhapHoc(id, done) {
    return () => {
        const url = '/api/ctsv/danh-muc/ho-so-nhap-hoc';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa hồ sơ bị lỗi', 'danger');
                console.error('PUT: ', data.error);
            } else {
                T.notify('Xóa hồ sơ thành công', 'success');
                done && done();
            }
        });
    };
}