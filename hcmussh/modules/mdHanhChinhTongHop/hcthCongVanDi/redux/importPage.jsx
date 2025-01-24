
export function getResult(fileName, data, done, onError) {
    return () => {
        const url = '/api/hcth/van-ban-di/import/' + fileName;
        T.get(url, data, (res) => {
            if (res.error) {
                T.notify('Lấy danh sách văn bản lỗi', 'danger');
                console.error('GET :', url, res.error);
                onError && onError();
            } else {
                done(res.items);
            }
        }, () => T.notify('Lấy danh sách văn bản lỗi', 'danger') || (onError && onError()));
    };
}

export function create(data, done, onError) {
    return () => {
        const url = '/api/hcth/van-ban-di/import/new';
        T.post(url, data, (res) => {
            if (res.error) {
                T.notify('Cập nhật danh sách văn bản lỗi', 'danger');
                console.error('GET :', url, res.error);
                onError && onError();
            } else {
                done();
            }
        }, () => T.notify('Cập nhật danh sách văn bản lỗi', 'danger') || (onError && onError()));
    };
}