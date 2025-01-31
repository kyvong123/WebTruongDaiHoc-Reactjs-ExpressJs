import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtLopGetPage = 'DtLop:GetPage';
const DtLopGetNull = 'DtLop:GetNull';
const DtLopGetCommonPage = 'DtLop:GetCommonPage';
const DtLopGetDetail = 'DtLop:GetDetail';
const DtLopGetDetailNull = 'DtLop:GetDetailNull';
export default function dtLopReducer(state = null, data) {
    switch (data.type) {
        case DtLopGetNull:
            return Object.assign({}, state, { page: null });
        case DtLopGetDetailNull:
            return Object.assign({}, state, { currentDataLop: null });
        case DtLopGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtLopGetCommonPage:
            return Object.assign({}, state, { commonPage: data.page });
        case DtLopGetDetail:
            return Object.assign({}, state, { currentDataLop: data.currentDataLop });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('DtLopCommonPage');
export function getDtLopCommonPage(pageNumber, pageSize, pageCondition, filter, done) {
    return (dispatch) => {
        dispatch({ type: DtLopGetNull });
        const page = T.updatePage('DtLopCommonPage', pageNumber, pageSize, pageCondition, filter);
        const url = `/api/dt/lop-sinh-vien/common-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DtLopGetCommonPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger'));
    };
}
T.initPage('DtLopPage');
export function getDtLopPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('DtLopPage', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/dt/lop-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.page);
                dispatch({ type: DtLopGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function getDtLopCtdt(filter, done) {
    return () => {
        const url = '/api/dt/lop-sinh-vien/get-ctdt';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
                console.error(`GET: ${url}`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function updateDtLop(maLop, changes, done) {
    return dispatch => {
        const url = '/api/dt/lop-sinh-vien';
        T.put(url, { maLop, changes }, data => {
            if (data.error || changes == null) {
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin lớp sinh viên thành công', 'success');
                done && done(data.item);
                dispatch(getDtLopPage());
            }
        }, () => T.notify('Cập nhật thông tin lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function createDtLop(dtLop, done) {
    return dispatch => {
        const url = '/api/dt/lop-sinh-vien/';
        T.post(url, { dtLop }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới lớp sinh viên thành công', 'success');
                done && done(data.item);
                dispatch(getDtLopPage());
            }
        }, () => T.notify('Tạo mới lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function getDtLop(maLop, done) {
    return () => {
        const url = `/api/dt/lop-sinh-vien/item/${maLop}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
                console.error(`GET: ${url}`, result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export function deleteDtLop(maLop) {
    return dispatch => {
        const url = '/api/dt/lop-sinh-vien';
        T.delete(url, { maLop }, data => {
            if (data.error) {
                T.notify('Xóa lớp sinh viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa lớp sinh viên thành công!', 'success', false, 800);
                dispatch(getDtLopPage());
            }
        }, () => T.notify('Xóa lớp sinh viên bị lỗi!', 'danger'));
    };
}

export function getDtChuyenNganh(ma, done) {
    return () => {
        const url = `/api/dt/danh-sach-chuyen-nganh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chuyên ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDtChuongTrinhDaoTao(maCtdt, done) {
    return () => {
        const url = `/api/dt/lop-sinh-vien/ctdt/item/${maCtdt}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
            }
        });
    };
}

export const SelectAdapter_DtDsChuyenNganhTheoLop = (maNganh = '') => {
    return {
        ajax: true,
        url: `/api/dt/lop-sinh-vien/chuyen-nganh/${maNganh}`,
        data: params => ({ searchTerm: params.term }),
        processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten, maLop: item.maLop })) : [] }),
        fetchOne: (id, done) => (getDtChuyenNganh(id, item => done && done({ id: item?.ma || '', text: item?.ten || '' })))(),
    };
};

export const SelectAdapter_KhungDaoTaoCtsv = (heDaoTao, khoaSinhVien) => {
    return {
        ajax: true,
        url: `/api/dt/lop-sinh-vien/ctdt-all/${heDaoTao}/${khoaSinhVien}`,
        data: params => ({ searchTerm: params.term, condition: { khoaSinhVien } }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maCtdt, text: item.maCtdt + ': ' + JSON.parse(item.tenNganh).vi + ': ' + item.khoaSinhVien })) : [] }),
        fetchOne: (ma, done) => (getDtChuongTrinhDaoTao(ma, item => done && done({ id: item.maCtdt, text: item.maCtdt + ': ' + JSON.parse(item.tenNganh).vi + ': ' + item.khoaSinhVien })))()
    };
};

export function getDtLopData(maLop, done) {
    return (dispatch) => {
        dispatch({ type: DtLopGetDetailNull });
        const url = `/api/dt/lop-sinh-vien/item/danh-sach/${maLop}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin lớp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.item);
                dispatch({ type: DtLopGetDetail, currentDataLop: data.item });
            }
        });
    };
}

export function updateDtLopData(maLop, changes, done) {
    return () => {
        const url = '/api/dt/lop-sinh-vien/item/danh-sach';
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

export function createMultipleDtLop(listNganh, listChuyenNganh, config, done) {
    return () => {
        const url = '/api/dt/lop-sinh-vien/get-multiple';
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


export function createDtLopMultiple(data, done) {
    return () => {
        const url = '/api/dt/lop-sinh-vien/multiple';
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

export function getDtLopFilter(filter, done) {
    return () => {
        const url = '/api/dt/lop-sinh-vien/all';
        T.get(url, { filter, }, result => {
            if (result.error) {
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export const SelectAdapter_DtLopByKhoaSinhVien = (filter) => ({
    ajax: true,
    url: '/api/dt/lop-sinh-vien/page/1/50',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maLop, text: item.tenLop })) : [] }),
    fetchOne: (ma, done) => (getDtLop(ma, item => done && done({ id: item.maLop, text: item.tenLop })))()
});


export const SelectAdapter_DtLopFilter = (filter) => ({
    ajax: true,
    url: '/api/dt/lop-sinh-vien/all',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ma, maCtdt: item.maCtdt })) : [] }),
    fetchOne: (ma, done) => (getDtLop(ma, item => done && done({ id: item.maLop, text: item.maLop })))()
});

export const SelectAdapter_DtLop = (filter) => ({
    ajax: true,
    url: '/api/dt/lop-sinh-vien/filter',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ma })) : [] }),
    fetchOne: (ma, done) => (getDtLop(ma, item => done && done({ id: item.maLop, text: item.maLop })))()
});
