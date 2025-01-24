import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CtsvThanhTichGetAll = 'CtsvThanhTich:GetAll';
const CtsvThanhTichGetPage = 'CtsvThanhTich:GetPage';

export default function ctsvThanhTichReducer(state = null, data) {
    switch (data.type) {
        case CtsvThanhTichGetAll:
            return Object.assign({}, state, { items: data.items });
        case CtsvThanhTichGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export function getAllCtsvThanhTich(done) {
    return dispatch => {
        const url = '/api/ctsv/dm-thanh-tich/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách thành tích bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: CtsvThanhTichGetAll, items: data.items });
                done && done(data.item);
            }
        }, () => T.notify('Lấy danh sách thành tích bị lỗi!', 'danger'));
    };
}

export function getCtsvThanhTich(id, done) {
    return () => {
        const url = '/api/ctsv/dm-thanh-tich/item';
        T.get(url, { id }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy thành tích bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thành tích bị lỗi!', 'danger'));
    };
}

export function createCtsvThanhTich(data, done) {
    return (dispatch) => {
        const url = '/api/ctsv/dm-thanh-tich';
        T.post(url, { data }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo thành tích bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thành tích thành công!', 'success');
                done && done(data.item);
                dispatch(getAllCtsvThanhTich());
            }
        }, () => T.notify('Tạo thành tích bị lỗi!', 'danger'));
    };
}

export function updateCtsvThanhTich(id, changes, done) {
    return (dispatch) => {
        const url = '/api/ctsv/dm-thanh-tich';
        T.put(url, { id, changes }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật thành tích bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thành tích thành công!', 'success');
                done && done(data.item);
                dispatch(getAllCtsvThanhTich());
            }
        }, () => T.notify('Cập nhật thành tích bị lỗi!', 'danger'));
    };
}

export function deleteCtsvThanhTich(id, done) {
    return (dispatch) => {
        const url = '/api/ctsv/dm-thanh-tich';
        T.delete(url, { id }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa thành tích bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa thành tích thành công!', 'success');
                done && done();
                dispatch(getAllCtsvThanhTich());
            }
        }, () => T.notify('Xóa thành tích bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_CtsvDmThanhTich = {
    ajax: true,
    url: '/api/ctsv/dm-thanh-tich/active',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getCtsvThanhTich(id, item => done && done({ id: item.id, text: item.ten })))(),
};