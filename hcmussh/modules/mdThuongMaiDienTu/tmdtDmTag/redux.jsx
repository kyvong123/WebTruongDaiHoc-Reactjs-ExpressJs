import T from 'view/js/common';

const DmTagGetPage = 'DmTag:GetPage';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function DmTagReducer(state = null, data) {
    switch (data.type) {
        case DmTagGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageDmTag';
T.initPage(PageName);
export function getDmTagPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tmdt/danh-muc/tag/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy tag sản phẩm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmTagGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy tag sản phẩm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmTagItem(id, done) {
    return () => {
        const url = `/api/tmdt/danh-muc/tag/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin tag bị lỗi' + (data.error.message || ''), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTag(item, done) {
    return dispatch => {
        const url = '/api/tmdt/danh-muc/tag';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo tag bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin tag thành công!', 'success');
                dispatch(getDmTagPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo tag bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmTag(id) {
    return dispatch => {
        const url = '/api/tmdt/danh-muc/tag';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục tag bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmTagPage());
            }
        }, (error) => T.notify('Xóa tag bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmTag(id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/danh-muc/tag';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin tag bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tag thành công!', 'success');
                done && done(data.item);
                dispatch(getDmTagPage());
            }
        }, (error) => T.notify('Cập nhật thông tin tag bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

// Search Loai San Pham Adapter ------------------------------------------------------------------------------------------------------------
export const SelectAdapter_DmTmdtTag = {
    ajax: true,
    url: '/api/tmdt/danh-muc/tag/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.id, text: item.ten
        })) : []
    }),
    fetchOne: (id, done) => {
        (getDmTagItem(id, (item) => {
            const { id, ten } = item;
            done && done({ id, text: ten });
        }))();
    },
};