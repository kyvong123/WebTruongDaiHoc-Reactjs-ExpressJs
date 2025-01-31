import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CtsvLopGetPage = 'CtsvLop:GetPage';
const CtsvLopGetNull = 'CtsvLop:GetNull';
const CtsvLopGetCommonPage = 'CtsvLop:GetCommonPage';
const CtsvLopGetDetail = 'CtsvLop:GetDetail';
const CtsvLopGetDetailNull = 'CtsvLop:GetDetailNull';

export default function ctsvLopReducer(state = null, data) {
    switch (data.type) {
        case CtsvLopGetNull:
            return Object.assign({}, state, { page: null });
        case CtsvLopGetDetailNull:
            return Object.assign({}, state, { currentDataLop: null });
        case CtsvLopGetPage:
            return Object.assign({}, state, { page: data.page });
        case CtsvLopGetCommonPage:
            return Object.assign({}, state, { commonPage: data.page });
        case CtsvLopGetDetail:
            return Object.assign({}, state, { currentDataLop: data.currentDataLop });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getCtsvLopCommonPage(pageNumber, pageSize, pageCondition, filter, done) {
    return (dispatch) => {
        dispatch({ type: CtsvLopGetNull });
        const page = T.updatePage('CtsvLopCommonPage', pageNumber, pageSize, pageCondition);
        const url = `/api/ctsv/lop-sinh-vien/common-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CtsvLopGetCommonPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger'));
    };
}
T.initPage('CtsvLopPage');
export function getCtsvLopPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = undefined;
    }
    const page = T.updatePage('CtsvLopPage', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/ctsv/lop-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: CtsvLopGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function updateCtsvLop(maLop, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/lop-sinh-vien';
        T.put(url, { maLop, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lớp sinh viên thành công', 'success');
                done && done(data.item);
                dispatch(getCtsvLopPage());
            }
        }, () => T.notify('Cập nhật thông tin lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function createCtsvLop(ctsvLop, done) {
    return dispatch => {
        const url = '/api/ctsv/lop-sinh-vien/';
        T.post(url, { ctsvLop }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới lớp sinh viên thành công', 'success');
                done && done(data.item);
                dispatch(getCtsvLopPage());
            }
        }, () => T.notify('Tạo mới lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function deleteCtsvLop(maLop) {
    return dispatch => {
        const url = '/api/ctsv/lop-sinh-vien';
        T.delete(url, { maLop }, data => {
            if (data.error) {
                T.notify('Xóa lớp sinh viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa lớp sinh viên thành công!', 'success', false, 800);
                dispatch(getCtsvLopPage());
            }
        }, () => T.notify('Xóa lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function getCtsvLop(maLop, done) {
    return () => {
        const url = `/api/ctsv/lop-sinh-vien/item/${maLop}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export function getCtsvLopData(maLop, done) {
    return (dispatch) => {
        dispatch({ type: CtsvLopGetDetailNull });
        const url = `/api/ctsv/lop-sinh-vien/item/danh-sach/${maLop}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                dispatch({ type: CtsvLopGetDetail, currentDataLop: data.item });
            }
        });
    };
}

export function updateCtsvLopData(maLop, changes, done) {
    return () => {
        const url = '/api/ctsv/lop-sinh-vien/item/danh-sach';
        T.put(url, { maLop, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lớp sinh viên thành công', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function createMultipleCtsvLop(listNganh, listChuyenNganh, config, done) {
    return () => {
        const url = '/api/ctsv/lop-sinh-vien/get-multiple';
        T.post(url, { listNganh, listChuyenNganh, config }, result => {
            if (result.error) {
                T.notify('Lỗi tạo lớp tự động!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo lớp tự động thành công!', 'success');
                done && done(result.dataCreate);
            }
        });
    };
}


export function createCtsvLopMultiple(data, done) {
    return () => {
        const url = '/api/ctsv/lop-sinh-vien/multiple';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo lớp tự động!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo lớp tự động thành công!', 'success');
                done && done(result.dataCreate);
            }
        });
    };
}

export function createCtsvDtLopBanCanSu(changes, done) {
    return (dispatch) => {
        const url = '/api/ctsv/quan-ly-lop/ban-can-su';
        T.post(url, { changes }, data => {
            if (data.error || changes == null) {
                console.error(`POST: ${url}.`, data.error);
                T.notify(data.error.message || 'Cập nhật thông tin ban cán sự không thành công', 'danger');
                done && done(data.error);
            } else {
                T.notify('Thêm ban cán sự lớp thành công', 'success');
                dispatch(getCtsvLopData(changes.maLop));
                done && done();
            }
        }, () => T.notify('Thêm ban cán sự lớp bị lỗi!', 'danger'));
    };
}

export function updateCtsvDtLopBanCanSu(id, changes, done) {
    return (dispatch) => {
        const url = '/api/ctsv/quan-ly-lop/ban-can-su';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                T.notify(data.error.message || 'Cập nhật thông tin ban cán sự không thành công', 'danger');
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ban cán sự thành công', 'success');
                dispatch(getCtsvLopData(changes.maLop));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin ban cán sự bị lỗi!', 'danger'));
    };
}

export function deleteCtsvDtLopBanCanSu(id, userId, maLop, maChucVu, done) {
    return (dispatch) => {
        const url = '/api/ctsv/quan-ly-lop/ban-can-su';
        T.delete(url, { id, userId, maLop, maChucVu }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Xóa ban cán sự thành công', 'success');
                dispatch(getCtsvLopData(maLop));
                done && done();
            }
        }, () => T.notify('Xóa ban cán sự bị lỗi!', 'danger'));
    };
}

export const getAllCtsvLopCtdt = (maCtdt, done) => {
    const url = `/api/ctsv/danh-sach-lop/ctdt/${maCtdt}`;
    T.get(url, data => {
        if (data.error) {
            T.notify('Lấy danh sách lớp bị lỗi!', 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            done && done(data);
        }
    }, () => T.notify('Lấy danh sách lớp bị lỗi!', 'danger'));
};

export const SelectAdapter_DtLopCtdt = (maCtdt) => {
    return {
        ajax: true,
        url: `/api/ctsv/danh-sach-lop/ctdt/${maCtdt}`,
        data: params => ({ searchTerm: params.term }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.maLop + ': ' + item.tenLop, nienKhoa: item.nienKhoa })) : [] }),
        fetchAll: (done) => getAllCtsvLopCtdt(maCtdt, response => done(response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.maLop + ': ' + item.tenLop, nienKhoa: item.nienKhoa })) : [])),
        fetchOne: (ma, done) => (getCtsvLop(ma, item => done && done({ id: item?.maLop, text: item?.maLop + ': ' + item?.tenLop, nienKhoa: item?.nienKhoa })))()
    };
};

export const SelectAdapter_DtLopFilter = (loaiHinhDaoTao = '', khoaSinhVien = '') => {
    return {
        ajax: true,
        url: '/api/ctsv/lop-sinh-vien/filter',
        data: params => ({ searchTerm: params.term, filter: { loaiHinhDaoTao, khoaSinhVien } }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.maLop + ': ' + item.tenLop })) : [] }),
        fetchOne: (ma, done) => (getCtsvLop(ma, item => done && done({ id: item.maLop, text: item.maLop + ': ' + item.tenLop })))()
    };
};

export const SelectAdapter_DtLopAdvancedFilter = (filter) => {
    return {
        ajax: true,
        url: '/api/ctsv/lop-sinh-vien/advanced-filter',
        data: params => ({ searchTerm: params.term, filter }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ma + ': ' + item.ten })) : [] }),
        fetchOne: (ma, done) => (getCtsvLop(ma, item => done && done({ id: item.maLop, text: item.maLop + ': ' + item.tenLop })))()
    };
};

export function getAllCtsvLopFilter(filter, done) {
    const url = '/api/ctsv/danh-sach-lop/filter';
    T.get(url, { filter }, data => {
        if (data.error) {
            T.notify('Lấy danh sách lớp bị lỗi!', 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            done && done(data);
        }
    }, () => T.notify('Lấy danh sách lớp bị lỗi!', 'danger'));
}

export const SelectAdapter_DtLopFilterQuyetDinh = (maNganh, maChuyenNganh, heDaoTao, khoaSinhVien) => {
    return {
        ajax: true,
        url: '/api/ctsv/danh-sach-lop/filter',
        data: params => ({ searchTerm: params.term, filter: { maNganh, maChuyenNganh, heDaoTao, khoaSinhVien } }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.maLop + ': ' + item.tenLop })) : [] }),
        fetchAll: (done) => getAllCtsvLopFilter({ maNganh, maChuyenNganh, heDaoTao, khoaSinhVien }, (response) => done(response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.maLop + ': ' + item.tenLop, maCtdt: item.maCtdt })) : [])),
        fetchOne: (ma, done) => (getCtsvLop(ma, item => done && done({ id: item.maLop, text: item.maLop + ': ' + item.tenLop })))()
    };
};