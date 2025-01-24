import T from 'view/js/common';

const SdhLopHocVienHocPhanAll = 'SdhLopHocVienHocPhan:GetAll';
export default function SdhLopHocVienHocPhanReducer(state = null, data) {
    switch (data.type) {
        case SdhLopHocVienHocPhanAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getAllSdhLopHocVienHocPhan(done) {
    return dispatch => {
        const url = '/api/sdh/lop-hoc-vien-hoc-phan/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu học phần', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhLopHocVienHocPhanAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function getSdhHocPhanByLopHocVien(maLop, done) {
    return () => {
        const url = '/api/sdh/hoc-phan-by-lop-hoc-vien';
        T.get(url, { maLop }, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu học phần', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function getSdhHocPhanByMaHocPhan(maHocPhan, done) {
    return () => {
        const url = '/api/sdh/hoc-phan-by-ma-hoc-phan';
        T.get(url, { maHocPhan }, data => {
            if (data.error) {
                T.notify('Lỗi lấy dữ liệu học phần theo lớp', 'danger');
                console.error(data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}
