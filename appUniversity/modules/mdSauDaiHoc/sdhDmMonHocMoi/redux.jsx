import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMonHocSdhMoiGetAll = 'DmMonHocSdhMoi:Get';
const DmMonHocSdhMoiGetPage = 'DmMonHocSdhMoi:GetPage';
const DmMonHocSdhMoiUpdate = 'DmMonHocSdhMoi:Update';

export default function dmMonHocSdhMoiReducer(state = null, data) {
    switch (data.type) {
        case DmMonHocSdhMoiGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmMonHocSdhMoiGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMonHocSdhMoiUpdate:
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
export function getDmMonHocSdhMoiAll(done) {
    return dispatch => {
        const url = '/api/sdh/mon-hoc-moi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DmMonHocSdhMoiGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDmMonHocSdhMoi');
export function getDmMonHocSdhMoiPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDmMonHocSdhMoi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/mon-hoc-moi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter, condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: DmMonHocSdhMoiGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDmMonHocSdhMoi(item, done) {
    const cookie = T.updatePage('pageDmMonHocSdhMoi');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/sdh/mon-hoc-moi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo môn học bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo môn học thành công!', 'success');
                dispatch(getDmMonHocSdhMoiPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        });
    };
}

export function deleteDmMonHocSdhMoi(ma) {
    const cookie = T.updatePage('pageDmMonHocSdhMoi');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/sdh/mon-hoc-moi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa môn học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Môn học đã xóa thành công!', 'success', false, 800);
                dispatch(getDmMonHocSdhMoiPage(pageNumber, pageSize, pageCondition, filter));
            }
        }, () => T.notify('Xóa môn học bị lỗi!', 'danger'));
    };
}

export function updateDmMonHocSdhMoi(ma, changes, done) {
    const cookie = T.updatePage('pageDmMonHocSdhMoi');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/sdh/mon-hoc-moi';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(getDmMonHocSdhMoiPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    };
}

export function getDmMonHocSdhMoi(ma, done) {
    return () => {
        const url = `/api/sdh/mon-hoc-moi/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin môn học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmMonHocSdhMoiMutiple(data, done) {
    const cookie = T.updatePage('pageDmMonHocSdhMoi');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return (dispatch) => {
        const url = '/api/sdh/mon-hoc-moi/multiple';
        T.post(url, { data }, (data) => {
            if (data.errors && data.errors.length > 0) {
                T.notify('Tạo mới môn học sau đại học lỗi', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo mới môn học thành công', 'success');
                done && done();
                dispatch(getDmMonHocSdhMoiPage(pageNumber, pageSize, pageCondition, filter));
            }
        });
    };
}
export function updateKhoaDmMonHocSdhMoi(listMa, khoaSdh, done) {
    const cookie = T.updatePage('pageDmMonHocSdhMoi');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/sdh/mon-hoc-moi/khoa';
        T.put(url, { listMa, khoaSdh }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(getDmMonHocSdhMoiPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật danh sách môn học bị lỗi!', 'danger'));
    };
}
export function changeDmMonHocSdhMoi(item) {
    return { type: DmMonHocSdhMoiUpdate, item };
}

export const SelectAdapter_DmMonHocSdhMoi = {
    ajax: true,
    url: '/api/sdh/mon-hoc-moi/page/1/50',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.tenTiengViet })) : [] }),
    fetchOne: (ma, done) => (getDmMonHocSdhMoi(ma, item => item && done && done({ id: item.ma, text: item.tenTiengViet })))(),
};