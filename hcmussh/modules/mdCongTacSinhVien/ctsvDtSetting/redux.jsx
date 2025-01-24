import T from 'view/js/common';

export function getScheduleSettings(done) {
    return () => {
        const url = '/api/ctsv/settings/schedule-settings';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin học kỳ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function getCtsvSemester(namHoc, hocKy, done) {
    return () => {
        const url = '/api/ctsv/semester/item';
        T.get(url, { namHoc, hocKy }, result => {
            if (result.error) {
                T.notify('Lấy thông tin học kỳ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.semester);
            }
        });
    };
}