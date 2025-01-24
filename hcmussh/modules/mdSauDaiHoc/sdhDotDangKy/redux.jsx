import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDotDangKyGetAll = 'SdhDotDangKy:GetAll';
const SdhDotDangKyGetPage = 'SdhDotDangKy:GetPage';
const SdhDotDangKyUpdate = 'SdhDotDangKy:Update';

export default function SdhDotDangKyReducer(state = null, data) {
    switch (data.type) {
        case SdhDotDangKyGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhDotDangKyGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhDotDangKyUpdate:
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
export const PageName = 'pageSdhDotDangKy';
T.initPage(PageName);

export function getSdhDotDangKyPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSdhDotDangKy', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/sdh/dot-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đợt đăng ký bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: SdhDotDangKyGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đợt đăng ký bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function updateSdhDotDangKy(id, changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/dot-dang-ky';
        T.put(url, { id, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin đợt đăng ký bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đợt đăng ký thành công!', 'success');
                done && done(data.page);
                dispatch(getSdhDotDangKyPage());
            }
        }, (error) => T.notify('Cập nhật thông tin đợt đăng ký bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhDotDangKy(item, done) {
    const cookie = T.updatePage('pageSdhDotDangKy');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;

    return (dispatch) => {
        const url = '/api/sdh/dot-dang-ky';
        T.post(url, { item }, (data) => {
            if (data.error) {
                T.notify('Tạo đợt đăng ký bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin đợt đăng ký thành công!', 'success');
                dispatch(getSdhDotDangKyPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới đợt đăng ký bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteSdhCauHinhDotDkhp(id, done) {
    const cookie = T.updatePage('pageSdhDotDangKy');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/sdh/dot-dang-ky';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Cấu hình đợt đăng ký học phần đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhDotDangKyPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done();
        }, () => T.notify('Xóa đợt đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function deleteSdhDotDangKy(id) {
    return (dispatch) => {
        const url = '/api/sdh/dot-dang-ky';
        T.delete(url, { id }, (data) => {
            if (data.error) {
                T.notify('Xóa đợt đăng ký bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đợt đăng ký đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhDotDangKyPage());
            }
        }, (error) => T.notify('Xóa đợt đăng ký bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getSdhDotDangKyAll(done) {
    return (dispatch) => {
        const url = '/api/sdh/dot-dang-ky/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đợt đăng ký bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: SdhDotDangKyGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách đợt đăng ký bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getSdhDotDangKyAdmin(id, done) {
    return () => {
        const url = `/api/sdh/dot-dang-ky/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đợt đăng ký bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.data);
            }
        }, () => T.notify('Lấy danh sách đợt đăng ký sau đại học bị lỗi!', 'danger'));
    };
}

export function getSoLuongSinhVienSdh(id, done) {
    return () => {
        const url = '/api/sdh/dot-dang-ky/count';
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

export const SelectAdapter_DotDangKySdh = {
    ajax: true,
    url: '/api/sdh/dot-dang-ky/page/1/20',
    data: params => ({ condition: params && params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.filter(item => item.kichHoat == 1 && item.ngayBatDau <= Date.now() && item.ngayKetThuc >= Date.now()).map(item => ({ id: item.id, text: `${'Tên đợt: ' + item.tenDot + '- Năm ' + item.namHoc + '-' + ' học kỳ ' + item.hocKy}` })) : [] }),
    fetchOne: (id, done) => (getSdhDotDangKyAdmin(id, item => done && done({ id: item.id, text: `${'Tên đợt: ' + item.tenDot + '- Năm ' + item.namHoc + '-' + ' học kỳ ' + item.hocKy}` })))()
};

export const SelectAdapter_DotDangKySdhV2 = (filter) => ({
    ajax: true,
    url: '/api/sdh/dot-dang-ky/page/1/20',
    data: params => ({ condition: params.term, kichHoat: 1, filter }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.filter(item => item.kichHoat == 1 && item.ngayBatDau <= Date.now() && item.ngayKetThuc >= Date.now()).map(item => ({ id: item.id, text: `${'Tên đợt: ' + item.tenDot + '- Năm ' + item.namHoc + '-' + ' học kỳ ' + item.hocKy}` })) : [] }),
    fetchOne: (id, done) => (getSdhDotDangKyAdmin(id, item => done && done({ id: item.id, text: `${'Tên đợt: ' + item.tenDot + '- Năm ' + item.namHoc + '-' + ' học kỳ ' + item.hocKy}` })))()
});