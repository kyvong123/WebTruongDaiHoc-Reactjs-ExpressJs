import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const svDsMienGiamGetAll = 'svDsMienGiam:GetAll';
const svDsMienGiamGetPage = 'svDsMienGiam:GetPage';
export default function svDsMienGiamReducer(state = null, data) {
    switch (data.type) {
        case svDsMienGiamGetAll:
            return Object.assign({}, state, { items: data.items });
        case svDsMienGiamGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('svDsMienGiamPage');
export function getSvDsMienGiamPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('svDsMienGiamPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/ds-mien-giam/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                dispatch({ type: svDsMienGiamGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger'));
    };
}

export function getActiveSvDsMienGiam(sqd, done) {
    return () => {
        const url = '/api/ctsv/ds-mien-giam/active';
        T.get(url, { sqd }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        }, () => T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger'));
    };
}

export function updateHoanSvDsMienGiam(condition, changes, done) {
    return () => {
        const url = '/api/ctsv/ds-mien-giam/hoan';
        T.put(url, { condition, changes }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        }, () => T.notify('Lấy danh sách sinh viên miễn giảm bị lỗi!', 'danger'));
    };
}
export function updateEndDate(mssv, qdId, changes, done) {
    return (dispatch) => {
        const url = '/api/ctsv/ds-mien-giam/update-end-date';
        T.put(url, { mssv, qdId, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật ngày kết thúc bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật ngày kết thúc thành công', 'success');
                dispatch(getSvDsMienGiamPage());
                done && done();
            }
        });
    };
}

