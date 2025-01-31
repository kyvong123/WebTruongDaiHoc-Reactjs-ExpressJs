export function getDiemRenLuyen(mssv, namHoc, done) {
    return () => {
        const url = '/api/ctsv/diem-ren-luyen';
        T.get(url, { filter: { mssv, namHoc } }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy điểm rèn luyện bị lỗi!', 'danger');
                console.error('GET: ', data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export const SelectAdapter_DiemRenLuyenNamHoc = (mssv) => ({
    ajax: true,
    url: '/api/ctsv/diem-ren-luyen/nam-hoc',
    data: () => ({ mssv }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.namHoc, text: item.namHoc })) : [] }),
});