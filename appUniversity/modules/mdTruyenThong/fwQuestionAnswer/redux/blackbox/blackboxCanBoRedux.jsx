import T from 'view/js/common';

const FwQuestionAnswerGetBlackBoxPage = 'FwQuestionAnswer:GetBlackBoxPage';
const FwQuestionAnswerGetPhuTrachBlackBoxPage = 'FwQuestionAnswer:GetPhuTrachBlackBoxPage';

export default function FwBlackboxCanBoReducer(state = null, data) {
    switch (data.type) {
        case FwQuestionAnswerGetBlackBoxPage:
            return Object.assign({}, state, { blackBoxPage: data.page });
        case FwQuestionAnswerGetPhuTrachBlackBoxPage:
            return Object.assign({}, state, { phuTrachBlackBoxPage: data.page });
        default:
            return state;
    }
}

// Manage Blackbox Don Vi Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageFwQuestionAnswerBlackBox');
export function getFwQuestionAnswerBlackBoxPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageFwQuestionAnswerBlackBox', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tt/lien-he/an-danh/quan-ly/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thông tin liên hệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetBlackBoxPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách thông tin liên hệ bị lỗi!', 'danger'));
    };
}

T.initPage('pagePhuTrachFwQuestionAnswerBlackBox');
export function getFwQuestionAnswerPhuTrachBlackBoxPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pagePhuTrachFwQuestionAnswerBlackBox', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tt/lien-he/an-danh/quan-ly/phu-trach/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách box FA phụ trách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetPhuTrachBlackBoxPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách box FA phụ trách bị lỗi!', 'danger'));
    };
}

export function acceptBlackBoxFwQuestionAnswerCanBo(id, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/an-danh/nhan-black-box';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Nhận Blackbox bị lỗi (Có thể đã có cán bộ ấn nút nhận phụ trách box trước bạn)!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Nhận Blackbox thành công!', 'success');
                dispatch(getFwQuestionAnswerPhuTrachBlackBoxPage());
                dispatch(getFwQuestionAnswerBlackBoxPage());
                done && done(data);
            }
        }, () => T.notify('Nhận Blackbox box bị lỗi!!', 'danger'));
    };
}