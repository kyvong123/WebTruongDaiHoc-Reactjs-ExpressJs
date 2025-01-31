import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const RoleGetAll = 'Role:GetAll';
const RoleGetPage = 'Role:GetPage';
const RoleUpdate = 'Role:Update';

export default function roleReducer(state = null, data) {
    switch (data.type) {
        case RoleGetPage:
            return Object.assign({}, state, { page: data.page });
        case RoleGetAll:
            return Object.assign({}, state, { items: data.items });
        case RoleUpdate: {
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
            if (updatedPage.list) {
                for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                    if (updatedPage.list[i].id == updatedItem.id) {
                        updatedPage.list.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return Object.assign({}, state, { items: updatedItems, page: updatedPage });
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'adminRole';
T.initPage(PageName);
export function getRolePage(pageNumber, pageSize, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize);
    return dispatch => {
        const url = `/api/role/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách vai trò bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: RoleGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách video bị lỗi!', 'danger'));
    };
}

export function getRoleAll(done) {
    return dispatch => {
        const url = '/api/role/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách vai trò bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: RoleGetAll, items: data.items });
            }
        }, () => T.notify('Lấy danh sách vai trò bị lỗi!', 'danger'));
    };
}

export function getRole(id, done) {
    return () => {
        const url = `/api/role/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin vai trò bị lỗi!', 'danger' +
                    (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createRole(role, done) {
    return dispatch => {
        const url = '/api/role';
        T.post(url, { role }, data => {
            if (data.error) {
                T.notify('Tạo vai trò bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getRolePage());
                done && done(data);
            }
        }, () => T.notify('Tạo vai trò bị lỗi!', 'danger'));
    };
}

export function updateRole(id, changes, done) {
    if (changes.permission) changes.permission = changes.permission.toString();
    return dispatch => {
        const url = '/api/role';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin vai trò bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin vai trò thành công!', 'success');
                dispatch(getRolePage());
            }
            done && done(data.error);
        }, () => T.notify('Cập nhật thông tin vai trò bị lỗi!', 'danger'));
    };
}

export function deleteRole(id) {
    return dispatch => {
        const url = '/api/role';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa vai trò bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Vai trò được xóa thành công!', 'error', false, 800);
                dispatch(getRolePage());
            }
        }, () => T.notify('Xóa vai trò bị lỗi!', 'danger'));
    };
}

export function changeRole(role) {
    return () => {
        const url = '/api/debug/change-role';
        T.post(url, { roleId: role.id }, data => {
            if (data.error) {
                T.notify('Change debug role error!', 'danger');
            } else {
                T.cookie('debugRole', role.name);
                window.location = '/user';
            }
        }, () => T.notify('Change debug role error!', 'danger'));
    };
}

export const SelectAdapter_Roles = {
    ajax: true,
    url: '/api/role/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.name })) : [] }),
    fetchOne: (id, done) => (getRole(id, item => item && done && done({ id: item.id, text: item.name })))(),
    getOne: getRole,
    processResultOne: response => response && ({ value: response.id, text: response.name }),
};

export function UpdateSessionRole(id, done) {
    return () => {
        T.get(`/api/resfresh-email-role/${id}`, result => {
            if (result.error) {
                T.notify('Có lỗi xảy ra', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật session cho role thành công', 'success');
                done && done();
            }
        });
    };
}