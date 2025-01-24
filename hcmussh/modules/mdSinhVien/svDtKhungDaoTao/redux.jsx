import T from 'view/js/common';

export function getSvDtChuongTrinhDaoTao(maCtdt, done) {
    return () => {
        const url = `/api/sv/chuong-trinh-dao-tao/item/${maCtdt}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export const SelectAdapter_SvDtKhungDaoTao = ({
    ajax: true,
    fetchOne: (ma, done) => (getSvDtChuongTrinhDaoTao(ma, item => done && done({ id: item.maCtdt, text: JSON.parse(item.tenNganh).vi + ': ' + item.khoaSinhVien })))()
});