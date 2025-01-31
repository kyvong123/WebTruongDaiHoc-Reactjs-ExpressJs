import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNhomLoaiVanBan = 'DmNhomLoaiVanBan:GetAll';

export default function dmNhomLoaiVanBanReducer(state = null, data) {
    switch (data.type) {
        case DmNhomLoaiVanBan:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------

export function getAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-van-ban/nhom/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm loại văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmNhomLoaiVanBan, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách nhóm loại văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function get(ma, done) {
    return () => {
        const url = '/api/danh-muc/loai-van-ban/nhom/item/' + ma;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nhóm loại văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, (error) => T.notify('Lấy nhóm loại văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}


export function createNhom(data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/danh-muc/loai-van-ban/nhom';
        T.post(url, data, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error(`GET: ${url}`, res.error);
                T.notify('Tạo nhóm lỗi', 'danger');
                onError && onError(res.error);
            } else {
                dispatch(getAll());
                done && done(res.item);
            }
        }, () => T.notify('Tạo nhóm lỗi', 'danger')) || (onFinish && onFinish()) || (onError && onError());
    };
}

export function updateNhom(data, done, onFinish, onError) {
    return () => {
        const url = '/api/danh-muc/loai-van-ban/nhom';
        T.put(url, data, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error(`GET: ${url}`, res.error);
                T.notify('Cập nhật nhóm lỗi', 'danger');
                onError && onError(res.error);
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật nhóm lỗi', 'danger')) || (onFinish && onFinish()) || (onError && onError());
    };
}

export function updateNhomItemOrdinal(itemData, mode, done, onFinish, onError) {
    return () => {
        const url = '/api/danh-muc/loai-van-ban/nhom/item';
        T.put(url, { itemData, mode }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error(`GET: ${url}`, res.error);
                T.notify('Cập nhật nhóm lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                onError && onError(res.error);
            } else {
                done && done();
            }
        }, () => T.notify('Cập nhật nhóm lỗi', 'danger')) || (onFinish && onFinish()) || (onError && onError());
    };
}


export const SelectAdapter_DmNhomLoaiVanBan = {
    ajax: true,
    url: '/api/danh-muc/loai-van-ban/nhom/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.tenNhom })) : [] }),
    fetchOne: (ma, done) => (get(ma, (item) => done && done({ id: item.ma, text: item.tenNhom })))(),
};
