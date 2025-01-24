import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemThanhPhanAll = 'DtDiemThanhPhan:GetAll';

export default function DtDiemThanhPhanReducer(state = null, data) {
    switch (data.type) {
        case DtDiemThanhPhanAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtDiemThanhPhanAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-thanh-phan';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm thành phần bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtDiemThanhPhanAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDiemThanhPhan(semester, data, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-thanh-phan';
        T.post(url, { semester, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới điểm thành phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới điểm thành phần thành công', 'success');
                dispatch(getDtDiemThanhPhanAll(semester, done));
            }
        });
    };
}

export function updateDtDiemThanhPhanItem(id, changes, semester, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-thanh-phan/item';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công điểm thành phần ' + result.item.ma, 'success');
                dispatch(getDtDiemThanhPhanAll(semester));
                done && done();
            }
        }, () => T.notify('Lấy dữ liệu điểm thành phần bị lỗi!', 'danger'));
    };
}

export function deleteDtDiemThanhPhanItem(id, semester, done) {
    return dispatch => {
        const url = '/api/dt/diem-config/diem-thanh-phan/item';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thành công điểm thành phần', 'success');
                dispatch(getDtDiemThanhPhanAll(semester, done));
            }
        }, () => T.notify('Lấy dữ liệu điểm thành phần bị lỗi!', 'danger'));
    };
}

export function getConfigThanhPhanFilter(ma, filter, done) {
    return () => {
        const url = '/api/dt/diem-config/thanh-phan-diem/filter';
        T.get(url, { ma, filter }, result => {
            if (result.error) {
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_ThanhPhanFilter = (filter) => ({
    ajax: true,
    url: '/api/dt/diem-config/thanh-phan-diem/filter',
    data: params => ({ condition: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten, data: item })) : [] }),
    fetchOne: (ma, done) => (getConfigThanhPhanFilter(ma, filter, res => res.items.length && done && done({ id: res.items[0].ma, text: res.items[0].ten })))(),
});
