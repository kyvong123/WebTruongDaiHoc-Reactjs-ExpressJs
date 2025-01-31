import T from 'view/js/common';

export const TcSubDetailLogGetPage = 'TcSubDetailLog:GetPage';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function TcDashboard(state = null, data) {
    switch (data.type) {
        case TcSubDetailLogGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export function getThongKeLoaiPhiDashboard(filter, done, onFinish) {
    const url = '/api/khtc/dashboard/detail-chart';
    return () => {
        T.get(url, filter, result => {
            onFinish && onFinish();
            if (result.error) {
                T.notify('Lấy dữ liệu thống kê lỗi ' + (result.error.message ? ` ${result.error.message}` : ''), 'danger');
                console.error('POST: ' + url, result.error);
            } else {
                done && done(result);
            }
        }, () => T.notify('Tra cứu lỗi', 'danger'));
    };
}

export function getThongKeHocPhiNganh(filter, done) {
    const url = '/api/khtc/dashboard/thong-ke-nganh';
    return () => {
        T.get(url, filter, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu thống kê lỗi ' + (result.error.message ? ` ${result.error.message}` : ''), 'danger');
                console.error('POST: ' + url, result.error);
            } else {
                done && done(result);
            }
        }, () => T.notify('Lấy dữ liệu thống kê lỗi', 'danger'));
    };
}







