import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmHeSoChatLuongGetPage = 'dtDmHeSoChatLuong:GetPage';

export default function dtDmHeSoKhoiLuongReducer(state = null, data) {
    switch (data.type) {
        case DtDmHeSoChatLuongGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDtDmHeSoChatLuong');
export function getDtDmHeSoChatLuongPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDmHeSoChatLuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/he-so-chat-luong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh hệ số khối lượng lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDmHeSoChatLuongGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createHeSoChatLuong(data, done) {
    const cookie = T.updatePage('pageDtDmHeSoChatLuong');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/he-so-chat-luong/create';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo hệ số chất lượng lỗi!', 'danger');
                console.error(`POST: ${url}.`, result.error);
                done && done(result.error);
            } else {
                T.notify('Tạo mới hệ số chất lượng thành công!', 'success');
                dispatch(getDtDmHeSoChatLuongPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Tạo hệ số chất lượng lỗi!', 'danger'));
    };
}

export function deleteHeSoChatLuong(ma, done) {
    const cookie = T.updatePage('pageDtDmHeSoChatLuong');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/he-so-chat-luong/delete';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify(result.error || 'Xóa hệ số chất lượng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, result.error);
                done && done();
            } else {
                T.notify('Xóa hệ số chất lượng thành công!', 'success');
                dispatch(getDtDmHeSoChatLuongPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Xóa hệ số chất lượng bị lỗi!', 'danger'));
    };
}

export function updateHeSoChatLuong(ma, changes, done) {
    const cookie = T.updatePage('pageDtDmHeSoChatLuong');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/he-so-chat-luong/update';
        T.put(url, { ma, changes }, result => {
            if (result.error) {
                T.notify(result.error || 'Cập nhật hệ số chất lượng lỗi!', 'danger');
                console.error(`Upadte: ${url}.`, result.error);
                done && done();
            } else {
                T.notify('Cập nhật hệ số chất lượng thành công!', 'success');
                dispatch(getDtDmHeSoChatLuongPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật hệ số chất lượng bị lỗi!', 'danger'));
    };
}


function getDtHeSoChatLuongItem(ma, done) {
    return () => {
        const url = `/api/dt/he-so-chat-luong/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hệ số chất lượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
const roundToTwo = (num) => {
    return +(Math.round(num + 'e+1') + 'e-1');
};

export const SelectAdapter_HeSoChatLuongAll = (filter) => {
    return {
        ajax: true,
        url: '/api/dt/he-so-chat-luong/page/all',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => ({ results: response && response.items && response.items.map(item => ({ id: item.ma, text: `${roundToTwo(item.heSo)}` })) }),
        // getOne: getDtHeSoChatLuongItem,
        fetchOne: (ma, done) => (getDtHeSoChatLuongItem(ma, item => done && done({ id: item.ma, text: item.heSo })))(),
    };
};
