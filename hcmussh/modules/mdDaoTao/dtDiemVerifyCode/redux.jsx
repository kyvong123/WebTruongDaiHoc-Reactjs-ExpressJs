import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDiemVerifySearchAll = 'DtDiemVerify:SearchAll';
export default function dtVerifyCodeReducer(state = null, data) {
    switch (data.type) {
        case DtDiemVerifySearchAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

//ACTIONS-------------------------------------------------------------------------------------------------------------

export function dtDiemVerifyCodeConfirm(listCode, data, done) {
    return () => {
        T.post('/api/dt/diem-verify/confirm', { listCode, data }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, 5000);
            } else {
                done && done(result);
            }
        });
    };
}

export function dtDiemVerifyCodeGetValue(idFolder, done) {
    return () => {
        const url = '/api/dt/diem-verify/get-value';
        T.get(url, { idFolder }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, 5000);
            } else {
                done && done(result);
            }
        });
    };
}

export function dtDiemVerifySearchAll(filter, done) {
    return dispatch => {
        const url = '/api/dt/diem-verify/search-all';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, 5000);
            } else {
                done && done(result);
                dispatch({ type: DtDiemVerifySearchAll, items: result.items });
            }
        });
    };
}

export function dtDiemVerifyCheck(listCode, idFolder, done) {
    return () => {
        const url = '/api/dt/diem-verify/check-code';
        T.post(url, { listCode, idFolder }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, 5000);
            } else {
                done && done(result);
            }
        });
    };
}

export function dtDiemVerifyCreateNew(code, idFolder, done) {
    return () => {
        const url = '/api/dt/diem-verify/check-code/item';
        T.post(url, { code, idFolder }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, 5000);
            } else {
                done && done(result.item);
            }
        });
    };
}

export function dtDiemVerifyCreateFolder(folderName, done) {
    return () => {
        const url = '/api/dt/diem-verify/folder-verify';
        T.post(url, { folderName }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, 5000);
            } else {
                T.notify('Tạo mới gói thành công', 'success');
                done && done(result.item);
            }
        });
    };
}

export function dtDiemVerifyDeleteFolder(idFolder, done) {
    return () => {
        const url = '/api/dt/diem-verify/folder-verify';
        T.delete(url, { idFolder }, result => {
            if (result.error) {
                T.alert(`Lỗi: ${result.error.message}`, 'error', true, 5000);
            } else {
                T.notify('Xóa gói thành công', 'success');
                done && done(result.item);
            }
        });
    };
}

T.initPage('pageDtDiemVerify');
export function dtDiemVerifySearchPage(pageNumber, pageSize, filter, done) {
    const page = T.updatePage('pageDtDiemVerify', pageNumber, pageSize, '', filter);
    return () => {
        const url = `/api/dt/diem-verify/search-page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data);
            }
        });
    };
}

export function dtDiemVerifyVerify(data, done) {
    return () => {
        const url = '/api/dt/diem-verify/verify';
        T.post(url, { data }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Xác nhận bảng điểm thất bại!', 'error', false, 2000);
                console.error('GET: ', result.error.message);
            } else {
                done && done(result);
            }
        });
    };
}

export function dtDiemVerifyCancel(data, done) {
    return () => {
        const url = '/api/dt/diem-verify/cancel';
        T.post(url, { data }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Hủy bảng điểm thất bại!', 'error', false, 2000);
                console.error('GET: ', result.error.message);
            } else {
                done && done(result);
            }
        });
    };
}

export function dtDiemVerifyVerifyStudent(mssv, maHocPhan, done) {
    return () => {
        const url = '/api/dt/diem-verify/student';
        T.post(url, { mssv, maHocPhan }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Xác nhận bảng điểm thất bại!', 'error', false, 2000);
                console.error('GET: ', result.error.message);
            } else {
                T.alert('Xác nhận bảng điểm thành công!', 'success', true, 2000);
                done && done(result);
            }
        });
    };
}

export function dtDiemVerifyCancelVerifyStudent(mssv, maHocPhan, done) {
    return () => {
        const url = '/api/dt/diem-verify/student/cancel';
        T.post(url, { mssv, maHocPhan }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Hủy xác nhận bảng điểm thất bại!', 'error', false, 2000);
                console.error('GET: ', result.error.message);
            } else {
                T.alert('Hủy xác nhận bảng điểm thành công!', 'success', true, 2000);
                done && done(result);
            }
        });
    };
}