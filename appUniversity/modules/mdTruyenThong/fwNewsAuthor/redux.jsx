export function fwNewsDmAuthorGetAll(done) {
    return () => {
        T.get('/api/tt/news/author/all', res => {
            if (res.error) {
                T.notify('Lỗi lấy dữ liệu tác giả', 'danger');
            } else {
                done && done(res.items);
            }
        });
    };
}

export function fwNewsDmAuthorCreate(data, done) {
    return () => {
        T.post('/api/tt/news/author', { data }, res => {
            if (res.error) {
                T.notify('Lỗi tạo dữ liệu tác giả', 'danger');
            } else {
                T.notify('Tạo mới thành công', 'success');
                done && done(res.item);
            }
        });
    };
}

export function fwNewsDmAuthorUpdate(email, changes, done) {
    return () => {
        T.put('/api/tt/news/author', { email, changes }, res => {
            if (res.error) {
                T.notify('Lỗi cập nhật dữ liệu tác giả', 'danger');
            } else {
                T.notify('Cập nhật thành công', 'success');
                done && done(res.item);
            }
        });
    };
}

export function fwNewsDmAuthorDelete(email, done) {
    return () => {
        T.delete('/api/tt/news/author', { email }, res => {
            if (res.error) {
                T.notify('Lỗi cập nhật dữ liệu tác giả', 'danger');
            } else {
                T.notify('Xoá tác giả thành công', 'success');
                done && done(res.item);
            }
        });
    };
}