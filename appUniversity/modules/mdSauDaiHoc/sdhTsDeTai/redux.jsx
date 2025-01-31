
export function createSdhTsDeTai(changes, done) {
    return () => {
        const url = '/api/sdh/ts/de-tai';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.notify('Tạo mới bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Tạo mới đề tài thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateSdhTsDeTai(idDeTai, changes, done) {
    return () => {
        const url = '/api/sdh/ts/de-tai';
        T.put(url, { idDeTai, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Cập nhật đề tài thành công!', 'success');
                done && done();
            }
        });
    };
}
export function deleteSdhTsDeTai(idDeTai, done) {
    return () => {
        const url = '/api/sdh/ts/de-tai';
        T.delete(url, { idDeTai }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            } else {
                T.notify('Xoá đề tài thành công!', 'success');
                done && done();
            }
        });
    };
}
export function getSdhTsThiSinhDeTai(idThiSinh, done) {
    return () => {
        const url = '/api/sdh/ts/de-tai/thi-sinh';
        T.get(url, { idThiSinh }, result => {
            if (result.error) {
                T.notify('Lấy thông tin đề tài không thành công' + (result.error.message ? (':<br>' + result.error.message) : ''), 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.data);
            }
        });
    };
}