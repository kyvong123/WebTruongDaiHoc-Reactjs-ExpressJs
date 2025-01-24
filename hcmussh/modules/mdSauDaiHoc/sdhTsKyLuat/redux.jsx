import T from 'view/js/common';
const SdhTsKyLuatGetPage = 'SdhTsKyLuat:Page';
const SdhTsVangGetPage = 'SdhTsVang:Page';


export default function SdhTsKyLuatReducer(state = null, data) {
    switch (data.type) {
        case SdhTsKyLuatGetPage:
            return Object.assign({}, state, { pageKyLuat: data.page });
        case SdhTsVangGetPage:
            return Object.assign({}, state, { pageVang: data.page });
        default:
            return state;
    }
}

export const PageVang = 'pageSdhDanhSachVangPage';
export const PageKyLuat = 'pageSdhDanhSachKyLuatPage';

T.initPage(PageVang);
T.initPage(PageKyLuat);

export function getSdhDanhSachKyLuatPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    let page = '';
    if (filter.vang)
        page = T.updatePage(PageVang, pageNumber, pageSize, pageCondition, filter);
    if (filter.kyLuat)
        page = T.updatePage(PageKyLuat, pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        const url = `/api/sdh/ts/ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lỗi lấy dữ liệu' + (data.error.message ? (':<br>' + data.error.message) : ''), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (filter.vang)
                    dispatch({ type: SdhTsVangGetPage, page: data.page });
                if (filter.kyLuat)
                    dispatch({ type: SdhTsKyLuatGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function updateSdhTsKyLuat(id, data, done) {
    return () => {
        const url = '/api/sdh/ts/ky-luat';
        T.put(url, { id, data }, result => {
            if (result.error) {
                T.notify(`Cập nhật thông tin ${data.type == 'vang' ? 'vắng' : 'kỷ luật'} bị lỗi`, 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify(`Cập nhật thông tin ${data.type == 'vang' ? 'vắng' : 'kỷ luật'} thành công!`, 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin vắng, kỷ luật bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmKyLuat = {
    ajax: true,
    url: '/api/sdh/ts/ky-luat/items',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item?.ma, text: item?.kyLuat })) : [] }),
    fetchOne: (id, done) => (getSdhTsKyLuat(id, item => done && done({ id: item?.ma, text: item?.kyLuat })))()
};

export function getSdhTsKyLuat(ma, done) {
    return () => {
        const url = `/api/sdh/ts/ky-luat/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin kỷ luật của thí sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
