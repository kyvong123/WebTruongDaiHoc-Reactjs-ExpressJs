import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDshpDotDangKyGetAll = 'SdhDshpDotDangKy:GetAll';
const SdhDshpDotDangKyGetPage = 'SdhDshpDotDangKy:GetPage';
const SdhDshpDotDangKyUpdate = 'SdhDshpDotDangKy:Update';

export default function SdhDshpDotDangKyReducer(state = null, data) {
    switch (data.type) {

        case SdhDshpDotDangKyGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhDshpDotDangKyGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhDshpDotDangKyUpdate:
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
T.initPage('pageSdhDshpDotDangKy');
export function getSdhDshpDotDangKyPage(pageNumber, pageSize, filter, done) {
    const page = T.updatePage('pageSdhDshpDotDangKy', pageNumber, pageSize, filter);
    return dispatch => {
        const url = `/api/sdh/dshp-dot-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SdhDshpDotDangKyGetPage, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

export function updateSdhDsvhpDotDangKy(changes, item, done) {
    return (dispatch) => {
        const url = '/api/sdh/dshp-dot-dang-ky';
        T.put(url, { changes, item }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật mã học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật mã học phần thành công!', 'success');
                dispatch({ type: SdhDshpDotDangKyUpdate, item: { item } });
                done && done(data.item);
            }
        }, (error) => T.notify('Cập nhật mã học phần bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getHpSdhInfo(maHp, ngayBatDau, ngayKetThuc, done) {
    return () => {
        const url = '/api/sdh/dshp-trong-dot-dkhp/checkDuplicated';
        T.get(url, { maHp, ngayBatDau, ngayKetThuc }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Kiểm tra học phần bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function createListHPSdh(data, done) {
    return dispatch => {
        const url = '/api/sdh/dshp-trong-dot-dkhp/list';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Thêm danh sách sinh viên bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Thêm danh sách sinh viên thành công!', 'success');
                dispatch(getSdhDshpDotDangKyPage());
                done && done(data);
            }
        });
    };
}