import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtBaoLuuGetAll = 'DtBaoLuu:GetAll';
const DtBaoLuuGetPage = 'DtBaoLuu:GetPage';

export default function DtBaoLuuReducer(state = null, data) {
    switch (data.type) {
        case DtBaoLuuGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtBaoLuuGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function dtBaoLuuGetPage(pageNumber, pageSize, pageCondition, filter, done) {
    return dispatch => {
        const url = `/api/dt/sinh-vien-bao-luu/page/${pageNumber || 1}/${pageSize || 5000}`;
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên bảo lưu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: DtBaoLuuGetPage, page: result.page });
                done && done(result.page);
            }
        }, () => T.notify('Lấy danh sách sinh viên bảo lưu bị lỗi!', 'danger'));
    };
}