import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmBacDonViGetAll = 'DmBacDonVi:GetAll';
const DmBacDonViGetPage = 'DmBacDonVi:GetPage';
const DmBacDonViUpdate = 'DmBacDonVi:Update';
const DmBacDonViDonViGet = 'DmBacDonVi:Get';

export default function DmBacDonViReducer(state = null, data) {
    switch (data.type) {
        case DmBacDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmBacDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmBacDonViDonViGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case DmBacDonViUpdate:
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

// // Actions ------------------------------------------------------------------------------------------------------------
export function getDmBacDonVi(ma, done) {
    return () => {
        const url = `/api/danh-muc/bac-don-vi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin bậc đơn vị bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

T.initPage('pageDmBacDonVi');
export function getDmBacDonViPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageDmBacDonViDonVi', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/danh-muc/bac-don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(
            url,
            { condition: page.pageCondition, filter },
            (data) => {
                if (data.error) {
                    T.notify('Lấy danh sách bậc đơn vị bị lỗi!', 'danger');
                    console.error(`GET: ${url}.`, data.error);
                } else {
                    if (page.filter) data.page.filter = page.filter;
                    if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                    dispatch({ type: DmBacDonViGetPage, page: data.page });
                    done && done(data.page);
                }
            },
            () => T.notify('Lấy danh sách bậc đơn vị bị lỗi!', 'danger')
        );
    };
}

export function createBacDonVi(data, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/bac-don-vi';
        T.post(
            url,
            { data },
            (res) => {
                if (res.error) {
                    T.notify('Thêm bậc đơn vị bị lỗi', 'danger');
                    console.error('POST: ' + url + '. ' + res.error);
                } else {
                    if (done) {
                        T.notify('Thêm bậc đơn vị thành công!', 'info');
                        dispatch(getDmBacDonViPage());
                        done && done(data);
                    }
                }
            },
            () => T.notify('Thêm bậc đơn vị bị lỗi', 'danger')
        );
    };
}

export function updateBacDonVi(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/bac-don-vi';
        T.put(url, { ma, changes }, (data) => {
            if (data.error) {
                T.notify('Cập nhật thông tin bậc đơn vị bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                console.log(data);
                T.notify('Cập nhật thông tin bậc đơn vị thành công!', 'info');
                done && done(data.item);
                dispatch(getDmBacDonViPage());
            }
        },
            () => T.notify('Cập nhật thông tin bậc đơn vị bị lỗi', 'danger')
        );
    };
}

export const SelectAdapter_DmBacDonVi = {
    ajax: true,
    data: params => ({ condition: params.term, ks_kichHoat: 1 }),
    url: '/api/danh-muc/bac-don-vi/page/1/20',
    getOne: getDmBacDonVi,
    processResults: response => ({ results: response && response.page ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDmBacDonVi(ma, item => done && done({ id: item.ma, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.ma, text: response.ten }),
};