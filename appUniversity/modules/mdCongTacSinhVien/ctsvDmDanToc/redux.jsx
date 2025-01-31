import T from 'view/js/common';

export function getDmDanToc(ma, done) {
    return () => {
        const url = `/api/ctsv/dan-toc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin dân tộc bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export const SelectAdapter_CtsvDmDanToc = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/ctsv/dan-toc/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmDanToc(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};