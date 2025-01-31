export function getForm(done) {
    return () => {
        const url = '/api/data-vnu/khai-bao';
        T.get(url, res => {
            if (res.error) {
                T.notify(res.error.message || 'Lấy dữ liệu form lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.data);
            }
        });
    };
}

export function saveForm(data, done) {
    return () => {
        const url = '/api/data-vnu/khai-bao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Lưu form lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        });
    };
}