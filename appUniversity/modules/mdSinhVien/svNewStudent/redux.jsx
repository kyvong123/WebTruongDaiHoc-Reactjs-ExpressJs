export function getCompleteStep(done) {
    return () => {
        const url = '/api/sv/student-enroll/check/current-step';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nhập học bị lỗi', 'danger');
                console.error(data.error);
            } else {
                done && done(data.result);
            }
        });
    };
}

export function getPageThanhToanHocPhi(done) {
    return () => {
        const url = '/api/sv/student-enroll/thanh-toan/get-detail';
        T.get(url, result => {
            if (result.error) {
                // T.alert(`${result.error.message} Vui lòng liên hệ Phòng Kế hoạch - Tài chính`, 'error', false, 5000);
            } else {
                done(result);
                // this.setState({ data: result.data, isCompleteHocPhi: result.isCompleteHocPhi });
            }
        });
    };
}

export function getQrThanhToan(done) {
    return () => {
        const url = '/api/sv/hoc-phi/qr-bidv';
        T.post(url, result => {
            if (result.error) {
                console.error(result.error);
                // T.alert(`${result.error.message} Vui lòng liên hệ Phòng Kế hoạch - Tài chính`, 'error', false, 5000);
            } else {
                done(result);
                // this.setState({ path: `/${result.path}` });
            }
        });
    };
}

export function getLastStepInfo(done) {
    return () => {
        const url = '/api/sv/student-enroll/last-step';
        T.get(url, result => {
            if (result.error) {
                console.error(result.error);
            } else {
                done(result);
            }
        });
    };
}
