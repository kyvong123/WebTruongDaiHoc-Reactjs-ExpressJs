import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmChuDeGetPage = 'DmChuDe:GetPage';

export default function DmChuDeReducer(state = null, data) {
    switch (data.type) {
        case DmChuDeGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmChuDe');

export function getDmChuDePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDmChuDe', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tt/lien-he/danh-muc/chu-de-chat/qa/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chủ đề bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmChuDeGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chủ đề bị lỗi!', 'danger'));
    };
}

export function getDmChuDe(id, done) {
    return () => {
        const url = `/api/tt/lien-he/danh-muc/chu-de-chat/qa/item/${id}`;
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

export function createDmChuDe(item, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/qa';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo chủ đề bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới chủ đề thành công!', 'success');
                dispatch(getDmChuDePage());
                done && done(data);
            }
        }, () => T.notify('Tạo chủ đề bị lỗi!', 'danger'));
    };
}

export function deleteDmChuDe(id) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/qa';
        T.delete(url, { id: id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục chủ đề bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDmChuDePage());
            }
        }, () => T.notify('Xóa chủ đề bị lỗi!', 'danger'));
    };
}

export function updateDmChuDe(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/danh-muc/chu-de-chat/qa';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật chủ đề bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật chủ đề thành công!', 'success');
                dispatch(getDmChuDePage());
                done && done();
            }
        }, () => T.notify('Cập nhật chủ đề bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmChuDe_ByDoiTuong = {
    ajax: true,
    url: '/api/tt/lien-he/danh-muc/chu-de-chat/qa/doi-tuong/page/1/50',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmChuDe(id, item => done && done({ id: item.id, text: item.ten })))()
};

export const SelectAdapter_DmChuDeBlackbox_ByDoiTuong = {
    ajax: true,
    url: '/api/tt/lien-he/danh-muc/chu-de-chat/qa/doi-tuong/page/1/50',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmChuDe(id, item => done && done({ id: item.id, text: item.ten })))()
};