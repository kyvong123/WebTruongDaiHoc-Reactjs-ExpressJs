import T from 'view/js/common';

export function getDmTonGiao(ma, done) {
    return () => {
        const url = `/api/ctsv/ton-giao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tôn giáo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_CtsvDmTonGiao = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/ctsv/ton-giao/page/1/20',
    getOne: getDmTonGiao,
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmTonGiao(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: response.ten }),
};