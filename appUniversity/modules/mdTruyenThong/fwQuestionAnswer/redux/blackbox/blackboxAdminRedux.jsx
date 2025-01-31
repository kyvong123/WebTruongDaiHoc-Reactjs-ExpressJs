import T from 'view/js/common';

const FwQuestionAnswerGetBlackBoxAdminPage = 'FwQuestionAnswer:GetBlackBoxAdminPage';

export default function FwBlackboxAdminReducer(state = null, data) {
    switch (data.type) {
        case FwQuestionAnswerGetBlackBoxAdminPage:
            return Object.assign({}, state, { blackBoxAdminPage: data.page });
        default:
            return state;
    }
}

T.initPage('pageFwQuestionAnswerBlackBoxAdmin');
export function getFwQuestionAnswerBlackBoxAdminPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageFwQuestionAnswerBlackBoxAdmin', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tt/lien-he/an-danh/admin/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thông tin liên hệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetBlackBoxAdminPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách thông tin liên hệ bị lỗi!', 'danger'));
    };
}

export function assignBlackBoxFwQuestionAnswerAdmin(id, email, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/an-danh/assign-qa-box';
        T.put(url, { id, email }, data => {
            if (data.error) {
                T.notify('Gán QA box bị lỗi (Có thể hộp thư đã có cán bộ phụ trách)!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Gán QA box thành công!', 'success');
                dispatch(getFwQuestionAnswerBlackBoxAdminPage());
                done && done(data);
            }
        }, () => T.notify('Gán QA box bị lỗi (Có thể hộp thư đã có cán bộ phụ trách)!!', 'danger'));
    };
}


export function acceptBlackBoxFwQuestionAnswerAdmin(id, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/an-danh/nhan-black-box';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Nhận Blackbox bị lỗi (Có thể đã có cán bộ ấn nút nhận phụ trách box trước bạn)!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Nhận Blackbox thành công!', 'success');
                dispatch(getFwQuestionAnswerBlackBoxAdminPage());
                done && done(data);
            }
        }, () => T.notify('Nhận Blackbox box bị lỗi!!', 'danger'));
    };
}