
export const SelectApdaterDmTrinhDoDaoTaoFilter = (loai = null) => {
    if (loai == null) loai = '00';
    return {
        ajax: true,
        url: `/api/danh-muc/trinh-do-dao-tao/filter/${loai}/1/20`,
        data: params => ({ condition: params.term }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
        fetchOne: (ma, done) => (getDmTrinhDoDaoTao(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    };
};

export function getDmTrinhDoDaoTao(ma, done) {
    return () => {
        const url = `/api/danh-muc/trinh-do-dao-tao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bằng đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}