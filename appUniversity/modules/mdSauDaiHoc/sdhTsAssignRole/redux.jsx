import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const AssignRoleGetAll = 'AssignRole:GetAll';

export default function sdhTsAssignRoleReducer(state = null, data) {
    switch (data.type) {
        case AssignRoleGetAll:
            return Object.assign({}, state, { items: data.items, listUser: data.listUser });
        default:
            return state;
    }
}
export function getAllAssignRole(done) {
    return dispatch => {
        const url = '/api/sdh/ts/assign-role/all';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy vai trò bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: AssignRoleGetAll, items: data.items, listUser: data.listUser });
                done && done(data.items);
            }
        });
    };
}
export function getRolesList(done) {
    return () => {
        const url = '/api/sdh/ts/list-assign-role';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function createSdhTsAssignRole(nhomUser, data, done) {
    return (dispatch) => {
        const url = '/api/sdh/ts/assign-role/item';
        T.post(url, { nhomUser, data }, result => {
            if (result.error) {
                T.notify('Phân quyền cán bộ bị lỗi!', 'danger');
                console.error('POST: ', result.error.message);
            } else {
                T.notify('Phân quyền cán bộ thành công!', 'success');
                dispatch(getAllAssignRole());
                done && done();
            }
        });
    };
}
export function updateSdhTsAssignRole(data, changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/ts/assign-role/item';
        T.put(url, { data, changes }, result => {
            if (result.error) {
                T.notify('Cập nhật quyền cán bộ bị lỗi!', 'danger');
                console.error('PUT: ', result.error.message);
            } else {
                T.notify('Cập nhật quyền cán bộ thành công!', 'success');
                dispatch(getAllAssignRole());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhTsAssignRole(id, nhomUser, done) {
    return (dispatch) => {
        const url = '/api/sdh/ts/assign-role/item';
        T.delete(url, { id, nhomUser }, result => {
            if (result.error) {
                T.notify('Xóa quyền cán bộ bị lỗi!', 'danger');
                console.error('DELETE: ', result.error.message);
            } else {
                T.notify('Xóa quyền cán bộ thành công!', 'success');
                dispatch(getAllAssignRole());
                done && done();
            }
        });
    };
}
export function getStaff(shcc, done) {
    return () => {
        const url = `/api/sdh/ts/assign-role/staff/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_SdhTsCanBo = {
    ajax: true,
    url: (params) => {
        return `/api/sdh/ts/assign-role/staff/page/${params?.page || 1}/20`;
    },
    data: params => ({ condition: params.term }),
    processResults: response => {
        const page = response && response.page;
        return {
            results: page && page.list ? page.list.map(item => ({
                id: item.shcc, text: `${item.email}: ${(item.ho + ' ' + item.ten).normalizedName()}`
            })) : [],
        };
    },
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.email}:${(item.ho + ' ' + item.ten).normalizedName()}` })))(),
};