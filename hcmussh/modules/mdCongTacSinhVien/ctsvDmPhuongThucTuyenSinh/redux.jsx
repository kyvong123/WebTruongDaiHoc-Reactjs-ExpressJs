import T from 'view/js/common';

export function getDmPhuongThucTuyenSinh(ma, done) {
    return () => {
        const url = `/api/ctsv/phuong-thuc-tuyen-sinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phương thức bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_CtsvDmPhuongThucTuyenSinh = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/ctsv/phuong-thuc-tuyen-sinh/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmPhuongThucTuyenSinh(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};