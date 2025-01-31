import T from 'view/js/common';


export function getShcdAssignRole(id, done) {
    return () => {
        const url = '/api/ctsv/shcd/assign-role';
        T.get(url, { id }, response => {
            if (response.error) {
                T.notify(response.error.message || 'Lấy dữ liệu SHCD bị lỗi', 'danger');
                console.error('GET: ', response.error);
            } else {
                done && done(response.items);
            }
        });
    };
}

export function setShcdAssignRole(data, done) {
    return () => {
        const url = '/api/ctsv/shcd/assign-role';
        T.post(url, { data }, response => {
            if (response.error) {
                T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${response.error}`);
            } else {
                T.notify('Phân quyền thành công', 'success');
                done && done(response);
            }
        }, () => T.notify('Quá trình lưu danh sách bị lỗi!', 'danger'));
    };
}

export function updateShcdAssignRole(shcdId, nguoiDuocGan, changes, done) {
    return () => {
        const url = '/api/ctsv/shcd/assign-role';
        T.put(url, { shcdId, nguoiDuocGan, changes }, response => {
            if (response.error) {
                T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${response.error}`);
            } else {
                T.notify('Cập nhật thành công', 'success');
                done && done(response);
            }
        }, () => T.notify('Quá trình lưu danh sách bị lỗi!', 'danger'));
    };
}

export function deleteShcdAssignRole(data, done) {
    return () => {
        const url = '/api/ctsv/shcd/assign-role';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa phân quyền bị lỗi', 'danger');
                console.error('DELETE: ', data.error);
            } else {
                T.notify('Xóa phân quyền thành công', 'success');
                done && done(data.item);
            }
        });
    };
}
