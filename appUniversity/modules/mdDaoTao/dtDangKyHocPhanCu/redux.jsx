import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDangKyHocPhanCuGetAll = 'DtDangKyHocPhanCu:GetAll';

export default function DtDangKyHocPhanCuReducer(state = null, data) {
    switch (data.type) {
        case DtDangKyHocPhanCuGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDataHocPhanCu(filter, done) {
    return () => {
        const url = '/api/dt/dang-ky-cu/hoc-phan';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getDiemAll(mssv, list, done) {
    return () => {
        const url = '/api/dt/dang-ky-cu/diem';
        T.get(url, { mssv, list }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function createDataHocPhanCu(mssv, list, done) {
    return () => {
        const url = '/api/dt/dang-ky-cu/hoc-phan';
        T.post(url, { mssv, list }, data => {
            if (data.error) {
                T.notify('Đăng ký học phần bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Đăng ký học phần thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function createDataDiemCu(list, done) {
    return () => {
        const url = '/api/dt/dang-ky-cu/diem';
        T.post(url, { list }, data => {
            if (data.error) {
                T.notify('Nhập điểm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Nhập điểm thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Nhập điểm bị lỗi!', 'danger'));
    };
}

export function deleteDataHocPhanCu(mssv, list, done) {
    return () => {
        const url = '/api/dt/dang-ky-cu/hoc-phan';
        T.delete(url, { mssv, list }, data => {
            if (data.error) {
                T.notify('Hủy đăng ký học phần bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Hủy đăng ký học phần thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Hủy đăng ký học phần bị lỗi!', 'danger'));
    };
}