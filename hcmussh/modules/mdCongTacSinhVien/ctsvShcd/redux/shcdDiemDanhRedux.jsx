import T from 'view/js/common';

export function getShcdDiemDanh(data, done) {
    return () => {
        const url = '/api/ctsv/shcd/diem-danh/get-data';
        T.get(url, { data }, response => {
            if (response.error) {
                T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                // T.notify(response.response, response.status);
                done && done(response.list);
            }
        }, () => T.notify('Lấy danh sách điểm danh bị lỗi!', 'danger'));
    };
}

export function setShcdDiemDanh(data, done) {
    return () => {
        const url = '/api/ctsv/shcd/diem-danh';
        if (data.loaiDiemDanh == 'VAO') {
            T.post(url, { data: { mssv: data.mssv, id: data.id } }, response => {
                if (response.error) {
                    T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                    console.error(`GET ${url}. ${response.error}`);
                } else {
                    T.notify(response.response, response.status);
                    done && done(response);
                }
            }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
        } else if (data.loaiDiemDanh == 'RA') {
            T.put(url, { id: data.id, mssv: data.mssv, changes: {} }, response => {
                if (response.error) {
                    T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                    console.error(`GET ${url}. ${response.error}`);
                } else {
                    T.notify(response.response, response.status);
                    done && done(response);
                }
            }, () => T.notify('Quá trình điểm danh bị lỗi!', 'danger'));
        }
    };
}

export function downloadExcelShcdDiemDanh(data, done) {
    T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
    return () => {
        const url = '/api/ctsv/shcd/diem-danh/download-excel';
        T.get(url, { data }, response => {
            if (response.error) {
                T.alert(response.error.message || 'Tải về thất bại!', 'warning', false, 2000);
                console.error('GET: ', response.error);
            } else {
                T.alert('Tải về thành công!', 'success', false, 2000);
                T.FileSaver(new Blob([new Uint8Array(response.buffer.data)]), response.filename);
                done && done();
            }
        });
    };
}

export function updateShcdDiemDanh(id, mssv, data, done) {
    return () => {
        const url = '/api/ctsv/shcd/diem-danh/update';
        T.put(url, { id, mssv, data }, response => {
            if (response.error) {
                T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${response.error}`);
            } else {
                T.notify(response.response, response.status);
                done && done(response);
            }
        }, () => T.notify('Quá trình cập nhật danh sách bị lỗi!', 'danger'));
    };
}

export function updateShcdDiemDanhDanhSach(id, danhSach, nguoiScan, done) {
    return () => {
        const url = '/api/ctsv/shcd/diem-danh/update-danh-sach';
        T.put(url, { id, danhSach, nguoiScan }, response => {
            if (response.error) {
                T.notify(`${response.error.message || 'Lỗi hệ thống'}`, 'danger');
                console.error(`GET ${url}. ${response.error}`);
            } else {
                T.notify(response.response, response.status);
                done && done(response);
            }
        }, () => T.notify('Quá trình cập nhật danh sách bị lỗi!', 'danger'));
    };
}