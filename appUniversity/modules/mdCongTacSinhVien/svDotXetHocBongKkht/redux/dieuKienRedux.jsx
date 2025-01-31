export function createDieuKienHocBong(dieuKien, done) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/cau-hinh';
        T.post(url, { dieuKien }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Tạo cấu hình bị lỗi', 'danger');
                console.error('POST: ', res.error.message);
            } else {
                T.notify('Tạo cấu hình thành công!', 'success');
                done && done();
            }
        });
    };
}

export function updateDieuKienHocBong(id, dieuKien, done) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/cau-hinh';
        T.put(url, { id, dieuKien }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Cập nhật cấu hình bị lỗi', 'danger');
                console.error('PUT: ', res.error.message);
            } else {
                T.notify('Cập nhật cấu hình thành công!', 'success');
                done && done();
            }
        });
    };
}

export function deleteDieuKienHocBong(id, done) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/cau-hinh';
        T.delete(url, { id }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Xóa cấu hình bị lỗi', 'danger');
                console.error('PUT: ', res.error.message);
            } else {
                T.notify('Xóa cấu hình thành công', 'success');
                done && done();
            }
        });
    };
}

export function downloadDanhSachNhom(idDieuKien) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/cau-hinh/download-excel?';
        T.handleDownload(url + (new URLSearchParams({ idDieuKien }).toString()));
    };
}

export function getDieuKienHocBong(id, done) {
    const url = '/api/ctsv/hoc-bong-khuyen-khich/cau-hinh/';
    T.get(url, { id }, res => {
        if (res.error) {
            T.notify(res.error.message || 'Lấy cấu hình bị lỗi', 'danger');
            console.error('PUT: ', res.error.message);
        } else {
            done && done(res.item);
        }
    });
}

export const SelectAdapter_CtsvCauHinhHocBong = (idDot) => ({
    ajax: true,
    url: '/api/ctsv/hoc-bong-khuyen-khich/cau-hinh/all',
    data: () => ({ idDot }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => getDieuKienHocBong(id, item => done && done({ id: item.id, text: item.ten })),
});