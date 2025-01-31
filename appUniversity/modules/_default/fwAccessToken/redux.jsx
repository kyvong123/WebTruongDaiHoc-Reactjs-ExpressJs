import T from 'view/js/common';

const AccessTokenGetAll = 'AccessTokenGetAll';

export default function accessTokenReducer(state = {}, data) {
    switch (data.type) {
        case AccessTokenGetAll:
            return Object.assign({}, state, { items: data.items });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllAccessToken() {
    return dispatch => {
        const url = '/api/access-token/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy access token bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: AccessTokenGetAll, items: data.items || [] });
            }
        }, error => console.error(error) || T.notify('Lấy access token bị lỗi!', 'danger'));
    };
}

export function createAccessToken(item, done = () => {}) {
    return dispatch => {
        const url = '/api/access-token';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo access token bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                getAllAccessToken()(dispatch);
                done(data.item);
            }
        }, error => console.error(error) || T.notify('Tạo access token bị lỗi!', 'danger'));
    };
}

export function updateAccessToken(token, changes, done = () => {}) {
    return dispatch => {
        const url = '/api/access-token';
        T.put(url, { token, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật access token bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                getAllAccessToken()(dispatch);
                done(data.item);
            }
        }, error => console.error(error) || T.notify('Cập nhật access token bị lỗi!', 'danger'));
    };
}

export function deleteAccessToken(token, done = () => {}) {
    return dispatch => {
        const url = '/api/access-token';
        T.delete(url, { token }, data => {
            if (data.error) {
                T.notify('Xóa access token bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                getAllAccessToken()(dispatch);
                done();
            }
        }, error => console.error(error) || T.notify('Xóa access token bị lỗi!', 'danger'));
    };
}