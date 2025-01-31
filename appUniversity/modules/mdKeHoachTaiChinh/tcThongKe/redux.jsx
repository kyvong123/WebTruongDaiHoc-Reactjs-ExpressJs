import T from 'view/js/common';

export function thongKeNoHocPhi(filter, done) {
    return () => {
        const url = '/api/khtc/thong-ke/thong-ke-no-hoc-phi/export';
        T.get(url, { filter }, res => {
            if (res.error) {
                T.alert('Xuất thống kê nợ học phí bị lỗi', 'danger', false, 800);
                console.error(`GET: ${url}.`, res.error);
            } else {
                T.alert('Xuất thống kê nợ học phí thành công', 'success', false, 800);
                T.FileSaver(new Blob([new Uint8Array(res.buffer.data)]), res.filename);
                done && done(res.length);
            }
        }, (error) => T.alert('Xuất thống kê nợ học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}

export function thongKeNoHocPhiLength(filter, done) {
    return () => {
        const url = '/api/khtc/thong-ke/thong-ke-no-hoc-phi/length';
        T.get(url, { filter }, res => {
            if (res.error) {
                T.notify('Lấy danh sách nợ học phí bị lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res.length);
            }
        }, (error) => T.alert('Lấy danh sách nợ học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}

export function thongKeNoHocPhiSendEmail(filter, done) {
    return () => {
        const url = '/api/khtc/thong-ke/thong-ke-no-hoc-phi/send-email';
        T.post(url, { filter }, res => {
            if (res.error) {
                T.notify('Gửi email nhắc nợ học phí bị lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Tạo tiến trình gửi email thành công', 'success');
                done && done();
            }
        }, (error) => T.alert('Gửi email nhắc nợ học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}
