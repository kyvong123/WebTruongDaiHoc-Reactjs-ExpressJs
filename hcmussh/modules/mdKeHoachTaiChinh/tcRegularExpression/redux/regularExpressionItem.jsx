
export function createItem(data, done, onError) {
    return () => {
        const url = '/api/khtc/regular-expression/item';
        T.post(url, { data }, (res) => {
            if (res.error) {
                onError && onError();
                console.error('POST: ', url, res.error);
                T.notify('Tạo biểu thức chính quy lỗi', 'danger');
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Tạo biểu thức chính quy lỗi', 'danger') || (onError && onError()));
    };
}


export function updateItem(id, changes, done, onError) {
    return () => {
        const url = '/api/khtc/regular-expression/item/' + id;
        T.put(url, { changes }, (res) => {
            if (res.error) {
                onError && onError();
                console.error('PUT: ', url, res.error);
                T.notify('Cập nhật biểu thức chính quy lỗi', 'danger');
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật biểu thức chính quy lỗi', 'danger') || (onError && onError()));
    };
}

export function deleteSetItem(id, done, onError) {
    return () => {
        const url = '/api/khtc/regular-expression/item/' + id;
        T.delete(url, (res) => {
            if (res.error) {
                onError && onError();
                console.error('PUT: ', url, res.error);
                T.notify('Cập nhật biểu thức chính quy lỗi', 'danger');
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật biểu thức chính quy lỗi', 'danger') || (onError && onError()));
    };
}