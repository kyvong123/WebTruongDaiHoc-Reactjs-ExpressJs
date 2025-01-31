import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetPage = 'manageSinhVien:GetPage';
export default function studentListReducer(state = null, data) {
    switch (data.type) {
        case sinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//ACTIONS--------------------------------------------------------------------------------------------------
T.initPage('pageManageStudent');
export function getStudentListPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageManageStudent', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/manage-student/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienGetPage, page: result.page });
                done && done(result.page);
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}