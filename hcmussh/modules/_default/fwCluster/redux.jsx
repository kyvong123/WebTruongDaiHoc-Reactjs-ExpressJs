import T from 'view/js/common';

const ClusterGetAll = 'ClusterGetAll';

export default function clusterReducer(state = {}, data) {
    switch (data.type) {
        case ClusterGetAll:
            return Object.assign({}, state, data.state);

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getClusterAll() {
    return dispatch => {
        const url = '/api/cluster/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cluster bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: ClusterGetAll, state: data.services || {} });
            }
        }, error => console.error(error) || T.notify('Lấy cluster bị lỗi!', 'danger'));
    };
}

export function createCluster(serviceName, done) {
    return dispatch => {
        const url = '/api/cluster';
        T.post(url, { serviceName }, data => {
            if (data.error) {
                T.notify('Tạo cluster bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch();
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo cluster bị lỗi!', 'danger'));
    };
}

export function resetCluster(serviceName, id, done) {
    return dispatch => {
        if (id && typeof id == 'function') {
            done = id;
            id = null;
        }

        const url = '/api/cluster';
        T.put(url, { serviceName, id }, data => {
            if (data.error) {
                T.notify('Cập nhật cluster bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật cluster thành công!', 'success');
                done && done();
                dispatch();
            }
        }, error => console.error(error) || T.notify('Cập nhật cluster bị lỗi!', 'danger'));
    };
}

export function deleteCluster(serviceName, id) {
    return dispatch => {
        const url = '/api/cluster';
        T.delete(url, { serviceName, id }, data => {
            if (data.error) {
                T.notify('Xóa cluster bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa cluster thành công!', 'error', false, 800);
                dispatch();
            }
        }, error => console.error(error) || T.notify('Xóa cluster bị lỗi!', 'danger'));
    };
}