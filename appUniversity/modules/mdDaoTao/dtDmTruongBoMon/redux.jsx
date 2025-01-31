import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmTruongBoMonAll = 'DtDmTruongBoMon:GetAll';

export default function DtDmTruongDonViReducer(state = null, data) {
    switch (data.type) {
        case DtDmTruongBoMonAll:
            return Object.assign({}, state, { items: data.items, dataUser: data.dataUser });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDmTruongBoMonAll(done) {
    return dispatch => {
        const url = '/api/dt/truong-bo-mon/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtDmTruongBoMonAll, items: data.items, dataUser: data.dataUser });
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtDmTruongBoMon(data, done) {
    return dispatch => {
        const url = '/api/dt/truong-bo-mon';
        T.post(url, { data }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Tạo mới nhóm bộ môn bị lỗi!', 'error', false, 1000);
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                dispatch(getDtDmTruongBoMonAll());
                done && done();
            }
        });
    };
}

export function deleteDtDmTruongBoMonAll(shcc, done) {
    return dispatch => {
        const url = '/api/dt/truong-bo-mon/all';
        T.delete(url, { shcc }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Xóa môn của cán bộ bị lỗi!', 'error', false, 1000);
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                dispatch(getDtDmTruongBoMonAll());
                T.alert('Xóa môn của cán bộ thành công', 'success', false, 1000);
                done && done();
            }
        });
    };
}

export function deleteDtDmTruongBoMon(item, done) {
    return dispatch => {
        const url = '/api/dt/truong-bo-mon/item';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Xóa môn của cán bộ bị lỗi!', 'error', false, 1000);
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                dispatch(getDtDmTruongBoMonAll());
                T.alert('Xóa môn của cán bộ thành công', 'success', false, 1000);
                done && done();
            }
        });
    };
}