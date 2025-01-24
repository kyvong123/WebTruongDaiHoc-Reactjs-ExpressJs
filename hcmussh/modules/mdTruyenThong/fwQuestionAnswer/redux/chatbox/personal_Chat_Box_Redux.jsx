import T from 'view/js/common';

const FwPersonalChatboxGetPage = 'FwPersonalChatbox:GetPage';

export default function FwPersonalChatboxReducer(state = null, data) {
    switch (data.type) {
        case FwPersonalChatboxGetPage:
            return Object.assign({}, state, { personalPage: data.page });
        default:
            return state;
    }
}

T.initPage('pageFwPersonalChatbox');
export function getFwPersonalChatboxPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageFwPersonalChatbox', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tt/chatbox/personal/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chatbox cá nhân bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwPersonalChatboxGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách chatbox cá nhân bị lỗi!', 'danger'));
    };
}
