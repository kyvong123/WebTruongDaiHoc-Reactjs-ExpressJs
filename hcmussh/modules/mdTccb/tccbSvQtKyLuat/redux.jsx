import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbSvKyLuatCauHinhGetPage = 'SvQtKyLuat:GetCauHinhPage';


export default function TccbSvKyLuatReducer(state = null, data) {
    switch (data.type) {
        case TccbSvKyLuatCauHinhGetPage:
            return Object.assign({}, state, { pageCauHinh: data.page });
        default:
            return state;
    }
}

T.initPage('pageTccbSvKyLuatCauHinh');
export function getTccbSvKyLuatCauHinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTccbSvKyLuatCauHinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/sv-ky-luat/cau-hinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình kỷ luật sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: TccbSvKyLuatCauHinhGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách cấu hình kỷ luật bị lỗi!', 'danger'));
    };
}

export function getTccbSvKyLuatCauHinh(id, done) {
    return () => {
        const url = '/api/tccb/sv-ky-luat/cau-hinh/item';
        T.get(url, { id }, res => {
            if (res.error) {
                T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function ghiChuTccbSvKyLuatDssv(id, changes, done) {
    return () => {
        const url = '/api/tccb/sv-ky-luat/them-ghi-chu-khoa';
        T.put(url, { id, changes }, res => {
            if (res.error) {
                T.notify('Cập nhật ghi chú cho kỷ luật bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật ghi chú cho kỷ luật thành công!', 'success');
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật ghi chú cho kỷ luật bị lỗi!', 'danger'));
    };
}

