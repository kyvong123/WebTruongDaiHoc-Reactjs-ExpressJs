import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SmsManageGetPage = 'SmsManage:GetPage';

export default function smsManageReducer(state = null, data) {
    switch (data.type) {
        case SmsManageGetPage: {
            return Object.assign({}, state, { page: data.page });
        }
        default:
            return state;
    }
}

T.initPage('smsManagePage');
export function getSmsManagePage(pageNumber, pageSize, done) {
    const page = T.updatePage('smsManagePage', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/sms-manage/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách SMS bị lỗi', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
                dispatch({ type: SmsManageGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách SMS bị lỗi!', 'danger'));
    };
}

export function sendSms(item, done) {
    return dispatch => {
        const url = '/api/sms-manage/send-sms';
        T.post(url, { item }, res => {
            if (res.error) {
                T.notify('Gửi SMS bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${res.error}`);
            } else {
                done && done();
                T.notify('Đã gửi tin nhắn SMS', 'info');
                dispatch(getSmsManagePage());
            }
        }, () => T.notify('Gửi SMS bị lỗi!', 'danger'));
    };
}