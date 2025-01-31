import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DrlRoleGetAll = 'DrlRole:GetAll';

export default function tccbDrlRoleReducer(state = null, data) {
    switch (data.type) {
        case DrlRoleGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

//Admin -----------------------------------------------------------------------------------------------------
export function getAllTccbDrlRole(filter, done) {
    return dispatch => {
        const url = '/api/tccb/drl-role/all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy vai trò bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: DrlRoleGetAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}

export function getTccbDrlRole(emailCanBo, done) {
    return () => {
        const url = '/api/tccb/drl-role/item';
        T.get(url, { emailCanBo }, data => {
            if (data.error) {
                T.notify('Lấy vai trò bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function createDrlRole(data, done) {
    return (dispatch) => {
        const url = '/api/tccb/drl-role/item';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Gán quyền cán bộ bị lỗi!', 'danger');
                console.error('PUT: ', data.error.message);
            } else {
                if (data.item.overwrite) {
                    T.notify('Quyền cán bộ được ghi đè!', 'warning');
                } else T.notify('Gán quyền cán bộ thành công!', 'success');
                dispatch(getAllTccbDrlRole());
                done && done(data.item);
            }
        });
    };
}

export function updateDrlRole(emailCanBo, changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/drl-role/item';
        T.put(url, { emailCanBo, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật quyền cán bộ bị lỗi!', 'danger');
                console.error('PUT: ', data.error.message);
            } else {
                T.notify('Cập nhật quyền cán bộ thành công!', 'success');
                dispatch(getAllTccbDrlRole());
                done && done(data.item);
            }
        });
    };
}

export function deleteDrlRole(emailCanBo, done) {
    return (dispatch) => {
        const url = '/api/tccb/drl-role/item';
        T.delete(url, { emailCanBo }, data => {
            if (data.error) {
                T.notify('Xóa quyền cán bộ bị lỗi!', 'danger');
                console.error('PUT: ', data.error.message);
            } else {
                T.notify('Xóa quyền cán bộ thành công!', 'success');
                dispatch(getAllTccbDrlRole());
                done && done();
            }
        });
    };
}