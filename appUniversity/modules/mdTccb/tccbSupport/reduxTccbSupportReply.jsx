import T from 'view/js/common';

const GetTccbSupportReply = 'TccbSupportReply:Get';
export default function tccbSupportReply(state = null, data) {
    switch (data.type) {
        case GetTccbSupportReply:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getTccbReply(maYeuCau, done) {
    return dispatch => {
        const url = `/api/tccb/support-reply/${maYeuCau}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy các phản hồi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: GetTccbSupportReply, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createTccbSupportReply(dataPhanHoi, done) {
    return dispatch => {
        const url = '/api/tccb/support-reply';
        T.post(url, { dataPhanHoi }, result => {
            if (result.error) {
                T.notify('Lỗi tạo phản hồi', 'danger');
                console.error(result.error);
            } else {
                dispatch(getTccbReply(dataPhanHoi.maYeuCau));
                done && done(result.item);
            }
        });
    };
}