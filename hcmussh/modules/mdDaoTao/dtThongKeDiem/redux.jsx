import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dtThongKeDiemGetPage = 'dtThongKeDiem:GetPage';
const dtThongKeDiemGetAll = 'dtThongKeDiem:GetAll';

export default function dtThongKeDiemReducer(state = null, data) {
    switch (data.type) {
        case dtThongKeDiemGetPage:
            return Object.assign({}, state, { page: data.page });
        case dtThongKeDiemGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

T.initPage('pageDtThongKeDiem');
export function getDtThongKeDiemTbPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKeDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-diem/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm trung bình của sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeDiemGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtThongKeDiemDatPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKeDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-diem/diem-dat-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm điểm đạt của lớp học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeDiemGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtThongKeDiemTongHopPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThongKeDkhp', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thong-ke-diem/diem-tong-hop-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm điểm đạt của lớp học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: dtThongKeDiemGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}