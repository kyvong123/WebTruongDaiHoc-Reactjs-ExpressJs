import T from 'view/js/common';

const SvDmDoiTuongTroCapGetAll = 'svDmDoiTuongTroCap:GetAll';
export default function svBaoHiemYTeReducer(state = null, data) {
    switch (data.type) {
        case SvDmDoiTuongTroCapGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getAllSvDmDoiTuongTroCap(done) {
    return dispatch => {
        const url = '/api/sv/doi-tuong-tro-cap/all';
        T.get(url, (result) => {
            if (result.error) {
                T.notify('Lấy danh sách đối tượng trợ cấp bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SvDmDoiTuongTroCapGetAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}