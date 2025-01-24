import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtCauHinhDotXetTotNghiepGetAll = 'dtCauHinhDotXetTotNghiep:GetAll';
const DtCauHinhDotXetTotNghiepGetPage = 'dtCauHinhDotXetTotNghiep:GetPage';
const DtCauHinhDotXetTotNghiepUpdate = 'dtCauHinhDotXetTotNghiep:Update';

export default function DtCauHinhDotXetTotNghiepReducer(state = null, data) {
    switch (data.type) {
        case DtCauHinhDotXetTotNghiepGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtCauHinhDotXetTotNghiepGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtCauHinhDotXetTotNghiepUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtCauHinhDotXetTotNghiepAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-xet-tot-nghiep/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt xét tốt nghiệp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.data);
                dispatch({ type: DtCauHinhDotXetTotNghiepGetAll, items: data.data ? data.data : [] });
            }
        });
    };
}

T.initPage('pageDtCauHinhDotXetTotNghiep');
export function getDtCauHinhDotXetTotNghiepPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtCauHinhDotXetTotNghiep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/cau-hinh-dot-xet-tot-nghiep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt xét tốt nghiệp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtCauHinhDotXetTotNghiepGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDtCauHinhDotXetTotNghiep(item, done) {
    const cookie = T.updatePage('pageDtCauHinhDotXetTotNghiep');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-xet-tot-nghiep';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo cấu hình đợt xét tốt nghiệp bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo cấu hình đợt xét tốt nghiệp thành công!', 'success');
                dispatch(getDtCauHinhDotXetTotNghiepPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done(data);
        });
    };
}

export function deleteDtCauHinhDotXetTotNghiep(id, done) {
    const cookie = T.updatePage('pageDtCauHinhDotXetTotNghiep');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-xet-tot-nghiep';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cấu hình đợt xét tốt nghiệp bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Cấu hình đợt xét tốt nghiệp đã xóa thành công!', 'success', false, 800);
                dispatch(getDtCauHinhDotXetTotNghiepPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done();
        }, () => T.notify('Xóa Cấu hình đợt xét tốt nghiệp bị lỗi!', 'danger'));
    };
}

export function updateDtCauHinhDotXetTotNghiep(id, changes, done) {
    const cookie = T.updatePage('pageDtCauHinhDotXetTotNghiep');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-xet-tot-nghiep';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin cấu hình đợt xét tốt nghiệp bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật thông tin cấu hình đợt xét tốt nghiệp thành công!', 'success');
                dispatch(getDtCauHinhDotXetTotNghiepPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình đợt xét tốt nghiệp bị lỗi!', 'danger'));
    };
}

export function changeDtCauHinhDotXetTotNghiep(item) {
    return { type: DtCauHinhDotXetTotNghiepUpdate, item };
}

export function getDtCauHinhDotXetTotNghiep(id, done) {
    return () => {
        const url = `/api/dt/cau-hinh-dot-xet-tot-nghiep/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin cấu hình đợt xét tốt nghiệp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.data);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function setUpDtDotXetTotNghiep(data, done) {
    return () => {
        const url = '/api/dt/cau-hinh-dot-xet-tot-nghiep/setup';
        T.get(url, { data }, result => {
            if (result.error) {
                T.notify('Cấu hình xét tốt nghiệp cho sinh viên bị lỗi ' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(`GET: ${url}. `, result.error.message || result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getListSinhVien(ma, done) {
    return () => {
        const url = '/api/dt/cau-hinh-dot-xet-tot-nghiep/get-list-sinh-vien';
        T.get(url, { ma }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi ' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error(`GET: ${url}. `, result.error.message || result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export const SelectAdapter_DotXetTotNghiep = (filter) => ({
    ajax: true,
    url: '/api/dt/cau-hinh-dot-xet-tot-nghiep/page/1/20',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDtCauHinhDotXetTotNghiep(id, item => done && done({ id: item.id, text: item.ten })))()
});

export const SelectAdapter_DotXetTotNghiepAll = ({
    ajax: true,
    url: '/api/dt/cau-hinh-dot-xet-tot-nghiep/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.data ? response.data.map(item => ({ id: item.id, text: `NH${item.namHoc} HK${item.hocKy}: ${item.ten} (${T.dateToText(item.ngayBatDau, 'dd/mm/yyyy')} - ${T.dateToText(item.ngayKetThuc, 'dd/mm/yyyy')})`, data: item })) : [] }),
    fetchOne: (id, done) => (getDtCauHinhDotXetTotNghiep(id, item => done && done({ id: item.id, text: `NH${item.namHoc} HK${item.hocKy}: ${item.ten} (${T.dateToText(item.ngayBatDau, 'dd/mm/yyyy')} - ${T.dateToText(item.ngayKetThuc, 'dd/mm/yyyy')})`, data: item })))()
});