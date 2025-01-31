import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const EmailTaskGetPage = 'EmailTask:Get';

export default function emailTaskReducer(state = null, data) {
    switch (data.type) {
        case EmailTaskGetPage: {
            return Object.assign({}, state, { page: data.page });
        }
        default:
            return state;
    }
}

T.initPage('pageEmailTask');
export function getPageEmailTask(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageEmailTask', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/email-task/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter: page.filter }, res => {
            if (res.error) {
                console.error('GET: ', res.error);
                T.notify('Lấy email task bị lỗi!', 'danger');
            } else {
                dispatch({ type: EmailTaskGetPage, page: res.page });
                done && done(res.items);
            }
        });
    };
}

export function getEmailTask(id, done) {
    const url = '/api/email-task/item';
    T.get(url, { id }, res => {
        if (res.error) {
            console.error('GET: ', res.error);
            T.notify('Lấy email task bị lỗi!', 'danger');
        } else {
            done && done(res.item);
        }
    });
}

export function resendEmailTask(id, done) {
    return dispatch => {
        const url = '/api/email-task/resend';
        T.put(url, { id }, res => {
            if (res.error) {
                console.error('PUT: ', res.error);
                T.notify('Thực thi email task bị lỗi!', 'danger');
            } else {
                dispatch(getPageEmailTask());
                done && done();
            }
        });
    };
}
export function resendEmailListTask(list, done) {
    return dispatch => {
        const url = '/api/hcth/email-task/resend-multiple';
        T.put(url, { list }, res => {
            if (res.error) {
                console.error('PUT: ', res.error);
                T.notify('Thực thi email task bị lỗi!', 'danger');
            } else {
                dispatch(getPageEmailTask());
                done && done();
            }
        });
    };
}