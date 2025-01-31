import T from 'view/js/common';
import { userGetStaff } from '../tccbCanBo/redux';

// Reducer ------------------------------------------------------------------------------------------------------------
const QtKeoDaiCongTacGetAll = 'QtKeoDaiCongTac:GetAll';
const QtKeoDaiCongTacGetPage = 'QtKeoDaiCongTac:GetPage';
const QtKeoDaiCongTacGetUserPage = 'QtKeoDaiCongTac:GetUserPage';
const QtKeoDaiCongTacGetGroupPage = 'QtKeoDaiCongTac:GetGroupPage';
const QtKeoDaiCongTacGetGroupPageMa = 'QtKeoDaiCongTac:GetGroupPageMa';
const QtKeoDaiCongTacUpdate = 'QtKeoDaiCongTac:Update';
const QtKeoDaiCongTacGet = 'QtKeoDaiCongTac:Get';

export default function QtKeoDaiCongTacReducer(state = null, data) {
    switch (data.type) {
        case QtKeoDaiCongTacGetAll:
            return Object.assign({}, state, { items: data.items });
        case QtKeoDaiCongTacGetGroupPage:
            return Object.assign({}, state, { pageGr: data.page });
        case QtKeoDaiCongTacGetGroupPageMa:
            return Object.assign({}, state, { pageMa: data.page });
        case QtKeoDaiCongTacGetPage:
            return Object.assign({}, state, { page: data.page });
        case QtKeoDaiCongTacGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        case QtKeoDaiCongTacGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case QtKeoDaiCongTacUpdate:
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
T.initPage('userPageQtKeoDaiCongTac');
export function getQtKeoDaiCongTacUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('userPageQtKeoDaiCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/user/qua-trinh/keo-dai-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKeoDaiCongTacGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function updateQtKeoDaiCongTacUserPage(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kéo dài công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacUserPage());
            }
        }, () => T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function createQtKeoDaiCongTacUserPage(data, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo kéo dài công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo kéo dài công tác thành công!', 'success');
                    dispatch(getQtKeoDaiCongTacUserPage());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo kéo dài công tác bị lỗi!', 'danger'));
    };
}
export function deleteQtKeoDaiCongTacUserPage(id, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa kéo dài công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('kéo dài công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacUserPage());
            }
        }, () => T.notify('Xóa kéo dài công tác bị lỗi!', 'danger'));
    };
}

T.initPage('pageQtKeoDaiCongTac');
export function getQtKeoDaiCongTacPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtKeoDaiCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/keo-dai-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKeoDaiCongTacGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function getQtKeoDaiCongTacGroupPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageQtKeoDaiCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/keo-dai-cong-tac/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKeoDaiCongTacGetGroupPage, page: data.page });
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('groupPageMaQtKeoDaiCongTac');
export function getQtKeoDaiCongTacGroupPageMa(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('groupPageMaQtKeoDaiCongTac', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/qua-trinh/keo-dai-cong-tac/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QtKeoDaiCongTacGetGroupPageMa, page: data.page });
            }
        }, () => T.notify('Lấy danh sách kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function updateQtKeoDaiCongTacGroupPageMa(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kéo dài công tác thành công!', 'success');
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacGroupPageMa());
            }
        }, () => T.notify('Cập nhật kéo dài công tác bị lỗi!', 'danger'));
    };
}

export function createQtKeoDaiCongTacGroupPageMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo kéo dài công tác bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                if (done) {
                    T.notify('Tạo kéo dài công tác thành công!', 'success');
                    dispatch(getQtKeoDaiCongTacGroupPageMa());
                    done && done(data);
                }
            }
        }, () => T.notify('Tạo kéo dài công tác bị lỗi!', 'danger'));
    };
}
export function deleteQtKeoDaiCongTacGroupPageMa(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa kéo dài công tác bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('kéo dài công tác đã xóa thành công!', 'success', false, 800);
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacGroupPageMa());
            }
        }, () => T.notify('Xóa kéo dài công tác bị lỗi!', 'danger'));
    };
}
export function createQtKeoDaiCongTacStaff(data, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Thêm thông tin kéo dài công tác thành công!', 'info');
                    done(data);
                    dispatch(getQtKeoDaiCongTacPage());
                }
            }
        }, () => T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function updateQtKeoDaiCongTacStaff(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin kéo dài công tác thành công!', 'info');
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacPage());
            }
        }, () => T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function deleteQtKeoDaiCongTacStaff(id, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin kéo dài công tác được xóa thành công!', 'info');
                done && done(data.item);
                dispatch(getQtKeoDaiCongTacPage());
            }
        }, () => T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function createQtKeoDaiCongTacStaffUser(data, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/keo-dai-cong-tac';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm thông tin kéo dài công tác thành công!', 'info');
                done && done(res);
                dispatch(userGetStaff(data.email));
            }
        }, () => T.notify('Thêm thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function updateQtKeoDaiCongTacStaffUser(id, changes, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/keo-dai-cong-tac';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin kéo dài công tác thành công!', 'info');
                done && done();
                dispatch(userGetStaff(changes.email));
            }
        }, () => T.notify('Cập nhật thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function deleteQtKeoDaiCongTacStaffUser(id, email, done) {
    return dispatch => {
        const url = '/api/tccb/user/qua-trinh/keo-dai-cong-tac';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin kéo dài công tác được xóa thành công!', 'info', false, 800);
                done && done();
                dispatch(userGetStaff(email));
            }
        }, () => T.notify('Xóa thông tin kéo dài công tác bị lỗi', 'danger'));
    };
}

export function getListInYear(year, done) {
    return () => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac/get-list-year';
        T.get(url, { year }, data => {
            if (data.error) {
                T.notify('Lấy danh sách dự kiến kéo dài công tác bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách dự kiến kéo dài công tác bị lỗi', 'danger'));
    };
}

export function createMultiQtKeoDaiCongTac(listData, done) {
    return () => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac/multiple';
        T.post(url, { listData }, data => {
            if (data.error && data.error.length) {
                T.notify('Cập nhật dữ liệu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error('PUT: ' + url + '. ' + data.error.toString());
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu bị lỗi!', 'danger'));
    };
}

export function getListItem(pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    return () => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac/download-excel-all';
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kéo dài công tác bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, (error) => T.notify('Lấy danh sách kéo dài công tác bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateMultipleQuyetDinh(items, done) {
    return dispatch => {
        const url = '/api/tccb/qua-trinh/keo-dai-cong-tac/update-quyet-dinh';
        T.put(url, { items }, res => {
            if (res.error.length > 0) {
                T.notify('Cập nhật quyết định kéo dài công tác bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + res.error);
            } else {
                if (done) {
                    T.notify('Cập nhật quyết định kéo dài công tác thành công!', 'info');
                    dispatch(getQtKeoDaiCongTacPage());
                    done && done(items);
                }
            }
        }, () => T.notify('Cập nhật quyết định kéo dài công tác bị lỗi', 'danger'));
    };
}