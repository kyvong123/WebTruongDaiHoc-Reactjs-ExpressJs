import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ContactGetPage = 'Contact:GetPage';
const ContactGetUnread = 'Contact:GetUnread';
const ContactUpdate = 'Contact:Update';

export default function contactReducer(state = null, data) {
    switch (data.type) {
        case ContactGetPage:
            return Object.assign({}, state, { page: data.page });

        case ContactGetUnread:
            return Object.assign({}, state, { unreads: data.items });

        case ContactUpdate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    updatedUnreads = Object.assign({}, state.unreads),
                    updatedItem = data.item;
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedUnreads) {
                    if (updatedItem.read) {
                        for (let i = 0, n = updatedUnreads.length; i < n; i++) {
                            if (updatedUnreads[i].id == updatedItem.id) {
                                updatedUnreads.splice(i, 1);
                                break;
                            }
                        }
                    } else {
                        updatedPage.list.splice(0, 1, updatedItem);
                    }
                }
                return Object.assign({}, state, { page: updatedPage, unreads: updatedUnreads });
            } else {
                return state;
            }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
// T.initPage('pageContact');
T.initPage('pageContact');
export function getContactPage(pageNumber, pageSize) {
    const page = T.updatePage('pageContact', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/tt/contact/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: ContactGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger'));
    };
}

export function getContact(contactId, done) {
    return dispatch => {
        const url = `/api/tt/contact/item/${contactId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.item);
                dispatch({ type: ContactUpdate, item: data.item });
            }
        }, () => T.notify('Lấy thông tin liên hệ bị lỗi!', 'danger'));
    };
}

export function getUnreadContacts(done) {
    return dispatch => {
        const url = '/api/tt/contact/unread';
        T.get(url, data => {
            if (data.error) {
                done && done(null, data.error);
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.items);
                dispatch({ type: ContactGetUnread, items: data.items });
            }
        }, () => T.notify('Lấy danh sách thông tin liên hệ bị lỗi!', 'danger'));
    };
}

export function updateContact(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/contact';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin liên hệ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin liên hệ thành công!', 'success');
                dispatch(getContactPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin liên hệ bị lỗi!', 'danger'));
    };
}

export function deleteContact(id) {
    return dispatch => {
        const url = '/api/tt/contact';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin liên hệ bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Thông tin liên hệ được xóa thành công!', 'error', false, 800);
                dispatch(getContactPage());
            }
        }, () => T.notify('Xóa thông tin liên hệ bị lỗi!', 'danger'));
    };
}

export function changeContact(item) {
    return { type: ContactUpdate, item };
}

export function createContact(contact, done) {
    return () => {
        const url = '/api/tt/contact';
        T.post(url, { contact }, data => {
            if (data.error) {
                T.notify('Gửi thông tin liên hệ bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done(data);
                //dispatch(getContactPage());
            }
        }, () => T.notify('Gửi thông tin liên hệ bị lỗi!', 'danger'));
    };
}