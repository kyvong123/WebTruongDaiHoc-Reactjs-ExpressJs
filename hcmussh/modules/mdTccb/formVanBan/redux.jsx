import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const FormVanBanGetAll = 'FormVanBan:GetAll';
const FormVanBanGetPage = 'FormVanBan:GetPage';
const FormVanBanUpdate = 'FormVanBan:Update';
const FormVanBanGet = 'FormVanBan:Get';

export default function FormVanBanReducer(state = null, data) {
    switch (data.type) {
        case FormVanBanGetAll:
            return Object.assign({}, state, { items: data.items });
        case FormVanBanGetPage:
            return Object.assign({}, state, { page: data.page });
        case FormVanBanGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case FormVanBanUpdate:
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
T.initPage('pageFormVanBan');

export function getAllFormVanBan(done) {
    return dispatch => {
        const url = '/api/tccb/form-van-ban/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu biểu mẫu lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: FormVanBanGetAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createFormVanBan(data, done) {
    return (dispatch) => {
        const url = '/api/tccb/form-van-ban';
        T.post(
            url,
            { data },
            (res) => {
                if (res.error) {
                    T.notify('Thêm form văn bản bị lỗi', 'danger');
                    console.error('POST: ' + url + '. ' + res.error);
                } else {
                    if (done) {
                        T.notify('Thêm loại form văn bản thành công!', 'success');
                        dispatch(getAllFormVanBan());
                        done && done(data);
                    }
                }
            },
            () => T.notify('Thêm form văn bản bị lỗi', 'danger')
        );
    };
}

export function updateFormVanBan(ma, changes, done) {
    return (dispatch) => {
        const url = '/api/tccb/form-van-ban';
        T.put(url, { ma, changes }, (data) => {
            if (data.error) {
                T.notify('Cập nhật thông tin form văn bản bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item) {
                T.notify('Cập nhật thông tin form văn bản thành công!', 'success');
                done && done(data.item);
                dispatch(getAllFormVanBan());
            }
            },
            () => T.notify('Cập nhật thông tin form văn bản bị lỗi', 'danger')
        );
    };
}