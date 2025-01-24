import T from 'view/js/common';
const TcHocBongGetPage = 'TcHocBong:GetAll';
const TcHocBongDanhSachGetPage = 'TcHocBongDanhSach:GetPage';


export default function tcHocBongReducer(state = null, data) {
    switch (data.type) {
        case TcHocBongGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcHocBongDanhSachGetPage:
            return Object.assign({}, state, { page: data.page, dsCauHinh: data.dsCauHinh });
        default:
            return state;
    }
}

T.initPage('tcHocBongDotHocBongPage');
export function getPageTcDotHocBong(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('tcHocBongDotHocBongPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khtc/hoc-bong/dot/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, res => {
            if (res.error) {
                console.error('GET: ', res.error.message);
                T.notify('Lấy dữ liệu đợt học bổng bị lỗi!', 'danger');
            } else {
                dispatch({ type: TcHocBongGetPage, page: res.page });
                done && done();
            }
        });
    };
}

T.initPage('tcHocBongDanhSachHocBongPage');
export function getDanhSachHocBongTc(idDot, pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('tcHocBongDanhSachHocBongPage', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/khtc/hoc-bong/dssv/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { idDot, condition: page.pageCondition, filter: page.filter }, res => {
            if (res.error) {
                console.error('GET: ', res.error.message);
                T.notify('Lấy dữ liệu đợt học bổng bị lỗi!', 'danger');
            } else {
                dispatch({ type: TcHocBongDanhSachGetPage, page: res.page, dsCauHinh: res.dsCauHinh });
                done && done(res.page);
            }
        });
    };
}

export function xuLyTcHocBong(idDot, danhSachSinhVien, done) {
    return (dispatch) => {
        const url = '/api/khtc/hoc-bong/dssv/confirm';
        T.post(url, { danhSachSinhVien }, res => {
            if (res.error) {
                T.notify('Xác nhận không thành công!', 'danger');
                console.error('POST: ', res.error.message);
            } else {
                T.notify('Xác nhận thành công!', 'success');
                dispatch(getDanhSachHocBongTc(idDot));
                done && done();
            }
        });
    };
}

export function hoanTacTcHocBong(idDot, mssv, idLichSu, done) {
    return (dispatch) => {
        const url = '/api/khtc/hoc-bong/dssv/confirm';
        T.delete(url, { mssv, idLichSu }, res => {
            if (res.error) {
                T.notify('Hoàn tác không thành công!', 'danger');
                console.error('POST: ', res.error.message);
            } else {
                T.notify('Hoàn tác thành công!', 'success');
                dispatch(getDanhSachHocBongTc(idDot));
                done && done();
            }
        });
    };
}

export function downloadExcelTcHocBong(idDot) {
    const url = '/api/khtc/hoc-bong/dssv/download-excel?';
    T.handleDownload(url + (new URLSearchParams({ idDot }).toString()));
}