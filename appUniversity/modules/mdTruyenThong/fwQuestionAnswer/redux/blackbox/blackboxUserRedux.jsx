import T from 'view/js/common';

const FwQuestionAnswerGetUserBlackBoxPage = 'FwQuestionAnswer:GetUserBlackBoxPage';

export default function FwBlackboxUserReducer(state = null, data) {
    switch (data.type) {
        case FwQuestionAnswerGetUserBlackBoxPage:
            return Object.assign({}, state, { userBlackBoxPage: data.page });
        default:
            return state;
    }
}

// User BlackBox Actions --------------------------------------------------------------------------------------
T.initPage('pageUserFwQuestionAnswerBlackBox');
export function getFwQuestionAnswerUserBlackBoxPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageUserFwQuestionAnswerBlackBox', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tt/lien-he/an-danh/user/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách box QA bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetUserBlackBoxPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách box QA bị lỗi!', 'danger'));
    };
}

export function createUserBlackBoxFwQuestionAnswer(item, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/an-danh/new-qa-box';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo hộp thư liên lạc mới bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo hộp thư liên lạc mới thành công!', 'success');
                // TODO: Viết lại cái getUserFwQuestionAnswerPage
                dispatch(getFwQuestionAnswerUserBlackBoxPage());
                done && done(data);
            }
        }, () => T.notify('Tạo dịch vụ bị lỗi!', 'danger'));
    };
}
