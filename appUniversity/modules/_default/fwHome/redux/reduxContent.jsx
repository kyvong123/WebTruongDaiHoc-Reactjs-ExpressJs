import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const ContentGetAll = 'Content:GetAll';
const ContentUpdate = 'Content:Update';
const ContentDelete = 'Content:Delete';

export default function contentReducer(state = [], data) {
    switch (data.type) {
        case ContentGetAll:
            return data.items;

        case ContentUpdate:
            state = state.slice();
            for (let i = 0; i < state.length; i++) {
                if (state[i].id == data.item.id) {
                    state[i] = data.item;
                    break;
                }
            }
            return state;

        case ContentDelete:
            state = state.slice();
            for (let i = 0; i < state.length; i++) {
                if (state[i].id == data.id) {
                    state.splice(i, 1);
                    break;
                }
            }
            return state;

        default:
            return state;
    }
}

// Action --------------------------------------------------------------------------------------------------------------
export function getAllContents() {
    return dispatch => {
        const url = '/api/content/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nội dung bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: ContentGetAll, items: data.items ? data.items : [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}

export function createContent(done) {
    return dispatch => {
        const url = '/api/content';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo nội dung bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllContents());
                done && done(data);
            }
        }, () => T.notify('Tạo nội dung bị lỗi!', 'danger'));
    };
}

export function updateContent(id, changes) {
    return dispatch => {
        const url = '/api/content';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật nội dung bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Nội dung cập nhật thành công!', 'success');
                dispatch(getAllContents());
            }
        }, () => T.notify('Cập nhật nội dung bị lỗi!', 'danger'));
    };
}

export function deleteContent(id) {
    return dispatch => {
        const url = '/api/content';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa nội dung bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Nội dung được xóa thành công!', 'error', false, 800);
                dispatch({ type: ContentDelete, id });
            }
        }, () => T.notify('Xóa nội dung bị lỗi!', 'danger'));
    };
}


export function getContent(id, done) {
    return dispatch => {
        const url = '/api/content/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nội dung bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: ContentUpdate, item: data.item });
                done && done({ item: data.item });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}