import T from 'view/js/common';
// export const PageName = 'HAA';
// T.initPage(PageName);


const TccbPhanQuyenGetAll = 'TccbPhanQuyen:GetAll';
export default function tccbPhanQuyenReducer(state = null, data) {
    switch (data.type) {
        case TccbPhanQuyenGetAll:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

export function getAllTccbAssignRole(done) {
    return dispatch => {
        const url = '/api/tccb/phan-quyen/get-all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách phân quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: TccbPhanQuyenGetAll, item: data.item });
            }
        }, (error) => T.notify('Lấy danh sách phân quyền bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getAllTccbRoleList(done) {
    return () => {
        const url = '/api/tccb/phan-quyen/role/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, (error) => T.notify('Lấy danh sách quyền bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTccbRoleList(role, done) {
    return () => {
        const url = '/api/tccb/phan-quyen/role/item';
        T.get(url, { role }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.role);
            }
        }, (error) => T.notify('Lấy danh sách quyền bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createTccbAssignRole(data, done) {
    return dispatch => {
        const url = '/api/tccb/phan-quyen/assign';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo phân quyền cho cán bộ bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.item);
                dispatch(getAllTccbAssignRole());
            }
        }, (error) => T.notify('Tạo phân quyền cho cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTccbAssignRole(data, done) {
    return dispatch => {
        const url = '/api/tccb/phan-quyen/delete';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Xóa phân quyền cho cán bộ bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.item);
                dispatch(getAllTccbAssignRole());
            }
        }, (error) => T.notify('Xóa phân quyền cho cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTccbAssignRole(id, data, done) {
    return dispatch => {
        const url = '/api/tccb/phan-quyen/assign';
        T.put(url, { id, data }, res => {
            if (res.error) {
                T.notify('Cập nhật phân quyền cho cán bộ bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.item);
                dispatch(getAllTccbAssignRole());
            }
        }, (error) => T.notify('Cập nhật phân quyền cho cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_TccbRoleList = {
    ajax: true,
    url: '/api/tccb/phan-quyen/role/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.listRole ? response.listRole.map(item => ({ id: item.role, text: item.tenRole })) : [] }),
    fetchOne: (role, done) => (getTccbRoleList(role, item => done && done({ id: item.role, text: item.tenRole })))(),
};
