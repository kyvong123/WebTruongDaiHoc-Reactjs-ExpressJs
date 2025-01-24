import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dtThongKeGetPage = 'dtThongKe:GetPage';
const dtThongKeGetAll = 'dtThongKe:GetAll';

export default function dtThongKeReducer(state = null, data) {
    switch (data.type) {
        case dtThongKeGetPage:
            return Object.assign({}, state, { page: data.page });
        case dtThongKeGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

T.initPage('pageDtThongKe');
export function getDtThongKeQuiMoAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/thong-ke-qui-mo/all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy thống kê qui mô sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: dtThongKeGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtThongKeDangKyAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/thong-ke-dang-ky/all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy thống kê đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: dtThongKeGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtThongKeHocLaiCaiThienAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/thong-ke-hoc-lai-cai-thien/all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy thống kê đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: dtThongKeGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtThongKeDangKyPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKe', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtThongKeHLCTPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKe', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-hoc-lai-cai-thien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên học lại học cải thiện bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtThongKeHocPhiAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/thong-ke-hoc-phi/all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy thống kê học phí bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: dtThongKeGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtThongKeHocPhiPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKe', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên đóng học phí bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtThongKeDiemTrungBinhAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/thong-ke-diem-trung-binh/all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy thống kê điểm trung bình bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: dtThongKeGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtThongKeDiemTrungBinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKe', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-diem-trung-binh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm trung bình của sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}