export function multiAddDssvAdmin(dssv, done) {
    return () => {
        const url = '/api/ctsv/tuyen-sinh/create-multi';
        T.post(url, { dssv }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lưu danh sách không thành công!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data.result);
            }
        });
    };
}