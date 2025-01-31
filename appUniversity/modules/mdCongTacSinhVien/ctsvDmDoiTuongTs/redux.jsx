import T from 'view/js/common';

export function getDmSvDoiTuongTs(ma, done) {
    return () => {
        const url = `/api/ctsv/doi-tuong-tuyen-sinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đối tượng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_CtsvDmDoiTuongTs = {
    ajax: true,
    url: '/api/ctsv/doi-tuong-tuyen-sinh/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
};