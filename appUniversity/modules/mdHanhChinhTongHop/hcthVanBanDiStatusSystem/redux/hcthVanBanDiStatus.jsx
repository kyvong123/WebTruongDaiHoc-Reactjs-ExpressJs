import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthVanBanDiStatusGetPage = 'HcthVanBanDiStatus:GetPage';

export default function reducer(state = null, data) {
    switch (data.type) {
        case HcthVanBanDiStatusGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('HcthVanBanDiStatus', true);
export function getPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('HcthVanBanDiStatus', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/van-ban-di-status/page/${page.pageNumber}/${page.pageSize}`;
        dispatch({ type: HcthVanBanDiStatusGetPage, page: null });
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trạng thái văn bản đi lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: HcthVanBanDiStatusGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách trạng thái văn bản đi lỗi', 'danger'));
    };
}


export function get(ma, done) {
    return () => {
        const url = `/api/hcth/van-ban-di-status/item/${ma}`;
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
        const url = '/api/hcth/van-ban-di-status';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo trạng thái văn bản đi bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới trạng thái văn bản đi thành công!', 'success');
                dispatch(getPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo trạng thái văn bản đi bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function update(ma, changes, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/van-ban-di-status/item/${ma}`;
        T.put(url, { changes }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật trạng thái văn bản đi bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật trạng thái văn bản đi thành công!', 'success');
                done && done(data.item);
                dispatch(getPage());
            }
        }, (error) => T.notify('Cập nhật trạng thái văn bản đi bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTrangThaiVanBanDi(ma, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/van-ban-di-status/${ma}`;
        T.delete(url, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Xóa trạng thái văn bản đi bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa trạng thái văn bản đi thành công!', 'success', false, 800);
                dispatch(getPage());
            }
            done && done();
        }, () => T.notify('Xóa trạng thái văn bản đi bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_HcthVanBanDiStatus = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/hcth/van-ban-di-status/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (get(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};