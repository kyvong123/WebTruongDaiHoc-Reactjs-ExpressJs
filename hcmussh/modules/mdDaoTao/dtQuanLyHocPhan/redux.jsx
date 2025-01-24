import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetPage = 'sinhVien:GetPage';
const sinhVienSetNull = 'sinhVien:SetNull';
const daoTaoSinhVienGetQuyetDinhPage = 'daoTaoSinhvien:GetQuyetDinhPage';
export default function studentListReducer(state = null, data) {
    switch (data.type) {
        case 'dangKyHocPhan:GetResult':
            return Object.assign({}, state, { resultPage: data.page });
        case sinhVienSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case sinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case daoTaoSinhVienGetQuyetDinhPage:
            return Object.assign({}, state, { quyetDinhPage: data.page });
        default:
            return state;
    }
}

//ACTIONS--------------------------------------------------------------------------------------------------
T.initPage('DtDangKyHocPhanResult');
export function getResultDataPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('DtDangKyHocPhanResult', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienSetNull });
        const url = `/api/dt/dkhp/list-result/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: 'dangKyHocPhan:GetResult', page: result.page });
                done && done(result.page);
            }
        }, () => T.notify('Lấy danh sách bị lỗi!', 'danger'));
    };
}

export function updateResultData(id, change, filter, sortTerm, done) {
    return dispatch => {
        T.put('/api/dt/dkhp/list-result', { id, change }, result => {
            if (result.error) {
                T.notify('Lỗi khi cập nhật cho sinh viên!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật cho sinh viên thành công!', 'success');
                const cookie = T.updatePage('DtDangKyHocPhanResult');
                const { pageNumber, pageSize, pageCondition } = cookie;
                dispatch(getResultDataPage(pageNumber, pageSize, pageCondition, filter, sortTerm));
                done && done();
            }
        });
    };
}

export function createResultData(data, filter, sortTerm, done) {
    return dispatch => {
        T.post('/api/dt/dkhp/list-result', { data }, result => {
            if (result.error) {
                T.notify('Lỗi khi tạo cho sinh viên!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo cho sinh viên thành công!', 'success');
                const cookie = T.updatePage('DtDangKyHocPhanResult');
                const { pageNumber, pageSize, pageCondition } = cookie;
                dispatch(getResultDataPage(pageNumber, pageSize, pageCondition, filter, sortTerm));
                done && done();
            }
        });
    };
}

export function deleteResultData(id, filter, sortTerm, done) {
    return dispatch => {
        T.delete('/api/dt/dkhp/list-result', { id }, result => {
            if (result.error) {
                T.notify('Lỗi khi xoá cho sinh viên!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá cho sinh viên thành công!', 'success');
                const cookie = T.updatePage('DtDangKyHocPhanResult');
                const { pageNumber, pageSize, pageCondition } = cookie;
                dispatch(getResultDataPage(pageNumber, pageSize, pageCondition, filter, sortTerm));
                done && done();
            }
        });
    };
}
//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageStudentList');
export function getStudentListPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageStudentList', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienSetNull });
        const url = `/api/dt/student-list/page/${page.pageNumber}/${page.pageSize}`;
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

export function getStudentInfo(mssv, done) {
    return () => {
        const url = `/api/dt/student-list/student/${mssv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function getHocPhan(filterhp, mssv, done) {
    const url = '/api/dt/student/hoc-phan';
    T.get(url, { filterhp, mssv }, data => {
        if (data.error) {
            T.notify('Lấy danh sách học phần bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            if (done) done(data.items);
        }
    });
}

export function createHocPhanStudent(list, mssv, done) {
    return () => {
        const url = '/api/dt/student/hoc-phan';
        T.post(url, { list, mssv }, data => {
            if (data.error) {
                T.notify('Đăng ký học phần bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                T.notify('Lưu đăng ký học phần thành công!', 'success');
                if (done) done(data);
            }
        });
    };
}

export function getLichSuDKHPStudent(mssv, done) {
    const url = '/api/dt/student/lich-su-dkhp';
    T.get(url, { mssv }, data => {
        if (data.error) {
            T.notify('Lấy thông tin lịch sử đăng ký' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            if (done) done(data.items);
        }
    });
}

export function getCtdtStudent(filter, done) {
    return () => {
        const url = '/api/dt/student/ctdt';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy thông tin chương trình đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.items);
            }
        });
    };
}

T.initPage('pageLichSuQuyetDinh');
export function getStudentQuyetDinhAdmin(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageLichSuQuyetDinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/quyet-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: daoTaoSinhVienGetQuyetDinhPage, page: data.page });
                done && done();
            }
        }, () => T.notify('Lấy danh sách quyết định bị lỗi!', 'danger'));
    };
}