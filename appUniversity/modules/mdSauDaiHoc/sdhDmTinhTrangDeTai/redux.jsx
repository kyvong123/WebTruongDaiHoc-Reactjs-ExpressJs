import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------

const SdhTinhTrangDeTaiGetAll = 'SdhTinhTrangDeTai:GetAll';
const SdhTinhTrangDeTaiGetPage = 'SdhTinhTrangDeTai:GetPage';
const SdhTinhTrangDeTaiUpdate = 'SdhTinhTrangDeTai:Update';

export default function SdhTinhTrangDeTaiReducer(state = null, data) {
    switch (data.type) {
        case SdhTinhTrangDeTaiGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhTinhTrangDeTaiGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhTinhTrangDeTaiUpdate:
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
export const PageName = 'pageSdhTinhTrangDeTai';
T.initPage(PageName);

export function getSdhTinhTrangDeTai(condition, done) {
    return (dispatch) => {
        const url = '/api/sdh/tinh-trang-de-tai/all';
        T.get(url, { condition }, (data) => {
            if (data.error) {
                T.notify('Lấy tình trạng đề tài bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: SdhTinhTrangDeTaiGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy tình trạng đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

// export function getSdhTinhTrangDeTaiPage(pageNumber, pageSize, pageCondition, done) {
//     const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
//     return (dispatch) => {
//         const url = `/api/sdh/tinh-trang-de-tai/page/${page.pageNumber}/${page.pageSize}`;
//         T.get(url, { condition: page.pageCondition }, (data) => {
//             if (data.error) {
//                 T.notify('Lấy danh sách tình trạng đề tài bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
//                 console.error(`GET: ${url}.`, data.error);
//             } else {
//                 if (page.pageCondition) data.page.pageCondition = page.pageCondition;
//                 done && done(data.page);
//                 dispatch({ type: SdhTinhTrangDeTaiGetPage, page: data.page });
//             }
//         }, (error) => T.notify('Lấy danh sách tình trạng đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
//     };
// }

export function updateSdhTinhTrangDeTai(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/tinh-trang-de-tai';
        T.put(url, { ma, changes }, (data) => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin tình trạng đề tài bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tình trạng đề tài thành công!', 'success');
                done && done(data.page);
                dispatch(getSdhTinhTrangDeTai());
            }
        }, (error) => T.notify('Cập nhật thông tin tình trạng đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhTinhTrangDeTai(changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/tinh-trang-de-tai';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Tạo học Sau đại học bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin tình trạng đề tài thành công!', 'success');
                dispatch(getSdhTinhTrangDeTai());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới tình trạng đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteSdhTinhTrangDeTai(ma) {
    return (dispatch) => {
        const url = '/api/sdh/tinh-trang-de-tai';
        T.delete(url, { ma }, (data) => {
            if (data.error) {
                T.notify('Xóa tình trạng đề tài bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Loại học viên đã xóa thành công!', 'success', false, 800);
                dispatch(getSdhTinhTrangDeTai());
            }
        }, (error) => T.notify('Xóa tình trạng đề tài bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getSvSdhTinhTrangDeTaiAdmin(ma, done) {
    return () => {
        const url = `/api/sdh/tinh-trang-de-tai/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tình trạng đề tài sau đại học không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy tình trạng đề tài sau đại học bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_sdhTinhTrangDeTai = {
    ajax: true,
    url: '/api/sdh/tinh-trang-de-tai/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ten}` })) : [] }),
    fetchOne: (ma, done) => (getSvSdhTinhTrangDeTaiAdmin(ma, item => done && done({ id: item.ma, text: `${item.ten}` })))(),
};