export function getDetailQuyetToan(nam, done) {
    return () => {
        const url = `/api/cb/quyet-toan-thue/${nam}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy lịch sử giao dịch lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        });
    };
}

export function getAllQuyetToanThue(done) {
    return () => {
        const url = '/api/cb/quyet-toan-thue';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy thông tin quyết toán thuế  lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.items);
            }
        });
    };
}

export function genQR(nam, soTien, isCustom, done) {
    return () => {
        const url = '/api/khtc/quyet-toan-thue/genQR';
        T.get(url, { nam, soTien, isCustom }, res => {
            if (res.error) {
                T.notify('Lấy thông tin QR lỗi!', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        });
    };
}