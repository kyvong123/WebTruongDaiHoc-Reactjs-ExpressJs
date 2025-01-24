import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function fwRedisManageReducer(state = null, data) {
    switch (data.type) {
        default:
            return state;
    }
}

export function initDataRedis(key, done) {
    return () => {
        const url = '/api/redis-manage/init';
        T.post(url, { key }, res => {
            if (res.error) {
                T.notify('Init dữ liệu redis bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${res.error}`);
            } else {
                T.notify('Init dữ liệu thành công!', 'success');
                done && done(res.items);
            }
        });
    };
}

export function getDotActive(done) {
    return () => {
        const url = '/api/redis-manage/dot-active';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách đợt đăng ký bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${res.error}`);
            } else {
                done && done(res.items);
            }
        });
    };
}

export function getDataRedis(data, done) {
    return () => {
        const url = '/api/redis-manage/data';
        T.get(url, { data }, res => {
            if (res.error) {
                T.notify('Lấy dữ liệu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${res.error}`);
            } else {
                done && done(res.item);
            }
        });
    };
}