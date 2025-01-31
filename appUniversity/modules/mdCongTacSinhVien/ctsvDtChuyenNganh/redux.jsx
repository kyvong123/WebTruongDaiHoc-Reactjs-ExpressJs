import T from 'view/js/common';

export function getDtChuyenNganh(maNganh, done) {
    return () => {
        const url = '/api/ctsv/danh-sach-chuyen-nganh';
        T.get(url, { maNganh }, data => {
            if (data.error) {
                T.notify('Lấy thông tin chuyên ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export const SelectAdapter_DtChuyenNganhDaoTao = (maNganh) => ({
    ajax: true,
    url: `/api/ctsv/danh-sach-chuyen-nganh/all?maNganh=${maNganh}`,
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ma + ': ' + item.ten, khoa: item.khoa, maLop: item.maLop })) : [] }),
    fetchOne: (maNganh, done) => (getDtChuyenNganh(maNganh, item => done && done({ id: item.ma, text: item.ma + ': ' + item.ten, maLop: item.maLop })))(),
});