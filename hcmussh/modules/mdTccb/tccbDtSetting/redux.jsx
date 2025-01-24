import T from 'view/js/common';

export function getScheduleSettings(done) {
    return () => {
        const url = '/api/tccb/settings/schedule-settings';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy cấu hình thời khoá biểu bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}