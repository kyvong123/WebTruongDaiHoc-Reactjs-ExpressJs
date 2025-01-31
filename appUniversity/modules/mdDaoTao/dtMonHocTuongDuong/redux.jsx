import T from 'view/js/common';

// Reducer ------------------------------
const DtMonTuongDuongGetNhom = 'DtMonTuongDuong:GetNhom';
const DtMonTuongDuongGetApDung = 'DtMonTuongDuong:GetApDung';

export default function dtMonTuongDuongReducer(state = null, data) {
    switch (data.type) {
        case DtMonTuongDuongGetNhom:
            return Object.assign({}, state, { listNhom: data.items, nhomData: data.nhomData });
        case DtMonTuongDuongGetApDung:
            return Object.assign({}, state, { nhomApDung: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getListNhomTuongDuong(done) {
    return dispatch => {
        const url = '/api/dt/mon-tuong-duong/list-nhom';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu nhóm tương đương bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtMonTuongDuongGetNhom, items: result.items, nhomData: result.nhomData });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createNhomTuongDuong(maNhom, data, done) {
    return dispatch => {
        const url = '/api/dt/mon-tuong-duong/nhom';
        T.post(url, { maNhom, data }, result => {
            if (result.error) {
                T.notify('Cập nhật nhóm tương đương bị lỗi', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                dispatch(getListNhomTuongDuong());
                done && done(result.items);
            }
        }, error => console.error(`POST: ${url}.`, error));
    };
}

export function getApDungNhomTuongDuong(done) {
    return dispatch => {
        const url = '/api/dt/mon-tuong-duong/nhom-ap-dung';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu nhóm tương đương bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtMonTuongDuongGetApDung, items: result.items });
                done && done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createApDungNhomTuongDuong(id, data, done) {
    return dispatch => {
        const url = '/api/dt/mon-tuong-duong/nhom-ap-dung';
        T.post(url, { id, data }, result => {
            if (result.error) {
                T.notify('Cập nhật nhóm tương đương áp dụng bị lỗi', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                dispatch(getApDungNhomTuongDuong());
                done && done(result.items);
            }
        }, error => console.error(`POST: ${url}.`, error));
    };
}
