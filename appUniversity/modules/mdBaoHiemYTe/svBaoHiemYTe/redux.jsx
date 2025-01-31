import T from 'view/js/common';

const SvBHYTPage = 'SvBHYT:GetPage';
const SvBHYTNull = 'SvBHYT:Null';
export default function svBaoHiemYTeReducer(state = null, data) {
    switch (data.type) {
        case SvBHYTPage:
            return Object.assign({}, state, { page: data.page });
        case SvBHYTNull:
            return Object.assign({}, state, { page: { list: null } });
        default:
            return state;
    }
}

T.initPage('pageCtsvBhyt:0:0');
T.initPage('pageCtsvBhyt:9:0');
T.initPage('pageCtsvBhyt:9:1');
T.initPage('pageCtsvBhyt:12:0');
T.initPage('pageCtsvBhyt:12:1');
T.initPage('pageCtsvBhyt:15:0');
T.initPage('pageCtsvBhyt:15:1');
export function getPageSvBaoHiemYTe(pageNumber, pageSize, pageCondition, filter = {}, done) {
    const { dienDong = 0, giaHan = 0 } = filter;
    const page = T.updatePage(`pageCtsvBhyt:${dienDong}:${dienDong == 0 ? 0 : giaHan}`, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: SvBHYTNull });
        const url = '/api/bhyt/all';
        T.get(url, {
            pageNumber: page.pageNumber, pageSize: page.pageSize,
            condition: page.pageCondition, filter: page.filter
        }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu BHYT lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SvBHYTPage, page: result.page });
                done && done();
            }
        });
    };
}

export function getMssvBaoHiemYTe(data, done) {
    return () => {
        const url = '/api/bhyt';
        T.get(url, data, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
            }
        });
    };
}

export function getBaoHiemYTeChuHo(mssv, done) {
    return () => {
        const url = '/api/bhyt/data/chu-ho';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify('Lấy thông tin hộ gia đình bị lỗi', 'danger');
            } else {
                done(result);
            }
        });
    };
}

export function createMssvBaoHiemYTe(data, done) {
    return () => {
        const url = '/api/bhyt/admin';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
                T.notify('Đăng ký thành công!', 'success');
            }
        });
    };
}

export function updateSvBaoHiemYTeAdmin(changes, done) {
    return () => {
        const url = '/api/bhyt/admin';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify(`${result.error?.message || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Cập nhật thành công!', 'success');
                // dispatch(getAllSvBaoHiemYTe());
            }
            done(result);
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
                // dispatch(getAllSvBaoHiemYTe(2022));
            }
            done && done(result);
        });
    };
}

export function downloadWord(id, done) {
    return () => {
        const url = '/api/bhyt/download-word';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(`${data.error || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Tải thành công!', 'success');
                T.FileSaver(new Blob([new Uint8Array(data.buffer.data)]), data.fileName);
            }
            done && done(data);
        });
    };
}

export function sendMailSvBaoHiemYTe(ma, done) {
    return () => {
        const url = '/api/bhyt/dot-dang-ky-bhyt/email-chua-ke-khai';
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify(`${data.error || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Gửi email thành công', 'success');
                done && done(data.items);
            }
        });
    };
}


