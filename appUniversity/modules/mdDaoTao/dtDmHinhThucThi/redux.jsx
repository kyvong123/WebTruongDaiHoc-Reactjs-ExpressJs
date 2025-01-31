import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmHinhThucThiGetAll = 'DtDmHinhThucThi:GetAll';
export default function DtDmHinhThucThiReducer(state = null, data) {
    switch (data.type) {
        case DtDmHinhThucThiGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDmHinhThucThiAll(done) {
    return dispatch => {
        const url = '/api/dt/hinh-thuc-thi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtDmHinhThucThiGetAll, items: data.items });
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmHinhThucThi(item, done) {
    return dispatch => {
        const url = '/api/dt/hinh-thuc-thi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo hình thức thi bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới thông tin hình thức thi thành công!', 'success');
                dispatch(getDtDmHinhThucThiAll());
                done && done();
            }
        }, () => T.notify('Tạo hình thức thi bị lỗi!', 'danger'));
    };
}

export function deleteDtDmHinhThucThi(ma) {
    return dispatch => {
        const url = '/api/dt/hinh-thuc-thi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hình thức thi bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa hình thức thi thành công!', 'success', false, 800);
                dispatch(getDtDmHinhThucThiAll());
            }
        }, () => T.notify('Xóa hình thức thi bị lỗi!', 'danger'));
    };
}

export function updateDtDmHinhThucThi(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/hinh-thuc-thi';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin hình thức thi bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin hình thức thi thành công!', 'success');
                dispatch(getDtDmHinhThucThiAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin hình thức thi bị lỗi!', 'danger'));
    };
}

export function getItemDtDmHinhThucThi(ma, done) {
    return () => {
        const url = `/api/dt/hinh-thuc-thi/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy hình thức thi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export const SelectAdapter_DtDmHinhThucThi = {
    ajax: true,
    url: '/api/dt/hinh-thuc-thi/all',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten}` })) : [] }),
    fetchOne: (ma, done) => (getItemDtDmHinhThucThi(ma, item => item && done && done({ id: item.ma, text: `${item.ten}` })))(),
};

