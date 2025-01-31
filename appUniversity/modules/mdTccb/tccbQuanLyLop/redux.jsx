import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbLopGetPage = 'TccbLop:GetPage';
const TccbLopGetNull = 'TccbLop:GetNull';
const TccbLopGetCommonPage = 'TccbLop:GetCommonPage';
const TccbLopGetDetail = 'TccbLop:GetDetail';
const TccbLopGetDetailNull = 'TccbLop:GetDetailNull';

export default function TccbLopReducer(state = null, data) {
    switch (data.type) {
        case TccbLopGetNull:
            return Object.assign({}, state, { page: null });
        case TccbLopGetDetailNull:
            return Object.assign({}, state, { currentDataLop: null });
        case TccbLopGetPage:
            return Object.assign({}, state, { page: data.page });
        case TccbLopGetCommonPage:
            return Object.assign({}, state, { commonPage: data.page });
        case TccbLopGetDetail:
            return Object.assign({}, state, { currentDataLop: data.currentDataLop });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getTccbLopCommonPage(pageNumber, pageSize, pageCondition, filter, done) {
    return (dispatch) => {
        dispatch({ type: TccbLopGetNull });
        const page = T.updatePage('TccbLopCommonPage', pageNumber, pageSize, pageCondition);
        const url = `/api/tccb/lop-sinh-vien/common-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: TccbLopGetCommonPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger'));
    };
}
T.initPage('TccbLopPage');
export function getTccbLopPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('TccbLopPage', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/tccb/lop-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: TccbLopGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function updateTccbLop(maLop, changes, done) {
    return dispatch => {
        const url = '/api/tccb/lop-sinh-vien';
        T.put(url, { maLop, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lớp sinh viên thành công', 'success');
                done && done(data.item);
                dispatch(getTccbLopPage());
            }
        }, () => T.notify('Cập nhật thông tin lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function createTccbLop(TccbLop, done) {
    return dispatch => {
        const url = '/api/tccb/lop-sinh-vien/';
        T.post(url, { TccbLop }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới lớp sinh viên thành công', 'success');
                done && done(data.item);
                dispatch(getTccbLopPage());
            }
        }, () => T.notify('Tạo mới lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function deleteTccbLop(maLop) {
    return dispatch => {
        const url = '/api/tccb/lop-sinh-vien';
        T.delete(url, { maLop }, data => {
            if (data.error) {
                T.notify('Xóa lớp sinh viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa lớp sinh viên thành công!', 'success', false, 800);
                dispatch(getTccbLopPage());
            }
        }, () => T.notify('Xóa lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function getTccbLop(maLop, done) {
    return () => {
        const url = `/api/tccb/lop-sinh-vien/item/${maLop}`;
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

export function getTccbLopData(maLop, done) {
    return (dispatch) => {
        dispatch({ type: TccbLopGetDetailNull });
        const url = `/api/tccb/lop-sinh-vien/item/danh-sach/${maLop}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                dispatch({ type: TccbLopGetDetail, currentDataLop: data.item });
            }
        });
    };
}

export function updateTccbLopData(maLop, changes, done) {
    return () => {
        const url = '/api/tccb/lop-sinh-vien/item/danh-sach';
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

export function createMultipleTccbLop(listNganh, listChuyenNganh, config, done) {
    return () => {
        const url = '/api/tccb/lop-sinh-vien/get-multiple';
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


export function createTccbLopMultiple(data, done) {
    return () => {
        const url = '/api/tccb/lop-sinh-vien/multiple';
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

export function createTccbDtLopBanCanSu(changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/quan-ly-lop/ban-can-su';
        T.post(url, { changes }, data => {
            if (data.error || changes == null) {
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Thêm ban cán sự lớp thành công', 'success');
                dispatch(getTccbLopData(changes.maLop));
                done && done();
            }
        }, () => T.notify('Thêm ban cán sự lớp bị lỗi!', 'danger'));
    };
}

export function updateTccbDtLopBanCanSu(id, changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/quan-ly-lop/ban-can-su';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ban cán sự thành công', 'success');
                dispatch(getTccbLopData(changes.maLop));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin ban cán sự bị lỗi!', 'danger'));
    };
}

export function deleteTccbDtLopBanCanSu(id, userId, maLop, maChucVu, done) {
    return (dispatch) => {
        const url = '/api/tccb/quan-ly-lop/ban-can-su';
        T.delete(url, { id, userId, maLop, maChucVu }, data => {
            if (data.error) {
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Xóa ban cán sự thành công', 'success');
                dispatch(getTccbLopData(maLop));
                done && done();
            }
        }, () => T.notify('Xóa ban cán sự bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DtLopCtdt = (maCtdt) => {
    return {
        ajax: true,
        url: `/api/tccb/danh-sach-lop/${maCtdt}`,
        data: params => ({ searchTerm: params.term }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.maLop + ': ' + item.tenLop, nienKhoa: item.nienKhoa })) : [] }),
        fetchOne: (ma, done) => (getTccbLop(ma, item => done && done({ id: item.maLop, text: item.maLop + ': ' + item.tenLop, nienKhoa: item.nienKhoa })))()
    };
};

export const SelectAdapter_DtLopFilter = (loaiHinhDaoTao = '', khoaSinhVien = '') => {
    return {
        ajax: true,
        url: '/api/tccb/lop-sinh-vien/filter',
        data: params => ({ searchTerm: params.term, filter: { loaiHinhDaoTao, khoaSinhVien } }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.maLop + ': ' + item.tenLop })) : [] }),
        fetchOne: (ma, done) => (getTccbLop(ma, item => done && done({ id: item.maLop, text: item.maLop + ': ' + item.tenLop })))()
    };
};