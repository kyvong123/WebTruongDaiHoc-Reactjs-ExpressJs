import T from 'view/js/common';

const SdhTsDmKyLuatAll = 'SdhTsDmKyLuat:GetAll';
export default function SdhTsDmKyLuatReducer(state = null, data) {
    switch (data.type) {
        case SdhTsDmKyLuatAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhTsDmKyLuat(done) {
    return dispatch => {
        const url = '/api/sdh/dm-ky-luat/all';
        T.get(url, result => {
            if (result.error) {
                T.notify(`Lỗi lấy dữ liệu ${result.error.message && (':<br>' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhTsDmKyLuatAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhTsDmKyLuat(data, done) {
    return dispatch => {
        const url = '/api/sdh/dm-ky-luat';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lỗi tạo mới ${result.error.message && (':<br>' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhTsDmKyLuat());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhTsDmKyLuat(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/dm-ky-luat';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify(`Lỗi cập nhật ${result.error.message && (':<br>' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhTsDmKyLuat());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhTsDmKyLuat(ma, done) {
    return dispatch => {
        const url = '/api/sdh/dm-ky-luat';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify(`Lỗi xoá ${result.error.message && (':<br>' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thành công', 'success');
                dispatch(getAllSdhTsDmKyLuat());
                done && done(result.item);
            }
        });
    };
}

export function getSdhTsDmKyLuat(ma, done) {
    return () => {
        const url = `/api/sdh/dm-ky-luat/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify(`Lỗi lấy dữ liệu ${result.error.message && (':<br>' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
