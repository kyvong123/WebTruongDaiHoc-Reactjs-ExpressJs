import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbLopChuNhiemGetNull = 'TccbLopChuNhiem:GetNull';
const TccbLopChuNhiemGetDetail = 'TccbLopChuNhiem:GetDetail';
const TccbLopChuNhiemGetDetailNull = 'TccbLopChuNhiem:GetDetailNull';

export default function tccbLopChuNhiemReducer(state = null, data) {
    switch (data.type) {
        case TccbLopChuNhiemGetNull:
            return Object.assign({}, state, { page: null });
        case TccbLopChuNhiemGetDetailNull:
            return Object.assign({}, state, { currentDataLop: null });
        case TccbLopChuNhiemGetDetail:
            return Object.assign({}, state, { currentDataLop: data.currentDataLop });
        default:
            return state;
    }
}

export function getTccbLopChuNhiem(done) {
    return () => {
        const url = '/api/tccb/lop-chu-nhiem';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function getTccbLopChuNhiemData(maLop, done) {
    return (dispatch) => {
        dispatch({ type: TccbLopChuNhiemGetDetailNull });
        const url = '/api/tccb/lop-chu-nhiem';
        T.get(url, { maLop }, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                dispatch({ type: TccbLopChuNhiemGetDetail, currentDataLop: data.item });
            }
        });
    };
}

export function createTccbLopChuNhiemBanCanSu(changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/lop-chu-nhiem/ban-can-su';
        T.post(url, { changes }, data => {
            if (data.error || changes == null) {
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Thêm ban cán sự lớp thành công', 'success');
                dispatch(getTccbLopChuNhiemData(changes.maLop));
                done && done();
            }
        }, () => T.notify('Thêm ban cán sự lớp bị lỗi!', 'danger'));
    };
}

export function updateTccbLopChuNhiemBanCanSu(id, changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/lop-chu-nhiem/ban-can-su';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ban cán sự thành công', 'success');
                dispatch(getTccbLopChuNhiemData(changes.maLop));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin ban cán sự bị lỗi!', 'danger'));
    };
}

export function deleteTccbLopChuNhiemBanCanSu(id, userId, maLop, maChucVu, done) {
    return (dispatch) => {
        const url = '/api/tccb/lop-chu-nhiem/ban-can-su';
        T.delete(url, { id, userId, maLop, maChucVu }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Xóa ban cán sự thành công', 'success');
                dispatch(getTccbLopChuNhiemData(maLop));
                done && done();
            }
        }, () => T.notify('Xóa ban cán sự bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_LopChuNhiemDanhSach = {
    ajax: true,
    url: '/api/tccb/lop-chu-nhiem/danh-sach-lop',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item, text: item })) : [] }),
};