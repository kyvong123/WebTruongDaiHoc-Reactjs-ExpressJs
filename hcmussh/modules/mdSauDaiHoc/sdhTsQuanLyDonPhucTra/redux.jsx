import T from 'view/js/common';
const SdhTsDonPhucTraGetPage = 'SdhTsDonPhucTra:GetPage';

export default function SdhTsDonPhucTraReducer(state = null, data) {
    switch (data.type) {
        case SdhTsDonPhucTraGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const PageName = 'pageSdhTsDonPhucTra';
T.initPage(PageName);
export function getSdhTsDonPhucTraPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts/quan-ly-don-phuc-tra/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đơn phúc tra không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsDonPhucTraGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function updateSdhTsDonPhucTra(changes, filter, done) {
    return dispatch => {
        const url = '/api/sdh/ts/quan-ly-don-phuc-tra';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify(result.error, 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Cập nhật tình trạng đơn thành công!', 'success');
                dispatch(getSdhTsDonPhucTraPage(undefined, undefined, '', filter));
                done && done();
            }
        }, () => T.notify('Cập nhật tình trạng đơn bị lỗi!', 'danger'));
    };
}