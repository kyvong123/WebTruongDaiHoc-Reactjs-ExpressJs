import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhQuanLyDeTaiGetAll = 'SdhQuanLyDeTai:GetAll';
const SdhQuanLyDeTaiGetPage = 'SdhQuanLyDeTai:GetPage';
const SdhQuanLyDeTaiUpdate = 'SdhQuanLyDeTai:Update';

export default function SdhQuanLyDeTaiReducer(state = null, data) {
    switch (data.type) {
        case SdhQuanLyDeTaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhQuanLyDeTaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhQuanLyDeTaiUpdate:
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
export const PageName = 'pageSdhQuanLyDeTai';
T.initPage(PageName);

export function getSdhQuanLyDeTaiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/sdh/quan-ly-de-tai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đề tài bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SdhQuanLyDeTaiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getSdhQuanLyDeTaiAdmin(ma, done) {
    return dispatch => {
        const url = `/api/sdh/quan-ly-de-tai/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đề tài sau đại học không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch({ type: SdhQuanLyDeTaiGetPage, item: data.item });
            }
        });
    };
}

export function createQuanLyDeTaiMutiple(data, done) {
    return (dispatch) => {
        const url = '/api/sdh/quan-ly-de-tai/multiple';
        T.post(url, { data }, (data) => {
            if (data.errors && data.errors.length > 0) {
                T.notify('Tạo mới đề tài sau đại học lỗi', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                done && done();
                dispatch(getSdhQuanLyDeTaiPage());
            }
        });
    };
}

export function updateQuanLyDeTai(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/quan-ly-de-tai';
        T.put(url, { ma, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin đề tài bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đề tài thành công!', 'success');
                done && done(data);
                dispatch(getSdhQuanLyDeTaiPage());
            }
        }, (error) => T.notify('Cập nhật thông tin đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhQuanLyDeTai(changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/quan-ly-de-tai';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Tạo học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin đề tài thành công!', 'success');
                dispatch(getSdhQuanLyDeTaiPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteSdhQuanLyDeTai(id, done) {
    return (dispatch) => {
        const url = '/api/sdh/quan-ly-de-tai';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cấu trúc khung đào tạo bị lỗi!', 'danger');
            } else {
                dispatch(getSdhQuanLyDeTaiPage());
                done && done();

            }
        });
    };
}
