import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CtsvKhenThuongGetAll = 'CtsvKhenThuong:GetAll';
const CtsvKhenThuongGetPage = 'CtsvKhenThuong:GetPage';
const CtsvKhenThuongSetNull = 'CtsvKhenThuong:SetNull';

export default function ctsvKhenThuongReducer(state = null, data) {
    switch (data.type) {
        case CtsvKhenThuongSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case CtsvKhenThuongGetAll:
            return Object.assign({}, state, { items: data.items });
        case CtsvKhenThuongGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export function getAllCtsvKhenThuong(done) {
    return dispatch => {
        const url = '/api/ctsv/khen-thuong/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: CtsvKhenThuongGetAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

T.initPage('pageCtsvKhenThuong');
export function getPageCtsvKhenThuong(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageCtsvKhenThuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/khen-thuong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition: page.pageCondition, filter: page.filter }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: CtsvKhenThuongGetPage, page: data.page });
                done && done();
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

T.initPage('pageCtsvKhenThuongGroup');
export function getPageCtsvKhenThuongGroup(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageCtsvKhenThuongGroup', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/khen-thuong/group/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: CtsvKhenThuongGetPage, page: data.page });
                done && done();
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}

export function getCtsvKhenThuong(id, done) {
    return () => {
        const url = '/api/ctsv/khen-thuong/item';
        T.get(url, { id }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        }, () => T.notify('Lấy khen thưởng bị lỗi!', 'danger'));
    };
}

export function createCtsvKhenThuong(data, done) {
    return dispatch => {
        const url = '/api/ctsv/khen-thuong';
        T.post(url, { data }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo khen thưởng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo khen thưởng thành công!', 'success');
                done && done(data.item);
                dispatch(getPageCtsvKhenThuong());
            }
        }, () => T.notify('Tạo khen thưởng bị lỗi!', 'danger'));
    };
}

export function updateCtsvKhenThuong(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/khen-thuong';
        T.put(url, { id, changes }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật khen thưởng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật khen thưởng thành công!', 'success');
                done && done(data.item);
                dispatch(getPageCtsvKhenThuong());
            }
        }, () => T.notify('Cập nhật khen thưởng bị lỗi!', 'danger'));
    };
}

export function deleteCtsvKhenThuong(id, done) {
    return dispatch => {
        const url = '/api/ctsv/khen-thuong';
        T.delete(url, { id }, (data) => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa khen thưởng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa khen thưởng thành công!', 'success');
                done && done();
                dispatch(getPageCtsvKhenThuong());
            }
        }, () => T.notify('Xóa khen thưởng bị lỗi!', 'danger'));
    };
}