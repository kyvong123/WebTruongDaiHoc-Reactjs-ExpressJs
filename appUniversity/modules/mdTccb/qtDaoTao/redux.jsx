import T from 'view/js/common';
import { getStaffEdit } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtDaoTaoGetAll = 'QtDaoTao:GetAll';
const QtDaoTaoGetPage = 'QtDaoTao:GetPage';
const QtDaoTaoGetStaffPage = 'QtDaoTao:GetStaffPage';
const QtDaoTaoUpdate = 'QtDaoTao:Update';
const QtDaoTaoGet = 'QtDaoTao:Get';
const QtDaoTaoGetGroupPage = 'QtDaoTao:GetGroupPage';

export default function QtDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case QtDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtDaoTaoGetStaffPage:
            return Object.assign({}, state, { staffPage: data.page });
        case QtDaoTaoGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtDaoTaoGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtDaoTaoUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].stt == updatedItem.stt) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].stt == updatedItem.stt) {
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


//Admin Page ---------------------------------------------------------------------------------------------------------
T.initPage('pageQtDaoTao');
export function getQtDaoTaoPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo sản bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: QtDaoTaoGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger'));
    };
}

export function getQtDaoTaoGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/dao-tao/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtDaoTaoGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createQtDaoTao(data, done) {
    const route = T.routeMatcher('/user/tccb/qua-trinh/dao-tao/:shcc'),
        shcc = route.parse(window.location.pathname)?.shcc || null;
    return dispatch => {
        const url = '/api/tccb/qua-trinh/dao-tao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm quá trình đào tạo thành công!', 'success');
                dispatch(getQtDaoTaoPage(undefined, undefined, '', { listShcc: shcc }));
                done(data);
            }
        }, () => T.notify('Thêm quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTao(id, changes, done) {
    const route = T.routeMatcher('/user/tccb/qua-trinh/dao-tao/:shcc'),
        shcc = route.parse(window.location.pathname)?.shcc || null;
    return dispatch => {
        const url = '/api/tccb/qua-trinh/dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật quá trình đào tạo thành công!', 'success');
                dispatch(getQtDaoTaoPage(undefined, undefined, '', { listShcc: shcc }));
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTao(id) {
    const route = T.routeMatcher('/user/tccb/qua-trinh/dao-tao/:shcc'),
        shcc = route.parse(window.location.pathname)?.shcc || null;
    return dispatch => {
        const url = '/api/tccb/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'success', false, 800);
                dispatch(getQtDaoTaoPage(undefined, undefined, '', { listShcc: shcc }));
            }
        }, () => T.notify('Xóa quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function createQtDaoTaoStaff(data, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/dao-tao';
        T.post(url, { data, shcc: data.shcc }, res => {
            if (res.error) {
                T.notify('Thêm quá trình đào tạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm quá trình đào tạo thành công!', 'success');
                dispatch(getStaffEdit(data.shcc));
                done && done(res.item);
            }
        }, () => T.notify('Thêm quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTaoStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/dao-tao';
        T.put(url, { id, changes, shcc: changes.shcc }, data => {
            if (data.error) {
                T.notify('Cập nhật quá trình đào tạo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật quá trình đào tạo thành công!', 'success');
                dispatch(getStaffEdit(changes.shcc));
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật quá trình đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTaoStaff(id, shcc, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/dao-tao';
        T.delete(url, { id, shcc }, data => {
            if (data.error) {
                T.notify('Xóa quá trình đào tạo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin quá trình đào tạo được xóa thành công!', 'success', false, 800);
                dispatch(getStaffEdit(shcc));
                done && done();
            }
        }, () => T.notify('Xóa quá trình đào tạo bị lỗi', 'danger'));
    };
}

//StaffPage----------------------
T.initPage('staffPageQtDaoTao');
export function getQtDaoTaoStaffPage(pageNumber, pageSize, pageCondition, ma, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('staffPageQtDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, ma: ma, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtDaoTaoGetStaffPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quá trình đào tạo bị lỗi!', 'danger'));
    };
}

export function createQtDaoTaoStaffPage(data, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/dao-tao';
        T.post(url, { data, shcc: data.shcc }, data => {
            if (data.error) {
                T.notify('Tạo đào tạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Thêm quá trình đào tạo thành công!', 'success');
                done && done(data);
                dispatch(getQtDaoTaoStaffPage());
            }
        }, () => T.notify('Thêm quá trìnph đào tạo bị lỗi', 'danger'));
    };
}

export function updateQtDaoTaoStaffPage(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/dao-tao';
        T.put(url, { id, changes, shcc: changes.shcc }, data => {
            if (data.error) {
                T.notify('Cập nhật đào tạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật đào tạo thành công!', 'success');
                done && done(data);
                dispatch(getQtDaoTaoStaffPage());
            }
        }, () => T.notify('Cập nhật đào tạo bị lỗi', 'danger'));
    };
}

export function deleteQtDaoTaoStaffPage(id, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá đào tạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Xoá đào tạo thành công!', 'success');
                done && done(data);
                dispatch(getQtDaoTaoStaffPage());
            }
        }, () => T.notify('Xoá đào tạo bị lỗi', 'danger'));
    };
}

export function getItemQtDaoTao(id, done) {
    return () => {
        const url = `/api/tccb/qua-trinh/dao-tao/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy quá trình đào tạo', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}