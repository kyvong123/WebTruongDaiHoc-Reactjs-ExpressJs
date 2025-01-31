import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvLoaiHinhDaoTaoGetPage = 'DmSvLoaiHinhDaoTao:GetPage';
const DmSvLoaiHinhDaoTaoGetAll = 'DmSvLoaiHinhDaoTao:GetAll';
const DmSvLoaiHinhDaoTaoUpdate = 'DmSvLoaiHinhDaoTao:Update';

export default function DmSvLoaiHinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DmSvLoaiHinhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmSvLoaiHinhDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmSvLoaiHinhDaoTaoUpdate:
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
T.initPage('pageDmSvLoaiHinhDaoTao');

export function getDmSvLoaiHinhDaoTaoPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmSvLoaiHinhDaoTao', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/he-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmSvLoaiHinhDaoTaoGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách loại hình bị lỗi!', 'danger'));
    };
}

export function getDmSvLoaiHinhDaoTao(ma, done) {
    return () => {
        const url = `/api/danh-muc/he-dao-tao/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDmSvLoaiHinhDaoTaoAll(done) {
    return () => {
        const url = '/api/danh-muc/he-dao-tao/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getAllCtsvDmLoaiHinhDaoTao(done) {
    return (dispatch) => {
        const url = '/api/danh-muc/he-dao-tao/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmSvLoaiHinhDaoTaoGetAll, items: data.items });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmSvLoaiHinhDaoTao(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/he-dao-tao';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo loại hình bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới thông tin loại hình thành công!', 'success');
                dispatch(getDmSvLoaiHinhDaoTaoPage());
                done && done(data);
            }
        }, () => T.notify('Tạo loại hình bị lỗi!', 'danger'));
    };
}

export function deleteDmSvLoaiHinhDaoTao(ma) {
    return dispatch => {
        const url = '/api/danh-muc/he-dao-tao';
        T.delete(url, { ma: ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại hình bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmSvLoaiHinhDaoTaoPage());
            }
        }, () => T.notify('Xóa loại hình bị lỗi!', 'danger'));
    };
}

export function updateDmSvLoaiHinhDaoTao(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/he-dao-tao';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin loại hình bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hình thành công!', 'success');
                dispatch(getDmSvLoaiHinhDaoTaoPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin loại hình bị lỗi!', 'danger'));
    };
}

export function getAllDmSvLoaiHinhDaoTaoDrl(done) {
    return () => {
        const url = '/api/danh-muc/he-dao-tao/drl';
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách loại hình đào tạo bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách loại hình đào tạo bị lỗi!', 'danger'));
    };
}

export function getAllDmSvLoaiHinhDaoTao(role, done) {
    return () => {
        const url = '/api/danh-muc/he-dao-tao/filter';
        T.get(url, { role }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách loại hình đào tạo bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách loại hình đào tạo bị lỗi!', 'danger'));
    };
}

export function changeDmSvLoaiHinhDaoTao(item) {
    return { type: DmSvLoaiHinhDaoTaoUpdate, item };
}

export const SelectAdapter_DmSvLoaiHinhDaoTao = {
    ajax: true,
    url: '/api/danh-muc/he-dao-tao/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten, maLopTuDong: item.maLopTuDong })) : [] }),
    fetchOne: (ma, done) => (getDmSvLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten, maLopTuDong: item.maLopTuDong })))()
};


export const SelectAdapter_DmSvLoaiHinhDaoTaoFilter = {
    ajax: true,
    url: '/api/danh-muc/he-dao-tao/filter',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten, maLop: item.maLop })) : [] }),
    fetchAll: done => (getDmSvLoaiHinhDaoTaoAll(items => done && done(items.map(item => ({ id: item.ma, text: item.ten })))))(),
    fetchOne: (ma, done) => (getDmSvLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten, item, maLop: item.maLop })))()
};

export const SelectAdapter_LoaiHinhDaoTaoFilter = (role) => ({
    ajax: true,
    url: '/api/danh-muc/he-dao-tao/filter',
    data: params => ({ condition: params.term, role }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten, maLop: item.maLop })) : [] }),
    fetchAll: done => (getAllDmSvLoaiHinhDaoTao(role, items => done && done(items.map(item => ({ id: item.ma, text: item.ten })))))(),
    fetchOne: (ma, done) => (getDmSvLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten, item, maLop: item.maLop })))()
});

export const SelectAdapter_DmSvLoaiHinhDaoTaoDrl = {
    ajax: true,
    url: '/api/danh-muc/he-dao-tao/drl',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchAll: done => (getAllDmSvLoaiHinhDaoTaoDrl(items => done && done(items.map(item => ({ id: item.ma, text: item.ten })))))(),
    fetchOne: (ma, done) => (getDmSvLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten, item, maLop: item.maLop })))()
};
export const SelectAdapter_DmSvLoaiHinhDaoTaoDrlByDot = (idDot) => ({
    ajax: true,
    url: '/api/danh-muc/he-dao-tao/drl',
    data: params => ({ condition: params.term, idDot }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchAll: done => (getAllDmSvLoaiHinhDaoTaoDrl(items => done && done(items.map(item => ({ id: item.ma, text: item.ten })))))(),
    fetchOne: (ma, done) => (getDmSvLoaiHinhDaoTao(ma, item => done && done({ id: item.ma, text: item.ten, item, maLop: item.maLop })))()
});