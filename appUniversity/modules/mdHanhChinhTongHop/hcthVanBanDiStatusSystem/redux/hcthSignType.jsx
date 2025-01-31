import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthSignTypeGetPage = 'hcthSignType:GetPage';
const HcthSignTypeGetAll = 'hcthSignType:GetAll';

export default function reducer(state = null, data) {
    switch (data.type) {
        case HcthSignTypeGetAll:
            return Object.assign({}, state, { items: data.items });
        case HcthSignTypeGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('hcthSignType', true);
export function getPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('hcthSignType', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/loai-chu-ky/page/${page.pageNumber}/${page.pageSize}`;
        dispatch({ type: HcthSignTypeGetPage, page: null });
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại ký lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: HcthSignTypeGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách loại ký lỗi', 'danger'));
    };
}

export function getAll(done) {
    return dispatch => {
        const url = '/api/hcth/loai-chu-ky/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách loại ký lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: HcthSignTypeGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách loại ký lỗi', 'danger'));
    };
}


export function get(ma, done) {
    return () => {
        const url = `/api/hcth/loai-chu-ky/item/${ma}`;
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
        const url = '/api/hcth/loai-chu-ky';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo loại ký bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới loại ký thành công!', 'success');
                dispatch(getPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo loại ký bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function update(ma, changes, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/loai-chu-ky/item/${ma}`;
        T.put(url, { changes }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật loại ký bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật loại ký thành công!', 'success');
                done && done(data.item);
                dispatch(getPage());
            }
        }, (error) => T.notify('Cập nhật loại ký bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteSignType(ma, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/loai-chu-ky/${ma}`;
        T.delete(url, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Xóa loại chữ ký bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa loại chữ ký thành công!', 'success', false, 800);
                dispatch(getPage());
            }
            done && done();
        }, () => T.notify('Xóa loại chữ ký bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_HcthSignType = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/hcth/loai-chu-ky/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (get(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};