import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMucDichTrongNuocGetAll = 'DmMucDichTrongNuoc:GetAll';
const DmMucDichTrongNuocGetPage = 'DmMucDichTrongNuoc:GetPage';
const DmMucDichTrongNuocUpdate = 'DmMucDichTrongNuoc:Update';

export default function DmMucDichTrongNuocReducer(state = null, data) {
    switch (data.type) {
        case DmMucDichTrongNuocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmMucDichTrongNuocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMucDichTrongNuocUpdate:
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
T.initPage('pageDmMucDichTrongNuoc');
export function getDmMucDichTrongNuocPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmMucDichTrongNuoc', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/muc-dich-trong-nuoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách mục đích đi công tác trong nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmMucDichTrongNuocGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách mục đích đi công tác trong nước bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmMucDichTrongNuocAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/muc-dich-trong-nuoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách mục đích đi công tác trong nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmMucDichTrongNuocGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách mục đích đi công tác trong nước bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmMucDichTrongNuoc(ma, done) {
    return () => {
        const url = `/api/danh-muc/muc-dich-trong-nuoc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin mục đích đi công tác trong nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmMucDichTrongNuoc(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/muc-dich-trong-nuoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo mục đích đi công tác trong nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mục đích đi công tác trong nướcthành công!', 'success');
                dispatch(getDmMucDichTrongNuocPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mục đích đi công tác trong nước bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmMucDichTrongNuoc(ma) {
    return dispatch => {
        const url = '/api/danh-muc/muc-dich-trong-nuoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục mục đích đi công tác trong nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmMucDichTrongNuocPage());
            }
        }, (error) => T.notify('Xóa mục đích đi công tác trong nước bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmMucDichTrongNuoc(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/muc-dich-trong-nuoc';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin mục đích đi công tác trong nước bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin mục đích đi công tác trong nước thành công!', 'success');
                done && done(data.item);
                dispatch(getDmMucDichTrongNuocPage());
            }
        }, (error) => T.notify('Cập nhật thông tin mục đích đi công tác trong nước bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function changeDmMucDichTrongNuoc(item) {
    return { type: DmMucDichTrongNuocUpdate, item };
}

export const SelectAdapter_DmMucDichTrongNuoc = {
    ajax: true,
    url: '/api/danh-muc/muc-dich-trong-nuoc/page/1/20',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.moTa })) : [] }),
    fetchOne: (ma, done) => (getDmMucDichTrongNuoc(ma, item => item && done && done({ id: item.ma, text: item.moTa })))(),
    getOne: getDmMucDichTrongNuoc,
    processResultOne: response => response && ({ value: response.ma, text: `${response.ma}: ${response.moTa}` }),
};