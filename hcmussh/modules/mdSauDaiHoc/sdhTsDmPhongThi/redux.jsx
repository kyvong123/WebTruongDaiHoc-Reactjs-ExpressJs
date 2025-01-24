import T from 'view/js/common';
const SdhTsPhongThiGetPage = 'SdhTsPhongThi:GetPage';
const SdhTsPhongThiThiSinh = 'SdhTsPhongThi:ThiSinh';

export default function SdhTsPhongThiReducer(state = null, data) {
    switch (data.type) {
        case SdhTsPhongThiGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhTsPhongThiThiSinh:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function createSdhTsDmPhongThi(data, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/phong-thi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới lịch thi bị lỗi', 'danger');
                console.error('POST: ' + url + '.', result.error);
            } else {
                T.notify('Tạo mới lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachPhongThiPage(undefined, undefined, '', filter));
                done && done(result.item);
            }
        });
    };
}
export function updateSdhTsDmPhongThi(id, data, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/phong-thi';
        T.put(url, { id, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Chỉnh sửa lịch thi bị lỗi', 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Chỉnh sửa lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachPhongThiPage(undefined, undefined, '', filter));
                done && done(result.item);
            }
        });
    };
}
export function deleteSdhTsDmPhongThi(id, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/phong-thi';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa lịch thi bị lỗi', 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Xóa lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachPhongThiPage(undefined, undefined, '', filter));
                done && done();
            }
        });
    };
}
export function deleteSdhTsDmPhongThiMultiple(listId, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/phong-thi/multiple';
        T.delete(url, { listId }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa lịch thi bị lỗi', 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Xóa các lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachPhongThiPage(undefined, undefined, '', filter));
                done && done();
            }
        });
    };
}
export function getSdhTsDmPhongThiById(idPhongThi, done) {
    return () => {
        const url = `/api/sdh/ts-info/phong-thi/item/:${idPhongThi}`;
        T.get(url, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin phòng thi bị lỗi', 'danger');
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export const PageName = 'pageSdhDanhSachPhongThi';
T.initPage(PageName);
export function getSdhDanhSachPhongThiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts-info/phong-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch thi tuyển sinh không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsPhongThiGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
