export function updateSdhTsBieuMau(id, changes, done) {
    return () => {
        const url = '/api/sdh/ts/dm-bieu-mau';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(`Lỗi cập nhật ${result.error.message && (':<br>' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                done && done(result.item);
            }
        });
    };
}
export function getAllSdhTsDmBieuMau(done) {
    return () => {
        const url = '/api/sdh/ts/dm-bieu-mau';
        T.get(url, result => {
            if (result.error) {
                T.notify(`Lỗi lấy dữ liệu ${result.error.message && (':<br>' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}