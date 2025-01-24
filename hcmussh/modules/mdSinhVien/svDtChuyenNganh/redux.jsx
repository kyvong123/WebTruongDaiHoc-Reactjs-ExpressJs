export function getSvDtChuyenNganh(maNganh, done) {
    return () => {
        const url = '/api/sv/danh-sach-chuyen-nganh';
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


export const SelectAdapter_SvDtChuyenNganhDaoTao = ({
    ajax: true,
    fetchOne: (maNganh, done) => (getSvDtChuyenNganh(maNganh, item => done && done({ id: item.ma, text: item.ten })))(),
});