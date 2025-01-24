import T from 'view/js/common';

const FwQuestionAnswerGetPage = 'FwQuestionAnswer:GetPage';
const FwQuestionAnswerGetPhuTrachPage = 'FwQuestionAnswer:GetPhuTrachPage';

export default function FwQaCanBoReducer(state = null, data) {
    switch (data.type) {
        case FwQuestionAnswerGetPage:
            return Object.assign({}, state, { page: data.page });
        case FwQuestionAnswerGetPhuTrachPage:
            return Object.assign({}, state, { phuTrachPage: data.page });
        default:
            return state;
    }
}

// Admin Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageFwQuestionAnswer');

export function getFwQuestionAnswerPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageFwQuestionAnswer', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tt/lien-he/quan-ly/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thông tin liên hệ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách thông tin liên hệ bị lỗi!', 'danger'));
    };
}

T.initPage('pagePhuTrachFwQuestionAnswer');

export function getFwQuestionAnswerPhuTrachPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pagePhuTrachFwQuestionAnswer', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/tt/lien-he/quan-ly/phu-trach/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách box FA phụ trách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetPhuTrachPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách box FA phụ trách bị lỗi!', 'danger'));
    };
}

export function createFwQuestionAnswer(item, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/quan-ly';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo dịch vụ bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới thông tin QA box thành công!', 'success');
                dispatch(getFwQuestionAnswerPage());
                done && done(data);
            }
        }, () => T.notify('Tạo dịch vụ bị lỗi!', 'danger'));
    };
}

export function deleteFwQuestionAnswer(ma) {
    return dispatch => {
        const url = '/api/tt/lien-he/quan-ly';
        T.delete(url, { ma: ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục dịch vụ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
                dispatch(getFwQuestionAnswerPage());
            }
        }, () => T.notify('Xóa dịch vụ bị lỗi!', 'danger'));
    };
}

export function updateFwQuestionAnswer(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/quan-ly';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin QA box bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin QA box thành công!', 'success');
                dispatch(getFwQuestionAnswerPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin QA box bị lỗi!', 'danger'));
    };
}

export function acceptFwQuestionAnswer(id, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/nhan-qa-box';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Nhận QA box bị lỗi (Có thể đã có cán bộ ấn nút nhận phụ trách box trước bạn)!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Nhận QA box thành công!', 'success');
                dispatch(getFwQuestionAnswerPage());
                dispatch(getFwQuestionAnswerPhuTrachPage());
                done && done(data);
            }
        }, () => T.notify('Nhận QA box bị lỗi!!', 'danger'));
    };
}