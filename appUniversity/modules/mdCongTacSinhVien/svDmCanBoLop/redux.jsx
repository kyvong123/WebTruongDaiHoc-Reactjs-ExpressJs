import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDmCanBoLopGetPage = 'SvDmCanBoLop:GetPage';

export default function svDmCanBoLopReducer(state = null, data) {
    switch (data.type) {
        case SvDmCanBoLopGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmCanBoLopPage', true);
export function getSvDmCanBoLopPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmCanBoLopPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/dm-can-bo-lop/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SvDmCanBoLopGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách danh mục hình thức bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createSvDmCanBoLop(dmCanBoLop, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-can-bo-lop';
        T.post(url, { dmCanBoLop }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một danh mục hình thức bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một danh mục hình thức thành công!', 'success');
                dispatch(getSvDmCanBoLopPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một danh mục nơi nhận bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateSvDmCanBoLop(ma, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-can-bo-lop';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu danh mục hình thức thành công!', 'success');
                done && done(data.item);
                dispatch(getSvDmCanBoLopPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục hình thức bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSvDmCanBoLop(ma, done) {
    return () => {
        const url = `/api/ctsv/dm-can-bo-lop/item/${ma}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục hình thức bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteSvDmCanBoLop(ma, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-can-bo-lop/delete';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa danh mục hình thức thành công!', 'success', false, 800);
                dispatch(getSvDmCanBoLopPage());
            }
            done && done();
        }, () => T.notify('Xóa danh mục nơi nhận bị lỗi!', 'danger'));
    };
}

//  USER ---------------------------------------------------------

export const SelectAdapter_DmCanBoLop = (doiTuong) => ({
    ajax: true,
    url: '/api/ctsv/dm-can-bo-lop/all',
    data: params => ({ condition: params.term, doiTuong }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten}`, doiTuong: item.doiTuong, soLuong: item.soLuong })) : [] }),
    fetchOne: (id, done) => (getSvDmCanBoLop(id, item => done && done({ id: item.ma, text: `${item.ten}`, doiTuong: item.doiTuong, soLuong: item.soLuong })))()
});