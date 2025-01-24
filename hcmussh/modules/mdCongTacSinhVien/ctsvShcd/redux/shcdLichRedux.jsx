import T from 'view/js/common';

export function getListNganhShcdEvent(timeStart, timeEnd, done) {
    return () => {
        const url = '/api/ctsv/shcd/event/list-nganh';
        T.get(url, { timeStart, timeEnd }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách ngành bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                // T.notify('Tạo nội dung thành công', 'success');
                done && done(data.items);
            }
        });
    };
}

export function createShcdEvent(data, done, error) {
    return () => {
        const url = '/api/ctsv/shcd/event';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo sự kiện bị lỗi', 'danger');
                console.error('POST: ', data.error);
                error && error();
            } else {
                // T.notify('Tạo nội dung thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateShcdEvent(id, changes, done, error) {
    return () => {
        const url = '/api/ctsv/shcd/event';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xếp sự kiện bị lỗi', 'danger');
                console.error('PUT: ', data.error);
                error && error();
            } else {
                done && done(data.item);
            }
        });
    };
}

export function updateShcdLichNganh(lichId, maNganh, changes, done, error) {
    return () => {
        const url = '/api/ctsv/shcd/event/nganh';
        T.put(url, { lichId, maNganh, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật sự kiện bị lỗi', 'danger');
                console.error('PUT: ', data.error);
                error && error();
            } else {
                T.notify('Cập nhật sự kiện thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

export function deleteShcdEvent(id, done) {
    return () => {
        const url = '/api/ctsv/shcd/event';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa sự kiện bị lỗi', 'danger');
                console.error('DELETE: ', data.error);
            } else {
                T.notify('Xóa sự kiện thành công', 'success');
                done && done(data.item);
            }
        });
    };
}

// CRUD Lop truc tuyen

export function getShcdMeetLink(lichId, done) {
    return () => {
        const url = '/api/ctsv/shcd/event/meet-link';
        T.get(url, { lichId }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách đường dẫn bị lỗi', 'danger');
                console.error('GET', data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function getShcdLichListSv(khoaSinhVien, heDaoTao, listNganh, done) {
    return () => {
        const url = '/api/ctsv/shcd/event/list-sinh-vien';
        T.get(url, { khoaSinhVien, heDaoTao, listNganh }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error('GET', data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getShcdLichQr(id, done){
    return () => {
        const url = '/api/ctsv/shcd/event/qr-code';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error('GET', data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}


