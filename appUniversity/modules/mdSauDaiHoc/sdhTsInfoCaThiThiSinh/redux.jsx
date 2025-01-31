import T from 'view/js/common';
// Reducer ------------------------------
const sdhDsTsCaThiGetAll = 'sdhDsTsCaThi:GetAll';
const sdhDsTsCaThiGetPage = 'sdhDsTsCaThi:GetPage';
const sdhDsTsCaThiGetAddPage = 'sdhDsTsCaThi:GetAddPage';
const sdhDsTsCaThiGetDSTCPage = 'sdhDsTsCaThi:GetDSTCPage';
const sdhDsTsGetDuocXepPage = 'sdhDsTsCaThi:GetDuocXepPage';
export default function sdhDsTsCaThiReducer(state = null, data) {
    switch (data.type) {
        case sdhDsTsCaThiGetAll:
            return Object.assign({}, state, { items: data.items });
        case sdhDsTsCaThiGetPage:
            return Object.assign({}, state, { page: data.page });
        case sdhDsTsCaThiGetAddPage:
            return Object.assign({}, state, { addPage: data.page });
        case sdhDsTsCaThiGetDSTCPage:
            return Object.assign({}, state, { dstcPage: data.page });
        case sdhDsTsGetDuocXepPage:
            return Object.assign({}, state, { dsdxPage: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------
export const PageName = 'pageSdhDsTsCaThi';
export const PageDsdx = 'pageSdhDsTsCaThiDuocXep';
export const PageDstc = 'pageSdhDsTsCaThiTuyChon';
export const PageDsDefault = 'pageSdhDsTsCaThiDefault';



T.initPage(PageName);
T.initPage(PageDsdx);
T.initPage(PageDstc);
T.initPage(PageDsDefault);

export function getSdhDanhSachThiSinhPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi/danh-sach-thi-sinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyển sinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: sdhDsTsCaThiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách tuyển sinh bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}
export function getSdhDanhSachThemThiSinhPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageDsDefault, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi/danh-sach-them/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyển sinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: sdhDsTsCaThiGetAddPage, page: data.page });
                done && done(data.page);
            }
        }, (error) => T.notify('Lấy danh sách tuyển sinh bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}
export function getSdhDanhSachThemThiSinhTuyChonPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageDstc, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi/danh-sach-them-tuy-chon/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyển sinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: sdhDsTsCaThiGetDSTCPage, page: data.page });
                done && done(data.page);
            }
        }, (error) => T.notify('Lấy danh sách tuyển sinh bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}
export function getSdhDsdxPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageDsdx, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi/danh-sach-thi-sinh-duoc-xep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyển sinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: sdhDsTsGetDuocXepPage, page: data.page });
                done && done(data.page);
            }
        }, (error) => T.notify('Lấy danh sách tuyển sinh bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSdhDanhSachThemThiSinhByMonThiPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageDsdx, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi/danh-sach-them/mon-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyển sinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: sdhDsTsCaThiGetAddPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách tuyển sinh bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}


export function deleteThiSinh(sbd, idLichThi, done) {
    return () => {
        const url = '/api/sdh/lich-thi/thi-sinh-du-thi/delete';
        T.delete(url, { sbd, idLichThi }, data => {
            if (data.error) {
                T.notify('Xóa thí sinh không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa thí sinh thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function multiDeleteThiSinh(lst, idLichThi, done) {
    return () => {
        const url = '/api/sdh/lich-thi/thi-sinh-du-thi/multi-delete';
        T.delete(url, { lst, idLichThi }, data => {
            if (data.error) {
                T.notify(`Xóa ${lst.length} thí sinh không thành công!`, 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify(`Xóa ${lst.length} thí sinh thành công!`, 'success');
                done && done(data.item);
            }
        });
    };
}
export function getSdhGetInfoLichThiById(id, done) {
    return () => {
        const url = `/api/sdh/lich-thi/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function sdhUpdateDstc(idLichThi, changes, done) {
    return () => {
        const url = '/api/sdh/lich-thi/danh-sach-thi-sinh/update';
        T.put(url, { idLichThi, changes }, data => {
            if (data.error) {
                T.notify('Thêm thí sinh không thành công!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Thêm thí sinh thành công!', 'success');
                done && done(data.items);
            }
        });
    };
}
//-----------SELECT ADAPTER-----------//



