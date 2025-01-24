import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtKhoaDaoTaoGetAll = 'dtKhoaDaoTao:GetAll';
const DtKhoaDaoTaoGetPage = 'dtKhoaDaoTao:GetPage';
const DtKhoaDaoTaoUpdate = 'dtKhoaDaoTao:Update';


export default function DtKhoaDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DtKhoaDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtKhoaDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtKhoaDaoTaoUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtKhoaDaoTao(maKhoa, done) {
    return () => {
        const url = `/api/dt/khoa-dao-tao/item/${maKhoa}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu khoá đào tạo', 'danger');
                console.error(`GET: ${url}`, result.error);
            } else {
                done && done(result.item);
            }
        }, () => {
            T.notify('Lỗi lấy dữ liệu khoá đào tạo', 'danger');
        });
    };
}

T.initPage('pageDtKhoaDaoTao');
export function getDtKhoaDaoTaoPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtKhoaDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/khoa-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khoa đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtKhoaDaoTaoGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDtKhoaDaoTao(data, done) {
    const cookie = T.updatePage('pageDtKhoaDaoTao');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        T.post('/api/dt/khoa-dao-tao', { data }, result => {
            if (result.error) {
                T.notify(result.error.message ? result.error.message : 'Tạo khóa đào tạo bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo khoá đào tạo thành công', 'success');
                dispatch(getDtKhoaDaoTaoPage(pageNumber, pageSize, pageCondition, filter));
                done && done(result.item);
            }
        }, () => {
            T.notify('Lỗi tạo khoá đào tạo', 'danger');
        });
    };
}

export function getDtKhoaSinhVien(khoaSinhVien, done) {
    return () => {
        const url = `/api/dt/khoa-sinh-vien/item/${khoaSinhVien}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item?.namTuyenSinh);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getAllKhoaSinhVien(done) {
    return () => {
        const url = '/api/dt/khoa-sinh-vien/get-khoa-sinh-vien';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getListKhoaSinhVien(role, done) {
    return () => {
        const url = '/api/dt/khoa-sinh-vien/all';
        T.get(url, { role }, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_DtKhoaDaoTao = {
    ajax: true,
    url: '/api/dt/khoa-sinh-vien/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item, text: item })) : [] }),
    fetchAll: (done) => (getAllKhoaSinhVien(items => done({ items: items.map(item => item.namTuyenSinh) })))(),
    fetchOne: (year, done) => (getDtKhoaSinhVien(year, item => item && done && done({ id: item, text: item })))(),
};

export const SelectAdapter_DtKhoaDaoTaoFilter = (role) => ({
    ajax: true,
    url: '/api/dt/khoa-sinh-vien/all',
    data: params => ({ searchTerm: params.term, role }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item, text: item })) : [] }),
    fetchAll: (done) => (getListKhoaSinhVien(role, items => done({ items })))(),
    fetchOne: (year, done) => (getDtKhoaSinhVien(year, item => item && done && done({ id: item, text: item })))(),
});

export const SelectAdapter_CtsvDtKhoaDaoTao = {
    ajax: true,
    url: '/api/dt/khoa-sinh-vien/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item, text: item })) : [] }),
    fetchAll: (done) => (getAllKhoaSinhVien(items => done({ items: items.map(item => item.namTuyenSinh) })))(),
    fetchOne: (year, done) => (getDtKhoaSinhVien(year, item => item && done && done({ id: item, text: item })))(),
};

export const SelectAdapter_DtKhoa = (namTuyenSinh, he) => ({
    ajax: true,
    data: params => ({ searchTerm: params.term, namTuyenSinh, he }),
    url: '/api/dt/khoa-dao-tao/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maKhoa, text: `${item.maKhoa}: Đợt ${item.dotTuyenSinh}`, dotTrungTuyen: item.dotTuyenSinh, thoiGianDaoTao: item.thoiGian })) : [] }),
    fetchOne: (maKhoa, done) => (getDtKhoaDaoTao(maKhoa, item => item && done && done({ id: item.maKhoa, text: `${item.maKhoa}: Đợt ${item.dotTuyenSinh}`, dotTrungTuyen: item.dotTuyenSinh, thoiGianDaoTao: item.thoiGian })))()
});