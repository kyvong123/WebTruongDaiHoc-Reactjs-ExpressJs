import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

// ACTIONS -------------------------------------------------
export function getDiem(filter, done) {
    const url = '/api/sv/bang-diem';
    T.get(url, { filter }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy bảng điểm bị lỗi!', 'danger'));
}

export function getInfo(done) {
    const url = '/api/sv/bang-diem/info';
    T.get(url, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger'));
}

export function getFileScan(mssv, maHocPhan, done) {
    return () => {
        const url = '/api/sv/get-data-scan';
        T.get(url, { mssv, maHocPhan }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}