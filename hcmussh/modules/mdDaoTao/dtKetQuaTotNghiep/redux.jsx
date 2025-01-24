import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtKetQuaTotNghiepGetPage = 'dtKetQuaTotNghiep:GetPage';

export default function dtKetQuaTotNghiepReducer(state = null, data) {
    switch (data.type) {
        case DtKetQuaTotNghiepGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDtKetQuaTotNghiep');
export function getDtKetQuaTotNghiepPage(pageNumber, pageSize, filter, done) {
    const page = T.updatePage('pageDtKetQuaTotNghiep', pageNumber, pageSize, null, filter);
    return dispatch => {
        const url = `/api/dt/ket-qua-tot-nghiep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kết quả tốt nghiệp bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtKetQuaTotNghiepGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function saveImportKetQuaTotNghiep(items, idDot, done) {
    return () => {
        T.post('/api/dt/ket-qua-tot-nghiep/save-import', { items, idDot }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', false, 2000);
            } else {
                done && done(result);
            }
        });
    };
}

export function deleteKetQuaTotNghiep(id, done) {
    return () => {
        T.delete('/api/dt/ket-qua-tot-nghiep', { id }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', false, 2000);
            } else {
                done && done(result);
            }
        });
    };
}