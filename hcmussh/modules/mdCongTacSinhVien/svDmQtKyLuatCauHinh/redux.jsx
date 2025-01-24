import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDmCauHinhKyLuatGetPage = 'SvDmCauHinhKyLuat:GetPage';

export default function svDmCauHinhKyLuatReducer(state = null, data) {
    switch (data.type) {
        case SvDmCauHinhKyLuatGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmCauHinhKyLuatPage', true);
export function getSvDmCauHinhKyLuatPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmCauHinhKyLuatPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/dm-cau-hinh-ky-luat/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục cấu hình kỷ luật bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SvDmCauHinhKyLuatGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách danh mục cấu hình kỷ luật bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createSvDmCauHinhKyLuat(dmCauHinhKyLuat, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-cau-hinh-ky-luat';
        T.post(url, { dmCauHinhKyLuat }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một danh mục cấu hình kỷ luật bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một danh mục cấu hình kỷ luật thành công!', 'success');
                dispatch(getSvDmCauHinhKyLuatPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một danh mục cấu hình kỷ luật bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateSvDmCauHinhKyLuat(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-cau-hinh-ky-luat';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu danh mục cấu hình kỷ luật bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu danh mục cấu hình kỷ luật thành công!', 'success');
                done && done(data.item);
                dispatch(getSvDmCauHinhKyLuatPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục cấu hình kỷ luật bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSvDmCauHinhKyLuat(id, done) {
    return () => {
        const url = `/api/ctsv/dm-cau-hinh-ky-luat/item/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu danh mục cấu hình kỷ luật bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục cấu hình kỷ luật bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSvDmCauHinhKyLuatDsDieuKien(id, done) {
    return () => {
        const url = '/api/ctsv/dm-cau-hinh-ky-luat/ds-dieu-kien';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điều kiện danh mục cấu hình kỷ luật bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.dsDieuKien);
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục cấu hình kỷ luật bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteSvDmCauHinhKyLuat(id, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-cau-hinh-ky-luat/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục cấu hình kỷ luật bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa danh mục cấu hình kỷ luật thành công!', 'success', false, 800);
                dispatch(getSvDmCauHinhKyLuatPage());
            }
            done && done();
        }, () => T.notify('Xóa danh mục nơi nhận bị lỗi!', 'danger'));
    };
}

//  USER ---------------------------------------------------------

export const SelectAdapter_DmCauHinhKyLuat = {
    ajax: true,
    url: '/api/ctsv/dm-cau-hinh-ky-luat/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.ten}${item.moTa ? ` (${item.moTa})` : ''}` })) : [] }),
    fetchOne: (id, done) => (getSvDmCauHinhKyLuat(id, item => done && done({ id: item.id, text: `${item.ten}${item.moTa ? ` (${item.moTa})` : ''}` })))()
};