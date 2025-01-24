import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDmLoaiDiemAll = 'SdhDmLoai:GetAll';

export default function SdhDmLoaiDiemReducer(state = null, data) {
    switch (data.type) {
        case SdhDmLoaiDiemAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getSdhDmLoaiDiemAll(done) {
    return dispatch => {
        const url = '/api/sdh/loai-diem/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhDmLoaiDiemAll, items: data.items });
                if (done) done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhDmLoaiDiem(ma, done) {
    return () => {
        const url = `/api/sdh/loai-diem/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại điểm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createSdhDmLoaiDiem(item, done) {
    return dispatch => {
        const url = '/api/sdh/loai-diem';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo loại điểm bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                if (done) done(data.error);
            } else {
                T.notify('Tạo mới thông tin loại điểm thành công!', 'success');
                dispatch(getSdhDmLoaiDiemAll());
                done && done();
            }
        }, () => T.notify('Tạo loại điểm bị lỗi!', 'danger'));
    };
}

export function deleteSdhDmLoaiDiem(ma) {
    return dispatch => {
        const url = '/api/sdh/loai-diem';
        T.delete(url, { ma: ma }, data => {
            if (data.error) {
                T.notify('Xóa loại điểm bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa loại điểm thành công!', 'success', false, 800);
                dispatch(getSdhDmLoaiDiemAll());
            }
        }, () => T.notify('Xóa loại điểm bị lỗi!', 'danger'));
    };
}

export function updateSdhDmLoaiDiem(ma, changes, done) {
    return dispatch => {
        const url = '/api/sdh/loai-diem';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin loại điểm bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại điểm thành công!', 'success');
                dispatch(getSdhDmLoaiDiemAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin loại điểm bị lỗi!', 'danger'));
    };
}

export function getSdhDmLoaiDiemThi(done) {
    return () => {
        const url = '/api/sdh/loai-diem/is-thi';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại điểm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}
export const SelectAdapter_LoaiDiem = {
    ajax: true,
    url: '/api/sdh/loai-diem/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhDmLoaiDiem(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};

