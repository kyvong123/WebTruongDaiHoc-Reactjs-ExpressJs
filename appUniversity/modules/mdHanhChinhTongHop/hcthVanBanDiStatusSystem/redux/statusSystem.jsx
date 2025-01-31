import T from 'view/js/common';
import { get as getDetail } from './statusSystemDetail';
// Reducer ------------------------------------------------------------------------------------------------------------
const hcthVanBanDiStatusSystemGetPage = 'hcthVanBanDiStatusSystem:GetPage';
const hcthVanBanDiStatusSystemGetItem = 'hcthVanBanDiStatusSystem:GetItem';

export default function reducer(state = null, data) {
    switch (data.type) {
        case hcthVanBanDiStatusSystemGetPage:
            return Object.assign({}, state, { page: data.page });
        case hcthVanBanDiStatusSystemGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('hcthVanBanDiStatusSystemPage', true);
export function getPage(pageNumber, pageSize, filter, pageCondition, done) {
    const page = T.updatePage('hcthVanBanDiStatusSystemPage', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/trang-thai-van-ban-di/page/${page.pageNumber}/${page.pageSize}`;
        dispatch({ type: hcthVanBanDiStatusSystemGetPage, page: null });
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hệ thống trạng thái lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: hcthVanBanDiStatusSystemGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hệ thống trạng thái lỗi', 'danger'));
    };
}


export function getSystem(id, done, onFinish) {
    return (dispatch) => {
        const url = `/api/hcth/trang-thai-van-ban-di/item/${id}`;
        dispatch({ type: hcthVanBanDiStatusSystemGetItem, item: null });
        T.get(url, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Lấy thông tin hệ thống trạng thái lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: hcthVanBanDiStatusSystemGetItem, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin hệ thống trạng thái lỗi', 'danger'));
    };
}

export function createSystem(data, done, onFinish) {
    return dispatch => {
        const url = '/api/hcth/trang-thai-van-ban-di';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới hệ thống bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới hệ thống thành công!', 'success');
                dispatch(getPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới hệ thống bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function copySystem(data, done, onFinish) {
    return dispatch => {
        const url = '/api/hcth/trang-thai-van-ban-di/copy';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới hệ thống lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hệ thống thành công!', 'success');
                dispatch(getPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo hệ thống lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateSystem(ma, changes, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/trang-thai-van-ban-di/item/${ma}`;
        T.put(url, changes, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật dữ liệu hệ thống trạng thái bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu hệ thống trạng thái thành công!', 'success');
                done && done(data.item);
                dispatch(getPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu hệ thống trạng thái bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteSystem(id, done) {
    return () => {
        const url = '/api/hcth/trang-thai-van-ban-di';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa hệ thống trạng thái bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa hệ thống trạng thái thành công!', 'success', false, 800);
                done && done();
            }
            done && done();
        }, () => T.notify('Xóa hệ thống trạng thái bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_HcthVanBanDiStatusSystem = (donVi, capVanBan, isPhysical, isConverted) => ({
    ajax: true,
    data: params => ({ condition: params.term, filter: { donVi: donVi.toString(), capVanBan, isPhysical: Number(isPhysical) || null, isConverted: Number(isConverted) || null } }),
    url: '/api/hcth/trang-thai-van-ban-di/page/1/20',
    processResults: response => ({ results: response?.page?.list ? response.page.list.map(item => ({ id: item.id, text: item.tenQuyTrinh })) : [] }),
    fetchOne: (id, done) => (getSystem(id, item => item && done && done({ id: item.id, text: item.tenQuyTrinh })))(() => { }),
});

export const SelectAdapter_HcthVanBanDiStatusSystemCtsv = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/hcth/trang-thai-van-ban-di/ctsv/qd',
    fetchOne: (id, done) => (getDetail(id, item => item && done && done({ id: item.id, text: item.tenTrangThai })))(() => { }),
    processResults: response => ({ results: response?.item?.details?.filter(i => i.toId)?.map(i => ({ id: i.id, text: `${i.tenTrangThai} -> ${i.toTenTrangThai}`, data: i })) || [] }),
    // fetchOne: (id, done) => (getSystem(id, item => item && done && done({ id: item.id, text: item.tenQuyTrinh })))(() => { }),
};

