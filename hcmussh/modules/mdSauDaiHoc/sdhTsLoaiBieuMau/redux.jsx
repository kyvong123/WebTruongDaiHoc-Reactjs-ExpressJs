import T from 'view/js/common';

export function getSdhTsLoaiBieuMau(maPhanHe, maHinhThuc, done) {
    return () => {
        const url = '/api/sdh/tuyen-sinh/loai-bieu-mau/get';
        T.get(url, { maPhanHe, maHinhThuc }, data => {
            if (data.error) {
                T.notify('Lấy loại biểu mẫu bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {                
                done && done(data.item);
            }
        }, (error) => T.notify('Lấy loại biểu mẫu bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}