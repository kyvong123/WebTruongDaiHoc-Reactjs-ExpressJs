import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemDmTinhTrangGetAll = 'DtDiemDmTinhTrang:GetAll';

export default function DtDiemDmTinhTrangReducer(state = null, data) {
    switch (data.type) {
        case DtDiemDmTinhTrangGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getAllDtDiemDmTinhTrang(done) {
    return dispatch => {
        const url = '/api/dt/diem-dm-tinh-trang/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu tình trạng điểm', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtDiemDmTinhTrangGetAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createDtDiemDmTinhTrang(data, done) {
    return dispatch => {
        const url = '/api/dt/diem-dm-tinh-trang';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo tình trạng điểm', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllDtDiemDmTinhTrang());
                done && done(result.item);
            }
        });
    };
}

export function updateDtDiemDmTinhTrang(ma, data, done) {
    return dispatch => {
        const url = '/api/dt/diem-dm-tinh-trang';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật tình trạng điểm', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllDtDiemDmTinhTrang());
                done && done(result.item);
            }
        });
    };
}

export function getDtDiemDmTinhTrang(ma, done) {
    return () => {
        const url = `/api/dt/diem-dm-tinh-trang/item/${ma}`;
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
    url: '/api/dt/diem-dm-tinh-trang/all',
    data: params => ({ searchTerm: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDiemDmTinhTrang(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};