import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhTsDashboardGetPage = 'SdhTsDashboard:GetPage';
const SdhTsDashboardGet = 'SdhTsDashboard:Get';

export default function sdhTsDashboardReducer(state = null, data) {
    switch (data.type) {
        case SdhTsDashboardGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhTsDashboardGet:
            return Object.assign({}, state, { selectedItem: data.item });
        default:
            return state;
    }
}


export function getDataThongKe(filter, done) {
    return () => {
        const url = '/api/sdh/ts-dashboard/get-data';
        T.get(url, { filter }, item => {
            if (item.error) {
                T.notify('Lấy dữ liệu bị lỗi', 'danger');
                console.error(`GET: ${url}.`, item.error);
            } else {
                done && done(item.data);
            }
        });
    };
}