import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmDotTrungTuyenAll = 'DtDmDotTrungTuyen:GetAll';

export default function DtDmDotTrungTuyenReducer(state = null, data) {
    switch (data.type) {
        case DtDmDotTrungTuyenAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDmDotTrungTuyenAll(done) {
    return dispatch => {
        const url = '/api/dt/dot-trung-tuyen/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtDmDotTrungTuyenAll, items: data.items });
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmDotTrungTuyen(item, done) {
    return dispatch => {
        const url = '/api/dt/dot-trung-tuyen';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo đợt trúng tuyển bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới thông tin đợt trúng tuyển thành công!', 'success');
                dispatch(getDtDmDotTrungTuyenAll());
                done && done();
            }
        }, () => T.notify('Tạo đợt trúng tuyển bị lỗi!', 'danger'));
    };
}

export function deleteDtDmDotTrungTuyen(ma) {
    return dispatch => {
        const url = '/api/dt/dot-trung-tuyen';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa đợt trúng tuyển bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đã xóa đợt trúng tuyển thành công!', 'success', false, 800);
                dispatch(getDtDmDotTrungTuyenAll());
            }
        }, () => T.notify('Xóa đợt trúng tuyển bị lỗi!', 'danger'));
    };
}

export function updateDtDmDotTrungTuyen(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/dot-trung-tuyen';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin đợt trúng tuyển bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đợt trúng tuyển thành công!', 'success');
                dispatch(getDtDmDotTrungTuyenAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin đợt trúng tuyển bị lỗi!', 'danger'));
    };
}

export function getItemDtDmDotTrungTuyen(ma, done) {
    return () => {
        const url = `/api/dt/dot-trung-tuyen/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy đợt trúng tuyển', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export const SelectAdapter_DtDmDotTrungTuyen = {
    ajax: true,
    url: '/api/dt/dot-trung-tuyen/all',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten}` })) : [] }),
    fetchOne: (ma, done) => (getItemDtDmDotTrungTuyen(ma, item => item && done && done({ id: item.ma, text: `${item.ten}` })))(),
};

