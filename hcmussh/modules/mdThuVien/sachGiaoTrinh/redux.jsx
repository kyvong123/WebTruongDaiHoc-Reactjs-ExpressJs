import { userGetStaff } from '../../mdTccb/tccbCanBo/redux';

import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SachGiaoTrinhGetAll = 'SachGiaoTrinh:GetAll';
const SachGiaoTrinhGetPage = 'SachGiaoTrinh:GetPage';
const SachGiaoTrinhGetUserPage = 'SachGiaoTrinh:GetUserPage';
const SachGiaoTrinhGetGroupPage = 'SachGiaoTrinh:GetGroupPage';
const SachGiaoTrinhGetGroupPageMa = 'SachGiaoTrinh:GetGroupPageMa';
const SachGiaoTrinhUpdate = 'SachGiaoTrinh:Update';
const SachGiaoTrinhGet = 'SachGiaoTrinh:Get';

export default function SachGiaoTrinhReducer(state = null, data) {
    switch (data.type) {
        case SachGiaoTrinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case SachGiaoTrinhGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case SachGiaoTrinhGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case SachGiaoTrinhGetPage:
            return Object.assign({}, state, { page: data.page });
        case SachGiaoTrinhGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case SachGiaoTrinhGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case SachGiaoTrinhUpdate:
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
T.initPage('userPageSachGiaoTrinh');
export function getSachGiaoTrinhUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageSachGiaoTrinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tv/user/qua-trinh/sach-giao-trinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách giáo trình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SachGiaoTrinhGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sách giáo trình bị lỗi!', 'danger'));
    };
}

export function updateSachGiaoTrinhUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/tv/user/qua-trinh/sach-giao-trinh';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật sách giáo trình bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật sách giáo trình thành công!', 'success');
                done && done(data.item);
                dispatch(getSachGiaoTrinhUserPage());
            }
        }, () => T.notify('Cập nhật sách giáo trình bị lỗi!', 'danger'));
    };
}

export function createSachGiaoTrinhUserPage(data, done) {
    return dispatch => {
        const url = '/api/tv/user/qua-trinh/sach-giao-trinh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo sách giáo trình bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo sách giáo trình thành công!', 'success');
                    dispatch(getSachGiaoTrinhUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo sách giáo trình bị lỗi!', 'danger'));
    };
}

export function deleteSachGiaoTrinhUserPage(id, done) {
    return dispatch => {
        const url = '/api/tv/user/qua-trinh/sach-giao-trinh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sách giáo trình bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('sách giáo trình đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getSachGiaoTrinhUserPage());
            }
        }, () => T.notify('Xóa sách giáo trình bị lỗi!', 'danger'));
    };
}

T.initPage('pageSachGiaoTrinh');
export function getSachGiaoTrinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSachGiaoTrinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tv/qua-trinh/sach-giao-trinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình sách giáo trình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SachGiaoTrinhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quá trình sách giáo trình bị lỗi!', 'danger'));
    };
}

export function getSachGiaoTrinhGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSachGiaoTrinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tv/qua-trinh/sach-giao-trinh/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình sách giáo trình bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SachGiaoTrinhGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaSachGiaoTrinh');
export function getSachGiaoTrinhGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaSachGiaoTrinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tv/qua-trinh/sach-giao-trinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình sách giáo trình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SachGiaoTrinhGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quá trình sách giáo trình bị lỗi!', 'danger'));
    };
}

export function updateSachGiaoTrinhGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/tv/staff/sach-giao-trinh';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật sách giáo trình bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật sách giáo trình thành công!', 'success');
                done && done(data.item);
                dispatch(getSachGiaoTrinhGroupPageMa());
            }
        }, () => T.notify('Cập nhật sách giáo trình bị lỗi!', 'danger'));
    };
}


export function deleteSachGiaoTrinhGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/tv/staff/sach-giao-trinh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin sách, giáo trình được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getSachGiaoTrinhGroupPageMa());
            }
        }, () => T.notify('Xóa thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}

export function createSachGiaoTrinhGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/tv/staff/sach-giao-trinh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo quá trình sách giáo trình bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo quá trình sách giáo trình thành công!', 'success');
                    dispatch(getSachGiaoTrinhGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo quá trình sách giáo trình bị lỗi!', 'danger'));
    };
}

export function createSachGTStaff(data, done) {
    return dispatch => {
        const url = '/api/tv/staff/sach-giao-trinh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin sách, giáo trình thành công!', 'info');
                dispatch(getSachGiaoTrinhPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}

export function createSachGiaoTrinhMultiple(data, done) {
    return dispatch => {
        const url = '/api/tv/staff/sach-giao-trinh/create-multiple';
        T.post(url, { data }, res => {
            if (res.error.length) {
                T.notify('Thêm thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin sách, giáo trình thành công!', 'info');
                dispatch(getSachGiaoTrinhPage());
                done && done(data);
            }
        }, () => T.notify('Thêm thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}

export function updateSachGTStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/tv/staff/sach-giao-trinh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin sách, giáo trình thành công!', 'info');
                done && done(data.item);
                dispatch(getSachGiaoTrinhPage());
            }
        }, () => T.notify('Cập nhật thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}

export function deleteSachGTStaff(id, done) {
    return dispatch => {
        const url = '/api/tv/staff/sach-giao-trinh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin sách, giáo trình được xóa thành công!', 'info', false, 800);
                done && done(data.item);
                dispatch(getSachGiaoTrinhPage());
            }
        }, () => T.notify('Xóa thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}

export function createSachGTStaffUser(data, done) {
    return dispatch => {
        const url = '/api/tv/user/staff/sach-giao-trinh';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin sách, giáo trình thành công!', 'info');
                done && done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}

export function updateSachGTStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/tv/user/staff/sach-giao-trinh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin sách, giáo trình thành công!', 'info');
                done && done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}

export function deleteSachGTStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/tv/user/staff/sach-giao-trinh';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin sách, giáo trình bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin sách, giáo trình được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin sách, giáo trình bị lỗi', 'danger'));
    };
}