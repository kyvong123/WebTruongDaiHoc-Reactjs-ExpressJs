export function getStudentKyLuat(mssv, done) {
    return () => {
        const url = '/api/ctsv/student/ky-luat';
        T.get(url, { mssv }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy kỷ luật sinh viên bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Lấy kỷ luật sinh viên thành công', 'success');
                done && done(data.items);
            }
        });
    };
}