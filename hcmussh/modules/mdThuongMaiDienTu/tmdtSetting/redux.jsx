// Reducer ------------------------------------------------------------------------------------------------------------

export default function TmdtSettingReducer(state = null) {
    return state;
}

export function getAllTmdtSetting(done) {
    return () => {
        const url = '/api/tmdt/setting/all';
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

export function updateTmdtSettingKeys(changes, done) {
    return () => {
        const url = '/api/tmdt/setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật cấu hình thành công', 'success');
                done && done();
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}