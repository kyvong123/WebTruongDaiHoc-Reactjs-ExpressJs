import T from 'view/js/common';
const SdhTsHinhThucAll = 'SdhTsHinhThuc:GetAll';

export default function SdhTsHinhThucReducer(state = null, data) {
    switch (data.type) {
        case SdhTsHinhThucAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getSdhTsInfoHinhThucData(idPhanHe, done) {
    return () => {
        const url = `/api/sdh/ts-info/hinh-thuc/${idPhanHe}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các hình thức không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}
export function getSdhTsInfoHinhThucAll(done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/hinh-thuc';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các hình thức không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhTsHinhThucAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}
export function getSdhTsInfoHinhThucById(id, done) {
    return () => {
        const url = `/api/sdh/ts-info/hinh-thuc/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin cấu hình không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export function deleteSdhTsInfoHinhThuc(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/hinh-thuc';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Hủy hình thức không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Hủy hình thức thành công!', 'success');
                done && done();
            }
        });
    };
}
export function createSdhTsInfoHinhThuc(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/hinh-thuc';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Kích hoạt hình thức không thành công ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(`POST: ${url}.`, result.error);
                done && done(result.error);
            } else {
                T.notify('Kích hoạt hình thức thành công!', 'success');
                done && done();
            }
        });
    };
}
export function getSdhTsInfoHinhThucToHop(idPhanHe, done) {
    return () => {
        const url = `/api/sdh/ts-info/hinh-thuc/to-hop/${idPhanHe}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin danh sách hình thức tổ hợp không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}