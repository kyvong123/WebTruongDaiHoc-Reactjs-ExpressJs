import T from 'view/js/common';

const SdhTsThongTinBieuMauAll = 'SdhTsThongTinBieuMau:GetAll';
export default function SdhTsThongTinBieuMauReducer(state = null, data) {
    switch (data.type) {
        case SdhTsThongTinBieuMauAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getSdhTsThongTinBieuMau(maPhanHe, done) {
    return () => {
        const url = '/api/sdh/tuyen-sinh/thong-tin-bieu-mau';
        T.get(url, { maPhanHe }, data => {
            if (data.error) {
                T.notify('Lấy thông tin biểu mẫu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (data == 'Không tìm thấy thông tin biểu mẫu!') {
                    T.notify('Lấy thông tin biểu mẫu bị lỗi' + (':<br>' + data), 'danger');
                    console.error(`GET: ${url}.`, data.error);
                }
                done && done(data.item);
            }
        }, (error) => T.notify('Lấy thông tin biểu mẫu bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSdhTsThongTinBieuMauAll(done) {
    return dispatch => {
        const url = '/api/sdh/tuyen-sinh/thong-tin-bieu-mau/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu biểu mẫu đăng ký', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhTsThongTinBieuMauAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhTsThongTinBieuMau(data, done) {
    return dispatch => {
        const url = '/api/sdh/tuyen-sinh/thong-tin-bieu-mau';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo dữ liệu biểu mẫu đăng ký', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getSdhTsThongTinBieuMauAll());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhTsThongTinBieuMau(phanHe, data, done) {
    return dispatch => {
        const url = '/api/sdh/tuyen-sinh/thong-tin-bieu-mau';
        T.put(url, { phanHe, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật dữ liệu biểu mẫu đăng ký', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getSdhTsThongTinBieuMauAll());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhTsThongTinBieuMau(phanHe, done) {
    return dispatch => {
        const url = '/api/sdh/tuyen-sinh/thong-tin-bieu-mau/';
        T.delete(url, { phanHe }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật dữ liệu biểu mẫu đăng ký', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thành công!', 'danger');
                dispatch(getSdhTsThongTinBieuMauAll());
                done && done(result.item);
            }
        });
    };
}