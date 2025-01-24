import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNganhSdhGetAll = 'DmNganhSdh:GetAll';
const DmNganhSdhGetPage = 'DmNganhSdh:GetPage';
const DmNganhSdhUpdate = 'DmNganhSdh:Update';

export default function dmNganhSdhReducer(state = null, data) {
    switch (data.type) {
        case DmNganhSdhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNganhSdhGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmNganhSdhUpdate:
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
export const PageName = 'pageDmNganhSdh';
T.initPage(PageName);
export function getDmNganhSdhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/sdh/danh-sach-nganh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: DmNganhSdhGetPage, page: data.page });
                done && done(data.page);
            }
        }, (error) => T.notify('Lấy danh sách ngành sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmNganhSdhAll(phanHe, filter, done) {
    return dispatch => {
        const url = '/api/sdh/danh-sach-nganh/all';
        T.get(url, { phanHe, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DmNganhSdhGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, (error) => T.notify('Lấy danh sách ngành sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmNganhSdh(ma, done) {
    return () => {
        const url = `/api/sdh/danh-sach-nganh/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy ngành sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getDmNganhByPhanHeSdh(phanHe, done) {
    return () => {
        const url = `/api/sdh/danh-sach-nganh/phanHe/${phanHe}`;
        T.get(url, { phanHe }, data => {
            if (data.error) {
                T.notify('Lấy ngành sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmNganhSdh(item, done) {
    return dispatch => {
        const url = '/api/sdh/danh-sach-nganh';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo ngành sau đại học thành công!', 'success');
                dispatch(getDmNganhSdhAll());
                done && done();
            }
        }, (error) => T.notify('Tạo ngành sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmNganhSdh(ma, done) {
    return dispatch => {
        const url = '/api/sdh/danh-sach-nganh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục  bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục ngành sau đại học đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNganhSdhAll());
                done && done();
            }
        }, (error) => T.notify('Xóa khoa sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmNganhSdh(ma, changes, done) {
    return dispatch => {
        const url = '/api/sdh/danh-sach-nganh';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật ngành sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật ngành sau đại học thành công!', 'success');
                dispatch(getDmNganhSdhAll());
                done && done(data.item);
            }
        }, (error) => T.notify('Cập nhật ngành sau đại học bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createDmNganhSdhMutiple(data, done) {
    return (dispatch) => {
        const url = '/api/sdh/danh-sach-nganh/multiple';
        T.post(url, { data }, (data) => {
            if (data.errors && data.errors.length > 0) {
                T.notify('Tạo mới môn học sau đại học lỗi', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                dispatch(getDmNganhSdhAll());
                done && done();
            }
        });
    };
}

export function changeDmNganhSdh(item) {
    return { type: DmNganhSdhUpdate, item };
}

export const SelectAdapter_DmNganhSdh = (maKhoaSdh) => {
    return {
        ajax: true,
        url: '/api/sdh/danh-sach-nganh/page/1/50',
        data: params => ({ condition: params.term, kichHoat: 1, maKhoaSdh }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.ten}`, name: item.ten, maLop: item.maLop })) : [] }),
        fetchOne: (id, done) => (getDmNganhSdh(id, item => item && done && done({ id: item.maNganh, text: `${item.maNganh}: ${item.ten}`, maLop: item.maLop })))(),
    };
};