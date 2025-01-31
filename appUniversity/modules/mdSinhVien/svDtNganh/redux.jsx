export function getSvDtNganh(maNganh, done) {
    return () => {
        const url = '/api/sv/danh-sach-nganh';
        T.get(url, { maNganh }, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_SvDtNganh = ({
    ajax: true,
    fetchOne: (maNganh, done) => (getSvDtNganh(maNganh, item => done && done({ id: item.maNganh, text: item.tenNganh, khoa: item.khoa })))(),
});