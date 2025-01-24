import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

// Actions ------------------------------------------------------------------------------------------------------------
export function getLichGiangDay(done) {
    return () => {
        const url = '/api/dt/gv/get-lich-day';
        T.get(url, { filter: { lichDay: 1 } }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
            }
        }, () => () => T.notify('Lấy lịch dạy bị lỗi!', 'danger'));
    };
}