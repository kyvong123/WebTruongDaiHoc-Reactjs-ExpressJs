import T from 'view/js/common';

const SdhTinhTrangHocPhanAll = 'SdhTinhTrangHocPhan:GetAll';
export default function SdhTinhTrangHocPhanReducer(state = null, data) {
    switch (data.type) {
        case SdhTinhTrangHocPhanAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhTinhTrangHocPhan(done) {
    return dispatch => {
        const url = '/api/sdh/tinh-trang-hoc-phan/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhTinhTrangHocPhanAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhTinhTrangHocPhan(data, done) {
    return dispatch => {
        const url = '/api/sdh/tinh-trang-hoc-phan';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhTinhTrangHocPhan());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhTinhTrangHocPhan(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/tinh-trang-hoc-phan';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhTinhTrangHocPhan());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhTinhTrangHocPhan(ma, done) {
    return dispatch => {
        const url = '/api/sdh/tinh-trang-hoc-phan';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllSdhTinhTrangHocPhan());
                done && done(result.item);
            }
        });
    };
}

export function getSdhTinhTrangHocPhan(ma, done) {
    return () => {
        const url = `/api/sdh/tinh-trang-hoc-phan/item/${ma}`;
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

export const SelectAdapter_SdhTinhTrangHocPhan = {
    ajax: true,
    url: '/api/sdh/tinh-trang-hoc-phan/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhTinhTrangHocPhan(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};