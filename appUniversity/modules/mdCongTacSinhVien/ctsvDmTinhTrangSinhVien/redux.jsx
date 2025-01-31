import T from 'view/js/common';

export function getDmTinhTrangSinhVien(ma, done) {
    return () => {
        const url = `/api/ctsv/tinh-trang-sinh-vien/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tình trạng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export const SelectAdapter_CtsvDmTinhTrangSinhVien = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/ctsv/tinh-trang-sinh-vien/page/1/20',
    getOne: getDmTinhTrangSinhVien,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmTinhTrangSinhVien(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: response.ten }),
};