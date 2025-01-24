import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtCauHinhDotDkhpGetAll = 'dtCauHinhDotDkhp:GetAll';
const DtCauHinhDotDkhpGetPage = 'dtCauHinhDotDkhp:GetPage';
const DtCauHinhDotDkhpUpdate = 'dtCauHinhDotDkhp:Update';

export default function DtCauHinhDotDkhpReducer(state = null, data) {
    switch (data.type) {
        case DtCauHinhDotDkhpGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtCauHinhDotDkhpGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtCauHinhDotDkhpUpdate:
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
export function getDtCauHinhDotDkhpAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-dkhp/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.data);
                dispatch({ type: DtCauHinhDotDkhpGetAll, items: data.data ? data.data : [] });
            }
        });
    };
}

T.initPage('pageDtCauHinhDotDkhp');
export function getDtCauHinhDotDkhpPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtCauHinhDotDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/cau-hinh-dot-dkhp/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtCauHinhDotDkhpGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtCauHinhDotDkhpAllDot(done) {
    return () => {
        const url = '/api/dt/cau-hinh-dot-dkhp/dot/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt đăng ký học phần bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function createDtCauHinhDotDkhp(item, done) {
    const cookie = T.updatePage('pageDtCauHinhDotDkhp');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-dkhp';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo cấu hình đợt đăng ký học phần thành công!', 'success');
                dispatch(getDtCauHinhDotDkhpPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done(data);
        });
    };
}

export function deleteDtCauHinhDotDkhp(id, done) {
    const cookie = T.updatePage('pageDtCauHinhDotDkhp');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-dkhp';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Cấu hình đợt đăng ký học phần đã xóa thành công!', 'success', false, 800);
                dispatch(getDtCauHinhDotDkhpPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done();
        }, () => T.notify('Xóa Cấu hình đợt đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function updateDtCauHinhDotDkhp(id, changes, done) {
    const cookie = T.updatePage('pageDtCauHinhDotDkhp');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/cau-hinh-dot-dkhp';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật thông tin cấu hình đợt đăng ký học phần thành công!', 'success');
                dispatch(getDtCauHinhDotDkhpPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình đợt đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function changeDtCauHinhDotDkhp(item) {
    return { type: DtCauHinhDotDkhpUpdate, item };
}
export function getDtCauHinhDotDkhp(id, done) {
    return () => {
        const url = `/api/dt/cau-hinh-dot-dkhp/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin cấu hình đợt đăng ký học phần bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.data);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getCauHinh(done) {
    return () => {
        const url = '/api/dt/cau-hinh';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cấu hình đăng ký bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                if (done) done(data);
            }
        });
    };
}

export function getSoLuongSinhVien(id, done) {
    return () => {
        const url = '/api/dt/cau-hinh-dot-dkhp/count';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy số lượng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.count);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}
