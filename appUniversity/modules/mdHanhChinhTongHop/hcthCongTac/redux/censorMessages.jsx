
export function createCensorMessage(id, noiDung, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/censor-message';
        T.post(url, { data: { id, noiDung } }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('POST:', url, res.error);
                T.notify('Tạo thông điệp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Tạo thông điệp lỗi.', 'danger');
        });
    };
}

export function resolveCensorMessage(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/censor-message/resolve';
        T.put(url, { data: { id } }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('POST:', url, res.error);
                T.notify('Cập nhật thông điệp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                T.notify('Cập nhật thông điệp thành công. ', 'success');

                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật thông điệp lỗi.', 'danger');
        });
    };
}

export function getCensorMessage(congTacItemId, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/censor-message/' + congTacItemId;
        T.get(url, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Lấy thông điệp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done(res.items);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Lấy thông điệp lỗi.', 'danger');
        });
    };
}

