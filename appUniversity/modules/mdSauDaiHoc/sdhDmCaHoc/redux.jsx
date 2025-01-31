import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDmCaHocGetAll = 'SdhDmCaHoc:GetAll';
const SdhDmCaHocGetPage = 'SdhDmCaHoc:GetPage';
const SdhDmCaHocUpdate = 'SdhDmCaHoc:Update';

export default function SdhDmCaHocReducer(state = null, data) {
    switch (data.type) {
        case SdhDmCaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhDmCaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhDmCaHocUpdate:
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
T.initPage('pageSdhDmCaHoc');
export function getSdhDmCaHocPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageSdhDmCaHoc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/sdh/ca-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SdhDmCaHocGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getSdhDmCaHocAll(done) {
    return dispatch => {
        const url = '/api/sdh/ca-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: SdhDmCaHocGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getSdhDmCaHocAllCondition(maCoSo, done) {
    return () => {
        const url = '/api/sdh/ca-hoc/all-condition';
        T.get(url, { maCoSo }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getSdhDmCaHoc(_id, maCoSo, done) {
    return () => {
        const url = '/api/sdh/ca-hoc/item';
        T.get(url, { _id, maCoSo }, data => {
            if (data.error) {
                T.notify('Lấy thông tin ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function createSdhDmCaHoc(item, done) {
    return dispatch => {
        const url = '/api/sdh/ca-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo ca học bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getSdhDmCaHocAll());
                T.notify('Tạo mới thông tin ca học thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Tạo ca học bị lỗi!', 'danger'));
    };
}

export function deleteSdhDmCaHoc(_id) {
    return dispatch => {
        const url = '/api/sdh/ca-hoc';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục ca học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhDmCaHocAll());
            }
        }, () => T.notify('Xóa ca học bị lỗi!', 'danger'));
    };
}

export function updateSdhDmCaHoc(_id, changes, done) {
    return dispatch => {
        const url = '/api/sdh/ca-hoc';
        T.put(url, { _id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin ca học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ca học thành công!', 'success');
                dispatch(getSdhDmCaHocAll());
                done && done(data.items);
            }
        }, () => T.notify('Cập nhật thông tin ca học bị lỗi!', 'danger'));
    };
}

export function changeSdhDmCaHoc(item) {
    return { type: SdhDmCaHocUpdate, item };
}

export const SelectAdapter_DmCaHocSdh = (maCoSo) => {
    return {
        ajax: true,
        url: '/api/sdh/ca-hoc/all-condition',
        data: params => ({ condition: params.term, kichHoat: 1, maCoSo }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ten, text: `Tiết ${item.ten}: ${item.thoiGianBatDau}-${item.thoiGianKetThuc}`, info: item, ten: item.ten, macoSo: item.maCoSo })) : [] }),
        fetchOne: (id, done) => (getSdhDmCaHoc(id, maCoSo, item => item && done && done({ id: item.ten, text: `Tiết ${item.ten}: ${item.thoiGianBatDau}-${item.thoiGianKetThuc}`, info: item, ten: item.ten, macoSo: item.maCoSo })))(),
    };
};