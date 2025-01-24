
export function createSdhTsBaiBao(changes, done) {
    return () => {
        const url = '/api/sdh/ts/bai-bao';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.notify('Tạo mới bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Tạo mới bài báo thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateSdhTsBaiBao(idBaiBao, changes, done) {
    return () => {
        const url = '/api/sdh/ts/bai-bao';
        T.put(url, { idBaiBao, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Cập nhật bài báo thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function deleteSdhTsBaiBao(idBaiBao, done) {
    return () => {
        const url = '/api/sdh/ts/bai-bao';
        T.delete(url, { idBaiBao }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Xoá bài báo thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function getSdhTsBaiBao(idThiSinh, done) {
    return () => {
        const url = '/api/sdh/ts/bai-bao';
        T.get(url, { idThiSinh }, data => {
            if (data.error) {
                T.notify('Lấy bài báo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                done && done(data.items);
            }
        });
    };
}