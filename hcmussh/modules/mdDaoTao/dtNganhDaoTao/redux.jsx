import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtNganhDaoTaoGetAll = 'DtNganhDaoTao:GetAll';
const DtNganhDaoTaoGetPage = 'DtNganhDaoTao:GetPage';
const DtNganhDaoTaoUpdate = 'DtNganhDaoTao:Update';

export default function DtNganhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DtNganhDaoTaoGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtNganhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page, dsChuyenNganh: data.dsChuyenNganh });
        case DtNganhDaoTaoUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].maNganh == updatedItem.maNganh) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].maNganh == updatedItem.maNganh) {
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
T.initPage('pageDtNganhDaoTao');
export function getDtNganhDaoTaoPage(pageNumber, pageSize, pageCondition) {
    const page = T.updatePage('pageDtNganhDaoTao', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dt/nganh-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { donViFilter: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtNganhDaoTaoGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách ngành bị lỗi!', 'danger'));
    };
}

export function getDtNganhDaoTaoAll(done) {
    return dispatch => {
        const url = '/api/dt/nganh-dao-tao/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DtNganhDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtNganhDaoTao(maNganh, done) {
    return () => {
        const url = `/api/dt/nganh-dao-tao/item/${maNganh}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDtNganhDaoTao(item, done) {
    return dispatch => {
        const url = '/api/dt/nganh-dao-tao';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo ngành bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới thông tin ngành thành công!', 'success');
                dispatch(getDtNganhDaoTaoPage());
                done && done(data);
            }
        }, () => T.notify('Tạo ngành bị lỗi!', 'danger'));
    };
}

export function deleteDtNganhDaoTao(maNganh) {
    return dispatch => {
        const url = '/api/dt/nganh-dao-tao';
        T.delete(url, { maNganh: maNganh }, data => {
            if (data.error) {
                T.notify('Xóa danh mục ngành bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getDtNganhDaoTaoPage());
            }
        }, () => T.notify('Xóa ngành bị lỗi!', 'danger'));
    };
}

export function updateDtNganhDaoTao(maNganh, changes, done) {
    return dispatch => {
        const url = '/api/dt/nganh-dao-tao';
        T.put(url, { maNganh, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin ngành bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin ngành thành công!', 'success');
                dispatch(getDtNganhDaoTaoPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin ngành bị lỗi!', 'danger'));
    };
}

export function changeDtNganhDaoTao(item) {
    return { type: DtNganhDaoTaoUpdate, item };
}

export function getDtNganhDaoTaoByDonVi(donVi, done) {
    return () => {
        const url = '/api/dt/nganh-dao-tao/filter';
        T.get(url, { donVi }, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

// NEW ==========================================================================================================

// Nganh Action ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function getDtNganhPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtNganhDaoTao', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dt/danh-sach-nganh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtNganhDaoTaoGetPage, page: data.page, dsChuyenNganh: data.dsChuyenNganh });
                done && done(data);
            }
        }, () => T.notify('Lấy danh sách ngành bị lỗi!', 'danger'));
    };
}

export function createDtNganh(data, done) {
    return dispatch => {
        const url = '/api/dt/danh-sach-nganh';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo ngành bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo ngành thành công!', 'success');
                dispatch(getDtNganhPage());
                done && done(data.page);
            }
        }, () => T.notify('Tạo ngành bị lỗi!', 'danger'));
    };
}

export function updateDtNganh(maNganh, changes, done) {
    return dispatch => {
        const url = '/api/dt/danh-sach-nganh';
        T.put(url, { maNganh, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật ngành bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật ngành thành công!', 'success');
                dispatch(getDtNganhPage());
                done && done(data.page);
            }
        }, () => T.notify('Cập nhật ngành bị lỗi!', 'danger'));
    };
}

export function deleteDtNganh(maNganh, done) {
    return dispatch => {
        const url = '/api/dt/danh-sach-nganh';
        T.delete(url, { maNganh }, data => {
            if (data.error) {
                T.notify('Xóa ngành bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa ngành thành công!', 'success');
                dispatch(getDtNganhPage());
                done && done(data.page);
            }
        }, () => T.notify('Xóa ngành bị lỗi!', 'danger'));
    };
}

// Chuyen Nganh Action ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export function createDtChuyenNganh(data, done) {
    return dispatch => {
        const url = '/api/dt/chuyen-nganh';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo chuyên ngành bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo chuyên ngành thành công!', 'success');
                dispatch(getDtNganhPage());
                done && done(data.page);
            }
        }, () => T.notify('Tạo chuyên ngành bị lỗi!', 'danger'));
    };
}

export function updateDtChuyenNganh(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/chuyen-nganh';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật chuyên ngành bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật chuyên ngành sách ngành thành công!', 'success');
                dispatch(getDtNganhPage());
                done && done(data.page);
            }
        }, () => T.notify('Cập nhật chuyên ngành bị lỗi!', 'danger'));
    };
}

export function deleteDtChuyenNganh(ma, done) {
    return dispatch => {
        const url = '/api/dt/chuyen-nganh';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa chuyên ngành bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa chuyên ngành thành công!', 'success');
                dispatch(getDtNganhPage());
                done && done(data.page);
            }
        }, () => T.notify('Xóa chuyên ngành bị lỗi!', 'danger'));
    };
}

export function dtNganhHeDaoTaoGetByFilter(ma, done) {
    return () => {
        const url = '/api/dt/nganh-he-dao-tao';
        T.get(url, { ma }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu ngành hệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function dtNganhHeDaoTaoCreate(heDaoTao, nganhDaoTao, done) {
    return () => {
        const url = '/api/dt/nganh-he-dao-tao';
        T.post(url, { heDaoTao, nganhDaoTao }, result => {
            if (result.error) {
                T.notify('Tạo mới dữ liệu ngành hệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Tạo mới dữ liệu ngành hệ thành công!', 'success');
                done && done(result.items);
            }
        });
    };
}

export function dtNganhHeDaoTaoCreateAll(heDaoTao, listNganh, done) {
    return () => {
        const url = '/api/dt/nganh-he-dao-tao/create-all';
        T.post(url, { heDaoTao, listNganh }, result => {
            if (result.error) {
                T.notify('Tạo mới dữ liệu ngành hệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Tạo mới dữ liệu ngành hệ thành công!', 'success');
                done && done(result.items);
            }
        });
    };
}

// SelectAdapter ==================================================================================================

export const SelectAdapter_DtNganhDaoTao = {
    ajax: true,
    url: '/api/dt/nganh-dao-tao/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maNganh, text: `${item.tenNganh} (${item.maNganh})`, khoa: item.khoa, name: item.tenNganh })) : [] }),
    fetchOne: (maNganh, done) => (getDtNganhDaoTao(maNganh, item => done && done({ id: item.maNganh, item, text: `${item.tenNganh} (${item.maNganh})` })))(),
};

export const SelectAdapter_DtNganhDaoTaoFilterPage = {
    ajax: true,
    url: '/api/dt/nganh-dao-tao/filter/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maNganh, text: `${item.tenNganh} (${item.maNganh})`, khoa: item.khoa, name: item.tenNganh })) : [] }),
    fetchOne: (maNganh, done) => (getDtNganhDaoTao(maNganh, item => done && done({ id: item.maNganh, item, text: `${item.tenNganh} (${item.maNganh})` })))(),
};

export const SelectAdapter_DtNganhDaoTaoStudent = {
    ajax: true,
    url: '/api/dt/nganh-dao-tao-student',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, khoa: item.khoa, maLop: item.maLop })) : [] }),
    fetchOne: (maNganh, done) => (getDtNganhDaoTao(maNganh, item => done && done({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}` })))(),
};


export const SelectAdapter_DtNganhDaoTaoMa = {
    ajax: true,
    url: '/api/dt/nganh-dao-tao/page/1/100',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, name: item.tenNganh, khoa: item.khoa })) : [] }),
    fetchOne: (maNganh, done) => (getDtNganhDaoTao(maNganh, item => done && done({ id: item.maNganh, text: item.maNganh })))(),
};

export const SelectAdapter_DtNganhDaoTaoFilter = (donVi) => {
    return {
        ajax: true,
        url: '/api/dt/nganh-dao-tao/filter',
        data: params => ({ condition: params.term, donVi }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, khoa: item.khoa })) : [] }),
        fetchOne: (maNganh, done) => (getDtNganhDaoTao(maNganh, item => done && done({ id: item.maNganh, text: item.tenNganh })))(),
    };
};

export const SelectAdapter_DtNganhDaoTaoRole = (filter) => {
    return {
        ajax: true,
        url: '/api/dt/nganh-dao-tao/role',
        data: params => ({ condition: params.term, filter }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, khoa: item.khoa })) : [] }),
        fetchOne: (maNganh, done) => (getDtNganhDaoTao(maNganh, item => done && done({ id: item.maNganh, text: item.tenNganh })))(),
    };
};