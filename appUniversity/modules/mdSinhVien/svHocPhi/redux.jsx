import T from 'view/js/common';

// const SvHocPhiGet = 'SvHocPhi:Get';
const SvHocPhi = 'SvHocPhi:All';

export default function svHocPhiReducer(state = null, data) {
    switch (data.type) {
        case SvHocPhi:
            return Object.assign({}, state, { dataAll: data.result });
        // case SvHocPhiGet:
        //     return Object.assign({}, state, { data: data.result });
        default:
            return state;
    }
}


export function vnPayGoToTransaction(bank, done) {
    return () => {
        T.get(`/api/sv/vnpay/start-thanh-toan/${bank}`, (result) => {
            if (result.error) {
                T.notify('Thanh toán bằng VNPAY thất bại!', 'danger');
                console.error(result.error);
            } else {
                done(result);
            }
        });
    };
}
export function getAllHocPhiStudent(done) {
    return dispatch => {
        const url = '/api/sv/hoc-phi/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
                dispatch({ type: SvHocPhi, result });
            }
        });
    };
}

export function getDetailHocPhi(done) {
    return () => {
        const url = '/api/sv/hoc-phi-page/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getSubDetailHocPhi(idDotDong, done) {
    return () => {
        const url = '/api/sv/hoc-phi-sub-detail/all';
        T.get(url, { idDotDong }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getInvoiceStudent(done) {
    return () => {
        const url = '/api/sv/invoice/page';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin hóa đơn!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        }, () => T.notify('Lỗi khi lấy thông tin hóa đơn!', 'danger'));
    };
}
