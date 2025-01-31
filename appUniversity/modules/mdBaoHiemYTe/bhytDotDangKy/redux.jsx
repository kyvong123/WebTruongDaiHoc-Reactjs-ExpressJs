import T from 'view/js/common';

const CtsvDotDangKyBhytGetAll = 'CtsvDotDangKyBhyt:GetAll';
const CtsvDotDangKyBhytGetData = 'CtsvDotDangKyBhyt:GetData';

export default function CtsvDotDangKyBhytReducer(state = null, data) {
    switch (data.type) {
        case CtsvDotDangKyBhytGetData:
            return Object.assign({}, state, { item: data.item, dataBhyt: data.dataBhyt, dataChuHo: data.dataChuHo, dataThanhVien: data.dataThanhVien });
        case CtsvDotDangKyBhytGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getAllCtsvDotDangKyBhyt(done) {
    return dispatch => {
        const url = '/api/bhyt/dot-dang-ky-bhyt/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đợt bị lỗi!', 'danger');
            } else {
                done && done(data.items);
                dispatch({ type: CtsvDotDangKyBhytGetAll, items: data.items });
            }
        });
    };
}

export function getDataCtsvDotDangKyBhyt(ma, done) {
    if (typeof ma == 'function') {
        done = ma;
        ma = undefined;
    }
    let _ma = ma ? ma : T.cookie('dotDangKy');
    T.cookie('dotDangKy', ma);
    return dispatch => {
        const url = '/api/bhyt/dot-dang-ky-bhyt/data';
        T.get(url, { ma: _ma }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy thông tin đợt đăng ký BHYT bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error.message}`);
            } else {
                done && done(data.item);
                dispatch({ type: CtsvDotDangKyBhytGetData, item: data.item, dataBhyt: data.dataBhyt, dataChuHo: data.dataChuHo, dataThanhVien: data.dataThanhVien });
            }
        });
    };
}

export function getCtsvDotDangKyBhyt(ma, done) {
    return () => {
        if (typeof ma == 'function') {
            done = ma;
            ma = null;
        }
        const url = '/api/bhyt/dot-dang-ky-bhyt';
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy thông tin đợt đăng ký BHYT bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error.message}`);
            } else {
                done && done(data.item);
            }
        });
    };
}
export function getCtsvDotDangKyBhyt2(ma, done) {
    return dispatch => {
        const url = '/api/bhyt/dot-dang-ky-bhyt';
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy thông tin đợt đăng ký BHYT bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error.message}`);
            } else {
                done && done(data.item);
                dispatch({ type: CtsvDotDangKyBhytGetData, item: data.item, dataBhyt: data.dataBhyt });
            }
        });
    };
}

export function createCtsvDotDangKyBhyt(data, done) {
    return (dispatch) => {
        const url = '/api/bhyt/dot-dang-ky-bhyt';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo đợt đăng ký BHYT bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo đợt đăng ký BHYT thành công!', 'success');
                dispatch(getAllCtsvDotDangKyBhyt());
                done && done();
            }
        });
    };
}

export function updateCtsvDotDangKyBhyt(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/bhyt/dot-dang-ky-bhyt';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật thông tin đợt đăng ký BHYT bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error.message}`);
            } else {
                T.notify('Cập nhật thông tin đợt đăng ký BHYT thành công!', 'success');
                dispatch(getAllCtsvDotDangKyBhyt());
                done && done();
            }
        });
    };
}

export function createCtsvDotDangKyBhytKhoanThu(done) {
    return (dispatch) => {
        const url = '/api/bhyt/dot-dang-ky-bhyt/khoan-thu';
        T.post(url, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lưu thông tin đợt đăng ký BHYT bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error.message}`);
            } else {
                T.notify('Lưu thông tin đợt đăng ký BHYT thành công!', 'success');
                dispatch(getDataCtsvDotDangKyBhyt());
                done && done();
            }
        });
    };
}

export function deleteSvBaoHiemYTe(idDangKy, done) {
    return () => {
        const url = '/api/bhyt/admin';
        T.delete(url, { idDangKy }, result => {
            if (result.error > 0) {
                T.notify(`${result.error?.map(e => e.message) || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Xóa thành công!', 'success');
                done && done(result);
            }
        });
    };
}

export function updateSvBaoHiemYTe(changes, done) {
    return () => {
        const url = '/api/bhyt/admin';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify(`${result.error?.message || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Cập nhật thành công!', 'success');
            }
            done(result);
        });
    };
}

export const SelectAdapter_DotDkBhyt = {
    ajax: true,
    url: '/api/bhyt/dot-dang-ky-bhyt/all',
    processResults: res => ({ results: res && res.items ? res.items.map(item => ({ id: item.ma, text: `${item.ma} - ${item.namDangKy}: ${T.dateToText(item.thoiGianBatDau)} - ${T.dateToText(item.thoiGianKetThuc)}` })) : [] }),
    fetchOne: (ma, done) => getCtsvDotDangKyBhyt(ma, item => done && done({ id: item.ma, text: `${item.ma} - ${item.namDangKy}: ${T.dateToText(item.thoiGianBatDau)} - ${T.dateToText(item.thoiGianKetThuc)}` }))()
};