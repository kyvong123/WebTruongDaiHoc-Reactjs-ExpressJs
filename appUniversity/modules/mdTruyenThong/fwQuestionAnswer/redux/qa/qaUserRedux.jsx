import T from 'view/js/common';

const FwQuestionAnswerGetUserPage = 'FwQuestionAnswer:GetUserPage';

export default function FwQaUserReducer(state = null, data) {
    switch (data.type) {
        case FwQuestionAnswerGetUserPage:
            return Object.assign({}, state, { userPage: data.page });
        default:
            return state;
    }
}

// User Actions ------------------------------------------------------------------------------------------------------------

T.initPage('pageUserFwQuestionAnswer');
export function getFwQuestionAnswerUserPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageUserFwQuestionAnswer', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tt/lien-he/user/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách box QA bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetUserPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách box QA bị lỗi!', 'danger'));
    };
}

export function createUserFwQuestionAnswer(item, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/new-qa-box';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo hộp thư liên lạc mới bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hộp thư liên lạc mới thành công!', 'success');
                // TODO: Viết lại cái getUserFwQuestionAnswerPage
                dispatch(getFwQuestionAnswerUserPage());
                done && done(data);
            }
        }, () => T.notify('Tạo dịch vụ bị lỗi!', 'danger'));
    };
}


export function cancelFwQuestionAnswer(fwQuestionAnswerId, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/cancelled-fw-qa-box';
        T.put(url, { fwQaId: fwQuestionAnswerId }, data => {
            if (data.error) {
                T.notify('Hủy hộp thư bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done();
                dispatch(getFwQuestionAnswerUserPage());
            }
        }, () => T.notify('Hủy hộp thư bị lỗi!', 'danger'));
    };
}