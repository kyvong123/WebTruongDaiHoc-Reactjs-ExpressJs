export function getSvSettingKeys() {
    let keys = [], callback = null;
    for (const key of arguments) {
        if (typeof key != 'function') keys.push(key);
        else callback = key;
    }
    return () => {
        const url = '/api/ctsv/setting/keys';
        T.get(url, { keys }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                callback && callback(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

T.initPage('pageDashboardNhapHoc');
export function GetDashboard(filter, done) {
    if (typeof filter == 'function') {
        done = filter;
        filter = null;
    }
    const page = T.updatePage('pageDashboardNhapHoc', undefined, undefined, undefined, filter);
    return () => {
        const url = '/api/ctsv/setting/dashboard';
        T.get(url, { filter: page.filter }, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function downloadExcel(xKey, yKey, filter, fileName) {
    return () => {
        const url = '/api/ctsv/setting/dashboard/download-excel';
        T.get(url, { xKey, yKey, filter }, result => {
            if (result.error) {
                T.notify('Lỗi!', 'danger');
            } else {
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), `${fileName}.xlsx`);
            }
        });
    };
}

export function updatSvSettingKeys(changes, done) {
    return () => {
        const url = '/api/ctsv/setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thống tin cấu hình bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Cập nhật thông tin cấu hình thành công!', 'success');
                done && done(result.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình bị lỗi!', 'danger'));
    };
}

