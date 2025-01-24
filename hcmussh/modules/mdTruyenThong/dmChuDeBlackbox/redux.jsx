import T from 'view/js/common';
const DmChuDeBlackboxGetPage = 'DmChuDeBlackbox:GetPage';
const DmChuDeBlackboxGetDonViPage = 'DmChuDeBlackbox:GetDonViPage';

export default function DmChuDeBlackboxReducer(state = null, data) {
    switch (data.type) {
        case DmChuDeBlackboxGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmChuDeBlackboxGetDonViPage:
            return Object.assign({}, state, { donViPage: data.page });
        default:
            return state;
    }
}

// Can Bo Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmChuDeBlackboxDonVi');
export function getDmChuDeBlackboxDonViPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmChuDeBlackboxDonVi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chủ đề bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmChuDeBlackboxGetDonViPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chủ đề bị lỗi!', 'danger'));
    };
}

export function createDmChuDeBlackboxDonVi(item, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo chủ đề bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới chủ đề thành công!', 'success');
                dispatch(getDmChuDeBlackboxDonViPage());
                done && done(data);
            }
        }, () => T.notify('Tạo chủ đề bị lỗi!', 'danger'));
    };
}

export function deleteDmChuDeBlackboxDonVi(id, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục chủ đề bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmChuDeBlackboxDonViPage());
                done && done();
            }
        }, () => T.notify('Xóa chủ đề bị lỗi!', 'danger'));
    };
}

export function updateDmChuDeBlackboxDonVi(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật chủ đề bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật chủ đề thành công!', 'success');
                dispatch(getDmChuDeBlackboxDonViPage());
                done && done();
            }
        }, () => T.notify('Cập nhật chủ đề bị lỗi!', 'danger'));
    };
}

// Admin Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmChuDeBlackbox');

export function getDmChuDeBlackboxPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmChuDeBlackbox', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chủ đề bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmChuDeBlackboxGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chủ đề bị lỗi!', 'danger'));
    };
}

export function getDmChuDeBlackbox(id, done) {
    return () => {
        const url = `/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy chủ đề bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmChuDeBlackbox(item, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/blackbox';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo chủ đề bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới chủ đề thành công!', 'success');
                dispatch(getDmChuDeBlackboxPage());
                done && done(data);
            }
        }, () => T.notify('Tạo chủ đề bị lỗi!', 'danger'));
    };
}

export function deleteDmChuDeBlackbox(id, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/blackbox';
        T.delete(url, { id: id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục chủ đề bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmChuDeBlackboxPage());
                done && done();
            }
        }, () => T.notify('Xóa chủ đề bị lỗi!', 'danger'));
    };
}

export function updateDmChuDeBlackbox(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/blackbox';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật chủ đề bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật chủ đề thành công!', 'success');
                dispatch(getDmChuDeBlackboxPage());
                done && done();
            }
        }, () => T.notify('Cập nhật chủ đề bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmChuDeBlackbox_ByDoiTuong = {
    ajax: true,
    url: '/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/doi-tuong/page/1/50',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmChuDeBlackbox(id, item => done && done({ id: item.id, text: item.ten })))()
};