import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CanBoDonViGetAll = 'CanBoDonVi:GetAll';
const CanBoDonViGetPage = 'CanBoDonVi:GetPage';
const CanBoDonViUpdate = 'CanBoDonVi:Update';
const CanBoDonViGet = 'CanBoDonVi:Get';

export default function CanBoDonViReducer(state = null, data) {
    switch (data.type) {
        case CanBoDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case CanBoDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        case CanBoDonViGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case CanBoDonViUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].shcc == updatedItem.shcc) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].shcc == updatedItem.shcc) {
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
T.initPage('pageCanBoDonVi');
export function getCanBoDonViPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageCanBoDonVi', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/tccb/can-bo-don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(
            url,
            { condition: page.pageCondition, filter },
            (data) => {
                if (data.error) {
                    T.notify('Lấy danh sách cán bộ đơn vị bị lỗi', 'danger');
                    console.error(`GET: ${url}.`, data.error);
                } else {
                    if (page.filter) data.page.filter = page.filter;
                    if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                    dispatch({ type: CanBoDonViGetPage, page: data.page });
                    done && done(data.page);
                }
            },
            () => T.notify('Lấy danh sách cán bộ đơn vị bị lỗi', 'danger')
        );
    };
}

export function createCanBoDonVi(data, done) {
    return (dispatch) => {
        const url = '/api/tccb/can-bo-don-vi';
        T.post(
            url,
            { data },
            (res) => {
                if (res.error) {
                    T.notify('Thêm cán bộ đơn vị bị lỗi', 'danger');
                    console.error('POST: ' + url + '. ' + res.error);
                } else {
                    if (done) {
                        T.notify('Thêm cán bộ đơn vị thành công', 'success');
                        dispatch(getCanBoDonViPage());
                        done && done(data);
                    }
                }
            },
            () => T.notify('Thêm cán bộ đơn vị bị lỗi', 'danger')
        );
    };
}

export function getCanBoDonViEdit(shcc, done) {
    return dispatch => {
        let condition = {};
        if (typeof shcc == 'object') condition = shcc;
        else condition = { shcc };
        const url = '/api/tccb/can-bo-don-vi/edit/item';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ đơn vị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: CanBoDonViGet, item: data.item });
                done && done(data);
            }
        }, () => T.notify('Lấy thông tin cán bộ đơn vị bị lỗi', 'danger'));
    };
}

export function updateCanBoDonVi(shcc, changes, done) {
    return dispatch => {
        const url = '/api/tccb/can-bo-don-vi';
        T.put(url, { shcc, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu cán bộ đơn vị bị lỗi1', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin cán bộ đơn vị thành công!', 'success');
                dispatch(getCanBoDonViEdit(data.item.shcc));
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật dữ liệu cán bộ đơn vị bị lỗi2', 'danger'));
    };
}

export function getCanBoDonVi(shcc, done) {
    return () => {
        const url = `/api/tccb/can-bo-don-vi/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ đơn vị bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getCanBoDonViByEmail(email, done) {
    return () => {
        const url = `/api/tccb/can-bo-don-vi/by-email/${email}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export const SelectAdapter_FwCanBoDonVi = {
    ajax: true,
    url: '/api/tccb/can-bo-don-vi/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDau: item.ngayBatDau, data: {
                phai: item.phai,
                ngaySinh: item.ngaySinh,
                hocVi: item.hocVi,
                chucDanh: item.chucDanh,
            }
        })) : []
    }),
    getOne: getCanBoDonVi,
    fetchOne: (shcc, done) => (getCanBoDonVi(shcc, ({ item }) => done && done({ id: item.shcc, text: `${item.shcc}: ${(item.ho + ' ' + item.ten).normalizedName()}`, ngayBatDau: item.ngayBatDau })))(),
    processResultOne: response => response && response.item && ({ value: response.item.shcc, text: `${response.item.shcc}: ${(response.item.ho + ' ' + response.item.ten).normalizedName()}` }),
};