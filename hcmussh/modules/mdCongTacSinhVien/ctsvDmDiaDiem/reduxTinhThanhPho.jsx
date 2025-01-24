import T from 'view/js/common';

export function getDmTinhThanhPho(ma, done) {
    return () => {
        const url = `/api/ctsv/tinh-thanh-pho/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tỉnh thành phố bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_CtsvDmTinhThanhPho = {
    ajax: true,
    url: '/api/ctsv/tinh-thanh-pho/page/1/20',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmTinhThanhPho(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};

export const ajaxSelectTinhThanhPho = {
    ajax: false,
    url: '/api/ctsv/tinh-thanh-pho/all',
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.items ? data.items.filter(item => item.kichHoat).map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmTinhThanhPho(id, (item) => item && done && done({ id: item.ma, text: item.ten })))()
};