//Trưởng đơn vị
export function createTccbDanhGiaCaNhanDiemTru(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-tru-hoi-dong-don-vi';
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

export function updateTccbDanhGiaCaNhanDiemTru(id, changes, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-tru-hoi-dong-don-vi';
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

export function deleteTccbDanhGiaCaNhanDiemTru(id, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-tru-hoi-dong-don-vi';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(`Xoá mục bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
            } else {
                T.notify('Xoá mục thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

//User
export function createTccbDanhGiaCaNhanDiemTruUser(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-tru-user';
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

export function updateTccbDanhGiaCaNhanDiemTruUser(id, changes, done) {
    return () => {
        const url = '/api/tccb/danh-gia-ca-nhan-diem-tru-user';
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