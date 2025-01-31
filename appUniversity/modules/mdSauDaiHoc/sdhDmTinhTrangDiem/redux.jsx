import T from 'view/js/common';

// Reducer ------------------------------
const SdhDmTinhTrangDiemAll = 'SdhDmTinhTrangDiem:GetAll';

export default function SdhDmTinhTrangDiemReducer(state = null, data) {
    switch (data.type) {
        case SdhDmTinhTrangDiemAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getAllSdhDmTinhTrangDiem(done) {
    return dispatch => {
        const url = '/api/sdh/dm-tinh-trang-diem/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng điểm', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhDmTinhTrangDiemAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhDmTinhTrangDiem(data, done) {
    return dispatch => {
        const url = '/api/sdh/dm-tinh-trang-diem';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo tình trạng điểm', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhDmTinhTrangDiem());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhDmTinhTrangDiem(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/dm-tinh-trang-diem';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng điểm', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhDmTinhTrangDiem());
                done && done(result.item);
            }
        });
    };
}

export function getSdhDmTinhTrangDiem(ma, done) {
    return () => {
        const url = `/api/sdh/dm-tinh-trang-diem/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng điểm', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_DiemDmTinhTrang = {
    ajax: true,
    url: '/api/sdh/dm-tinh-trang-diem/all',
    data: params => ({ searchTerm: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhDmTinhTrangDiem(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};