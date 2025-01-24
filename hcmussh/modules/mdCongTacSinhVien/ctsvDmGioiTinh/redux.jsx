import T from 'view/js/common';

export function getDmGioiTinh(ma, done) {
    return () => {
        const url = `/api/ctsv/gioi-tinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_CtsvDmGioiTinh = {
    ajax: true,
    data: () => ({ condition: { kichHoat: 1 } }),
    url: '/api/ctsv/gioi-tinh/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: JSON.parse(item.ten).vi })) : [] }),
    fetchOne: (ma, done) => (getDmGioiTinh(ma, item => done && done({ id: item.ma, text: JSON.parse(item.ten).vi })))(),
};