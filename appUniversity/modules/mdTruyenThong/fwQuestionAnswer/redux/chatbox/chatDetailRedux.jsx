import T from 'view/js/common';

const FwQuestionAnswerGetDetailUserPage = 'FwQuestionAnswer:GetDetailUserPage';

export default function FwChatboxDetailReducer(state = null, data) {
    switch (data.type) {
        case FwQuestionAnswerGetDetailUserPage:
            return Object.assign({}, state, { detailPage: data.page });
        default:
            return state;
    }
}

export function getFwQuestionAnswerChatDetailPage(fwQuestionAnswerId, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/get-qa-box-detail'; // TODO: API here for getting box detail
        T.get(url, { condition: { fwQaId: fwQuestionAnswerId } }, data => {
            if (data.error) {
                console.error(data.error);
                if (data.error.message == 'Access denied') {
                    T.notify('Bạn không có quyền truy cập hộp thư này!', 'danger');
                    console.error(`GET: ${url}.`, data.error);
                } else {
                    T.notify('Lấy thông tin chi tiết hộp thư bị lỗi!', 'danger');
                    console.error(`GET: ${url}.`, data.error);
                }
            } else {
                done && done(data.page);
                dispatch({ type: FwQuestionAnswerGetDetailUserPage, page: data.page });
            }
        }, () => T.notify('Lấy thông tin chi tiết hộp thư bị lỗi!', 'danger'));
    };
}

export function getFwQuestionAnswerMessagePage(pageNumber, pageSize, maQa, done) {
    return () => {
        const url = `/api/tt/chatbox/messages/page/${pageNumber}/${pageSize}`;
        T.get(url, { maQa }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin nhắn bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.page);
            }
        });
    };
}


export function closeFwQuestionAnswer(id, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/close-box';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Close box QA bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Close box QA thành công!', 'success');
                dispatch(getFwQuestionAnswerChatDetailPage(id));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin QA box bị lỗi!', 'danger'));
    };
}


export function createFwQuestionAnswerMessage(fwQaId, messageContent, done) {
    return dispatch => {
        const url = '/api/tt/lien-he/new-message'; // TODO: API here for sending message
        T.post(url, { data: { fwQaId, messageContent } }, data => {
            if (data.error) {
                T.notify(`${data.error.message}`, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch(getFwQuestionAnswerChatDetailPage(fwQaId));
            }
        }, () => T.notify('Gửi tin nhắn bị lỗi!', 'danger'));
    };
}

export function clearUnsaveImagesFwQAMessage(done) {
    return () => {
        const url = '/api/tt/lien-he/clear-unsave-message';
        T.delete(url, { imgList: [] }, data => {
            if (data.error) {
                T.notify('Xóa hình tạm bị lỗi!', 'danger');
            } else {
                console.log('done', done);
                if (done) done();
            }
        }, () => T.notify('Xóa hình tạm bị lỗi!', 'danger'));
    };
}