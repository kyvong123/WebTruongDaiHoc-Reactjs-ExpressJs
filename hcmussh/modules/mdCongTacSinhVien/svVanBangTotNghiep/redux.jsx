import T from 'view/js/common';

const SvVbTotNghiepGetPage = 'SvVbTotNghiep:GetPage';

export default function SvVbTotNghiepReducer(state = null, data) {
    switch (data.type) {
        case SvVbTotNghiepGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('PageCtsvSvVbTotNghiep');
export function getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('PageCtsvSvVbTotNghiep', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = '/api/ctsv/van-bang-tot-nghiep/page';
        T.get(url, { ...page, filter, sortTerm }, data => {
            if (data.error) {
                T.notify('Lấy văn bằng tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: SvVbTotNghiepGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}


export function createSvVbTotNghiep(data, updateStudentStatus, done) {
    return dispatch => {
        const url = '/api/ctsv/van-bang-tot-nghiep';
        T.post(url, { data, updateStudentStatus }, data => {
            if (data.error) {
                T.notify('Tạo văn bằng tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch(getPageSvVbTotNghiep());
                T.notify('Tạo văn bằng tốt nghiệp thành công', 'success');
                done && done(data.items);
            }
        });
    };
}

export function bulkCreateSvVbTotNghiep(listData, updateStudentStatus, done) {
    return dispatch => {
        const url = '/api/ctsv/van-bang-tot-nghiep/multiple';
        T.post(url, { listData, updateStudentStatus }, data => {
            if (data.error) {
                T.notify('Tạo văn bằng tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch(getPageSvVbTotNghiep());
                T.notify('Tạo văn bằng tốt nghiệp thành công', 'success');
                done && done(data.failed);
            }
        });
    };
}

export function getSvVbTotNghiep(mssv, done) {
    return () => {
        const url = '/api/ctsv/van-bang-tot-nghiep/item';
        T.get(url, { mssv }, data => {
            if (data.error) {
                T.notify('Lấy văn bằng tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function updateSvVbTotNghiep(mssv, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/van-bang-tot-nghiep';
        T.put(url, { mssv, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật văn bằng tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật văn bằng tốt nghiệp thành công', 'success');
                dispatch(getPageSvVbTotNghiep());
                done && done();
            }
        });
    };
}

export function deleteSvVbTotNghiep(mssv, done) {
    return dispatch => {
        const url = '/api/ctsv/van-bang-tot-nghiep';
        T.delete(url, { mssv }, data => {
            if (data.error) {
                T.notify('Xóa văn bằng tốt nghiệp bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                T.notify('Xóa văn bằng tốt nghiệp thành công', 'success');
                dispatch(getPageSvVbTotNghiep());
                done && done();
            }
        });
    };
}


