import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmFontGetAll = 'DmFont:GetAll';
const DmFontGetPage = 'DmFont:GetPage';

export default function DmFontReducer(state = null, data) {
    switch (data.type) {
        case DmFontGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmFontGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageDmFont';
T.initPage(PageName);
export function getDmFontPage(pageNumber, pageSize, pageCondition, done) {
    console.log(pageNumber, pageSize);
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/font/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách font chữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmFontGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách font chữ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmFontAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/font/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách font chữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmFontGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách font chữ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmFont(id, done) {
    return () => {
        const url = `/api/danh-muc/font/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin font chữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmFont(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/font';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Thêm font chữ mới thành công!', 'success');
                dispatch(getDmFontPage());
                done && done(data);
            }
        }, (error) => T.notify('Thêm font chữ mới lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmFont(id) {
    return dispatch => {
        const url = '/api/danh-muc/font';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa font chữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xoá font chữ thành công!', 'success', false, 800);
                dispatch(getDmFontPage());
            }
        }, (error) => T.notify('Xóa font chữ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmFont(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/font';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật font chữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật font chữ thành công!', 'success');
                done && done(data.item);
                dispatch(getDmFontPage());
            }
        }, (error) => T.notify('Cập nhật font chữ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmDonFont = {
    ajax: true,
    url: '/api/danh-muc/font/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmFont(id, (item) => done && done({ id: item.id, text: item.ten })))()
};
