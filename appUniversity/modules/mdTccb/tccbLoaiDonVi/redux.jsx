import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const LoaiDonViGetAll = 'LoaiDonVi:GetAll';
const LoaiDonViGetPage = 'LoaiDonVi:GetPage';
const LoaiDonViUpdate = 'LoaiDonVi:Update';
const LoaiDonViGet = 'LoaiDonVi:Get';

export default function LoaiDonViReducer(state = null, data) {
    switch (data.type) {
        case LoaiDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case LoaiDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case LoaiDonViGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case LoaiDonViUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.item),
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

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageLoaiDonVi');
export function getLoaiDonViPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageLoaiDonVi', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/tccb/loai-don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đơn vị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: LoaiDonViGetPage, page: data.page });
                done && done(data.page);
            }
        },
            () => T.notify('Lấy danh sách đơn vị bị lỗi!', 'danger')
        );
    };
}

export function getLoaiDonVi(id, done) {
    return () => {
        const url = `/api/tccb/loai-don-vi/item/${id}`;
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy loại đơn vị bị lỗi', 'danger');
                console.log('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function updateLoaiDonVi(id, changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/loai-don-vi';
        T.put(url, { id, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin đơn vị bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                console.log(data);
                T.notify('Cập nhật thông tin đơn vị thành công!', 'info');
                done && done(data.items);
                dispatch(getLoaiDonViPage());
            }
        },
            () => T.notify('Cập nhật thông tin đơn vị bị lỗi', 'danger')
        );
    };
}

export function createLoaiDonVi(data, done) {
    return (dispatch) => {
        const url = '/api/tccb/loai-don-vi';
        T.post(url, { item: data }, (data) => {
            if (data.error) {
                T.notify('Tạo loại đơn vị bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else if (data.item) {
                console.log(data);
                T.notify('Tạo loại đơn vị thành công!', 'info');
                done && done(data.item);
                dispatch(getLoaiDonViPage());
            }
        },
            () => T.notify('Tạo loại đơn vị bị lỗi', 'danger')
        );
    };
}

export function deleteLoaiDonVi(id, done) {
    return (dispatch) => {
        const url = '/api/tccb/loai-don-vi';
        T.delete(url, { id }, (data) => {
            if (data.error) {
                T.notify('Xóa loại đơn vị bị lỗi', 'danger');
                console.log('GET: ' + url + '. ' + data.error);
            } else {
                dispatch(getLoaiDonViPage());
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_TccbLoaiDonVi = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/tccb/loai-don-vi/all',
    processResults: response => ({
        results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : []
    }),
    fetchOne: (id, done) => (getLoaiDonVi(id, item => done && done({ id: item.id, text: item.ten })))()
};
