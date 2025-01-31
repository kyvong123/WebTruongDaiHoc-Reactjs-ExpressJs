const TccbGiaHanDrlGetAll = 'TccbGiaHanDrl:GetAll';
const TccbGiaHanDrlGetPage = 'TccbGiaHanDrl:GetPage';

export default function tccbDanhGiaDrlReducer(state = null, data) {
    switch (data.type) {
        case TccbGiaHanDrlGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbGiaHanDrlGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export function getAllGiaHanDrl(idDot, done) {
    return (dispatch) => {
        const url = '/api/tccb/danh-gia-drl/gia-han/all';
        T.get(url, { idDot }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lấy danh sách gia hạn bị lỗi', 'danger');
                console.error('/upcase: ', data.error);
            } else {
                dispatch({ type: TccbGiaHanDrlGetAll, items: data.items });
                done && done(data);
            }
        });
    };
}

export function getPendingGiaHan(idDot, condition, done) {
    return () => {
        const url = '/api/tccb/diem-ren-luyen/gia-han/kien-nghi/all';
        T.get(url, { idDot, condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kiến nghị bị lỗi!', 'danger');
                console.error('GET:', data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function chapNhanKienNghi(data, done) {
    const url = '/api/tccb/diem-ren-luyen/gia-han/kien-nghi/chap-nhan';
    T.put(url, { data }, data => {
        if (data.error) {
            T.notify('Mở khóa đánh giá bị lỗi!', 'danger');
            console.error('PUT:', data.error);
        } else {
            T.notify('Mở khóa đánh giá thành công!', 'success');
            done && done(data);
        }
    });
}

export function tuChoiGiaHan(data, done) {
    const url = '/api/tccb/diem-ren-luyen/gia-han/kien-nghi/tu-choi';
    T.put(url, { data }, data => {
        if (data.error) {
            T.notify('Từ chối bị lỗi!', 'danger');
            console.error('PUT:', data.error);
        } else {
            T.notify('Phản hồi của bạn đã được gửi đến sinh viên!', 'success');
            done && done(data.item);
        }
    });
}