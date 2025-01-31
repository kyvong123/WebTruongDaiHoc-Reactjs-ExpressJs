// Reducer ------------------------------------------------------------------------------------------------------------
const getAll = 'fwParameterCanBo:GetAll';

export default function fwParameterCanBoReducer(state = null, data) {
    switch (data.type) {
        case getAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllFwParameterCanBo(done) {
    return dispatch => {
        const url = '/api/setting/parameter-can-bo/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy tham số', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: getAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createFwParameterCanBo(data, done) {
    return dispatch => {
        const url = '/api/setting/parameter-can-bo';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mục đích bị lỗi', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Tạo mới thành công!', 'success');
                dispatch(getAllFwParameterCanBo());
                if (result) done(result);
            }
        }, () => T.notify('Tạo mục đích bị lỗi!', 'danger'));
    };
}

export function deleteFwParameterCanBo(bien) {
    return dispatch => {
        const url = '/api/setting/parameter-can-bo';
        T.delete(url, { bien }, data => {
            if (data.error) {
                T.notify('Xóa bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                dispatch(getAllFwParameterCanBo());
            }
        }, () => T.notify('Xóa bị lỗi!', 'danger'));
    };
}

export function updateFwParameterCanBo(bien, changes, done) {
    return dispatch => {
        const url = '/api/setting/parameter-can-bo';
        T.put(url, { bien, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                dispatch(getAllFwParameterCanBo());
                done && done();
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

export function getFwParameterCanBo(bien, done) {
    return () => {
        const url = '/api/setting/parameter-can-bo';
        T.get(url, { bien }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy tham số bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}