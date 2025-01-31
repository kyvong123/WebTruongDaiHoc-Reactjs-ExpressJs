import T from 'view/js/common';

export function getDmQuanHuyen(ma, done) {
    return () => {
        const url = `/api/ctsv/quan-huyen/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin quận huyện bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
                // T.notify('Lấy thông tin quận huyện thành công!', 'success');
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const ajaxSelectQuanHuyen = (maTinhThanhPho) => ({
    ajax: false,
    url: `/api/ctsv/quan-huyen/all/${maTinhThanhPho}`,
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.items ? data.items.map(item => ({ id: item.maQuanHuyen, text: item.tenQuanHuyen })) : [] }),
    fetchOne: (id, done) => (getDmQuanHuyen(id, (item) => done && done({ id: item.maQuanHuyen, text: item.tenQuanHuyen })))()
});
