import T from 'view/js/common';

export function hcthUserSetting(state = null, data) {
    switch (data.type) {
        default:
            return state;
    }
}

//Actions ----------------
export function getSetting(done, onFinish, onError) {
    return () => {
        T.get('/api/hcth/user/setting', (data) => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Lấy thông tin cài đặt lỗi', 'danger');
            } else {
                done && done(data.setting);
            }
        }, () => T.notify('Lấy cài đặt lỗi', 'danger') || (onError && onError()));
    };
}

export function updateSetting(changes, done, onFinish, onError) {
    return () => {
        T.put('/api/hcth/user/setting', changes, (data) => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật thông tin cài đặt lỗi', 'danger');
            } else {
                T.notify('Cập nhật thông tin cài đặt thành công', 'success');
                done && done(data.setting);
            }
        }, () => T.notify('Lấy cài đặt lỗi', 'danger') || (onError && onError()));
    };
}