// Reducer ------------------------------------------------------------------------------------------------------------
const DtSvChuongTrinhGetAll = 'DtSvChuongTrinhDaoTao:GetAll';
export default function DtSvCtdtReducer(state = null, data) {
    switch (data.type) {
        case DtSvChuongTrinhGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getDtSvChuongTrinhAll(done) {
    return dispatch => {
        const url = '/api/dt/svChuongTrinhDaoTao/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin sinh viên chương trình đào tạo bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtSvChuongTrinhGetAll, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtSvChuongTrinh(data, done) {
    return dispatch => {
        const url = '/api/dt/svChuongTrinhDaoTao';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới sinh viên chương trình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới sinh viên chương trình thành công', 'success');
                done && done(data);
                dispatch(getDtSvChuongTrinhAll());
            }
        });
    };
}

export function deleteDtSvChuongTrinh(id, done) {
    return dispatch => {
        const url = '/api/dt/svChuongTrinhDaoTao';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa sinh viên chương trình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xóa sinh viên chương trình thành công', 'success');
                done && done();
                dispatch(getDtSvChuongTrinhAll());
            }
        });
    };
}