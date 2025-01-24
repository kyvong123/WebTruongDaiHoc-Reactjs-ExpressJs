import T from 'view/js/common';

// Reducer ------------------------------
const SdhDiemHocPhanAll = 'SdhDiemHocPhan:GetAll';
const SdhDiemHocPhanPage = 'SdhDiemHocPhan:GetPage';
const SdhDiemHocPhanUpdate = 'SdhDiemHocPhan:Update';


export default function SdhDiemManageReducer(state = null, data) {
    switch (data.type) {
        case SdhDiemHocPhanAll:
            return Object.assign({}, state, { items: data.items });

        case SdhDiemHocPhanPage:
            return Object.assign({}, state, { page: data.page });
        case SdhDiemHocPhanUpdate:
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

// Actions ------------------------------
T.initPage('pageSdhDiemHocPhan');
export function getSdhDiemHocPhanPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSdhDiemHocPhan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/diem-hoc-phan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, namHocFilter: pageCondition?.namHocFilter, hocKyFilter: pageCondition?.hocKyFilter, phanHeFilter: pageCondition?.phanHeFilter, khoaHocVienFilter: pageCondition?.KhoaHocVienfilter, filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhDiemHocPhanPage, page: result.page });
                done && done(result.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateSdhTinhTrangDiemMulti(chosenList, tinhTrang, done) {
    return dispatch => {
        const url = '/api/sdh/diem-hoc-phan/multi-tinh-trang',
            cookie = T.updatePage('pageSdhDiemHocPhan');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        T.put(url, { chosenList, tinhTrang }, result => {
            if (result.error) {
                T.notify('Cập nhật tình trạng điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật tình trạng điểm thành công', 'success');
                dispatch(getSdhDiemHocPhanPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateSdhTinhTrangDiem(maHocPhan, tinhTrang, done) {
    return dispatch => {
        const url = '/api/sdh/diem-hoc-phan/tinh-trang',
            cookie = T.updatePage('pageSdhDiemHocPhan');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        T.put(url, { maHocPhan, tinhTrang }, result => {
            if (result.error) {
                T.notify('Cập nhật tình trạng điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật tình trạng điểm thành công', 'success');
                dispatch(getSdhDiemHocPhanPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateSdhConfigMulti(updateList, listThanhPhan, done) {
    return dispatch => {
        const url = '/api/sdh/diem-hoc-phan/multi-config',
            cookie = T.updatePage('pageSdhDiemHocPhan');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        T.put(url, { updateList, listThanhPhan }, result => {
            if (result.error) {
                T.notify('Cập nhật phần trăm điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật phần trăm điểm thành công', 'success');
                dispatch(getSdhDiemHocPhanPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function updateSdhThoiGianHocPhan(maHocPhan, changes, done) {
    return dispatch => {
        const url = '/api/sdh/diem-hoc-phan/time-config',
            cookie = T.updatePage('pageSdhDiemHocPhan');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        T.put(url, { maHocPhan, changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thời gian nhập điểm bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật thời gian nhập điểm thành công', 'success');
                dispatch(getSdhDiemHocPhanPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


