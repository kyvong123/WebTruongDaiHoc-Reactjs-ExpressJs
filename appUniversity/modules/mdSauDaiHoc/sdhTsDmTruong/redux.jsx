export function getSdhTsDmTruongItem(ten, done) {
    return () => {
        const url = '/api/sdh/ts/dm-truong/item';
        T.get(url, { ten }, result => {
            if (result.error) {
                T.notify('Lấy thông tin trường không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_DmTruong = {
    ajax: true,
    url: '/api/sdh/ts/dm-truong/all',
    data: params => ({ searchTerm: params.term, }),
    processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.ten, text: item.ten, ma: item.ma })) : [] }),
    fetchOne: (ma, done) => (getSdhTsDmTruongItem(ma, item => done && done({ id: item.ten, text: item.ten, ma: item.ma })))()
};