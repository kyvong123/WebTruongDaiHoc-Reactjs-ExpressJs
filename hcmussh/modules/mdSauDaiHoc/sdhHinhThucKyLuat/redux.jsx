import T from 'view/js/common';

const SdhKyLuatAll = 'SdhKyLuat:GetAll';
export default function SdhKyLuatReducer(state = null, data) {
    switch (data.type) {
        case SdhKyLuatAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhKyLuat(done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-ky-luat/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu hình thức kỷ luật', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhKyLuatAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhKyLuat(data, done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-ky-luat';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo hình thức kỷ luật', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhKyLuat());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhKyLuat(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-ky-luat';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật hình thức kỷ luật', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhKyLuat());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhKyLuat(ma, done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-ky-luat';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật hình thức kỷ luật', 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllSdhKyLuat());
                done && done(result.item);
            }
        });
    };
}

export function getSdhKyLuat(ma, done) {
    return () => {
        const url = `/api/sdh/hinh-thuc-ky-luat/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu hình thức kỷ luật', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SdhKyLuat = {
    ajax: true,
    url: '/api/sdh/hinh-thuc-ky-luat/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhKyLuat(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};