

export function createSdhTsCongTrinhCbhd(changes, done) {
    return () => {
        const url = '/api/sdh/ts/ctnc';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.notify('Tạo mới bị lỗi' + (data.error.message ? (':<br>' + data.error.message) : ''), 'danger');
            } else {
                T.notify('Tạo mới bài báo thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateSdhTsCongTrinhCbhd(id, changes, done) {
    return () => {
        const url = '/api/sdh/ts/ctnc';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bị lỗi' + (data.error.message ? (':<br>' + data.error.message) : ''), 'danger');
            } else {
                T.notify('Cập nhật bài báo thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function deleteSdhTsCongTrinhCbhd(id, done) {
    return () => {
        const url = '/api/sdh/ts/ctnc';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi' + (data.error.message ? (':<br>' + data.error.message) : ''), 'danger');
            } else {
                T.notify('Xoá bài báo thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function getSdhTsBaiBaoCbhd(idCbhd, done) {
    return () => {
        const url = '/api/sdh/ts/ctnc';
        T.get(url, { idCbhd }, data => {
            if (data.error) {
                T.notify('Lấy bài báo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                done && done(data.items);
            }
        });
    };
}