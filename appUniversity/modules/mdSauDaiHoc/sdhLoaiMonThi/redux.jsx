import T from 'view/js/common';

const SdhLoaiMonThiAll = 'SdhLoaiMonThi:GetAll';
export default function SdhLoaiMonThiReducer(state = null, data) {
    switch (data.type) {
        case SdhLoaiMonThiAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhLoaiMonThi(done) {
    return dispatch => {
        const url = '/api/sdh/loai-mon-thi/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhLoaiMonThiAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhLoaiMonThi(data, done) {
    return dispatch => {
        const url = '/api/sdh/loai-mon-thi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhLoaiMonThi());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhLoaiMonThi(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/loai-mon-thi';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhLoaiMonThi());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhLoaiMonThi(ma, done) {
    return dispatch => {
        const url = '/api/sdh/loai-mon-thi';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllSdhLoaiMonThi());
                done && done(result.item);
            }
        });
    };
}

export function getSdhLoaiMonThi(ma, done) {
    return () => {
        const url = `/api/sdh/loai-mon-thi/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SdhLoaiMonThi = {
    ajax: true,
    url: '/api/sdh/loai-mon-thi/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.loaiMonThi })) : [] }),
    fetchOne: (ma, done) => (getSdhLoaiMonThi(ma, item => done && done({ id: item.ma, text: item.loaiMonThi })))(),
};