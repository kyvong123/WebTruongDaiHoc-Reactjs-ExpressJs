import T from 'view/js/common';

export const TcSubDetailLogGetPage = 'TcSubDetailLog:GetPage';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function TcSubDetailLog(state = null, data) {
    switch (data.type) {
        case TcSubDetailLogGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageTcSubDetailLog');
export function getPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcSubDetailLog', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        dispatch({ type: TcSubDetailLogGetPage, page: null });
        const url = `/api/khtc/sub-detail/log/page/search/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lỗi', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcSubDetailLogGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getSubDetailLogSinhVien(mssv, done) {
    const url = '/api/khtc/sub-detail/log/get-sinh-vien';
    return () => {
        T.get(url, { mssv }, (data) => {
            if (data.error) {
                T.notify('Lấy lịch sử thay đổi học phần lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.dataSinhVien);
            }
        }, () => T.notify('Lấy lịch sử thay đổi học phần lỗi'));
    };
}

export function syncPreview(filter, done) {
    return () => {
        const url = '/api/khtc/sync-hoc-phi/preview';
        T.get(url, { filter }, res => {
            if (res.error) {
                T.notify('Đồng bộ dữ liệu bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        });
    };
}

export function syncData(data, done) {
    return dispatch => {
        const url = '/api/khtc/sync-hoc-phi/ap-dung';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Đồng bộ dữ liệu bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                dispatch(getPage());
                done && done();
            }
        });
    };
}
