import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

// Actions ------------------------------------------------------------------------------------------------------------
export function getRoleNhapDiem(filter, done) {
    return () => {
        const url = '/api/dt/gv/get-role-nhap-diem';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.items);
            }
        }, () => () => T.notify('Lấy danh sách quyền bị lỗi!', 'danger'));
    };
}

export function getDataNhapDiem(id, done) {
    return () => {
        const url = '/api/dt/gv/nhap-diem/get-data';
        T.get(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
            }
        }, () => () => T.notify('Lấy dữ liệu bị lỗi!', 'danger'));
    };
}

export function updateDiemSinhVien(changes, done) {
    return () => {
        const url = '/api/dt/gv/nhap-diem/diem-sinh-vien';
        T.post(url, { changes }, result => {
            if (result.error) {
                console.error(result.error);
                T.notify('Cập nhật điểm sinh viên bị lỗi!', 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function saveImportDiemSinhVien(changes, done) {
    return () => {
        const url = '/api/dt/gv/import-diem/save';
        T.post(url, { changes }, result => {
            if (result.error) {
                console.error(result.error.message);
                T.alert(result.error.message || 'Cập nhật điểm sinh viên bị lỗi!', 'error', false, 2000);
            } else {
                done && done(result);
            }
        });
    };
}
