import T from 'view/js/common';

const SdhTsDotPhucTraAll = 'SdhTsDotPhucTra:GetAll';
export default function SdhHinhThucTuyenSinhReducer(state = null, data) {
    switch (data.type) {
        case SdhTsDotPhucTraAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getSdhTsDotPhucTraAll(done) {
    return dispatch => {
        const url = '/api/sdh/ts/dot-phuc-tra/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhTsDotPhucTraAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function getSdhTsDotPhucTra(maDot, done) {
    return () => {
        const url = `/api/sdh/ts/dot-phuc-tra/item/${maDot}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export function createSdhTsDotPhucTra(data, done) {
    return dispatch => {
        const url = '/api/sdh/ts/dot-phuc-tra';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo mới không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getSdhTsDotPhucTraAll());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhTsDotPhucTra(maDot, data, done) {
    return dispatch => {
        const url = '/api/sdh/ts/dot-phuc-tra';
        T.put(url, { maDot, data }, result => {
            if (result.error) {
                T.notify('Cập nhật không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getSdhTsDotPhucTraAll());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhTsDotPhucTra(maDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts/dot-phuc-tra';
        T.delete(url, { maDot }, result => {
            if (result.error) {
                T.notify('Xoá không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thành công', 'success');
                dispatch(getSdhTsDotPhucTraAll());
                done && done();
            }
        });
    };
}



