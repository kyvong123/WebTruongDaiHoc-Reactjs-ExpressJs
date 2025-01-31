//Trưởng đơn vị
export function createTccbDanhGiaCaNhanDiemThuong(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-thuong-hoi-dong-don-vi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Thêm mục bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Thêm mục thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateTccbDanhGiaCaNhanDiemThuong(id, changes, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-thuong-hoi-dong-don-vi';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Cập nhật mục bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
            } else {
                T.notify('Cập nhật mục thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function deleteTccbDanhGiaCaNhanDiemThuong(id, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-thuong-hoi-dong-don-vi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(`Xoá mục bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
            } else {
                T.notify('Xoá mục thành công!', 'success');
                done && done();
            }
        });
    };
}

//User
export function createTccbDanhGiaCaNhanDiemThuongUser(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-thuong-user';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Thêm mục bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Thêm mục thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateTccbDanhGiaCaNhanDiemThuongUser(id, changes, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-thuong-user';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Cập nhật bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function deleteTccbDanhGiaCaNhanDiemThuongUser(id, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-thuong-user';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(`Xóa điểm thưởng bị lỗi: ${data.error.message}`, 'danger');
                console.error(`DELETE ${url}. ${data.error.message}`);
            } else {
                T.alert('Xóa điểm thưởng thành công!', 'success', false, 800);
                done && done();
            }
        });
    };
}

