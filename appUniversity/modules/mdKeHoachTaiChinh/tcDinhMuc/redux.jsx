import T from 'view/js/common';

const tcDinhMucGetItem = 'TcDinhMuc:GetItem';
const tcDinhMucGetPage = 'TcDinhMuc:GetPage';
export default function reducers(state = null, data) {
    switch (data.type) {
        case tcDinhMucGetPage:
            return Object.assign({}, state, { page: data.page });
        case tcDinhMucGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}


T.initPage('pageTcDinhMuc');
export function getPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcDinhMuc', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        dispatch({ type: tcDinhMucGetPage, page: null });

        const url = `/api/khtc/dinh-muc/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách định mức học phí bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: tcDinhMucGetPage, page: data.page });
                done && done(data.settings);
            }
        });
    };
}


export function createDinhMuc(data, done) {
    const url = '/api/khtc/dinh-muc';
    T.post(url, data, (res) => {
        if (res.error) {
            T.notify('Tạo định mức lỗi.' + (res.error.message ? ` ${res.error.message}` : ''), 'danger');
            console.error('POST: ' + url, res.error);
        } else {
            T.notify('Tạo định mức thành công.', 'success');
            done && done(res.item);
        }
    }, () => T.notify('Tạo định mức lỗi', 'danger'));
}

export function createDinhMucDetail(data, done) {
    const url = '/api/khtc/dinh-muc/detail';
    T.post(url, data, (res) => {
        if (res.error) {
            T.notify('Tạo định mức lỗi.' + (res.error.message ? ` ${res.error.message}` : ''), 'danger');
            console.error('POST: ' + url, res.error);
        } else {
            T.notify('Tạo định mức thành công.', 'success');
            done && done(res.item);
        }
    }, () => T.notify('Tạo định mức lỗi', 'danger'));
}

export function updateDinhMucDetail(id, data, done) {
    const url = `/api/khtc/dinh-muc/detail/${id}`;
    T.put(url, data, (res) => {
        if (res.error) {
            T.notify('Cập nhật định mức lỗi.' + (res.error.message ? ` ${res.error.message}` : ''), 'danger');
            console.error('PUT: ' + url, res.error);
        } else {
            T.notify('Cập nhật định mức thành công.', 'success');
            done && done(res.item);
        }
    }, () => T.notify('Cập nhật định mức lỗi', 'danger'));
}

export function lookup(data, done, onFinish) {
    const url = '/api/khtc/dinh-muc/lookup';
    return () => {
        T.post(url, data, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Tra cứu lỗi.' + (res.error.message ? ` ${res.error.message}` : ''), 'danger');
                console.error('POST: ' + url, res.error);
                done && done(0);
            } else {
                T.notify('Tra cứu thành công.', 'success');
                done && done(res.item.soTien);
            }
        }, () => T.notify('Tra cứu lỗi', 'danger'));
    };
}

export function deleteDinhMucDetail(id, done) {
    const url = `/api/khtc/dinh-muc/detail/${id}`;
    T.delete(url, (res) => {
        if (res.error) {
            T.notify('Xóa định mức lỗi.' + (res.error.message ? ` ${res.error.message}` : ''), 'danger');
            console.error('DELETE: ' + url, res.error);
        } else {
            T.notify('Xóa định mức thành công.', 'success');
            done && done(res.item);
        }
    }, () => T.notify('Xóa định mức lỗi', 'danger'));
}

export function getDinhMuc(namHoc, hocKy, namTuyenSinh, done) {
    const url = `/api/khtc/dinh-muc/item/${namHoc}/${hocKy}/${namTuyenSinh}`;
    return (dispatch) => {
        T.get(url, (res) => {
            if (res.error) {
                T.notify('Lấy định mức lỗi.' + (res.error.message ? ` ${res.error.message}` : ''), 'danger');
                console.error('GET: ' + url, res.error);
            } else {
                // T.notify('Lấy định mức thành công.', 'success');
                dispatch({ type: tcDinhMucGetItem, item: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy định mức lỗi', 'danger'));
    };
}

export function cloneDinhMuc(data, done) {
    return dispatch => {
        const url = '/api/khtc/dinh-muc/clone';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Sao chép định mức lỗi', 'danger');
                console.error('POST:', url, res.error);
            } else {
                T.notify('Sao chép định mức thành công', 'success');
                dispatch(getPage());
                done && done();
            }
            done && done();
        });
    };
}

export function getDinhMucHocPhiKhac(data, done) {
    return () => {
        const url = '/api/khtc/dinh-muc/hoc-phi-khac';
        T.get(url, data, res => {
            if (res.error) {
                T.notify('Lấy thông tin định mức học phí không thành công', 'danger');
                console.error('GET:', url, res.error);
            } else {
                done && done(res);
            }
        });
    };
}