import T from 'view/js/common';

const UPDATE_MOBILE_SYSTEM_STATE = 'system:updateMobileSystemState';

export default function mobileSystemReducer(state = null, data) {
    switch (data.type) {
        case UPDATE_MOBILE_SYSTEM_STATE:
            return Object.assign({}, state, data.state);
        default:
            return state;
    }
}

export function getMobileSystemState(done) {
    return dispatch => {
        const url = '/api/mobile/state';
        T.get(url, {}, data => {
            data && dispatch({ type: UPDATE_MOBILE_SYSTEM_STATE, state: data });
            done && done(data);
        }, () => {
            T.notify('Lấy thông tin cấu hình mobile bị lỗi!', 'danger');
            done && done();
        });
    };
}

export function saveMobileSystemState(changes, done) {
    return dispatch => {
        const url = '/api/system/mobile';
        T.put(url, changes, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data);
                T.notify('Lưu thông tin cấu hình mobile thành công!', 'success');
                dispatch({ type: UPDATE_MOBILE_SYSTEM_STATE, state: data });
            }
        }, () => T.notify('Lưu thông tin cấu hình mobile bị lỗi!', 'danger'));
    };
}