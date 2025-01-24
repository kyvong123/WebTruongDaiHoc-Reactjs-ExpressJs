import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDssvTrongDotDkhpGetAll = 'dtDssvTrongDotDkhp:GetAll';
const DtDssvTrongDotDkhpGetPage = 'dtDssvTrongDotDkhp:GetPage';
const DtDssvTrongDotDkhpUpdate = 'dtDssvTrongDotDkhp:Update';
const DtDotDkhpMienNNGetPage = 'dtDotDkhpMienNN:GetPage';



export default function DtDssvTrongDotDkhpReducer(state = null, data) {
    switch (data.type) {
        case DtDssvTrongDotDkhpGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDssvTrongDotDkhpGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDotDkhpMienNNGetPage:
            return Object.assign({}, state, { pageMien: data.page });
        case DtDssvTrongDotDkhpUpdate:
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
export function getDtDssvTrongDotDkhpAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/dssv-trong-dot-dkhp/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.data);
                dispatch({ type: DtDssvTrongDotDkhpGetAll, items: data.data ? data.data : [] });
            }
        });
    };
}

T.initPage('pageDtDssvTrongDotDkhp');
export function getDtDssvTrongDotDkhpPage(pageNumber, pageSize, pageCondition, filter, iddot, done) {
    const page = T.updatePage('pageDtDssvTrongDotDkhp', pageNumber, pageSize, pageCondition, filter, iddot);
    return dispatch => {
        const url = `/api/dt/dssv-trong-dot-dkhp/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter, iddot }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDssvTrongDotDkhpGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtDssvTrongDotDkhpAllSv(list, done) {
    return () => {
        const url = '/api/dt/dssv-trong-dot-dkhp/dssv';
        T.get(url, { list }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getStudent(list, done) {
    return () => {
        const url = '/api/dt/dssv-trong-dot-dkhp/sinh-vien';
        T.get(url, { list }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.listSV);
            }
        });
    };
}


export function createDtDssvTrongDotDkhp(item, done) {
    return dispatch => {
        const url = '/api/dt/dssv-trong-dot-dkhp';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo danh sách sinh viên bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo tạo danh sách sinh viên thành công!', 'success');
                dispatch(getDtDssvTrongDotDkhpAll());
            }
            done && done(data);
        });
    };
}

export function createListSV(data, done) {
    return dispatch => {
        const url = '/api/dt/dssv-trong-dot-dkhp/list';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Thêm danh sách sinh viên bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Thêm danh sách sinh viên thành công!', 'success');
                dispatch(getDtDssvTrongDotDkhpAll());
                done && done(data);
            }
        });
    };
}

export function deleteDtDssvTrongDotDkhp(id, done) {
    return dispatch => {
        const url = '/api/dt/dssv-trong-dot-dkhp';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh sách sinh viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh sách sinh viên đã xóa thành công!', 'success', false, 800);
                dispatch({ type: DtDssvTrongDotDkhpUpdate, item: { id } });
            }
            done && done();
        }, () => T.notify('Xóa danh sách sinh viên bị lỗi!', 'danger'));
    };
}

export function updateDtDssvTrongDotDkhp(id, changes, done) {
    return dispatch => {
        const url = '/api/dt/dssv-trong-dot-dkhp';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách sinh viên bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật danh sách sinh viên thành công!', 'success');
                dispatch({ type: DtDssvTrongDotDkhpUpdate, item: data.item });
                done && done(data);
            }
        }, () => T.notify('Cập nhật danh sách sinh viên bị lỗi!', 'danger'));
    };
}


export function getDtDssvTrongDotDkhp(id, done) {
    return () => {
        const url = `/api/dt/dssv-trong-dot-dkhp/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy anh sách sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function reLoadListSv(idDot, done) {
    const cookie = T.updatePage('pageDtDssvTrongDotDkhp');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/dssv-trong-dot-dkhp/reload';
        T.post(url, { idDot }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Chạy lại danh sách sinh viên thất bại!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Chạy lại danh sách sinh viên thành công!', 'success');
                dispatch(getDtDssvTrongDotDkhpPage(pageNumber, pageSize, pageCondition, filter, idDot));
            }
            done && done(data);
        });
    };
}


//Redux_Sinh_Vien_Dao_Tao----------------------------------------------------------------------------------------------------------------------------------
export function getStudentInfo(maSoSV, ngayBatDau, ngayKetThuc, done) {
    return () => {
        const url = '/api/dt/dssv-trong-dot-dkhp/checkDuplicated';
        T.get(url, { maSoSV, ngayBatDau, ngayKetThuc }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Kiểm tra sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                // dispatch({ type: sinhVienGetEditPage, items: data.items });
            }
        });
    };
}

export const SelectAdapter_DanhSachSinhVien = {
    ajax: true,
    url: '/api/dt/dssv-trong-dot-dkhp/student/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] }),
    // fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};

// MIEN NGOAI NGU
T.initPage('pageDtDotDkhpMienNgoaiNgu');
export function getDtDotDkhpMienNgoaiNguPage(pageNumber, pageSize, filter, done) {
    const page = T.updatePage('pageDtDotDkhpMienNgoaiNgu', pageNumber, pageSize, null, filter);
    return dispatch => {
        const url = `/api/dt/cau-hinh-dot/mien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên miễn ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDotDkhpMienNNGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDtDotDkhpMienNgoaiNgu(idDot, list, done) {
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot/mien';
        T.post(url, { idDot, list }, data => {
            if (data.error) {
                T.notify('Tạo sinh viên miễn ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                const filter = T.storage('pageDtDotDkhpMienNgoaiNgu')[T.pageKeyName.filter];
                dispatch(getDtDotDkhpMienNgoaiNguPage(null, null, filter));
                const cookie = T.updatePage('pageDtDssvTrongDotDkhp');
                dispatch(getDtDssvTrongDotDkhpPage(cookie.pageNumber, cookie.pageSize, cookie.pageCondition, cookie.filter, idDot));
                done && done(data);
            }
        });
    };
}

export function deleteDtDotDkhpMienNgoaiNgu(id, done) {
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot/mien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sinh viên miễn ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                const filter = T.storage('pageDtDotDkhpMienNgoaiNgu')[T.pageKeyName.filter];
                dispatch(getDtDotDkhpMienNgoaiNguPage(null, null, filter));
                const cookie = T.updatePage('pageDtDssvTrongDotDkhp');
                dispatch(getDtDssvTrongDotDkhpPage(cookie.pageNumber, cookie.pageSize, cookie.pageCondition, cookie.filter, filter.idDot));
                done && done(data);
            }
        });
    };
}