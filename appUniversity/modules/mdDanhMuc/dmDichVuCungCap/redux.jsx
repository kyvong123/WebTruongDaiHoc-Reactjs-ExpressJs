import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDichVuCungCapGetPage = 'DmDichVuCungCap:GetPage';

export default function DmDichVuCungCapReducer(state = null, data) {
    if (data.type == DmDichVuCungCapGetPage) {
        return Object.assign({}, state, { page: data.page });
    } else {
        return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmDichVuCungCap');

export function getDmDichVuCungCapPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmDichVuCungCap', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/dich-vu-cung-cap/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách dịch vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmDichVuCungCapGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách dịch vụ bị lỗi!', 'danger'));
    };
}

export function getDmDichVuCungCap(id, done) {
    return () => {
        const url = `/api/danh-muc/dich-vu-cung-cap/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin dịch vụ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmDichVuCungCap(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/dich-vu-cung-cap';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo dịch vụ bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin dịch vụ thành công!', 'success');
                dispatch(getDmDichVuCungCapPage());
                done && done(data);
            }
        }, () => T.notify('Tạo dịch vụ bị lỗi!', 'danger'));
    };
}

export function deleteDmDichVuCungCap(ma) {
    return dispatch => {
        const url = '/api/danh-muc/dich-vu-cung-cap';
        T.delete(url, { ma: ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục dịch vụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmDichVuCungCapPage());
            }
        }, () => T.notify('Xóa dịch vụ bị lỗi!', 'danger'));
    };
}

export function updateDmDichVuCungCap(ma, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/dich-vu-cung-cap';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin dịch vụ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin dịch vụ thành công!', 'success');
                dispatch(getDmDichVuCungCapPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin dịch vụ bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmDichVuCungCap = {
    ajax: true,
    url: '/api/danh-muc/dich-vu-cung-cap/page/1/20',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    getOne: getDmDichVuCungCap,
    fetchOne: (id, done) => (getDmDichVuCungCap(id, item => done && done({ id: item.id, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.id, text: response.id + ': ' + response.ten })
};