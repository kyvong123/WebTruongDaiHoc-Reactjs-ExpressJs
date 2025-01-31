import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTinhTrangHocPhiGetPage = 'DmTinhTrangHocPhi:GetPage';
const DmTinhTrangHocPhiUpdate = 'DmTinhTrangHocPhi:Update';

export default function dmTinhTrangHocPhiReducer(state = null, data) {
    switch (data.type) {
        case DmTinhTrangHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmTinhTrangHocPhiUpdate:
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
T.initPage('dmTinhTrangHocPhiPage', true);
export function getDmTinhTrangHocPhiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTinhTrangHocPhiPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/tinh-trang-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmTinhTrangHocPhiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách tình trạng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}


export function getDmTinhTrangHocPhi(ma, done) {
    return () => {
        const url = `/api/danh-muc/tinh-trang-hoc-phi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tình trạng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTinhTrangHocPhi(dmTinhTrangHocPhi, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-hoc-phi';
        T.post(url, { dmTinhTrangHocPhi }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một tình trạng học phí bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một tình trạng học phí thành công!', 'success');
                dispatch(getDmTinhTrangHocPhiPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một tình trạng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmTinhTrangHocPhi(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-hoc-phi';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu tình trạng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu tình trạng học phí thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTinhTrangHocPhiPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu tình trạng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmTinhTrangHocPhi(ma, done) {
    return dispatch => {
        const url = '/api/danh-muc/tinh-trang-hoc-phi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa tình trạng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa tình trạng học phí thành công!', 'success', false, 800);
                dispatch(getDmTinhTrangHocPhiPage());
            }
            done && done();
        }, () => T.notify('Xóa tình trạng học phí bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmTinhTrangHocPhi = {
    ajax: true,
    data: params => ({ condition: params.term, active: 1 }),
    url: '/api/danh-muc/tinh-trang-hoc-phi/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.tinhTrangHocPhi })) : [] }),
    fetchOne: (ma, done) => (getDmTinhTrangHocPhi(ma, item => done && done({ id: item.ma, text: item.tinhTrangHocPhi })))(),
};