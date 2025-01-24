import T from 'view/js/common';

export const TcQuyetToanThueGiaoDichGetPage = 'TcQuyetToanThueGiaoDich:GetPage';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function tcQuyetToanThueGiaoDich(state = null, data) {
    switch (data.type) {
        case TcQuyetToanThueGiaoDichGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageTcQuyetToanThueGiaoDich');
export function getPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcQuyetToanThueGiaoDich', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        dispatch({ type: TcQuyetToanThueGiaoDichGetPage, page: null });
        const url = `/api/khtc/quyet-toan-thue/giao-dich/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giao dịch quyết toán thuế bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcQuyetToanThueGiaoDichGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getSoTien(shcc, nam, done) {
    return () => {
        const url = '/api/khtc/quyet-toan-thue/giao-dich/item';
        T.get(url, { shcc, nam }, res => {
            if (res.error) {
                T.notify('Lấy thông tin quyết toán thuế bị lỗi!', 'danger');
                console.error(`GET ${url}.`, res.error);
            } else {
                if (!res.item) {
                    T.notify('Cán bộ chưa có công nợ quyết toán thuế!', 'warning');
                } else {
                    done && done(res.item);
                }
            }
        });
    };
}

export function createGiaoDich(data, done) {
    return dispatch => {
        const url = '/api/khtc/quyet-toan-thue/giao-dich';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Tạo giao dịch quyết toán thuế bị lỗi!', 'danger');
                console.error(`POST ${url}.`, res.error);
            } else {
                dispatch(getPage());
                done && done();
            }
        });
    };
}
