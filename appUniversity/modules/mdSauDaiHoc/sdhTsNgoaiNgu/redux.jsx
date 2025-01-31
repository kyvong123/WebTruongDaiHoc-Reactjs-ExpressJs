
export function createSdhTsNgoaiNgu(changes, done) {
    return () => {
        const url = '/api/sdh/ts/ngoai-ngu';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.notify('Tạo mới bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Tạo mới thông tin ngoại ngữ thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateSdhTsNgoaiNgu(idCcnn, changes, done) {
    return () => {
        const url = '/api/sdh/ts/ngoai-ngu';
        T.put(url, { idCcnn, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Cập nhật thông tin ngoại ngữ thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function deleteSdhTsNgoaiNgu(idCcnn, done) {
    return () => {
        const url = '/api/sdh/ts/ngoai-ngu';
        T.delete(url, { idCcnn }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Xoá thông tin ngoại ngữ thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function getSdhTsNgoaiNgu(idThiSinh, done) {
    return () => {
        const url = '/api/sdh/ts/ngoai-ngu';
        T.get(url, { idThiSinh }, data => {
            if (data.error) {
                T.notify('Lấy bài báo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                done && done(data.items);
            }
        });
    };
}