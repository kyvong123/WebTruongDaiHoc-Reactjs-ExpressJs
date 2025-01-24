import T from 'view/js/common.js';

const ctsvSinhHoatCongDanGetAll = 'ctsvSinhHoatCongDanGetAll';
const ctsvSinhHoatCongDanGet = 'ctsvSinhHoatCongDan:Get';
const ctsvSinhHoatCongDanGetData = 'ctsvSinhHoatCongDan:GetData';

export default function CtsvSinhHoatCongDanReducer(state = null, data) {
    switch (data.type) {
        case ctsvSinhHoatCongDanGetAll:
            return Object.assign({}, state, { items: data.items });
        case ctsvSinhHoatCongDanGet:
            return Object.assign({}, state, { item: data.item });
        case ctsvSinhHoatCongDanGetData:
            return Object.assign({}, state, { item: data.item, listNoiDung: data.listNoiDung, listEvent: data.listEvent, listGuest: data.listGuest, listAssignRole: data.listAssignRole });
        default:
            return state;
    }
}

export function getAllCtsvShcd(done) {
    return dispatch => {
        const url = '/api/ctsv/shcd/all';
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu SHCD bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: ctsvSinhHoatCongDanGetAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}

export function getCtsvShcd(id, done) {
    return dispatch => {
        const url = '/api/ctsv/shcd/item';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu SHCD bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: ctsvSinhHoatCongDanGet, item: data.item });
                done && done(data.items);
            }
        });
    };
}

export function getDataCtsvShcd(id, done) {
    return dispatch => {
        const url = '/api/ctsv/shcd/item/data';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu SHCD bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: ctsvSinhHoatCongDanGetData, item: data.item, listNoiDung: data.listNoiDung, listEvent: data.listEvent, listGuest: data.listGuest, listAssignRole: data.listAssignRole });
                done && done(data.item);
            }
        });
    };
}

export function createCtsvShcd(data, done) {
    return (dispatch) => {
        const url = '/api/ctsv/shcd';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo dữ liệu SHCD bị lỗi', 'danger');
                console.error('POST: ', data.error);
            } else {
                T.notify('Tạo dữ liệu SHCD thành công', 'success');
                dispatch(getAllCtsvShcd());
                done && done(data.item);
            }
        });
    };
}

export function updateCtsvShcd(id, changes, done) {
    return (dispatch) => {
        const url = '/api/ctsv/shcd';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật dữ liệu SHCD bị lỗi', 'danger');
                console.error('PUT: ', data.error);
            } else {
                T.notify('Cập nhật dữ liệu SHCD thành công', 'success');
                dispatch(getAllCtsvShcd());
                done && done(data.item);
            }
        });
    };
}

export function deleteCtsvShcd(id, done) {
    return (dispatch) => {
        const url = '/api/ctsv/shcd';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa dữ liệu SHCD bị lỗi', 'danger');
                console.error('DELETE: ', data.error);
            } else {
                T.notify('Xóa dữ liệu SHCD thành công', 'success');
                dispatch(getAllCtsvShcd());
                done && done();
            }
        });
    };
}

export function downloadExcelCtsvShcd(shcdId, done) {
    T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
    return () => {
        const url = '/api/ctsv/shcd/download-excel';
        T.get(url, { shcdId }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Tải về thất bại!', 'warning', false, 2000);
                console.error('GET: ', data.error);
            } else {
                T.alert('Tải về thành công!', 'success', false, 2000);
                T.FileSaver(new Blob([new Uint8Array(data.buffer.data)]), data.filename);
                done && done();
            }
        });
    };
}