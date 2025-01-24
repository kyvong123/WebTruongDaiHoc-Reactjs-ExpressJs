import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const dtKeHoachDaoTaoGet = 'dtKeHoachDaoTao:Get';
export default function dtChuongTrinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case dtKeHoachDaoTaoGet:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

//Actions ------------------------------------------------------------------------------------------------------------
export function getDtKeHoachDaoTao(maKhungDaoTao, maMonHoc, done) {
    return dispatch => {
        const url = '/api/dt/ke-hoach-dao-tao';
        T.get(url, { condition: { maKhungDaoTao, maMonHoc } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kế hoạch đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data);
                dispatch({ type: dtKeHoachDaoTaoGet, items: data.items ? data.items : [] });
            }
        });
    };
}

export function createDtKeHoachDaoTao({ items, data }, done) {
    return () => {
        const url = '/api/dt/ke-hoach-dao-tao';
        T.post(url, { items, data }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo kế hoạch đào tạo thành công!', 'success');
                done && done();
            }
        });
    };
}

export function updateDtKeHoachDaoTao(ma, { changes, data }, done) {
    return () => {
        const url = '/api/dt/ke-hoach-dao-tao';
        T.put(url, { ma, changes, data }, data => {
            if (data.error) {
                T.notify('Cập nhật bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done();
            }
        });
    };
}

