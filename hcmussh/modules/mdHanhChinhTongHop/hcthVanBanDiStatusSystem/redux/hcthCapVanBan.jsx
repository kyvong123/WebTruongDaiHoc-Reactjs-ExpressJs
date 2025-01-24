import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const hcthCapVanBanGetPage = 'hcthCapVanBan:GetPage';

export default function reducer(state = null, data) {
    switch (data.type) {
        case hcthCapVanBanGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('hcthCapVanBan', true);
export function getPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('hcthCapVanBan', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/cap-van-ban/page/${page.pageNumber}/${page.pageSize}`;
        dispatch({ type: hcthCapVanBanGetPage, page: null });
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấp văn bản lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: hcthCapVanBanGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách cấp văn bản lỗi', 'danger'));
    };
}


export function get(ma, done) {
    return () => {
        const url = `/api/hcth/cap-van-ban/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông đối tượng lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin đối tượng lỗi', 'danger'));
    };
}

export function create(data, done, onFinish) {
    return dispatch => {
        const url = '/api/hcth/cap-van-ban';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo cấp văn bản bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới cấp văn bản thành công!', 'success');
                dispatch(getPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo cấp văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function update(ma, changes, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/cap-van-ban/item/${ma}`;
        T.put(url, { changes }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật cấp văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật cấp văn bản thành công!', 'success');
                done && done(data.item);
                dispatch(getPage());
            }
        }, (error) => T.notify('Cập nhật cấp văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteCapVanBan(ma, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/cap-van-ban/${ma}`;
        T.delete(url, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Xóa cấp văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa cấp văn bản thành công!', 'success', false, 800);
                dispatch(getPage());
            }
            done && done();
        }, () => T.notify('Xóa cấp văn bản bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_HcthCapVanBan = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/hcth/cap-van-ban/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (get(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};