import T from 'view/js/common';

// Reducer ------------------------------
const DtDiemMienGetPage = 'DtDiemMien:GetPage';
export default function DtDiemMienReducer(state = null, data) {
    switch (data.type) {
        case DtDiemMienGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//ACTIONS-------------------------------------------------------------------------------------------------------------
T.initPage('pageDtDiemMien');
export function dtDiemMienGetPage(pageNumber, pageSize, pageCondition = '', filter, done) {
    const page = T.updatePage('pageDtDiemMien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: DtDiemMienGetPage, page: { totalItem: page.totalItem, pageNumber, pageTotal: page.pageTotal, pageSize, list: null } });
        const url = `/api/dt/diem-mien/data/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lỗi lấy dữ liệu điểm', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtDiemMienGetPage, page: result.page });
                done && done(result.page);
            }
        });
    };
}

export function dtDiemMienSaveImport(dataDiem, done) {
    return () => {
        T.post('/api/dt/diem-mien/save-import', { dataDiem }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function deleteDtDiemMien(data, done) {
    return () => {
        T.delete('/api/dt/diem-mien', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function addDtDiemMien(list, done) {
    const cookie = T.updatePage('pageDtDiemMien');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/diem-mien';
        T.post(url, { list }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                dispatch(dtDiemMienGetPage(pageNumber, pageSize, pageCondition, filter));
                done && done(result);
                if (result.listError.length) T.alert(`Môn học ${result.listError.toString()} đã được đăng ký trong năm học, học kỳ!`, 'error', false, 5000);
                else T.alert('Tạo môn học miễn cho sinh viên thành công!', 'success', false, 2000);
            }
        });
    };
}