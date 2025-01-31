import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TmdtDiaChiGetPage = 'TmdtSellerDiaChi:GetPage';

export default function TmdtSellerDiaChiReducer(state = null, data) {
    if (data.type == TmdtDiaChiGetPage) {
        return Object.assign({}, state, { page: data.page });
    } else {
        return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageTmdtDiaChi');

export function getTmdtDiaChiPage(maDaiLy, pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtDiaChi', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/seller/dia-chi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter: page.filter, maDaiLy }, data => {
            if (data.error) {
                T.notify('Lấy danh sách địa chỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TmdtDiaChiGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách địa chỉ bị lỗi!', 'danger'));
    };
}

export function getDiaChi(id, done) {
    return () => {
        const url = `/api/tmdt/y-shop/seller/dia-chi/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy địa chỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDiaChi(maDaiLy, item, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/dia-chi';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Thêm địa chỉ bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Thêm địa chỉ thành công!', 'success');
                dispatch(getTmdtDiaChiPage(maDaiLy));
                done && done(data);
            }
        }, () => T.notify('Tạo voucher bị lỗi!', 'danger'));
    };
}

export function deleteDiaChi(maDaiLy, id) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/dia-chi';
        T.delete(url, { id: id }, data => {
            if (data.error) {
                T.notify('Xóa địa chỉ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Địa chỉ đã xóa thành công!', 'success', false, 800);
                dispatch(getTmdtDiaChiPage(maDaiLy));
            }
        }, () => T.notify('Xóa địa chỉ bị lỗi!', 'danger'));
    };
}

export function updateDiaChi(maDaiLy, id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/seller/dia-chi';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật địa chỉ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật địa chỉ thành công!', 'success');
                dispatch(getTmdtDiaChiPage(maDaiLy));
                done && done();
            }
        }, () => T.notify('Cập nhật địa chỉ bị lỗi!', 'danger'));
    };
}

// Select địa chỉ
export const SelectAdapter_TmdtSellerDiaChi = {
    ajax: true,
    url: '/api/tmdt/y-shop/seller/dia-chi/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.id, text: item.address
        })) : []
    }),
    fetchOne: (id, done) => {
        (getDiaChi(id, (item) => {
            const { id, address } = item;
            done && done({ id, text: address });
        }))();
    },
};