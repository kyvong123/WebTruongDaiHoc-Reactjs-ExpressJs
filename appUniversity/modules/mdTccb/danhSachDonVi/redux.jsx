import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DanhSachDonViGetAll = 'DanhSachDonVi:GetAll';
const DanhSachDonViGetPage = 'DanhSachDonVi:GetPage';
const DanhSachDonViUpdate = 'DanhSachDonVi:Update';
const DanhSachDonViGet = 'DanhSachDonVi:Get';

export default function DanhSachDonViReducer(state = null, data) {
    switch (data.type) {
        case DanhSachDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case DanhSachDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case DanhSachDonViGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case DanhSachDonViUpdate:
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

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDanhSachDonVi');
export function getDanhSachDonViPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageDanhSachDonVi', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/tccb/ds-don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đơn vị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: DanhSachDonViGetPage, page: data.page });
                done && done(data.page);
            }
        },
            () => T.notify('Lấy danh sách đơn vị bị lỗi!', 'danger')
        );
    };
}

export function createDonVi(data, done) {
    return (dispatch) => {
        const url = '/api/tccb/ds-don-vi';
        T.post(url, { data }, (res) => {
            if (res.error) {
                T.notify('Thêm đơn vị bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Thêm thông tin đơn vị thành công!', 'info');
                    dispatch(getDanhSachDonViPage());
                    done && done(data);
                }
            }
        },
            () => T.notify('Thêm đơn vị bị lỗi', 'danger')
        );
    };
}

export function updateDonVi(id, changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/ds-don-vi';
        T.put(url, { id, changes }, (data) => {
            if (data.error) {
                T.notify('Cập nhật thông tin đơn vị bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin đơn vị thành công!', 'info');
                done && done(data.item);
                dispatch(getDanhSachDonViPage());
            }
        },
            () => T.notify('Cập nhật thông tin đơn vị bị lỗi', 'danger')
        );
    };
}

export function deleteDonVi(id, done) {
    return (dispatch) => {
        const url = '/api/tccb/ds-don-vi';
        T.delete(url, { id }, (data) => {
            if (data.error) {
                T.notify('Xóa đơn vị bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Đơn vị được xóa thành công!', 'info', false, 800);
                dispatch(getDanhSachDonViPage());
                done && done(data.item);
            }
        },
            () => T.notify('Xóa đơn vị bị lỗi', 'danger')
        );
    };
}