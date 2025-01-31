import T from 'view/js/common';

const TccbCapMaCanBoGetPage = 'TccbCapMaCanBo:GetPage';

export default function tccbCapMaCanBoReducer(state = null, data) {
    switch (data.type) {
        case TccbCapMaCanBoGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const PageName = 'pageTccbCapMaCanBo';
T.initPage(PageName);

export function getTccbCapMaCanBoPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/tccb/ma-so-can-bo/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấp mã cán bộ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TccbCapMaCanBoGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách cấp mã cán bộ lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function checkExist(data, done) {
    return () => {
        const url = '/api/tccb/ma-so-can-bo/check-exist';
        T.get(url, { data }, res => {
            if (res.error) {
                T.notify('Kiểm tra thông tin cán bộ bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.result);
            }
        }, (error) => T.notify('Kiểm tra thông tin cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createCapMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/ma-so-can-bo/create';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo yêu cầu cấp mã cán bộ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTccbCapMaCanBoPage());
            }
        }, (error) => T.notify('Tạo yêu cầu cấp mã cán bộ lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function acceptCapMa(data, done) {
    return dispatch => {
        const url = '/api/tccb/ma-so-can-bo/accept';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Cấp mã cán bộ bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                done && done();
                dispatch(getTccbCapMaCanBoPage());
            }
        }, (error) => T.notify('Cấp mã cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function rejectCapMa(id, ghiChu, done) {
    return dispatch => {
        const url = '/api/tccb/ma-so-can-bo/reject';
        T.post(url, { id, ghiChu }, data => {
            if (data.error) {
                T.notify('Hủy yêu cầu cấp mã cán bộ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTccbCapMaCanBoPage());
            }
        }, (error) => T.notify('Hủy yêu cầu cấp mã cán bộ lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function huyMscb(id, ghiChu, done) {
    return dispatch => {
        const url = '/api/tccb/ma-so-can-bo/delete';
        T.post(url, { id, ghiChu }, data => {
            if (data.error) {
                T.notify('Hủy mã cán bộ lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getTccbCapMaCanBoPage());
            }
        }, (error) => T.notify('Hủy mã cán bộ lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTccbLoaiCanBo(ma, done) {
    return () => {
        const url = `/api/tccb/loai-can-bo/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_TccbLoaiCanBo =
{
    ajax: true,
    url: '/api/tccb/loai-can-bo/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.item ? response.item.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getTccbLoaiCanBo(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};

export function getTccbCanBo(id, done) {
    return () => {
        const url = `/api/tccb/ma-so-can-bo/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin mã số cán bộ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_TccbCanBo =
{
    ajax: true,
    url: '/api/tccb/ma-so-can-bo/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.item ? response.item.map(item => ({ id: item.mscb, text: `${item.mscb}: ${`${item.ho} ${item.ten}`.trim().normalizedName()}` })) : []
    }),
    fetchOne: (id, done) => (getTccbCanBo(id, item => done && done({ id: item.mscb, text: `${item.mscb}: ${`${item.ho} ${item.ten}`.trim().normalizedName()}` })))(),
};