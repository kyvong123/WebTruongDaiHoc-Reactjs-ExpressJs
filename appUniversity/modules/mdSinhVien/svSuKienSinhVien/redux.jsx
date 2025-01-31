import T from 'view/js/common';

const SuKienNguoiThamDuGetPage = 'SuKienNguoiThamDu:GetPage';

export default function StudentSuKienReducer(state = null, data) {
    switch (data.type) {
        case SuKienNguoiThamDuGetPage:
            return Object.assign({}, state, { suKienNguoiThamDu: data.page, daThamDu: data.daThamDu });
        default:
            return state;
    }
}

export function getSuKienInfo(id, done) {
    return () => {
        const url = `/api/sv/su-kien/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sự kiện không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

T.initPage('PageSuKienNguoiThamDu');

export function getPageSuKienNguoiThamDu(pageNumber, pageSize, pageCondition, idSuKien, filter, done) {
    const page = T.updatePage('PageCtsvSuKienNguoiThamDu', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/sv/su-kien-nguoi-tham-du/page';
        T.get(url, { ...page, filter: { idSuKien, ...filter } }, response => {
            if (response.error) {
                T.notify('Lấy danh sách người tham dự sự kiện bị lỗi', 'danger');
                console.error('GET: ', response.error.message);
            } else {
                dispatch({ type: SuKienNguoiThamDuGetPage, page: response.page, daThamDu: response.daThamDu });
                done && done(response.page);
            }
        });
    };
}
export function setSuKienNguoiThamDu(idSuKien, done) {
    return dispatch => {
        const url = '/api/sv/su-kien-nguoi-tham-du';
        T.post(url, { idSuKien }, response => {
            if (response.error) {
                T.notify('Đăng kí tham gia sự kiện bị lỗi', 'danger');
                console.error('GET: ', response.error.message);
            } else {
                dispatch(getPageSuKienNguoiThamDu(null, null, null, idSuKien));
                T.notify('Đăng kí tham gia sự kiện thành công', 'success');
                done && done(response.item);
            }
        });
    };
}

export function deleteSuKienNguoiThamDu(idSuKien, done) {
    return dispatch => {
        const url = '/api/sv/su-kien-nguoi-tham-du';
        T.delete(url, { idSuKien }, response => {
            if (response.error) {
                T.notify('Hủy đăng kí tham gia sự kiện bị lỗi', 'danger');
                console.error('GET: ', response.error.message);
            } else {
                dispatch(getPageSuKienNguoiThamDu(null, null, null, idSuKien));
                T.notify('Hủy đăng kí thành công', 'success');
                done && done(response.item);
            }
        });
    };
}

export function sinhVienDiemDanh(id, done) {
    return () => {
        const url = '/api/sv/danh-sach-su-kien/diem-danh';
        T.put(url, { id }, response => {
            if (response.error) {
                T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${response.error}`);
            } else {
                T.notify(response.response, response.status);
                done && done(response);
            }
        }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
    };
}
