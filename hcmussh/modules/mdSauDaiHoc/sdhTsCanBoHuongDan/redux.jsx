export function deleteSdhTsCbhd(idCbhd, done) {
    return () => {
        const url = '/api/sdh/ts/cbhd';
        T.delete(url, { idCbhd }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi' + (data.error.message ? (':<br>' + data.error.message) : ''), 'danger');
            } else {
                T.notify('Xoá thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}