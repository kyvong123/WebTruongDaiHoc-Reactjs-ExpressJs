import T from 'view/js/common';

// Reducer ------------------------------
const DmTinhTrangPhongGetAll = 'DmTinhTrangPhong:GetAll';

export default function DmTinhTrangPhongReducer(state = null, data) {
    switch (data.type) {
        case DmTinhTrangPhongGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getAllDmTinhTrangPhong(done) {
    return dispatch => {
        const url = '/api/dt/tinh-trang-phong/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng phòng', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DmTinhTrangPhongGetAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createDmTinhTrangPhong(data, done) {
    return dispatch => {
        const url = '/api/dt/tinh-trang-phong';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo tình trạng phòng', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllDmTinhTrangPhong());
                done && done(result.item);
            }
        });
    };
}

export function updateDmTinhTrangPhong(ma, data, done) {
    return dispatch => {
        const url = '/api/dt/tinh-trang-phong';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng phòng', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllDmTinhTrangPhong());
                done && done(result.item);
            }
        });
    };
}

export function getDmTinhTrangPhong(ma, done) {
    return () => {
        const url = `/api/dt/tinh-trang-phong/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng phòng', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_TinhTrangPhong = {
    ajax: true,
    url: '/api/dt/tinh-trang-phong/all',
    data: params => ({ searchTerm: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmTinhTrangPhong(ma, item => done && done({ id: item.id, text: item.ten })))(),
};