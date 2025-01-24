export function getSignatureInfo(data, done, onFinish) {
    return () => {
        const url = '/api/hcth/chu-ky-dien-tu/van-ban-di/xac-thuc';
        T.get(url, data, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Lấy thông tin chữ ký lỗi', 'danger');
            } else {
                done && done(res.items);
            }
        }, () => (onFinish && onFinish()) || T.notify('Lấy thông tin chữ ký lỗi', 'danger'));
    };
}
