import T from 'view/js/common';

const TcInvoiceGetPage = 'TcInvoice:GetPage';

export default function tcInvoiceReducer(state = null, data) {
    switch (data.type) {
        case TcInvoiceGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcInvoice');
export function getInvoicePage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcInvoice', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/khtc/invoice/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hóa đơn bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcInvoiceGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function sendInvoiceMail(id, done) {
    return () => {
        const url = '/api/khtc/invoice/mail';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Gửi mail hóa đơn lỗi!', 'danger');
                console.error(`POST ${url}.`, data.error);
            } else {
                T.notify('Gửi mail hóa đơn thành công', 'success');
                done && done(data.page);
            }
        }, () => T.notify('Gửi mail hóa đơn lỗi!', 'danger'));
    };
}

export function cancelInvoice(id, lyDo, done, onError) {
    return dispatch => {
        const url = `/api/khtc/invoice/cancel/${id}`;
        T.post(url, { lyDo }, res => {
            if (res.error) {
                T.notify('Hủy hóa đơn lỗi. ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
                onError && onError();
            }
            else {
                const cookie = T.updatePage('pageTcInvoice');
                const { pageNumber, pageSize, pageCondition, pageFilter } = cookie;
                T.notify('Hủy hóa đơn thành công', 'success');
                dispatch(getInvoicePage(pageNumber, pageSize, pageCondition, pageFilter));
                done && done();
            }
        }, () => T.notify('Hủy hóa đơn lỗi', 'danger'));
    };
}

export function addInvoice(data, done) {
    return dispatch => {
        const url = '/api/khtc/add-invoice';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo hóa đơn lỗi!', 'danger');
                console.error(`POST ${url}.`, result.error);
            } else {
                T.notify('Tạo hóa đơn thành công!', 'success');
                dispatch(getInvoicePage());
                done && done();
            }
        }, () => T.notify('Giao dịch không tồn tại', 'danger'));

    };
}

export function checkStatusInvoice(done) {
    return dispatch => {
        const url = '/api/khtc/invoice/check-invoice';
        T.post(url, result => {
            if (result.error) {
                T.notify('Kiểm tra hóa đơn lỗi!', 'danger');
                console.error(`POST ${url}.`, result.error);
            } else {
                T.notify('Tạo tiến trình kiểm tra thành công!', 'success');
                dispatch(getInvoicePage());
                done && done();
            }
        }, () => T.notify('Kiểm tra hóa đơn lỗi!', 'danger'));

    };
}
