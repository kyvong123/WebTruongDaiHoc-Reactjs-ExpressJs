import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMonHocGetPage = 'DmMonHoc:GetPage';
const DmMonHocUpdate = 'DmMonHoc:Update';

export default function dmMonHoc(state = null, data) {
    switch (data.type) {
        case DmMonHocGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmMonHocUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
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
T.initPage('pageDmMonHoc');
export function getDmMonHocPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDmMonHoc', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/mon-hoc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DmMonHocGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDmMonHoc(item, list, done) {
    const cookie = T.updatePage('pageDmMonHoc');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/mon-hoc';
        T.post(url, { item, list }, data => {
            if (data.error) {
                T.notify('Tạo môn học bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Tạo môn học thành công!', 'success');
                dispatch(getDmMonHocPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data.item);
            }
        });
    };
}

export function createListDmMonHoc(list, done) {
    return () => {
        const url = '/api/dt/list-mon-hoc';
        T.post(url, { list }, data => {
            if (data.error) {
                T.notify('Tạo môn học bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Tạo môn học thành công!', 'success');
                done && done();
            }
        });
    };
}

export function getDmMonHoc(ma, done) {
    return () => {
        const url = `/api/dt/mon-hoc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin môn học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getDtPhanTramDiem(ma, done) {
    return () => {
        const url = '/api/dt/mon-hoc-diem-thanh-phan';
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin phần trăm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function checkMonHoc(ma, done) {
    return () => {
        const url = `/api/dt/mon-hoc/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin môn học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function deleteDmMonHoc(ma, done) {
    const cookie = T.updatePage('pageDmMonHoc');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/mon-hoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa môn học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                dispatch(getDmMonHocPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Xóa môn học bị lỗi!', 'danger'));
    };
}

export function updateDmMonHoc(ma, changes, list, done) {
    const cookie = T.updatePage('pageDmMonHoc');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/mon-hoc';
        T.put(url, { ma, changes, list }, data => {
            if (data.error) {
                T.notify('Cập nhật môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(getDmMonHocPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    };
}

export function updateThanhPhanDmMonHoc(listMa, changes, done) {
    const cookie = T.updatePage('pageDmMonHoc');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/mon-hoc/list';
        T.put(url, { listMa, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(getDmMonHocPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật danh sách môn học bị lỗi!', 'danger'));
    };
}

export function updateFacultyDmMonHoc(listMa, khoa, done) {
    const cookie = T.updatePage('pageDmMonHoc');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/mon-hoc/faculty';
        T.put(url, { listMa, khoa }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách môn học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(getDmMonHocPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật danh sách môn học bị lỗi!', 'danger'));
    };
}

export function changeDmMonHoc(item) {
    return { type: DmMonHocUpdate, item };
}

export const SelectAdapter_DmMonHoc = {
    ajax: true,
    url: '/api/dt/mon-hoc/page/1/20',
    data: params => ({ condition: params.term || '' }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, item, text: `${item.ma}: ${T.parse(item.ten, { vi: '' })?.vi}` })) : [] }),
    fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${T.parse(item.ten, { vi: '' })?.vi}` })))(),
    fetchOneItem: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, item: item })))(),
};

export const SelectAdapter_DmMonHocFaculty = (donVi) => {
    return {
        ajax: true,
        url: '/api/dt/mon-hoc/page/1/20',
        data: params => ({ condition: params.term || '', donViFilter: donVi }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}` })) : [] }),
        fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}` })))(),

    };
};

export const SelectAdapter_DmMonHocFacultyFilter = (donVi, selectedItems) => {
    return {
        ajax: true,
        url: (params) => {
            return `/api/dt/mon-hoc/page/${params?.page || 1}/50`;
        },
        data: params => ({ condition: params.term || '', donVi, selectedItems }),
        processResults: response => {
            let more = false;
            const page = response && response.page;
            if (page && page.pageTotal > page.pageNumber) {
                more = true;
            }
            return {
                results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}` })) : [],
                pagination: {
                    more
                }
            };
        },
        fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}`, tenMonHoc: T.parse(item.ten).vi })))(),
    };
};

export const SelectAdapter_DmMonHocAll = (isDangKyMoMon = null) => {
    return ({
        ajax: true,
        url: '/api/dt/mon-hoc/page-all/1/100',
        data: params => ({ searchTerm: params.term || '', isDangKyMoMon }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}`, item, tenVi: T.parse(item.ten, { vi: '' }).vi })) : [] }),
        fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({
            id: item.ma, text: `${item.ma}: ${T.parse(item.ten).vi}`,
            tenVi: T.parse(item.ten, { vi: '' }).vi
        })))(),
    });
};