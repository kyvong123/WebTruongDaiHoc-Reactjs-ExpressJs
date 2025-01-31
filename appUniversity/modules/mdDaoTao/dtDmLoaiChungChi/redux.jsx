import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmLoaiChungChiGetAll = 'dtDmLoaiChungChi:GetAll';

export default function dtDmLoaiChungChiReducer(state = null, data) {
    switch (data.type) {
        case DtDmLoaiChungChiGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDmLoaiChungChiAll(done) {
    return dispatch => {
        const url = '/api/dt/loai-chung-chi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại chứng chỉ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDmLoaiChungChiGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDmLoaiChungChi');
export function createDtDmLoaiChungChi(item, done) {
    return dispatch => {
        const url = '/api/dt/loai-chung-chi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo loại chứng chỉ bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thông tin loại chứng chỉ thành công!', 'success');
                dispatch(getDtDmLoaiChungChiAll());
                done && done(data.items);
            }
        });
    };
}

export function updateDtDmLoaiChungChi(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/loai-chung-chi';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật loại chứng chỉ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại chứng chỉ thành công!', 'success');
                dispatch(getDtDmLoaiChungChiAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin loại chứng chỉ bị lỗi!', 'danger'));
    };
}

export function getDtDmLoaiChungChi(ma, done) {
    return () => {
        const url = `/api/dt/loai-chung-chi/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại chứng chỉ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_DtDmLoaiChungChi = {
    ajax: true,
    url: '/api/dt/loai-chung-chi',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDmLoaiChungChi(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};