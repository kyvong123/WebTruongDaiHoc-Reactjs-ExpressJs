import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNhomDonViGetAll = 'DmNhomDonVi:GetAll';
const DmNhomDonViGetPage = 'DmNhomDonVi:GetPage';

export default function DmNhomDonViReducer(state = null, data) {
    switch (data.type) {
        case DmNhomDonViGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNhomDonViGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmNhomDonVi');
export function getDmNhomDonViPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNhomDonVi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/nhom-don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm đơn vị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmNhomDonViGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách nhóm đơn vị bị lỗi!', 'danger'));
    };
}

export function createDmNhomDonVi(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/nhom-don-vi';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify('Tạo nhóm đơn vị bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin nhóm đơn vị thành công!', 'success');
                dispatch(getDmNhomDonViPage());
                done && done(data);
            }
        }, () => T.notify('Tạo nhóm đơn vị bị lỗi!', 'danger'));
    };
}

export function deleteDmNhomDonVi(id) {
    return dispatch => {
        const url = '/api/danh-muc/nhom-don-vi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục nhóm đơn vị bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNhomDonViPage());
            }
        }, () => T.notify('Xóa nhóm đơn vị bị lỗi!', 'danger'));
    };
}

export function deleteDmNhomDonViItem(id, maDonVi) {
    return dispatch => {
        const url = '/api/danh-muc/nhom-don-vi/item';
        T.delete(url, { id, maDonVi }, data => {
            if (data.error) {
                T.notify('Xóa danh mục nhóm đơn vị bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNhomDonViPage());
            }
        }, () => T.notify('Xóa nhóm đơn vị bị lỗi!', 'danger'));
    };
}

export function updateDmNhomDonVi(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/nhom-don-vi';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin nhóm đơn vị bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin nhóm đơn vị thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNhomDonViPage());
            }
        }, () => T.notify('Cập nhật thông tin nhóm đơn vị bị lỗi!', 'danger'));
    };
}


export function updateDmNhomDonViKichHoat(id, kichHoat, done, onFinish, onError) {
    return dispatch => {
        const url = '/api/danh-muc/nhom-don-vi/kich-hoat';
        T.put(url, { id, kichHoat }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật thông tin nhóm đơn vị bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
                onError && onError();
            } else {
                T.notify('Cập nhật thông tin nhóm đơn vị thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNhomDonViPage());
            }
        }, () => T.notify('Cập nhật thông tin nhóm đơn vị bị lỗi!', 'danger') || (onError && onError()));
    };
}

export function getDmNhomDonVi(id, done, onFinish, onError,) {
    return () => {
        const url = '/api/danh-muc/nhom-don-vi/item/' + id;
        T.get(url, res => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Lấy thông tin nhóm đơn vị bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
                done && done(res.error);
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Lấy thông tin nhóm đơn vị bị lỗi!', 'danger') || (onError && onError()));
    };
}

export const SelectAdapter_DmNhomDonVi = {
    ajax: true,
    url: '/api/danh-muc/nhom-don-vi/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => {
        return ({ results: response ? (response.page.list.map(item => ({ id: item.id, text: item.ten }))) : [] });
    },
    fetchOne: (id, done) => (getDmNhomDonVi(id, item => done && done({ id: item.id, text: item.ten })))(),
};
