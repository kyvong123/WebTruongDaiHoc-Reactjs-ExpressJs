import T from 'view/js/common';

export function getDmPhuongXa(maPhuongXa, done) {
    return () => {
        const url = `/api/ctsv/phuong-xa/item/${maPhuongXa}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phường xã bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const ajaxSelectPhuongXa = (maQuanHuyen) => ({
    ajax: false,
    url: `/api/ctsv/phuong-xa/all/${maQuanHuyen}`,
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.items ? data.items.map(item => ({ id: item.maPhuongXa, text: item.tenPhuongXa })) : [] }),
    fetchOne: (id, done) => (getDmPhuongXa(id, (item) => done && done({ id: item.maPhuongXa, text: item.tenPhuongXa })))()
});
