import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiVanBanTccbGetAll = 'DmLoaiVanBanTccb:GetAll';
const DmLoaiVanBanTccbGetPage = 'DmLoaiVanBanTccb:GetPage';
const DmLoaiVanBanTccbUpdate = 'DmLoaiVanBanTccb:Update';
const DmLoaiVanBanTccbGet = 'DmLoaiVanBanTccb:Get';

export default function DmLoaiVanBanTccbReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiVanBanTccbGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiVanBanTccbGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmLoaiVanBanTccbGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case DmLoaiVanBanTccbUpdate:
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

// // Actions ------------------------------------------------------------------------------------------------------------
export function getDmLoaiVanBanTccb(ma, done) {
    return () => {
        const url = `/api/danh-muc/loai-van-ban-tccb/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại văn bản TCCB bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

T.initPage('pageDmLoaiVanBanTccb');
export function getDmLoaiVanBanTccbPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageDmLoaiVanBanTccb', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/danh-muc/loai-van-ban-tccb/page/${page.pageNumber}/${page.pageSize}`;
        T.get(
            url,
            { condition: page.pageCondition, filter },
            (data) => {
                if (data.error) {
                    T.notify('Lấy danh sách loại văn bản TCCB bị lỗi!', 'danger');
                    console.error(`GET: ${url}.`, data.error);
                } else {
                    if (page.filter) data.page.filter = page.filter;
                    if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                    dispatch({ type: DmLoaiVanBanTccbGetPage, page: data.page });
                    done && done(data.page);
                }
            },
            () => T.notify('Lấy danh sách loại văn bản TCCB bị lỗi!', 'danger')
        );
    };
}

export function createLoaiVanBanTccb(data, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/loai-van-ban-tccb';
        T.post(
            url,
            { data },
            (res) => {
                if (res.error) {
                    T.notify('Thêm loại văn bản TCCB bị lỗi', 'danger');
                    console.error('POST: ' + url + '. ' + res.error);
                } else {
                    if (done) {
                        T.notify('Thêm loại văn bản TCCB thành công!', 'success');
                        dispatch(getDmLoaiVanBanTccbPage());
                        done && done(data);
                    }
                }
            },
            () => T.notify('Thêm loại văn bản TCCB bị lỗi', 'danger')
        );
    };
}

export function updateLoaiVanBanTccb(id, changes, done) {
    return (dispatch) => {
        const url = '/api/danh-muc/loai-van-ban-tccb';
        T.put(url, { id, changes }, (data) => {
            if (data.error) {
                T.notify('Cập nhật thông tin loại văn bản TCCB bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin loại văn bản TCCB thành công!', 'success');
                done && done(data.item);
                dispatch(getDmLoaiVanBanTccbPage());
            }
            },
            () => T.notify('Cập nhật thông tin loại văn bản TCCB bị lỗi', 'danger')
        );
    };
}