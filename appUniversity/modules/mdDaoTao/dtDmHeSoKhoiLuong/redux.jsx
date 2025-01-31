import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmHeSoKhoiLuongGetPage = 'dtDmHeSoKhoiLuong:GetPage';
const DtDmHeSoKhoiLuongUpdate = 'dtDmHeSoKhoiLuong:Update';

export default function dtDmHeSoKhoiLuongReducer(state = null, data) {
    switch (data.type) {
        case DtDmHeSoKhoiLuongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDmHeSoKhoiLuongUpdate:
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
T.initPage('pageDtDmHeSoKhoiLuong');
export function getDtDmHeSoKhoiLuongPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDmHeSoKhoiLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/he-so-khoi-luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh hệ số khối lượng lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDmHeSoKhoiLuongGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
function getDtHeSoKhoiLuongItem(id, done) {
    return () => {
        const url = `/api/dt/he-so-khoi-luong/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hệ số khối lượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function createHeSoKhoiLuong(data, done) {
    const cookie = T.updatePage('pageDtDmHeSoKhoiLuong');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/he-so-khoi-luong/create';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo hệ số khối lượng lỗi!', 'danger');
                console.error(`POST: ${url}.`, result.error);
                done && done(result.error);
            } else {
                T.notify('Tạo mới hệ số khối lượng thành công!', 'success');
                dispatch(getDtDmHeSoKhoiLuongPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Tạo hệ số khối lượng lỗi!', 'danger'));
    };
}

export function deleteHeSoKhoiLuong(id, done) {
    const cookie = T.updatePage('pageDtDmHeSoKhoiLuong');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/he-so-khoi-luong/delete';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error || 'Xóa hệ số khối lượng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, result.error);
                done && done();
            } else {
                T.notify('Xóa hệ số khối lượng bị lỗi!', 'success');
                dispatch(getDtDmHeSoKhoiLuongPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Xóa hệ số khối lượng bị lỗi!', 'danger'));
    };
}

export function updateHeSoKhoiLuong(id, changes, done) {
    const cookie = T.updatePage('pageDtDmHeSoKhoiLuong');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/he-so-khoi-luong/update';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error || 'Cập nhật hệ số khối lượng bị lỗi!', 'danger');
                console.error(`Upadte: ${url}.`, result.error);
                done && done();
            } else {
                T.notify('Cập nhật hệ số khối lượng thành công!', 'success');
                dispatch(getDtDmHeSoKhoiLuongPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật hệ số khối lượng bị lỗi!', 'danger'));
    };
}
const roundToTwo = (num) => {
    return +(Math.round(num + 'e+1') + 'e-1');
};
export const SelectAdapter_HeSoKhoiLuongAll = (filter) => {
    return {
        ajax: true,
        url: '/api/dt/he-so-khoi-luong/page/all',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => ({ results: response && response.items && response.items.map(item => ({ id: item.id, text: `${roundToTwo(item.heSo)}` })) }),
        fetchOne: (id, done) => (getDtHeSoKhoiLuongItem(id, item => done && done({ id: item.id, text: item.heSo })))(),
    };
};