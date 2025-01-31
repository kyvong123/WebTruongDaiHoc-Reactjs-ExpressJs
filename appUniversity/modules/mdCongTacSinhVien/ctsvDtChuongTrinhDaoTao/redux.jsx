import T from 'view/js/common';

export function getDtChuongTrinhDaoTao(maCtdt, done) {
    return () => {
        const url = `/api/ctsv/chuong-trinh-dao-tao/item/${maCtdt}`;
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

export function getDtChuongTrinhDaoTaoTheoNganh(lhdt, maNganh, maChuyenNganh, khoaDt, done) {
    return () => {
        const url = '/api/ctsv/chuong-trinh-dao-tao-theo-nganh/item';
        T.get(url, { lhdt, maNganh, maChuyenNganh, khoaDt }, data => {
            if (data.error) {
                T.notify('Lấy chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export const SelectAdapter_KhungDaoTaoCtsvFilter = (loaiHinhDt, khoaSinhVien, maNganh = '') => {
    return {
        ajax: true,
        url: `/api/ctsv/chuong-trinh-dao-tao/ctdt-filter/${loaiHinhDt}/${khoaSinhVien}/${maNganh}`,
        data: params => ({ searchTerm: params.term }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maCtdt, text: item.maCtdt + ': ' + JSON.parse(item.tenNganh).vi + ': ' + item.khoaSinhVien, maNganh: item.maNganh, maChuyenNganh: item.chuyenNganh, maKhoa: item.maKhoa, thoiGianDaoTao: item.thoiGianDaoTao })) : [] }),
        fetchOne: (ma, done) => (getDtChuongTrinhDaoTao(ma, item => done && done({ id: item.maCtdt, text: item.maCtdt + ': ' + JSON.parse(item.tenNganh).vi + ': ' + item.khoaSinhVien, thoiGianDaoTao: item.thoiGianDaoTao })))()
    };
};

export const SelectAdapter_KhungDaoTaoCtsv = (loaiHinhDt, khoaSinhVien) => {
    return {
        ajax: true,
        url: `/api/ctsv/chuong-trinh-dao-tao/ctdt-all/${loaiHinhDt}/${khoaSinhVien}`,
        data: params => ({ searchTerm: params.term }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maCtdt, text: item.maCtdt + ': ' + JSON.parse(item.tenNganh).vi + ': ' + item.khoaSinhVien, maNganh: item.maNganh, maChuyenNganh: item.chuyenNganh, maKhoa: item.maKhoa })) : [] }),
        fetchOne: (ma, done) => (getDtChuongTrinhDaoTao(ma, item => done && done({ id: item.maCtdt, text: item.maCtdt + ': ' + JSON.parse(item.tenNganh).vi + ': ' + item.khoaSinhVien })))()
    };
};