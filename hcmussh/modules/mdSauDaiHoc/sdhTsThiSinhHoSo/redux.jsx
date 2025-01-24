import { getSystemState } from 'modules/_default/_init/reduxSystem';
import T from 'view/js/common';
const UPDATE_SYSTEM_STATE = 'system:updateSystemState';

export default function systemReducer(state = null, data) {
    switch (data.type) {
        case UPDATE_SYSTEM_STATE:
            return Object.assign({}, state, data.state);
        default:
            return state;
    }
}

export function getSdhTsThiSinhProfile(done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/get-profile';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin không thành công' + (result.error.message ? (':<br>' + result.error.message) : ''), 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.data);
            }
        });
    };
}

export function copyHsdk(dataCoBan, newData, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/dang-ky-them';
        T.post(url, { dataCoBan, newData }, result => {
            if (result.error) {
                T.notify('Đăng ký không thành công' + (result.error.message ? (':<br>' + result.error.message) : ''), 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Đăng ký thành công', 'success');
                done && done(result.item);
            }
        });
    };
}

export function huyDangKy(id, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin thí sinh không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa thông tin thí sinh thành công!', 'success');
                done && done();
            }
        });
    };
}
export function createSdhTsCbhd(data, dataCbhd, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/delete';
        T.post(url, { data, dataCbhd }, data => {
            if (data.error) {
                T.notify('Xóa thông tin thí sinh không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa thông tin thí sinh thành công!', 'success');
                done && done();
            }
        });
    };

}
export function triggerPhanHe(phanHe, done) {
    return (dispatch) => {
        const url = '/api/sdh/ts/thi-sinh/trigger';
        T.put(url, { phanHe }, data => {
            if (data.error) {
                console.error(`PUT: ${url}.`, data.error);
            } else {
                dispatch(getSystemState());
                done && done();
            }
        });
    };
}
export function deleteSdhTsDangKyNgoaiNgu(idThiSinh, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/dang-ky-ngoai-ngu';
        T.delete(url, { idThiSinh }, data => {
            if (data.error) {
                T.notify('Xóa thông tin đăng ký ngoại ngữ không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                done && done();
            }
        });
    };
}
export function deleteSdhTsNgoaiNguByIdThiSinh(idThiSinh, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/chung-chi-ngoai-ngu';
        T.delete(url, { idThiSinh }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                done && done();
            }
        });
    };
}

export function deleteSdhTsDeTaiByIdThiSinh(idThiSinh, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/de-tai';
        T.delete(url, { idThiSinh }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                done && done();
            }
        });
    };
}

export function handleChangePassword(data, done) {
    return () => {
        const url = '/api/sdh/change-password';
        T.post(url, { data }, result => {
            if (result.error) {
                console.error(result.error);
                done && done(result);

            } else {
                T.notify('Đổi mật khẩu thành công!', 'success');
                done && done();
            }
        });
    };
}