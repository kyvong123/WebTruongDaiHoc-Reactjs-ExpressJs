import T from 'view/js/common';

const sinhVienUserGet = 'sinhVien:UserGet';
export default function sinhVienReducer(state = null, data) {
    switch (data.type) {
        case sinhVienUserGet:
            return Object.assign({}, state, { selectedItem: data.item });
        default:
            return state;
    }
}
export function getSinhVienEditUser(done) {
    return dispatch => {
        const url = '/api/sv/profile/edit/item';
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error.message);
            } else {
                done && done(data);
                dispatch({ type: sinhVienUserGet, item: data.item });
            }
        }, () => console.error('Lấy thông tin sinh viên bị lỗi!'));
    };
}

export function updateStudentUser(changes, done) {
    return dispatch => {
        const url = '/api/sv/profile';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu sinh viên bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch({ type: sinhVienUserGet, item: data.item });
            }
        }, () => T.notify('Cập nhật dữ liệu sinh viên bị lỗi', 'danger'));
    };
}



export function updateStudentUserNganHangInfo(changes, done) {
    return dispatch => {
        const url = '/api/sv/ngan-hang-sinh-vien';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu sinh viên bị lỗi! ' + data.error.message, 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch({ type: sinhVienUserGet, item: data.item });
            }
        }, () => T.notify('Cập nhật dữ liệu sinh viên bị lỗi', 'danger'));
    };
}

export function downloadWord(done) {
    return () => {
        const url = '/api/sv/profile/syll';
        T.get(url, result => {
            done(result);
        });
    };
}