import T from 'view/js/common';

export function getDmDangThucThiAll(done) {
    return () => {
        const url = '/api/sdh/ts/dang-thuc-thi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các phân hệ không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}
export function getSdhTsDangThucThi(ma, done) {
    return () => {
        const url = `/api/sdh/ts/dang-thuc-thi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các phân hệ không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export const SelectAdapter_DangThucThi = {
    ajax: true,
    url: '/api/sdh/ts/dang-thuc-thi/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
    fetchOne: (ma, done) => (getSdhTsDangThucThi(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))()
};

