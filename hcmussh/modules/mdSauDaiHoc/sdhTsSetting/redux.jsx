import T from 'view/js/common';


// Actions ----------------------------------------------------------------------------------------------------
export function getSdhTsSettingAll(done) {
    return () => {
        const url = '/api/sdh/ts-setting/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function updateSdhTsSetting(changes, done) {
    return () => {
        const url = '/api/sdh/ts-setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                !changes['expiredIn'] && T.notify('Cập nhật thống tin cấu hình bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                !changes['expiredIn'] && T.notify('Cập nhật thông tin cấu hình thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function sendEditLink(listEmail, done) {
    return () => {
        const url = '/api/sdh/ts-setting';
        T.post(url, { listEmail }, result => {
            if (result.error) {
                T.notify('Gửi không thành không' + (result.error.message && (':<br>' + result.error.message) || ''), 'danger');
                done && done(result.error);
            } else {
                T.notify('Gửi thành công!', 'success');
                done && done();
            }
        });
    };
}