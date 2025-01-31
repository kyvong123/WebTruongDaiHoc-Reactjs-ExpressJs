import T from 'view/js/common';

const DmLoaiSanPhamGetPage = 'DmLoaiSanPham:GetPage';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function DmLoaiSanPhamReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiSanPhamGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageDmLoaiSanPham';
T.initPage(PageName);
export function getDmLoaiSanPhamPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tmdt/danh-muc/loai-san-pham/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại sản phẩm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmLoaiSanPhamGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại sản phẩm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiSanPhamItem(id, done) {
    return () => {
        const url = `/api/tmdt/danh-muc/loai-san-pham/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại sản phẩm bị lỗi' + (data.error.message || ''), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmLoaiSanPham(item, done) {
    return dispatch => {
        const url = '/api/tmdt/danh-muc/loai-san-pham';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo loại sản phẩm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo thông tin loại sản phẩm thành công!', 'success');
                dispatch(getDmLoaiSanPhamPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo loại sản phẩm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiSanPham(id) {
    return dispatch => {
        const url = '/api/tmdt/danh-muc/loai-san-pham';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại sản phẩm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiSanPhamPage());
            }
        }, (error) => T.notify('Xóa loại sản phẩm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiSanPham(id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/danh-muc/loai-san-pham';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin loại sản phẩm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại sản phẩm thành công!', 'success');
                done && done(data.item);
                dispatch(getDmLoaiSanPhamPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại sản phẩm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

// Search Loai San Pham Adapter ------------------------------------------------------------------------------------------------------------
export const SelectAdapter_LoaiSanPham = {
    ajax: true,
    url: '/api/tmdt/danh-muc/loai-san-pham/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.id, text: item.ten
        })) : []
    }),
    fetchOne: (id, done) => {
        (getDmLoaiSanPhamItem(id, (item) => {
            const { id, ten } = item;
            done && done({ id, text: ten });
        }))();
    },
};