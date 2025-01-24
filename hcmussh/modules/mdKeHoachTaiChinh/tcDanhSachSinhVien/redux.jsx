import T from 'view/js/common';

const TcDanhSachSinhVienGetPage = 'TcDanhSachSinhVien:GetPage';
const TcInfoSinhVien = 'TcDanhSachSinhVien:InfoSinhVien';
export default function tcDanhSachSinhVien(state = null, data) {
    switch (data.type) {
        case TcDanhSachSinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcInfoSinhVien:
            return Object.assign({}, state, { infoSinhVien: data.data });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcDanhSachSinhVien');
export function GetDanhSachSinhVienPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcDanhSachSinhVien', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        dispatch({ type: TcDanhSachSinhVienGetPage, page: null });
        const url = `/api/khtc/danh-sach-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcDanhSachSinhVienGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function GetOneSinhVienPage(mssv, done) {
    return dispatch => {
        const url = `/api/khtc/danh-sach-sinh-vien/info-page/${mssv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcInfoSinhVien, data: data });
                done && done(data);
            }
        }, () => T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger'));
    };
}

export function getDtDangKyHocPhanByStudent(mssv, filter, done) {
    return () => {
        const url = '/api/khtc/dang-ky-hoc-phan/student/hoc-phan';
        T.get(url, { mssv, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần sinh viên đăng ký bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getInvoiceStudent(mssv, done) {
    return () => {
        const url = `/api/khtc/invoice/page/${mssv}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin hóa đơn!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        }, () => T.notify('Lỗi khi lấy thông tin hóa đơn!', 'danger'));
    };
}

export function downloadPhieuThuWord(filter, done) {
    return () => {
        const url = '/api/khtc/danh-sach-sinh-vien/sv/download-word';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Tải phiếu thông tin học phí không thành công!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tải phiếu thông tin học phí thành công!', 'success');
                done && done(result);
            }
        }, () => T.notify('Lỗi khi lấy thông tin hóa đơn!', 'danger'));
    };
}

// export function getCauHinhThongTin(mssv, done) {
//     return () => {
//         const url = '/api/khtc/danh-sach-sinh-vien/cau-hinh-thong-tin';
//         T.get(url, { mssv }, result => {
//             if (result.error) {
//                 T.notify('Lấy cấu hình thông tin sinh viên không thành công!', 'danger');
//                 console.error(result.error);
//             } else {
//                 done && done(result);
//             }
//         }, () => T.notify('Lấy cấu hình thông tin sinh viên không thành công!', 'danger'));
//     };
// }

export function updateCauHinhThongTin(mssv, cauHinh, khoaSinhVien, done) {
    return () => {
        const url = '/api/khtc/danh-sach-sinh-vien/cau-hinh-thong-tin';
        T.post(url, { mssv, cauHinh, khoaSinhVien }, result => {
            if (result.error) {
                T.notify('Cập nhật cấu hình thông tin sinh viên không thành công!', 'danger');
                console.error(result.error);
            } else {
                done && done();
            }
        }, () => T.notify('Cập nhật cấu hình thông tin sinh viên không thành công!', 'danger'));
    };
}

// export function updateCauHinhBaoLuu(mssv, cauHinh, done) {
//     return () => {
//         const url = '/api/khtc/danh-sach-sinh-vien/cau-hinh-bao-luu';
//         T.post(url, { mssv, cauHinh }, result => {
//             if (result.error) {
//                 T.notify('Cập nhật cấu hình bảo lưu của sinh viên không thành công!', 'danger');
//                 console.error(result.error);
//             } else {
//                 done && done();
//             }
//         }, () => T.notify('Cập nhật cấu hình bảo lưu của sinh viên không thành công!', 'danger'));
//     };
// }






