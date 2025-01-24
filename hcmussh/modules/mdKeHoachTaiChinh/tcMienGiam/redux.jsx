import T from 'view/js/common';

export const TcMienGiamGetPage = 'TcMienGiam:GetPage';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function tcMienGiam(state = null, data) {
    switch (data.type) {
        case TcMienGiamGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageTcMienGiam');
export function getPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcMienGiam', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        dispatch({ type: TcMienGiamGetPage, page: null });
        const url = `/api/khtc/mien-giam/search/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách miễn giảm bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcMienGiamGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDssvMienGiam(namHoc, hocKy, done) {
    return () => {
        const url = '/api/khtc/mien-giam/get-dssv';
        T.get(url, { namHoc, hocKy }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.items);
            }
        }, () => T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi', 'danger'));
    };
}

export function multiCreateDssvTcMienGiam(namHoc, hocKy, items, overwrite, done, error) {
    return () => {
        const url = '/api/khtc/mien-giam/multiple';
        T.post(url, { namHoc, hocKy, overwrite, items }, data => {
            if (data.error) {
                error && error(data.error);
                // T.alert(data.error.message || 'Cập nhật danh sách sinh viên miễn giảm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done && done(data.failed);
            }
        }, () => T.notify('Cập nhật danh sách sinh viên miễn giảm bị lỗi', 'danger'));
    };
}