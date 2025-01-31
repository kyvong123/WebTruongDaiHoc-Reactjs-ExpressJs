import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDmHinhThucKyLuatGetPage = 'SvDmHinhThucKyLuat:GetPage';

export default function svDmHinhThucKyLuatReducer(state = null, data) {
    switch (data.type) {
        case SvDmHinhThucKyLuatGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmHinhThucKyLuatPage', true);
export function getSvDmHinhThucKyLuatPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmHinhThucKyLuatPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/dm-hinh-thuc-ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SvDmHinhThucKyLuatGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách danh mục hình thức bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createSvDmHinhThucKyLuat(dmHinhThucKyLuat, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-hinh-thuc-ky-luat';
        T.post(url, { dmHinhThucKyLuat }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một danh mục hình thức bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một danh mục hình thức thành công!', 'success');
                dispatch(getSvDmHinhThucKyLuatPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một danh mục nơi nhận bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateSvDmHinhThucKyLuat(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-hinh-thuc-ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu danh mục hình thức thành công!', 'success');
                done && done(data.item);
                dispatch(getSvDmHinhThucKyLuatPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục hình thức bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSvDmHinhThucKyLuat(id, done) {
    return () => {
        const url = `/api/ctsv/dm-hinh-thuc-ky-luat/item/${id}`;
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

export function getAllSvDmHinhThucKyLuat(done) {
    return () => {
        const url = '/api/ctsv/dm-hinh-thuc-ky-luat/all';
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, (error) => T.notify('Lấy dữ liệu danh mục hình thức bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteSvDmHinhThucKyLuat(id, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-hinh-thuc-ky-luat/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục hình thức bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa danh mục hình thức thành công!', 'success', false, 800);
                dispatch(getSvDmHinhThucKyLuatPage());
            }
            done && done();
        }, () => T.notify('Xóa danh mục nơi nhận bị lỗi!', 'danger'));
    };
}

//  USER ---------------------------------------------------------

export const SelectAdapter_DmHinhThucKyLuat = {
    ajax: true,
    url: '/api/ctsv/dm-hinh-thuc-ky-luat/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.ten}`, chuyenTinhTrang: item.chuyenTinhTrang, canThoiGian: item.canThoiGian })) : [] }),
    fetchOne: (id, done) => (getSvDmHinhThucKyLuat(id, item => done && done({ id: item.id, text: item.ten, chuyenTinhTrang: item.chuyenTinhTrang, canThoiGian: item.canThoiGian })))()
};