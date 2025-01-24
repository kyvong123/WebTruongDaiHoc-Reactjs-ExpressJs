import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const GiangVienHdGetAll = 'GiangVienHd:GetAll';
const GiangVienHdGetPage = 'GiangVienHd:GetPage';
const GiangVienHdGet = 'GiangVienHd:Get';
const GiangVienHdUpdate = 'GiangVienHd:Update';
const UserGetGiangVienHd = 'GiangVienHd:UserGet';

export default function giangVienHdReducer(state = null, data) {
    switch (data.type) {
        case GiangVienHdGetAll:
            return Object.assign({}, state, { items: data.items });
        case GiangVienHdGetPage:
            return Object.assign({}, state, { page: data.page });
        case GiangVienHdGet:
            return Object.assign({}, state, { dataGiangVienHd: data.item });
        case GiangVienHdUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].shcc == updatedItem.shcc) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].shcc == updatedItem.shcc) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        case UserGetGiangVienHd:
            return Object.assign({}, state, { userItem: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'giangVienHdPage';
T.initPage(PageName);
export function getGiangVienHdPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/giang-vien-huong-dan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giảng viên bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: GiangVienHdGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách giảng viên bị lỗi', 'danger'));
    };
}

export function getGiangVienHd(shcc, done) {
    return () => {
        const url = `/api/sdh/giang-vien-huong-dan/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giảng viên hướng dẫn bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDeTaiGiangVienHd(shcc, done) {
    return () => {
        const url = `/api/sdh/giang-vien-huong-dan/de-tai/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đề tài hướng dẫn bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getGiangVienHdAll(done) {
    return dispatch => {
        const url = '/api/sdh/giang-vien-huong-dan/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách giảng viên hướng dẫn bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: GiangVienHdGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách giảng viên hướng dẫn bị lỗi!', 'danger'));
    };
}

export function getGiangVienHdEdit(shcc, done) {
    return dispatch => {
        let condition = {};
        if (typeof shcc == 'object') condition = shcc;
        else condition = { shcc };
        const url = '/api/sdh/giang-vien-huong-dan/edit/item';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông tin giảng viên hướng dẫn bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: GiangVienHdGet, item: data.item });
                if (done) done(data);
            }
        }, () => T.notify('Lấy thông tin giảng viên hướng dẫn bị lỗi', 'danger'));
    };
}

export function createGiangVienHd(canBo, done) {
    return () => {
        const url = '/api/sdh/giang-vien-huong-dan';
        T.post(url, { canBo }, data => {
            if (data.error) {
                T.notify('Tạo mới một giảng viên hướng dẫn bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một giảng viên hướng dẫn thành công!', 'success');
                if (done) done(data);
            }
        }, () => T.notify('Tạo mới một giảng viên hướng dẫn bị lỗi', 'danger'));
    };
}

export function updateGiangVienHd(shcc, changes, done) {
    return dispatch => {
        const url = '/api/sdh/giang-vien-huong-dan';
        T.put(url, { shcc, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu giảng viên hướng dẫn bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin giảng viên hướng dẫn thành công!', 'success');
                dispatch(getGiangVienHdEdit(data.item.shcc));
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu giảng viên hướng dẫn bị lỗi', 'danger'));
    };
}

export function deleteGiangVienHd(shcc, done) {
    return dispatch => {
        const url = '/api/sdh/giang-vien-huong-dan';
        T.delete(url, { shcc }, data => {
            if (data.error) {
                T.notify('Xóa giảng viên hướng dẫn bị lỗi', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa giảng viên hướng dẫn thành công!', 'success', false, 800);
                dispatch(getGiangVienHdPage());
            }
            done && done();
        }, () => T.notify('Xóa giảng viên hướng dẫn bị lỗi', 'danger'));
    };
}
