import T from 'view/js/common';

const SvThongKeTotNghiepGetPage = 'SvThongKeTotNghiep:GetPage';
const SvThongKeTotNghiepGetSoLuongTheoKhoa = 'SvThongKeTotNghiep:GetSoLuongTheoKhoa';
const SvThongKeTotNghiepGetSoLuongTheoLHDT = 'SvThongKeTotNghiep:GetSoLuongTheoLHDT';
const SvThongKeTotNghiepGetSoLuongTheoXepLoai = 'SvThongKeTotNghiep:GetSoLuongTheoXepLoai';

export default function SvThongKeTotNghiepReducer(state = null, data) {
    switch (data.type) {
        case SvThongKeTotNghiepGetPage:
            return Object.assign({}, state, { page: data.page });
        case SvThongKeTotNghiepGetSoLuongTheoKhoa:
            return Object.assign({}, state, { soLuongTheoKhoaData: data.soLuongTheoKhoaData });
        case SvThongKeTotNghiepGetSoLuongTheoLHDT:
            return Object.assign({}, state, { soLuongTheoLHDTData: data.soLuongTheoLHDTData });
        case SvThongKeTotNghiepGetSoLuongTheoXepLoai:
            return Object.assign({}, state, { soLuongTheoXepLoaiData: data.soLuongTheoXepLoaiData });
        default:
            return state;
    }
}

T.initPage('PageCtsvSvThongKeTotNghiep');
export function getPageSvThongKeTotNghiep(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('PageCtsvSvThongKeTotNghiep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/page';
        T.get(url, { ...page }, data => {
            if (data.error) {
                T.notify('Lấy thống kê tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SvThongKeTotNghiepGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}


export function createSvThongKeTotNghiep(data, done) {
    return dispatch => {
        const url = '/api/ctsv/thong-ke-tot-nghiep';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thống kê tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch(getPageSvThongKeTotNghiep());
                T.notify('Tạo thống kê tốt nghiệp thành công', 'success');
                done && done(data.items);
            }
        });
    };
}

export function getSvThongKeTotNghiep(mssv, done) {
    return () => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/item';
        T.get(url, { mssv }, data => {
            if (data.error) {
                T.notify('Lấy thống kê tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function updateSvThongKeTotNghiep(mssv, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/thong-ke-tot-nghiep';
        T.put(url, { mssv, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thống kê tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật thống kê tốt nghiệp thành công', 'success');
                dispatch(getPageSvThongKeTotNghiep());
                done && done();
            }
        });
    };
}


export const getDataSoLuongTheoKhoa = (filter) => {
    return dispatch => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/thong-ke-theo-khoa';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy số lượng theo khoá bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SvThongKeTotNghiepGetSoLuongTheoKhoa, soLuongTheoKhoaData: data.thongKe });

            }
        });
    };
};

export const getDataSoLuongTheoXepLoai = (filter) => {
    return dispatch => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/thong-ke-theo-xep-loai';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy số lượng theo xếp loại bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SvThongKeTotNghiepGetSoLuongTheoXepLoai, soLuongTheoXepLoaiData: data.thongKeTheoXepLoaiData });

            }
        });
    };
};

export const getDataSoLuongTheoLHDT = (filter) => {
    return dispatch => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/thong-ke-theo-loai-hinh-dao-tao';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy số lượng theo loại hình đào tạo bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SvThongKeTotNghiepGetSoLuongTheoLHDT, soLuongTheoLHDTData: data.thongKeLHDTData });

            }
        });
    };
};

export function downloadExcelTheoKhoa(xKey, yKey, fileName, filter) {
    return () => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/download-excel-theo-khoa';
        T.get(url, { xKey, yKey, filter }, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), `${fileName}.xlsx`);
            }
        });
    };
}
export function downloadExcelTheoHeDaoTao(xKey, yKey, fileName, filter) {
    return () => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/download-excel-theo-he-dao-tao';
        T.get(url, { xKey, yKey, filter }, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), `${fileName}.xlsx`);
            }
        });
    };
}
export function downloadExcelTheoXepLoai(xKey, yKey, fileName, filter) {
    return () => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/download-excel-theo-xep-loai';
        T.get(url, { xKey, yKey, filter }, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), `${fileName}.xlsx`);
            }
        });
    };
}

export function downloadExcel(fileName, pageCondition, filter) {
    return () => {
        const url = '/api/ctsv/thong-ke-tot-nghiep/download-excel';
        T.get(url, { pageCondition, filter }, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), `${fileName}.xlsx`);
            }
        });
    };
}
