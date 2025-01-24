import T from 'view/js/common';

export function getDtChuyenNganh(ma, done) {
    return () => {
        T.get(`/api/dt/danh-sach-chuyen-nganh/item/${ma}`, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu!', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });

    };
}
export const SelectAdapter_DtChuyenNganhFilter = (maNganh) => ({
    ajax: true,
    data: params => ({ searchTerm: params.term, kichHoat: 1, maNganh }),
    url: '/api/dt/chuyen-nganh/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten} (${item.ma})` })) : [] }),
    fetchOne: (ma, done) => (getDtChuyenNganh(ma, item => done && done({ id: item.ma, text: `${item.ten} (${item.ma})` })))()
});