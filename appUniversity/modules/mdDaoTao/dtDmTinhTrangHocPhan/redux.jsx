import T from 'view/js/common';

const DtDmHocPhanAll = 'DtDmHocPhan:GetAll';
export default function DtDmHocPhanReducer(state = null, data) {
    switch (data.type) {
        case DtDmHocPhanAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getAllDtDmTinhTrangHocPhan(done) {
    return dispatch => {
        const url = '/api/dt/dm-tinh-trang-hoc-phan/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtDmHocPhanAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createDtDmTinhTrangHocPhan(data, done) {
    return dispatch => {
        const url = '/api/dt/dm-tinh-trang-hoc-phan';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllDtDmTinhTrangHocPhan());
                done && done(result.item);
            }
        });
    };
}

export function updateDtDmTinhTrangHocPhan(ma, data, done) {
    return dispatch => {
        const url = '/api/dt/dm-tinh-trang-hoc-phan';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllDtDmTinhTrangHocPhan());
                done && done(result.item);
            }
        });
    };
}

export function deleteDtDmTinhTrangHocPhan(ma, done) {
    return dispatch => {
        const url = '/api/dt/dm-tinh-trang-hoc-phan';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng học phần', 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllDtDmTinhTrangHocPhan());
                done && done(result.item);
            }
        });
    };
}

export function getDtDmTinhTrangHocPhan(ma, done) {
    return () => {
        const url = `/api/dt/dm-tinh-trang-hoc-phan/item/${ma}`;
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

export const SelectAdapter_DtDmTinhTrangHocPhan = {
    ajax: true,
    url: '/api/dt/dm-tinh-trang-hoc-phan/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDmTinhTrangHocPhan(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};