import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const svLtQuanLyLopGetNull = 'TccbLopChuNhiem:GetNull';
const svLtQuanLyLopGetDetail = 'TccbLopChuNhiem:GetDetail';
const svLtQuanLyLopGetDetailNull = 'TccbLopChuNhiem:GetDetailNull';

export default function svLtQuanLyLopReducer(state = null, data) {
    switch (data.type) {
        case svLtQuanLyLopGetNull:
            return Object.assign({}, state, { page: null });
        case svLtQuanLyLopGetDetailNull:
            return Object.assign({}, state, { currentDataLop: null });
        case svLtQuanLyLopGetDetail:
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

export function getSvLtQuanLyLopData(done) {
    return (dispatch) => {
        dispatch({ type: svLtQuanLyLopGetDetailNull });
        const url = '/api/sv/lop-truong/quan-ly-lop';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                dispatch({ type: svLtQuanLyLopGetDetail, currentDataLop: data.item });
            }
        });
    };
}

export function updateTccbLopChuNhiemData(maLop, changes, done) {
    return () => {
        const url = '/api/ctsv/lop-sinh-vien/item/danh-sach';
        T.put(url, { maLop, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lớp sinh viên thành công', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin lớp sinh viên bị lỗi!', 'danger'));
    };
}