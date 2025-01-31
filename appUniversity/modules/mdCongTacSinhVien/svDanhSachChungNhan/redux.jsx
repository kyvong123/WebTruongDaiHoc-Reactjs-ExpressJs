import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const svDashboardChungNhanGetList = 'svDashboardChungNhan:GetList';

export default function ctsvDashboardChungNhanReducer(state = null, data) {
    switch (data.type) {
        case svDashboardChungNhanGetList:
            return Object.assign({}, state, { list: data });
        default:
            return state;
    }
}
// Actions ------------------------------------------------------------------------------------------------------------
// trả về data cho chart
export function getDmSvDashboardChungNhan(filter, done) {
    return (dispatch) => {
        const url = '/api/ctsv/dashboard-chung-nhan/form-list';
        T.get(url, { filter }, response => {
            if (response.error) {
                T.notify('Không tìm thấy danh sách', 'danger');
                console.error(`GET: ${url}.`, response.error);
            } else {
                if (response) {
                    //done && done(data.rows);
                    if (done) done(response.data);
                    dispatch({ type: svDashboardChungNhanGetList, response });
                }
            }
        }, () => T.notify('Không tìm thấy danh sách', 'danger'));
    };
}