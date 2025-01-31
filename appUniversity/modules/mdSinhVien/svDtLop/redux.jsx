export function getSvDtLop(maLop, done) {
    return () => {
        const url = `/api/sv/danh-sach-lop/item/${maLop}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export const SelectAdapter_SvDtLop = ({
    ajax: true,
    fetchOne: (ma, done) => (getSvDtLop(ma, item => done && done({ id: item.maLop, text: item.maLop })))()
});