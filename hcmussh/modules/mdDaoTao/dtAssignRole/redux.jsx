import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const AssignRoleGetAll = 'AssignRole:GetAll';

export default function dtAssignRoleReducer(state = null, data) {
    switch (data.type) {
        case AssignRoleGetAll:
            return Object.assign({}, state, { items: data.items, listUser: data.listUser });
        default:
            return state;
    }
}

//Admin -----------------------------------------------------------------------------------------------------
export function getAllAssignRole(done) {
    return dispatch => {
        const url = '/api/dt/assign-role/all';
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

export function getDtAssignRole(shccCanBo, done) {
    return () => {
        const url = '/api/dt/assign-role/item';
        T.get(url, { shccCanBo }, data => {
            if (data.error) {
                T.notify('Lấy vai trò bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function createDtAssignRole(data, done) {
    return (dispatch) => {
        const url = '/api/dt/assign-role/item';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message ? result.error.message : 'Gán quyền cán bộ bị lỗi!', 'danger');
                console.error('POST: ', data.error.message);
            } else {
                T.notify('Gán quyền cán bộ thành công!', 'success');
                dispatch(getAllAssignRole());
                done && done(result.item);
            }
        });
    };
}

export function updateDtAssignRole(data, changes, done) {
    return (dispatch) => {
        const url = '/api/dt/assign-role/item';
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

export function deleteDtAssignRole(group, nhomUser, done) {
    return (dispatch) => {
        const url = '/api/dt/assign-role/item';
        T.delete(url, { group, nhomUser }, result => {
            if (result.error) {
                T.notify('Xóa quyền cán bộ bị lỗi!', 'danger');
                console.error('PUT: ', result.error.message);
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
        const url = `/api/dt/assign-role/staff/item/${shcc}`;
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

export const SelectAdapter_DtFwCanBoWithDonVi = (filter) => ({
    ajax: true,
    url: (params) => {
        return `/api/dt/assign-role/staff/page/${params?.page || 1}/20`;
    },
    data: params => ({ condition: params.term, filter }),
    processResults: response => {
        let more = false;
        const page = response && response.page;
        if (page && page.pageTotal > page.pageNumber) {
            more = true;
        }
        return {
            results: page && page.list ? page.list.map(item => ({
                id: item.shcc, text: `${item.shcc}: ${item.tenDonVi ? item.tenDonVi + ' _ ' : ''}${(item.ho + ' ' + item.ten).normalizedName()}`, maPl: item.loaiDonVi, data: item
            })) : [],
            pagination: {
                more
            }
        };
    },
    fetchOne: (shcc, done) => (getStaff(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.shcc}: ${item.tenDonVi ? item.tenDonVi + ' _ ' : ''}${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDauCongTac: item.ngayBatDauCongTac })))(),
});

export function getRolesList(nhomRole, done) {
    const url = '/api/dt/list-assign-role';
    T.get(url, { nhomRole }, data => {
        if (data.error) {
            T.notify('Lấy danh sách quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            done && done(data.items);
        }
    }, error => console.error(`GET: ${url}.`, error));
}