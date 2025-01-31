import T from 'view/js/common';

export function getDtNganh(maNganh, done) {
    return () => {
        const url = '/api/ctsv/danh-sach-nganh';
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

export function getAllDtNganh(done) {
    return () => {
        const url = '/api/ctsv/danh-sach-nganh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getAllDtNganhCountStudent(searchTerm, filter, done) {
    return () => {
        const url = '/api/ctsv/danh-sach-nganh/count-student/all';
        T.get(url, { searchTerm, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getDtNganhCountStudent(maNganh, khoaSinhVien, listHeDaoTao, done) {
    return () => {
        const url = '/api/ctsv/danh-sach-nganh/count-student/item';
        T.get(url, { maNganh, khoaSinhVien, listHeDaoTao }, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}


export const SelectAdapter_DtNganhDaoTao = {
    ajax: true,
    url: '/api/ctsv/danh-sach-nganh/page/1/20',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, khoa: item.maKhoa, maLop: item.maLop })) : [] }),
    fetchOne: (maNganh, done) => (getDtNganh(maNganh, item => done && done({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, khoa: item.khoa, maLop: item.maLop })))(),
};

export const SelectAdapter_DtNganhDaoTaoV2 = (maKhoa) => ({
    ajax: true,
    url: '/api/ctsv/danh-sach-nganh/page/1/20',
    data: params => ({ searchTerm: params.term, filter: { maKhoa } }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maNganh, text: item.tenNganh, khoa: item.maKhoa })) : [] }),
    fetchOne: (maNganh, done) => (getDtNganh(maNganh, item => done && done({ id: item.maNganh, text: item.tenNganh, khoa: item.khoa })))(),
});

export const SelectAdapter_DtNganhDaoTaoShcd = (khoaSinhVien, listHeDaoTao) => ({
    ajax: true,
    url: '/api/ctsv/danh-sach-nganh/count-student/all',
    data: params => ({ searchTerm: params.term, filter: { khoaSinhVien, listHeDaoTao } }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maNganh, text: item.tenNganh, soLuong: item.soLuong })) : [] }),
    fetchOne: (maNganh, done) => (getDtNganhCountStudent(maNganh, khoaSinhVien, listHeDaoTao, item => done && done({ id: item.maNganh, text: item.tenNganh, soLuong: item.soLuong })))(),
});
