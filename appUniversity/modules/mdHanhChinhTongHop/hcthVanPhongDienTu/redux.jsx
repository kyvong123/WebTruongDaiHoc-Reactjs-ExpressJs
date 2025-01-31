// Actions -------------------------

export function getList(done) {
    const url = '/api/hcth/van-ban/cho-xu-ly/list';
    return () => {
        T.get(url, (res) => {
            if (res.error) {
                T.notify('Lấy danh sách văn bản chờ xử lý lỗi', 'danger');
                console.error('GET:', url, res.error);
            } else {
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách văn bản chờ xử lý lỗi', 'danger'));
    };
}

export function seenUpdate(id, data, done) {
    const url = '/api/hcth/van-ban/cho-xu-ly/seen/' + id;
    return () => {
        T.put(url, data, (res) => {
            if (res.error) {
                T.notify('Cập nhật trạng thái đã xem thất bại', 'danger');
                console.error('GET:', url, res.error);
            } else {
                done && done();
            }
        }, () => T.notify('Cập nhật trạng thái đã xem thất bại', 'danger'));
    };
}