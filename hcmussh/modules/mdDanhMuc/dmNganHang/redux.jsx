import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmNganHangGetAll = 'DmNganHang:GetAll';
const DmNganHangGetPage = 'DmNganHang:GetPage';

export default function DmNganHangReducer(state = null, data) {
    switch (data.type) {
        case DmNganHangGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmNganHangGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmNganHang');
export function getDmNganHangPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmNganHang', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/ngan-hang-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách Ngân hàng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmNganHangGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách Ngân hàng bị lỗi!', 'danger'));
    };
}

export function getDmNganHangAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/ngan-hang-sinh-vien/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách Ngân hàng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmNganHangGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách Ngân hàng bị lỗi!', 'danger'));
    };
}

export function getDmNganHang(ma, done) {
    return () => {
        const url = `/api/danh-muc/ngan-hang-sinh-vien/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin Ngân hàng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmNganHang(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngan-hang-sinh-vien';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo Ngân hàng bị lỗi! ' + data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error.message);
            } else {
                T.notify('Tạo Ngân hàng thành công!', 'success');
                dispatch(getDmNganHangPage());
                done && done(data);
            }
        }, () => T.notify('Tạo Ngân hàng bị lỗi!', 'danger'));
    };
}

export function deleteDmNganHang(ma) {
    return dispatch => {
        const url = '/api/danh-muc/ngan-hang-sinh-vien';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục Ngân hàng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error.message);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmNganHangPage());
            }
        }, () => T.notify('Xóa Ngân hàng bị lỗi!', 'danger'));
    };
}

export function updateDmNganHang(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngan-hang-sinh-vien';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin Ngân hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin Ngân hàng thành công!', 'success');
                done && done(data.item);
                dispatch(getDmNganHangPage());
            }
        }, () => T.notify('Cập nhật thông tin Ngân hàng bị lỗi!', 'danger'));
    };
}

export function createMultipleThongTinNganHangSinhVien(data, done) {
    return dispatch => {
        const url = '/api/danh-muc/ngan-hang-sinh-vien/multiple';
        T.post(url, data, (res) => {
            if (res.error) {
                T.notify('Lưu danh sách thông tin ngân hàng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error.message);
                done && done(res.error);
            } else {
                T.notify('Lưu danh sách thông tin ngân hàng thành công!', 'success');
                done && done(res.item);
                dispatch(getDmNganHangPage());
            }
        });
    };
}

export const SelectAdapter_DmNganHang = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/danh-muc/ngan-hang-sinh-vien/page/1/20',
    processResults: data => ({ results: data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.ma, text: item.ten + ' (' + item.ma + ')' })) : [] }),
    fetchOne: (ma, done) => (getDmNganHang(ma, item => item && done && done({ id: item.ma, text: item.ten + ' (' + item.ma + ')' })))(),
};