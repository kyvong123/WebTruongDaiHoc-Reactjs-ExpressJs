import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const GetSvChungChi = 'svChungChi:getData';
export default function svChungChiReducer(state = null, data) {
    switch (data.type) {
        case GetSvChungChi:
            return Object.assign({}, { dataChungChi: data.dataChungChi });
        default:
            return state;
    }
}


// ACTIONS -------------------------------------------------
export function svChungChiCreate(data, done) {
    return dispatch => {
        const url = '/api/sv/chung-chi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
                dispatch(getSvChungChi());
            }
        }, () => () => T.notify('Đăng ký chứng chỉ bị lỗi!', 'danger'));
    };
}

export function svChungChiDelete(data, done) {
    return dispatch => {
        const url = '/api/sv/chung-chi';
        T.delete(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
                dispatch(getSvChungChi());
                T.notify('Hủy đăng ký chứng chỉ thành công!', 'success');
            }
        });
    };
}

export function getSvChungChi(done) {
    return dispatch => {
        const url = '/api/sv/chung-chi';
        T.get(url, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
                dispatch({ type: GetSvChungChi, dataChungChi: result.dataChungChi });
            }
        }, () => () => T.notify('Đăng ký chứng chỉ bị lỗi!', 'danger'));
    };
}
