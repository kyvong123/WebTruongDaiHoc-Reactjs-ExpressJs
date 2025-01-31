export function getShcdNoiDung(id, done) {
    return () => {
        const url = '/api/ctsv/shcd/noi-dung/item';
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy nội dung bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Lấy nội dung thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateShcdNoiDung(id, changes, done) {
    return () => {
        const url = '/api/ctsv/shcd/noi-dung';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật nội dung bị lỗi', 'danger');
                console.error('PUT: ', data.error);
            } else {
                T.notify('Cập nhật nội dung thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

export function createShcdNoiDung(data, done) {
    return () => {
        const url = '/api/ctsv/shcd/noi-dung';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo nội dung bị lỗi', 'danger');
                console.error('POST: ', data.error);
            } else {
                T.notify('Tạo nội dung thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

export function deleteShcdNoiDung(id, done) {
    return () => {
        const url = '/api/ctsv/shcd/noi-dung';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa nội dung bị lỗi', 'danger');
                console.error('DELETE: ', data.error);
            } else {
                T.notify('Xóa nội dung thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

export const SelectAdapter_CtsvShcdNoiDung = (shcdId) => ({
    ajax: true,
    url: '/api/ctsv/shcd/noi-dung/all',
    data: params => ({ condition: params.term, shcdId }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (ten, done) => (getShcdNoiDung(ten, item => done && done({ id: item.id, text: item.ten })))(),
});