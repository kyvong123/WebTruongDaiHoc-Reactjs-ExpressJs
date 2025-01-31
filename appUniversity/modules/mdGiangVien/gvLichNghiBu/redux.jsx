// Reducer ------------------------------------------------------------------------------------------------------------
export default function gvLichNghiBuReducer(state = null, data) {
    switch (data.type) {
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getGvLichGiangDayPage(filter, done) {
    return () => {
        const url = '/api/dt/gv/lich-nghi-bu';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch nghỉ bù bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}