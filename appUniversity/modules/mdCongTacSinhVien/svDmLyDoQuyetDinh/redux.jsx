import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDmLyDoQuyetDinhGetPage = 'SvDmLyDoQuyetDinh:GetPage';

export default function svDmLyDoQuyetDinhReducer(state = null, data) {
    switch (data.type) {
        case SvDmLyDoQuyetDinhGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmLyDoQuyetDinhPage', true);
export function getSvDmLyDoQuyetDinhPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmLyDoQuyetDinhPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/dm-ly-do-quyet-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục lý do bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SvDmLyDoQuyetDinhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách danh mục lý do bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createSvDmLyDoQuyetDinh(dmLyDoQuyetDinh, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-ly-do-quyet-dinh';
        T.post(url, { dmLyDoQuyetDinh }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một danh mục lý do bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một danh mục lý do thành công!', 'success');
                dispatch(getSvDmLyDoQuyetDinhPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một danh mục nơi nhận bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateSvDmLyDoQuyetDinh(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-ly-do-quyet-dinh';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu danh mục lý do bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu danh mục lý do thành công!', 'success');
                done && done(data.item);
                dispatch(getSvDmLyDoQuyetDinhPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục lý do bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSvDmLyDoQuyetDinh(id, done) {
    return () => {
        const url = `/api/ctsv/dm-ly-do-quyet-dinh/item/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu danh mục lý do bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục lý do bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteSvDmLyDoQuyetDinh(id, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-ly-do-quyet-dinh/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục lý do bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa danh mục lý do thành công!', 'success', false, 800);
                dispatch(getSvDmLyDoQuyetDinhPage());
            }
            done && done();
        }, () => T.notify('Xóa danh mục nơi nhận bị lỗi!', 'danger'));
    };
}

//  USER ---------------------------------------------------------

export const SelectAdapter_DmLyDoQuyetDinh = {
    ajax: true,
    url: '/api/ctsv/dm-ly-do-quyet-dinh/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.ten}` })) : [] }),
    fetchOne: (id, done) => (getSvDmLyDoQuyetDinh(id, item => done && done({ id: item.id, text: item.ten})))()
};

export const SelectAdapter_DmLyDoLoaiQuyetDinh = (loaiQuyetDinh) => ({
    ajax: true,
    url: '/api/ctsv/dm-ly-do-quyet-dinh/loai-quyet-dinh/all',
    data: params => ({ condition: params.term, loaiQuyetDinh }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.ten}` })) : [] }),
    fetchOne: (id, done) => (getSvDmLyDoQuyetDinh(id, item => done && done({ id: item.id, text: item.ten})))()
});