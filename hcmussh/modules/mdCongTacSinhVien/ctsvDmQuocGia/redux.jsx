export function cstvGetDmQuocGia(maCode, done) {
    return () => {
        const url = `/api/ctsv/quoc-gia/item/${maCode}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin Quốc gia bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_CstvDmQuocGia = {
    ajax: true,
    url: '/api/ctsv/quoc-gia/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maCode, text: `${item.maCode}: ${item.tenQuocGia.normalizedName()}` })) : [] }),
    fetchOne: (maCode, done) => (cstvGetDmQuocGia(maCode, item => item && done && done({ id: item.maCode, text: `${item.tenQuocGia.normalizedName()}` })))(),
};