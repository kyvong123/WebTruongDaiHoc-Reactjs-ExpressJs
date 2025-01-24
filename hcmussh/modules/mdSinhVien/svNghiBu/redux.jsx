import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

// ACTIONS -------------------------------------------------
export function getLichNghiBu(filter, done) {
    const url = '/api/sv/lich-nghi-bu';
    T.get(url, { filter }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy lịch nghỉ bù bị lỗi!', 'danger'));
}
