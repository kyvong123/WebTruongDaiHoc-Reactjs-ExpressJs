import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
export default function dtAssignRoleNhapDiemReducer(state = null, data) {
    switch (data.type) {
        default:
            return state;
    }
}

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageDtAssignRoleNhapDiem');
export function dtAssignRoleNhapDiemGetData(pageNumber, pageSize, filter, done) {
    const page = T.updatePage('pageDtAssignRoleNhapDiem', pageNumber, pageSize, '', filter);
    return () => {
        const url = `/api/dt/assign-role-nhap-diem/data/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.items);
            }
        });
    };
}

T.initPage('pageDtTinhTrangDiem');
export function getTinhTrangDiemPage(pageNumber, pageSize, filter, done) {
    const page = T.updatePage('pageDtTinhTrangDiem', pageNumber, pageSize, '', filter);
    return () => {
        const url = `/api/dt/tinh-trang-diem/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function createDtAssignRoleNhapDiem(data, done) {
    return () => {
        const url = '/api/dt/assign-role-nhap-diem/data';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data);
            }
        });
    };
}

export function createDtAssignRoleNhapDiemDefault(filter, done) {
    return () => {
        const url = '/api/dt/assign-role-nhap-diem/default';
        T.post(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu bị lỗi!', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done();
            }
        });
    };
}

export function deleteDtAssignRoleNhapDiem(list, done) {
    return () => {
        const url = '/api/dt/assign-role-nhap-diem';
        T.delete(url, { list }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Xóa giảng viên nhập điểm bị lỗi!', 'error', false, 2000);
                console.error('GET: ', data.error.message);
            } else {
                done && done();
            }
        });
    };
}

export function saveImportTyLeDiem(data, done) {
    return () => {
        const url = '/api/dt/assign-role-nhap-diem/ty-le-diem';
        T.post(url, { data }, result => {
            if (result.error) {
                T.alert(`Lưu dữ liệu bị lỗi: ${result.error.message}`, 'error', true, 5000);
                console.error('POST: ', result.error.message);
            } else {
                done && done(result);
            }
        });
    };
}
