import T from 'view/js/common';

// const tcHocPhiTheoMonGetItem = 'TcHocPhiTheoMon:GetItem';
const tcHocPhiTheoMonGetPage = 'TcHocPhiTheoMon:GetPage';
export default function TcHocPhiTheoMonReducer(state = null, data) {
    switch (data.type) {
        case tcHocPhiTheoMonGetPage:
            return Object.assign({}, state, { page: data.page });
        // case tcHocPhiTheoMonGetItem:
        //     return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

T.initPage('pageTcHocPhiTheoMon');
export function getTcHocPhiTheoMonPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcHocPhiTheoMon', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        dispatch({ type: tcHocPhiTheoMonGetPage, page: null });

        const url = `/api/khtc/hoc-phi-theo-mon/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách định mức học phí bị lỗi!', 'danger');
                console.error(`GET ${url}.`, data.error);
            } else {
                dispatch({ type: tcHocPhiTheoMonGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function capNhatThoiGianThanhToanGiangVienLength(filter, done) {
    return () => {
        const url = '/api/khtc/hoc-phi-theo-mon/thoi-gian-thanh-toan-giang-vien/length';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Cập nhật thời gian thanh toán cho giảng viên bị lỗi!', 'danger');
                console.error(`GET ${url}.`, result.error);
            }
            else {
                done && done(result.length);
            }
        });
    };
}

export function capNhatThoiGianThanhToanGiangVien(filter, data, done) {
    return dispatch => {
        const url = '/api/khtc/hoc-phi-theo-mon/thoi-gian-thanh-toan-giang-vien';
        T.post(url, { filter, data }, result => {
            if (result.error) {
                T.notify('Cập nhật thời gian thanh toán cho giảng viên bị lỗi!', 'danger');
                console.error(`POST ${url}.`, result.error);
            }
            else {
                const cookie = T.updatePage('pageTcHocPhiTheoMon');
                const { pageNumber, pageSize, pageCondition, filter: pageFilter } = cookie;
                done && done(result.length);
                dispatch(getTcHocPhiTheoMonPage(pageNumber, pageSize, pageCondition, pageFilter));
            }
        });
    };
}
export const SelectAdapter_HocPhan_Custom = (filter) => ({
    ajax: true,
    url: '/api/khtc/hoc-phi-theo-mon/hoc-phan',
    data: params => ({ condition: params.term, filter }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maHocPhan, item, text: `${item.maHocPhan}: ${T.parse(item.tenMonHoc, { vi: '' })?.vi}` })) : [] }),
    // fetchOne: (done) => (getHocPhan({}, item => done && done({ id: item.maHocPhan, item, text: `${item.maHocPhan}: ${T.parse(item.tenMonHoc, { vi: '' })?.vi}` })))(),
});

