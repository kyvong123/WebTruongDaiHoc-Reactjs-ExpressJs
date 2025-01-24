import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmMonHocKhongTinhPhiGetPage = 'dtDmMonHocKhongTinhPhi:GetPage';
const DtDmMonHocKhongTinhPhiUpdate = 'dtDmMonHocKhongTinhPhi:Update';

export default function dtDmMonHocKhongTinhPhiReducer(state = null, data) {
    switch (data.type) {
        case DtDmMonHocKhongTinhPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDmMonHocKhongTinhPhiUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDtDmMonHocKhongTinhPhi');
export function getDtDmMonHocKhongTinhPhiPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDmMonHocKhongTinhPhi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/mon-hoc-khong-tinh-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDmMonHocKhongTinhPhiGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createMonHocKhongTinhPhi(list, done) {
    const cookie = T.updatePage('pageDtDmMonHocKhongTinhPhi');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/mon-hoc-khong-tinh-phi';
        T.post(url, { list }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo môn học không tính phí bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                if (data.message && data.message.failed) T.notify(data.message.failed, 'danger');
                if (data.message && data.message.success) T.notify(data.message.success, 'success');
                done && done();
                dispatch(getDtDmMonHocKhongTinhPhiPage(pageNumber, pageSize, pageCondition, filter));
            }
        }, () => T.notify('Tạo môn học không tính phí bị lỗi!', 'danger'));
    };
}

export function deleteMonHocKhongTinhPhi(id, done) {
    const cookie = T.updatePage('pageDtDmMonHocKhongTinhPhi');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/mon-hoc-khong-tinh-phi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa môn học không tính phí bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Xóa môn học không tính phí thành công!', 'success');
                dispatch(getDtDmMonHocKhongTinhPhiPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Xóa môn học không tính phí bị lỗi!', 'danger'));
    };
}
