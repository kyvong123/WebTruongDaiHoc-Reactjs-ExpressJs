import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTheTieuChiGetPage = 'DmTheTieuChi:GetPage';

export default function dmTheTieuChiReducer(state = null, data) {
    switch (data.type) {
        case DmTheTieuChiGetPage:
            return Object.assign({}, state, { pageNumber: data.pageNumber, pageSize: data.pageSize, pageTotal: data.pageTotal, totalItem: data.totalItem, pageCondition: data.pageCondition, page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmTheTieuChi', true);
export function getDmTheTieuChiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmTheTieuChi', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/danh-muc-the-tieu-chi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, response => {
            if (response.error) {
                T.notify('Lấy danh sách thẻ tiêu chí bị lỗi ' + (response.error.message && (':<br>' + response.error.message)), 'danger');
                console.error(`GET: ${url}.`, response.error);
            } else {
                if (page.pageCondition) response.page.pageCondition = page.pageCondition;
                done && done(response.page);
                // T.notify(response.response, response.status);
                dispatch({ type: DmTheTieuChiGetPage, pageNumber: response.pageNumber, pageSize: response.pageSize, pageTotal: response.pageTotal, totalItem: response.totalItem, pageCondition, page: response.page });
            }
        }, (error) => T.notify('Lấy danh sách thẻ tiêu chí bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmTheTieuChi(ma, done) {
    return () => {
        const url = '/api/ctsv/danh-muc-the-tieu-chi/item/';
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin thẻ tiêu chí bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDmTheTieuChi(ma, ten, ghiChu, done) {
    return dispatch => {
        const url = '/api/ctsv/danh-muc-the-tieu-chi/';
        T.post(url, { ma, ten, ghiChu }, response => {
            if (response.error) {
                T.notify('Tạo thẻ tiêu chí bị lỗi ', 'danger');
                console.error(`GET: ${url}.`, response.error);
            } else {
                T.notify(response.response, response.status);
                dispatch(getDmTheTieuChiPage(null, null, null, done));
            }
        });
    };
}

export function updateDmTheTieuChi(ma, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/danh-muc-the-tieu-chi/';
        T.put(url, { ma, changes }, response => {
            if (response.error) {
                T.notify('Cập nhật thẻ tiêu chí bị lỗi ', 'danger');
                console.error(`GET: ${url}.`, response.error);
            } else {
                T.notify(response.response, response.status);
                dispatch(getDmTheTieuChiPage(null, null, null, done));
            }
        });
    };
}

export function deleteDmTheTieuChi(ma, done) {
    return dispatch => {
        const url = '/api/ctsv/danh-muc-the-tieu-chi/';
        T.delete(url, { ma }, response => {
            if (response.error) {
                T.notify('Xóa thẻ tiêu chí bị lỗi ', 'danger');
                console.error(`GET: ${url}.`, response.error);
            } else {
                T.notify(response.response, response.status);
                dispatch(getDmTheTieuChiPage(null, null, null, done));
            }
        });
    };
}

export const SelectAdapter_DmTheTieuChi = ({
    ajax: true,
    url: '/api/ctsv/danh-muc-the-tieu-chi/get-all',
    data: params => ({ searchTerm: params.term }),
    processResults: res => ({ results: res && res.items ? res.items.map(item => ({ id: item.ma, text: item.ten + ' (' + item.ma + ')' })) : [] }),
    fetchOne: (ma, done) => (getDmTheTieuChi(ma, item => done && done({ id: item?.ma, text: item?.ten + ' (' + item?.ma + ')' })))()
});