// Reducer ------------------------------------------------------------------------------------------------------------
const getAll = 'fwParameter:GetAll';

export default function fwParameterReducer(state = null, data) {
    switch (data.type) {
        case getAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllFwParameter(done) {
    return dispatch => {
        const url = '/api/setting/parameter/all';
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

export function createFwParameter(data, done) {
    return dispatch => {
        const url = '/api/setting/parameter';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mục đích bị lỗi', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Tạo mới thành công!', 'success');
                dispatch(getAllFwParameter());
                if (result) done(result);
            }
        }, () => T.notify('Tạo mục đích bị lỗi!', 'danger'));
    };
}

export function deleteFwParameter(bien) {
    return dispatch => {
        const url = '/api/setting/parameter';
        T.delete(url, { bien }, data => {
            if (data.error) {
                T.notify('Xóa bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                dispatch(getAllFwParameter());
            }
        }, () => T.notify('Xóa bị lỗi!', 'danger'));
    };
}

export function updateFwParameter(bien, changes, done) {
    return dispatch => {
        const url = '/api/setting/parameter';
        T.put(url, { bien, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                dispatch(getAllFwParameter());
                done && done();
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

export function getFwParameter(bien, done) {
    return () => {
        const url = '/api/setting/parameter';
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

export const SelectAdapter_fwParameter = ({
    ajax: true,
    url: '/api/setting/parameter/get-list',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ bien: item.bien, text: item.chuThich, ten: item.ten })) : [] }),
    fetchOne: (bien, done) => (getFwParameter(bien, item => done && done({ bien: item.bien, text: item.chuThich })))()
});