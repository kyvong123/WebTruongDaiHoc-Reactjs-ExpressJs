import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const svThongKeQuyetDinhGetList = 'svThongKeQuyetDinh:GetList';

export default function ctsvThongKeQuyetDinhReducer(state = null, data) {
    switch (data.type) {
        case svThongKeQuyetDinhGetList:
            return Object.assign({}, state, { list: data });
        default:
            return state;
    }
}
// Actions ------------------------------------------------------------------------------------------------------------
export function getSvThongKeQuyetDinh(filter, loaiQuyetDinh, done) {
    return (dispatch) => {
        const url = '/api/ctsv/thong-ke-quyet-dinh/get-data';
        T.get(url, { filter, loaiQuyetDinh }, response => {
            if (response.error) {
                T.notify('Không tìm thấy danh sách quyết định', 'danger');
                console.error(`GET: ${url}.`, response.error);
            } else {
                if (response) {
                    if (done) done(response);
                    dispatch({ type: svThongKeQuyetDinhGetList, response });
                }
            }
        }, () => T.notify('Không tìm thấy danh sách', 'danger'));
    };
}