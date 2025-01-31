import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ThongTinTaiChinhCanBoGetAll = 'ThongTinTaiChinhCanBo:GetAll';
const ThongTinTaiChinhCanBoGetPage = 'ThongTinTaiChinhCanBo:GetPage';

export default function ThongTinTaiChinhCanBoReducer(state = null, data) {
    switch (data.type) {
        case ThongTinTaiChinhCanBoGetAll:
            return Object.assign({}, state, { items: data.items });
        case ThongTinTaiChinhCanBoGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('thongTinTaiChinhCanBoPage');
export function getThongTinTaiChinhCanBoPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('thongTinTaiChinhCanBoPage', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        const url = `/api/tccb/thong-tin-tai-chinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter, sortTerm }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách thông tin tài chính cán bộ bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: ThongTinTaiChinhCanBoGetPage, page: data.page });
                done && done(data.page);
            }
        },
            () => T.notify('Lấy danh sách thông tin tài chính cán bộ bị lỗi!', 'danger')
        );
    };
}

export function exportExcel(filter, searchText, sortTerm) {
    return () => {
        const url = ('/api/tccb/thong-tin-tai-chinh/download-excel');
        T.get(url, { filter, searchText, sortTerm }, (res) => {
            if (res.error) {
                T.notify('Tải thông tin tài chính cán bộ bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                T.FileSaver(new Blob([new Uint8Array(res.buffer.data)]), res.filename);
            }
        }, (error) => T.notify('Tải thông tin tài chính cán bộ bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}