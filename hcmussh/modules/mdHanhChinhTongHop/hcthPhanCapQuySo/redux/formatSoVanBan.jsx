import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthFormatSoVanBanGetAll = 'HcthFormatSoVanBan:GetAll';

export default function hcthFormatSoVanBan(state = null, data) {
    switch (data.type) {
        case HcthFormatSoVanBanGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
// T.initPage('hcthPhanCapFormatSoVanBanGetPage', true);

export function getAllFormatSoVanBan(done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/so-van-ban/format/all';
        T.get(url,
            (res) => {
                onFinish && onFinish();
                if (res.error) {
                    console.error('GET:', url, res.error);
                    T.notify('Lấy danh sách định dạng lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                    onError && onError();
                } else {
                    dispatch({ type: HcthFormatSoVanBanGetAll, items: res.items });
                    done && done(res.items);
                }
            },
            () => {
                onFinish && onFinish();
                onError && onError();
                T.notify('Lấy danh sách định dạng lỗi. ', 'danger');
            });
    };
}

export function createFormatSoVanBan(data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/so-van-ban/format';
        T.post(url, { data },
            (res) => {
                onFinish && onFinish();
                if (res.error) {
                    console.error('POST:', url, res.error);
                    T.notify('Áp dụng thông tin định dạng lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                    onError && onError();
                } else {
                    T.notify('Tạo thông tin định dạng thành công. ', 'success');
                    dispatch(getAllFormatSoVanBan());
                    done && done();
                }
            },
            () => {
                onFinish && onFinish();
                onError && onError();
                T.notify('Áp dụng thông tin định dạng lỗi. ', 'danger');
            });
    };
}

export function updateFormatSoVanBan(id, changes, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/so-van-ban/format';
        T.put(url, { id, changes },
            (res) => {
                onFinish && onFinish();
                if (res.error) {
                    console.error('PUT:', url, res.error);
                    T.notify('Áp dụng thông tin định dạng lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                    onError && onError();
                } else {
                    T.notify('Tạo thông tin định dạng thành công. ', 'success');
                    dispatch(getAllFormatSoVanBan());
                    done && done();
                }
            },
            () => {
                onFinish && onFinish();
                onError && onError();
                T.notify('Áp dụng thông tin định dạng lỗi. ', 'danger');
            });
    };
}




