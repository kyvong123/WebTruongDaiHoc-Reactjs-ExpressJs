import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmCaHocGetAll = 'DmCaHoc:GetAll';
const DmCaHocGetPage = 'DmCaHoc:GetPage';
const DmCaHocUpdate = 'DmCaHoc:Update';

export default function DmCaHocReducer(state = null, data) {
    switch (data.type) {
        case DmCaHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmCaHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmCaHocUpdate:
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
T.initPage('pageDmCaHoc');
export function getDmCaHocPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDmCaHoc', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/ca-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmCaHocGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getDmCaHocAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmCaHocGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
    };
}

export function getDmCaHocAllCondition(maCoSo, done) {
    const url = '/api/danh-muc/ca-hoc/all-condition';
    T.get(url, { maCoSo }, data => {
        if (data.error) {
            T.notify('Lấy danh sách ca học bị lỗi!', 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            done && done(data.items);
        }
    }, () => T.notify('Lấy danh sách ca học bị lỗi!', 'danger'));
}

export function getDmCaHoc(ten, done) {
    return () => {
        const url = `/api/danh-muc/ca-hoc/item/${ten}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ca học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmCaHoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo ca học bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmCaHocAll());
                T.notify('Tạo mới thông tin ca học thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Tạo ca học bị lỗi!', 'danger'));
    };
}

export function deleteDmCaHoc(_id) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục ca học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getDmCaHocAll());
            }
        }, () => T.notify('Xóa ca học bị lỗi!', 'danger'));
    };
}

export function updateDmCaHoc(_id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ca-hoc';
        T.put(url, { _id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin ca học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ca học thành công!', 'success');
                dispatch(getDmCaHocAll());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin ca học bị lỗi!', 'danger'));
    };
}

export function changeDmCaHoc(item) {
    return { type: DmCaHocUpdate, item };
}

export const SelectAdapter_DmCaHocFilter = (filter) => ({
    ajax: true,
    url: '/api/danh-muc/ca-hoc/filter',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.dataCaHoc ? response.dataCaHoc.map(item => ({ id: parseInt(item.ten), text: `Tiết ${item.ten}: ${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`, item, coSo: item.maCoSo, buoi: item.buoi, thoiGianBatDau: item.thoiGianBatDau, thoiGianKetThuc: item.thoiGianKetThuc })) : [] }),
    fetchOne: (ten, done) => (getDmCaHoc(ten, item => done && done({ id: parseInt(item?.ten), text: item ? `Tiết ${item.ten}: ${item.thoiGianBatDau} - ${item.thoiGianKetThuc}` : '', coSo: item.maCoSo, buoi: item.buoi, thoiGianBatDau: item.thoiGianBatDau, thoiGianKetThuc: item.thoiGianKetThuc })))(),
});

export const SelectAdapter_DmCaHoc = (maCoSo) => ({
    ajax: true,
    url: '/api/danh-muc/ca-hoc/all-condition',
    data: params => ({ searchTerm: params.term, maCoSo }),
    processResults: response => {
        if (!response || response.error) T.notify('Vui lòng chọn cơ sở!', 'danger');
        return { results: response && response.items ? response.items.map(item => ({ id: parseInt(item.ten), text: `Tiết ${item.ten}: ${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`, item })) : [] };
    },
    fetchOne: (ten, done) => (getDmCaHoc(ten, item => done && done({ id: parseInt(item?.ten), text: item ? `Tiết ${item.ten}: ${item.thoiGianBatDau} - ${item.thoiGianKetThuc}` : '', item })))(),
});