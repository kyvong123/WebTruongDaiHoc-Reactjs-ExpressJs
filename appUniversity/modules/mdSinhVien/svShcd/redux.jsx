import T from 'view/js/common';

const svSinhHoatCongDanGetData = 'svSinhHoatCongDan:GetData';
const svQuanLyShcdGetDataDotSinhHoat = 'svShcd:GetData';

export default function svSinhHoatCongDanReducer(state = null, data) {
    switch (data.type) {
        case svSinhHoatCongDanGetData:
            return Object.assign({}, state, { item: data.item, listNoiDung: data.listNoiDung, listEvent: data.listEvent, listGuest: data.listGuest, danhSachDiemDanh: data.danhSachDiemDanh });
        case svQuanLyShcdGetDataDotSinhHoat:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

export function getDataSvShcd(mssv, done) {
    return (dispatch) => {
        const url = '/api/sv/shcd';
        T.get(url, { mssv }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu SHCD bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: svSinhHoatCongDanGetData, item: data.item, listNoiDung: data.listNoiDung, listEvent: data.listEvent, listGuest: data.listGuest, danhSachDiemDanh: data.danhSachDiemDanh });
                done && done(data.item);
            }
        });
    };
}

export function setSvShcdDiemDanh(data, done) {
    return () => {
        const url = '/api/sv/shcd/diem-danh';
        if (data.loaiDiemDanh == 'VAO') {
            T.post(url, { data }, response => {
                if (response.error) {
                    T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                    console.error(`GET ${url}. ${response.error}`);
                } else {
                    T.notify(`${response.response}`, response.status);
                    done && done();
                }
            }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
        } else if (data.loaiDiemDanh == 'RA') {
            T.put(url, { id: data.id, mssv: data.mssv }, response => {
                if (response.error) {
                    T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                    console.error(`GET ${url}. ${response.error}`);
                } else {
                    T.notify(response.response, response.status);
                    done && done(response);
                }
            }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
        }
    };
}

//================= Redux cho menu quản lý ==================

export function getDataSinhHoatCongDan(done) {
    return dispatch => {
        const url = '/api/sv/quan-ly-shcd';
        T.get(url, {}, response => {
            if (response.error) {
                T.notify(response.error.message || 'Lấy dữ liệu đợt sinh hoạt công dân bị lỗi', 'danger');
                console.error('GET: ', response.error);
            } else {
                dispatch({ type: svQuanLyShcdGetDataDotSinhHoat, item: response.item });
                done && done(response.item);
            }
        });
    };
}

export function getDataCtsvShcd(id, done) {
    return dispatch => {
        const url = '/api/sv/quan-ly-shcd/item/data';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy dữ liệu SHCD bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                dispatch({ type: svSinhHoatCongDanGetData, item: data.item, listNoiDung: data.listNoiDung, listEvent: data.listEvent, listGuest: data.listGuest });
                done && done(data.item);
            }
        });
    };
}

export function setShcdDiemDanh(data, done) {
    return () => {
        const url = '/api/sv/quan-ly-shcd/diem-danh';
        if (data.loaiDiemDanh == 'VAO') {
            T.post(url, { data: { mssv: data.mssv, id: data.id, nguoiScanVao: data.nguoiScan } }, response => {
                if (response.error) {
                    T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                    console.error(`GET ${url}. ${response.error}`);
                } else {
                    T.notify(response.response, response.status);
                    done && done(response);
                }
            }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
        } else if (data.loaiDiemDanh == 'RA') {
            T.put(url, { id: data.id, mssv: data.mssv, changes: { nguoiScanRa: data.nguoiScan } }, response => {
                if (response.error) {
                    T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                    console.error(`GET ${url}. ${response.error}`);
                } else {
                    T.notify(response.response, response.status);
                    done && done(response);
                }
            }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
        }
    };
}
