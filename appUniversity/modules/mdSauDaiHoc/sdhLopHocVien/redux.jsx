import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhLopHocVienGetAll = 'SdhLopHocVien:GetAll';
const SdhLopHocVienGetPage = 'SdhLopHocVien:GetPage';
const SdhLopHocVienUpdate = 'SdhLopHocVien:Update';
const SdhLopHocVienCommonPage = 'SdhLopHocVien:GetCommonPage';
const SdhLopHocVienGetNull = 'SdhLopHocVien:GetNull';
const SdhLopHocVienGetDetail = 'SdhLopHocVien:GetDetail';
export default function SdhLopHocVienReducer(state = null, data) {
    switch (data.type) {
        case SdhLopHocVienGetNull:
            return Object.assign({}, state, { page: null });
        case SdhLopHocVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhLopHocVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhLopHocVienCommonPage:
            return Object.assign({}, state, { commonPage: data.page });
        case SdhLopHocVienGetDetail:
            return Object.assign({}, state, { currentDataLop: data.currentDataLop });
        case SdhLopHocVienUpdate:
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
T.initPage('pageSdhLopHocVien');
export function getSdhLopHocVienPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSdhLopHocVien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lop-hoc-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lớp học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: SdhLopHocVienGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp học viên bị lỗi!', 'danger'));
    };
}

export function getDtLopCommonPage(pageNumber, pageSize, pageCondition, done) {
    return (dispatch) => {
        dispatch({ type: SdhLopHocVienGetNull });
        const page = T.updatePage('sdhLopCommonPage', pageNumber, pageSize, pageCondition);
        const url = `/api/sdh/lop-hoc-vien/common-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SdhLopHocVienCommonPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp học viên bị lỗi!', 'danger'));
    };
}

export function getSdhLopHocVienAll(done) {
    return dispatch => {
        const url = '/api/sdh/lop-hoc-vien/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách lớp học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: SdhLopHocVienGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách lớp học viên bị lỗi!', 'danger'));
    };
}

export function getSdhLopHocVienAllCondition(maCoSo, done) {
    return () => {
        const url = '/api/sdh/lop-hoc-vien/all-condition';
        T.get(url, { maCoSo }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lớp học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách lớp học viên bị lỗi!', 'danger'));
    };
}

export function getSdhLopHocVien(_id, done) {
    return () => {
        const url = `/api/sdh/lop-hoc-vien/detail/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhLopHocVienDsNganh(_id, done) {
    return () => {
        const url = '/api/sdh/lop-hoc-vien/get-danh-sach-nganh';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp học viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function getLopCommonPage(pageNumber, pageSize, pageCondition, done) {
    return (dispatch) => {
        dispatch({ type: SdhLopHocVienGetNull });
        const page = T.updatePage('pageSdhLopHocVien', pageNumber, pageSize, pageCondition);
        const url = `/api/sdh/lop-hoc-vien/common-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SdhLopHocVienCommonPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function createSdhLopHocVien(item, done) {
    return dispatch => {
        const url = '/api/sdh/lop-hoc-vien';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo lớp học viên bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin lớp học viên thành công!', 'success');
                done && done(data.item);
                dispatch(getSdhLopHocVienPage());

            }
        }, () => T.notify('Tạo lớp học viên bị lỗi!', 'danger'));
    };
}

export function deleteSdhLopHocVien(maLop) {
    return dispatch => {
        const url = '/api/sdh/lop-hoc-vien';
        T.delete(url, { maLop }, data => {
            if (data.error) {
                T.notify('Xóa danh mục lớp học viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Khoa đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhLopHocVienPage());
            }
        }, () => T.notify('Xóa lớp học viên bị lỗi!', 'danger'));
    };
}

export function updateSdhLopHocVien(ma, changes, done) {
    return dispatch => {
        const url = '/api/sdh/lop-hoc-vien';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin lớp học viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lớp học viên thành công!', 'success');
                dispatch(getSdhLopHocVienPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin lớp học viên bị lỗi!', 'danger'));
    };
}

export function createSdhLopMultiple(data, idInfoPhanHe, done) {
    return dispatch => {
        const url = '/api/sdh/lop-hoc-vien/multiple';
        T.post(url, { data, idInfoPhanHe }, result => {
            if (result.error) {
                T.notify('Lỗi tạo lớp tự động!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo lớp tự động thành công!', 'success');
                done && done(result);
            }
            dispatch(getDtLopCommonPage(1, 50));
        });
    };
}

export function createMultipleSdhLop(listNganh, config, done) {
    return () => {
        const url = '/api/sdh/lop-hoc-vien/get-multiple';
        T.post(url, { listNganh, config }, result => {
            if (result.error) {
                T.notify('Lỗi tạo lớp tự động!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo lớp tự động thành công!', 'success');
                done && done(result.dataCreate);
            }
        });
    };
}

export function getSdhLopCtdt(filter, done) {
    return () => {
        const url = '/api/sdh/lop-hoc-vien/get-ctdt';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
                console.error(`GET: ${url}`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function getSdhLopData(maLop, done) {
    return (dispatch) => {
        dispatch({ type: SdhLopHocVienGetNull });
        const url = `/api/sdh/lop-hoc-vien/item/danh-sach/${maLop}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                dispatch({ type: SdhLopHocVienGetDetail, currentDataLop: data.item });
            }
        });
    };
}

export function updateSdhLopData(maLop, changes, done) {
    return () => {
        const url = '/api/sdh/lop-hoc-vien/item/danh-sach';
        T.put(url, { maLop, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lớp sinh viên thành công', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function changeSdhLopHocVien(item) {
    return { type: SdhLopHocVienUpdate, item };
}

export const SelectAdapter_SdhLopHocVien = {
    ajax: true,
    url: '/api/sdh/lop-hoc-vien/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ma + ': ' + item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhLopHocVien(ma, item => done && done({ id: item.ma, text: item.ma + ': ' + item.ten })))()
};

export const SelectAdapter_SdhLopHocVienFilter = (filter) => ({
    ajax: true,
    url: '/api/sdh/lop-hoc-vien/page/1/20',
    data: params => ({ condition: params.term, filter }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ma + ': ' + item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhLopHocVien(ma, item => done && done({ id: item.ma, text: item.ma + ': ' + item.ten })))()
});