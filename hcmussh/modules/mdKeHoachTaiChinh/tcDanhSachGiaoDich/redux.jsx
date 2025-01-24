import T from 'view/js/common';

const TcTongGiaoDichGetPage = 'TcTongGiaoDich:GetPage';
const TcTongGiaoDichGetListNganHang = 'TcTongGiaoDich:GetListNganHang';
const TcTongGiaoDichCompare = 'TcTongGiaoDich:Compare';

export default function tcGiaoDich(state = null, data) {
    switch (data.type) {
        case TcTongGiaoDichGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcTongGiaoDichGetListNganHang:
            return Object.assign({}, state, { nganHang: data.nganHang });
        case TcTongGiaoDichCompare:
            return Object.assign({}, state, { soPhu: data.result });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcTongGiaoDich');
export function getTongGiaoDichPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcTongGiaoDich', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        dispatch({ type: TcTongGiaoDichGetPage, page: null });
        const url = `/api/khtc/danh-sach-giao-dich/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phí bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: TcTongGiaoDichGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getListNganHang(done) {
    return dispatch => {
        const url = '/api/khtc/danh-sach-giao-dich/list-ngan-hang-sinh-vien';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách ngân hàng lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
            }
            else {
                dispatch({ type: TcTongGiaoDichGetListNganHang, nganHang: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách ngân hàng lỗi', 'danger'));
    };
}

export function createInvoice(transactionId, done, onError) {
    return dispatch => {
        const url = '/api/khtc/invoice';
        T.post(url, { transactionId }, res => {
            if (res.error) {
                T.notify('Tạo hóa đơn lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error);
                onError && onError();
            }
            else {
                T.notify('Tạo hóa đơn thành công', 'success');
                dispatch(getTongGiaoDichPage());
                done && done(res.item);
            }
        }, () => T.notify('Tạo hóa đơn lỗi', 'danger'));
    };
}

export function getCongNo(mssv, done) {
    return () => {
        const url = '/api/khtc/danh-sach-giao-dich/get-cong-no';
        T.get(url, { mssv }, res => {
            if (res.error) {
                T.notify('Cập nhật công nợ thất bại', 'danger');
                console.error(`GET: ${url}.`, res.error);
            }
            else {
                done && done(res.congNo);
            }
        });
    };
}

export function createGiaoDich(data, done) {
    return dispatch => {
        const url = '/api/khtc/danh-sach-giao-dich';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Tạo giao dịch lỗi. ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
            }
            else {
                T.notify('Tạo giao dịch thành công', 'success');
                dispatch(getTongGiaoDichPage());
                done && done(res.items);
            }
        }, () => T.notify('Tạo giao dịch lỗi', 'danger'));
    };
}

export function updateGiaoDich(keys, changes, done) {
    return dispatch => {
        const url = '/api/khtc/danh-sach-giao-dich';
        T.put(url, { keys, changes }, res => {
            if (res.error || changes == null) {
                T.notify('Cập nhật thông tin giao dịch lỗi. ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`PUT: ${url}.`, res.error);
            }
            else {
                T.notify('Cập nhật giao dịch thành công', 'success');
                dispatch(getTongGiaoDichPage());
                done && done(res);
            }
        }, () => T.notify('Cập nhật giao dịch lỗi', 'danger'));
    };
}

export function cancelGiaoDich(data, done) {
    return dispatch => {
        const url = '/api/khtc/danh-sach-giao-dich/huy';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Hủy giao dịch lỗi. ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
            }
            else {
                if (res.invoiceId) {
                    const urlInvoice = `/api/khtc/invoice/cancel/${res.invoiceId}`;
                    T.post(urlInvoice, { lyDo: 'Hủy giao dịch' }, res => {
                        if (res.error) {
                            T.notify('Hủy hóa đơn lỗi. ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                        }
                        else {
                            T.notify('Hủy hóa đơn thành công', 'success');
                        }
                    }, () => T.notify('Hủy hóa đơn lỗi', 'danger'));
                }
                T.notify('Hủy giao dịch thành công', 'success');
                dispatch(getTongGiaoDichPage());
                done && done();
            }
        }, () => T.notify('Hủy giao dịch lỗi', 'danger'));
    };
}

export function getBankStatistic(data, done) {
    return () => {
        const url = '/api/khtc/danh-sach-giao-dich/bank/stat';
        T.get(url, { data: T.stringify(data) }, res => {
            if (res.error) {
                T.notify('Lấy thông tin giao dịch lỗi ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
            }
            else {
                done && done(res.data);
            }
        }, () => T.notify('Lấy thông tin giao dịch lỗi '));
    };
}
export function getInfoInvocie(item, done) {
    return () => {
        const url = '/api/khtc/invoice/info';
        T.get(url, item, res => {
            if (res.error) {
                T.notify('Lấy thông tin hóa đơn lỗi ' + (res.error.message && typeof res.error.message === 'string' ? res.error.message : ''), 'danger');
                console.error(`GET: ${url}.`, res.error);
            }
            else {
                done && done(res);
            }
        }, () => T.notify('Lấy thông tin hóa đơn lỗi'));
    };
}

export function createInvoiceTransaction(data, done) {
    return dispatch => {
        const url = '/api/khtc/invoice-transaction';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hóa đơn lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error);
            }
            else {
                T.notify('Tạo hóa đơn thành công', 'success');
                dispatch(getTongGiaoDichPage());
                done && done();
            }
        }, () => T.notify('Tạo hóa đơn lỗi', 'danger'));
    };
}

export function createInvoiceList(data, done, onError) {
    return () => {
        const url = '/api/khtc/invoice/list';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Tạo hóa đơn lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error);
                onError && onError();
            }
            else {
                T.notify('Yêu cầu xuất hóa đơn của bạn đang được xử lý', 'warning');
                done && done();
            }
        }, () => T.notify('Tạo hóa đơn lỗi', 'danger'));
    };
}

export function getPendingListInvoiceLength(data, done, onError) {
    return () => {
        const url = '/api/khtc/invoice/list/length';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Lấy số hóa đơn lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error);
                onError && onError();
            }
            else {
                done && done(res.length);
            }
        }, () => T.notify('Lấy số hóa đơn lỗi', 'danger'));
    };
}

export function getCompareData(name, info, done, onError) {
    return (dispatch) => {
        const url = '/api/khtc/danh-sach-giao-dich/compare/result/' + name;
        dispatch({ type: TcTongGiaoDichCompare, result: null });

        T.get(url, { info }, res => {
            if (res.error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
                onError && onError();
            }
            else {
                dispatch({ type: TcTongGiaoDichCompare, result: res });
                done && done(res);
            }
        }, () => T.notify('Lấy dữ liệu lỗi', 'danger'));
    };
}

export function setupExcelCanTru(filter, done) {
    return () => {
        const url = '/api/khtc/danh-sach-giao-dich/excel-can-tru';
        T.get(url, { filter }, res => {
            if (res.error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
            }
            else {
                T.notify('Thành công', 'success');
                done && done(res);
            }
        }, () => T.notify('Lấy dữ liệu lỗi', 'danger'));
    };
}

export function downloadExcelCanTru(filePath, done) {
    return () => {
        const url = '/api/khtc/danh-sach-giao-dich/excel-can-tru/download';
        T.get(url, { filePath }, res => {
            if (res.error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
            }
            else {
                done && done(res);
            }
        }, () => T.notify('Lấy dữ liệu lỗi', 'danger'));
    };
}