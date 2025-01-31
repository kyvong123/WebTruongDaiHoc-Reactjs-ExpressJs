import T from 'view/js/common';

// Reducer ------------------------------
const DtCanBoNgoaiTruongGet = 'DtCanBoNgoaiTruong:Get';
const DtStaffGetPage = 'dtStaff:GetPage';
export default function DtCBNgoaiTruongReducer(state = null, data) {
    switch (data.type) {
        case DtCanBoNgoaiTruongGet:
            return Object.assign({}, state, { items: data.items });
        case DtStaffGetPage:
            return Object.assign({}, state, { pageCB: data.page });
        default:
            return state;
    }
}

//Actions ------------------------------
export const PageName = 'dtStaffPage';
T.initPage(PageName);
export function getStaffPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, null, filter);
    return dispatch => {
        const url = `/api/dt/staff/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DtStaffGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách cán bộ bị lỗi', 'danger'));
    };
}

export function getDtCBNgoaiTruong(filter, done) {
    return dispatch => {
        const url = '/api/dt/can-bo-ngoai-truong';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy thông tin cán bộ ngoài trường', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtCanBoNgoaiTruongGet, items: result.items });
                if (done) done(result.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDtCanBo(shcc, done) {
    return () => {
        const url = `/api/dt/can-bo/item/${shcc}`;
        T.get(url, {}, result => {
            if (result.error) {
                T.notify('Lỗi lấy thông tin cán bộ', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtCBNgoaiTruong(filter, data, done) {
    return dispatch => {
        const url = '/api/dt/can-bo-ngoai-truong';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo mới thông tin cán bộ bị lỗi', 'danger');
                console.error(data.error);
            } else {
                T.notify('Tạo mới thông tin cán bộ thành công', 'success');
                done && done(data);
                dispatch(getDtCBNgoaiTruong(filter));
            }
        });
    };
}

export function updateDtCBNgoaiTruong(filter, shcc, changes, done) {
    return dispatch => {
        const url = '/api/dt/can-bo-ngoai-truong';
        T.put(url, { shcc, changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thông tin cán bộ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thông tin cán bộ thành công', 'success');
                dispatch(getDtCBNgoaiTruong(filter));
                done && done(result.item);
            }
        }, () => T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger'));
    };
}

export function deleteDtCBNgoaiTruong(filter, shcc) {
    return dispatch => {
        const url = '/api/dt/can-bo-ngoai-truong';
        T.delete(url, { shcc }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Xóa cán bộ bị lỗi', 'error', false, 2000);
                console.error(result.error);
            } else {
                T.alert('Xóa cán bộ thành công!', 'success', false, 800);
                dispatch(getDtCBNgoaiTruong(filter));
            }
        }, () => T.notify('Xóa cán bộ bị lỗi', 'danger'));
    };
}

export const SelectAdapter_CanBoGiamThi = {
    ajax: true,
    url: '/api/dt/can-bo/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.shcc, text: `${item.shcc}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (shcc, done) => (getDtCanBo(shcc, item => item && done && done({ id: item.shcc, text: `${item.shcc}: ${item.ho} ${item.ten}` })))()
};