import T from 'view/js/common.js';

const ctsvQuanHeNhapHocGetAll = 'ctsvQuanHeNhapHoc:GetAll';
const ctsvQuanHeNhapHocGetByKhoaHe = 'ctsvQuanHeNhapHoc:GetByKhoaHe';
const ctsvQuanHeNhapHocGet = 'ctsvQuanHeNhapHoc:Get';

export default function CtsvQuanHeNhapHocReducer(state = null, data) {
    switch (data.type) {
        case ctsvQuanHeNhapHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case ctsvQuanHeNhapHocGetByKhoaHe:
            return Object.assign({}, state, { heDaoTao: data.heDaoTao, khoaSinhVien: data.khoaSinhVien, items: data.items });
        case ctsvQuanHeNhapHocGet:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

export function getAllCtsvQuanHeNhapHoc(done) {
    return dispatch => {
        const url = '/api/ctsv/ho-so-nhap-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu hồ sơ nhập học bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: ctsvQuanHeNhapHocGetAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}

export function getAllCtsvQuanHeNhapHocByKhoaHe(heDaoTao, khoaSinhVien, done) {
    return (dispatch) => {
        const url = '/api/ctsv/ho-so-nhap-hoc/by-khoa-he';
        T.get(url, { heDaoTao, khoaSinhVien }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu hồ sơ nhập học bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.storage('ctsvQuanHeNhapHoc', { heDaoTao, khoaSinhVien });
                dispatch({ type: ctsvQuanHeNhapHocGetByKhoaHe, heDaoTao, khoaSinhVien, items: data.items });
                done && done(data.items);
            }
        });
    };
}

export function getCtsvQuanHeNhapHoc(id, done) {
    return dispatch => {
        const url = '/api/ctsv/ho-so-nhap-hoc/item';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu hồ sơ nhập học bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: ctsvQuanHeNhapHocGet, item: data.item });
                done && done(data.items);
            }
        });
    };
}
export function updateCtsvQuanHeHoSo(heDaoTao, khoaSinhVien, listHoSo, done) {
    return dispatch => {
        const url = '/api/ctsv/ho-so-nhap-hoc';
        T.put(url, { heDaoTao, khoaSinhVien, listHoSo }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật hồ sơ nhập học hệ đào tạo bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật hồ sơ nhập học hệ đào tạo thành công!', 'success');
                dispatch(getAllCtsvQuanHeNhapHocByKhoaHe(heDaoTao, khoaSinhVien));
                done && done();
            }
        });
    };
}