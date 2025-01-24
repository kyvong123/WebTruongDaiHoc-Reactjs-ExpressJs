import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChungChiGetPage = 'DmChungChi:GetPage';
export default function dmChungChiChuKyReducer(state = null, data) {
    switch (data.type) {
        case DmChungChiGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
const pageName = 'pageDmChungChiChuKy';
T.initPage(pageName);

export function getDmChungChiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(pageName, pageNumber, pageSize, pageCondition, done);
    return dispatch => {
        const url = `/api/danh-muc/chung-chi-chu-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: DmChungChiGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateDmChungChi(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/chung-chi-chu-ky';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin chứng chỉ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chứng chỉ thành công!', 'success');
                dispatch(getDmChungChiPage());
                done && done();
            }
        }, error => console.error(`PUT: ${url}.`, error));
    };
}

export function createDmChungChi(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/chung-chi-chu-ky';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo mới chứng chỉ thất bại', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới chứng chỉ thành công', 'success');
                dispatch(getDmChungChiPage());
                done && done();
            }
        }, error => console.error(`POST: ${url}.`, error));
    };
}

export function getDmChungChi(id, done) {
    return () => {
        const url = `/api/danh-muc/chung-chi-chu-ky/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin chứng chỉ bị lỗi' + (data.error.message || ''), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteDmChungChi(id, done) {
    return dispatch => {
        const url = '/api/danh-muc/chung-chi-chu-ky';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá chứng chỉ bị lỗi', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xoá chứng chỉ thành công!', 'success');
                dispatch(getDmChungChiPage());
                done && done();
            }
        }, error => console.error(`DELETE: ${url}.`, error));
    };
}

export const SelectAdapter_ChungChiChuKy = {
    ajax: true,
    url: '/api/danh-muc/chung-chi-chu-ky/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => {
        return (
            { results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }
        );
    },
    fetchOne: (id, done) => (getDmChungChi(id, item => item && done && done({ id: item.id, text: item.ten })))()
};