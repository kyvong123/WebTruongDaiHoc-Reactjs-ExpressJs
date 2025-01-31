import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const svManageQuyetDinhGetAll = 'svManageQuyetDinh:GetAll';
const svManageQuyetDinhGetPage = 'svManageQuyetDinh:GetPage';
export default function svManageQuyetDinhReducer(state = null, data) {
    switch (data.type) {
        case svManageQuyetDinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case svManageQuyetDinhGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getSvManageQuyetDinhAll(done) {
    return dispatch => {
        const url = '/api/ctsv/quyet-dinh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: svManageQuyetDinhGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách quyết định bị lỗi!', 'danger'));
    };
}

T.initPage('svManageQuyetDinhPage');
export function getSvManageQuyetDinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('svManageQuyetDinhPage', pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/ctsv/quyet-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: svManageQuyetDinhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách quyết định bị lỗi!', 'danger'));
    };
}

export function updateSvManageQuyetDinh(id, changes, done) {
    return () => {
        const url = '/api/ctsv/quyet-dinh';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin quyết định bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
                T.notify('Cập nhật thông tin quyết định thành công!', 'success');
            }
        }, () => T.notify('Cập nhật thông tin quyết định bị lỗi!', 'danger'));
    };
}

export function createSvManageQuyetDinh(svManageQuyetDinh, done) {
    return () => {
        const url = '/api/ctsv/quyet-dinh';
        T.post(url, { svManageQuyetDinh }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới quyết định thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Tạo mới quyết định bị lỗi!', 'danger'));
    };
}

export function deleteSvManageQuyetDinh(id, soQuyetDinh) {
    return () => {
        const url = '/api/ctsv/quyet-dinh';
        T.delete(url, { id, soQuyetDinh }, data => {
            if (data.error) {
                T.notify('Xóa quyết định bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa quyết định thành công!', 'success', false, 800);
            }
        }, () => T.notify('Xóa quyết định bị lỗi!', 'danger'));
    };
}

export function svCheckSoQuyetDinh(soQuyetDinh, done) {
    return () => {
        const url = `/api/ctsv/quyet-dinh/check/${soQuyetDinh}`;
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                done && done(data);
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Số quyết định hợp lệ', 'success');
                done && done({});
            }
        }, () => T.notify('Số quyết định đã tồn tại!', 'danger'));
    };
}

export function huyQuyetDinh(id, changes, done) {
    return () => {
        const url = '/api/ctsv/quyet-dinh/huy';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Hủy quyết định bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Hủy quyết định thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin quyết định bị lỗi!', 'danger'));
    };
}

export function downloadWord(id, done) {
    return () => {
        const url = `/api/ctsv/quyet-dinh/download/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

export function getSo(id, done) {
    return () => {
        const url = `/api/hcth/so-dang-ky/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy số bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getSoQuyetDinhRaCuoi(student, done) {
    return () => {
        const url = '/api/ctsv/quyet-dinh/so-quyet-dinh-ra';
        T.get(url, { condition: { student } }, data => {
            if (data.error) {
                T.notify('Lấy số quyết định ra bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getCtdt(maCtdt, done) {
    return () => {
        const url = '/api/ctsv/chuong-trinh-dao-tao/';
        T.get(url, { maCtdt }, data => {
            if (data.error) {
                T.notify('Lấy chương trình đào tạo ra bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_SoQuyetDinh = (student) => ({
    ajax: true,
    url: '/api/ctsv/quyet-dinh/so-quyet-dinh-ra',
    data: () => ({ condition: { student } }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.soCongVan })) : [] }),
    fetchOne: (id, done) => (getSo(id, item => done && done({ id: item.id, text: item.soCongVan })))()
});