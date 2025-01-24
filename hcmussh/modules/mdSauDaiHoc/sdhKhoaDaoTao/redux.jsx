import T from 'view/js/common';

const SdhKhoaDaoTaoAll = 'SdhKhoaDaoTao:GetAll';
const SdhKhoaDaoTaoGetPage = 'SdhKhoaDaoTao:GetPage';
const SdhKhoaDaoTaoUpdate = 'SdhKhoaDaoTao:Update';

export default function SdhKhoaDaoTaoReducer(state = null, data) {
    switch (data.type) {

        case SdhKhoaDaoTaoAll:
            return Object.assign({}, state, { items: data.items });
        case SdhKhoaDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhKhoaDaoTaoUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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

export function getSdhKhoaDaoTaoPage(pageNumber, pageSize, searchTerm, filter, done) {
    return dispatch => {
        const url = '/api/sdh/khoa-dao-tao/page/:pageNumber/:pageSize';
        T.get(url, { pageNumber, pageSize, searchTerm, filter }, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu khóa đào tạo', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhKhoaDaoTaoAll, page: result.page });
                done && done(result.page);
            }
        });
    };
}

export function getSdhKhoaDaoTaoAll(idKhoa, searchTerm, done) {
    return dispatch => {
        const url = '/api/sdh/khoa-dao-tao/all';
        T.get(url, { idKhoa, searchTerm }, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu khóa đào tạo', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhKhoaDaoTaoAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhKhoaDaoTao(data, done) {
    return dispatch => {
        const url = '/api/sdh/khoa-dao-tao';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo khóa đào tạo', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới khóa đào tạo thành công', 'success');
                dispatch(getSdhKhoaDaoTaoAll());
                done && done();
            }
        });
    };
}

export function updateSdhKhoaDaoTao(id, data, done) {
    return dispatch => {
        const url = '/api/sdh/khoa-dao-tao';
        T.put(url, { id, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật khóa đào tạo', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật khóa đào tạo thành công', 'success');
                dispatch(getSdhKhoaDaoTaoAll());
                done && done();
            }
        });
    };
}

export function deleteSdhKhoaDaoTao(id, done) {
    return dispatch => {
        const url = '/api/sdh/khoa-dao-tao';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật khóa đào tạo', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xóa khóa đào tạo thành công', 'success');
                dispatch(getSdhKhoaDaoTaoAll());
                done && done();
            }
        });
    };
}

export function getSdhKhoaDaoTao(id, done) {
    return () => {
        const url = `/api/sdh/khoa-dao-tao/item/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu khóa đào tạo', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export function getSdhKhoaHocVien(khoaHocVien, done) {
    return () => {
        const url = `/api/sdh/khoa-dao-tao/item-khoa-hoc-vien/${khoaHocVien}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu khóa học viên', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item.namTuyenSinh);
            }
        });
    };
}

export function checkLopSdhByKhoa(idKhoaDaoTao, done) {
    return () => {
        const url = '/api/sdh/khoa-dao-tao/check-lop-hoc-vien';
        T.get(url, { idKhoaDaoTao }, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu lớp học viên', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SdhKhoaDaoTao = {
    ajax: true,
    url: '/api/sdh/khoa-dao-tao/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.id, text: `Khóa: ${item.maKhoa} - Phân hệ: ${item.tenPhanHe}`, data: item })) : [] }),
    fetchOne: (id, done) => (getSdhKhoaDaoTao(id, item => done && done({ id: item.id, text: `Khóa: ${item.maKhoa} - Phân hệ: ${item.tenPhanHe}`, data: item })))(),
};


export const SelectAdapter_SdhKhoaHocVien = {
    ajax: true,
    url: '/api/sdh/khoa-hoc-vien/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item, text: item })) : [] }),
    fetchOne: (id, done) => (getSdhKhoaHocVien(id, item => done && done({ id: item, text: item })))(),
};