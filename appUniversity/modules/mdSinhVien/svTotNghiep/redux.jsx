import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

// ACTIONS -------------------------------------------------
export function getKetQuaTotNghiep(idDot, done) {
    return () => {
        const url = '/api/sv/ket-qua-tot-nghiep';
        T.get(url, { idDot }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.list);
            }
        });
    };
}