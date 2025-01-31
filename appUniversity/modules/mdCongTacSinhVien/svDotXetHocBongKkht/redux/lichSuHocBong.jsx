const SvLichSuDssvHbkkGetAll = 'SvLichSuDssvHbkk:GetAll';

export default function svDotXetHocBongKkhtReducer(state = null, data) {
    switch (data.type) {
        case SvLichSuDssvHbkkGetAll: {
            return Object.assign({}, state, { lichSuDsHocBong: data.lichSuDsHocBong });
        }
        default:
            return state;
    }
}

export function createLichSuDssvHbkk(idDieuKien, data, done) {
    return (dispatch) => {
        const url = '/api/ctsv/lich-su-hbkk/dssv';
        T.post(url, { idDieuKien, data }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Lưu danh sách bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Lưu danh sách thành công!', 'success');
                dispatch(getAllLichSuDssvHbkk(idDieuKien));
                done && done();
            }
        });
    };
}

export function getAllLichSuDssvHbkk(id, done) {
    return (dispatch) => {
        const url = '/api/ctsv/lich-su-hbkk';
        T.get(url, { id }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Lấy danh sách bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvLichSuDssvHbkkGetAll, lichSuDsHocBong: data.items });
                done && done(data.items);
            }
        });
    };
}


export function getLichSuHbkkDssv(id, filter, listIdQuery, done) {
    return () => {
        const url = '/api/ctsv/lich-su-hbkk/dssv';
        T.get(url, { id, filter, listIdQuery }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Lấy danh sách bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        });
    };
}

export function delelteLichSuDssvHbkk(id, done) {
    return (dispatch) => {
        const url = '/api/ctsv/lich-su-hbkk/dssv';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Xóa danh sách bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch(getAllLichSuDssvHbkk(data.item.idDieuKien));
                T.notify('Xóa danh sách thành công', 'success');
            }
        });
    };
}

export function updateLichSuHbkkDssv(id, changes, done) {
    return (dispatch) => {
        const url = '/api/ctsv/lich-su-hbkk';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Cập nhật bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllLichSuDssvHbkk(data.item.idDieuKien));
                done && done(data.item);
            }
        });
    };
}
export function forwardLichSuHbkkDssv(id, isForward, notify, done) {
    return (dispatch) => {
        const url = '/api/ctsv/lich-su-hbkk/forward';
        T.put(url, { id, isForward, notify }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Cập nhật bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllLichSuDssvHbkk(data.item.idDieuKien));
                done && done(data.item);
            }
        });
    };
}