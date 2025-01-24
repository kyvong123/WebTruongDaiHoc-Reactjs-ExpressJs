import T from 'view/js/common';
const SdhTsToHopAll = 'SdhTsToHop:GetAll';

export default function SdhTsToHopReducer(state = null, data) {
    switch (data.type) {
        case SdhTsToHopAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getSdhTsInfoToHopDataAll(done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/to-hop/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các tổ hợp không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhTsToHopAll, items: data.items.rows });
                done && done(data.items.rows);
            }
        });
    };
}
export function getSdhTsInfoToHopData(idPhanHe, done) {
    return () => {
        const url = `/api/sdh/ts-info/to-hop/${idPhanHe}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các tổ hợp không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}
export function getSdhTsInfoToHopByHinhThuc(idHinhThuc, done) {
    return () => {
        const url = `/api/sdh/ts-info/to-hop/hinh-thuc/${idHinhThuc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các tổ hợp không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}
export function deleteSdhTsInfoToHop(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/to-hop';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Hủy đăng ký tổ hợp không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Hủy đăng ký tổ hợp thành công!', 'success');
                done && done();
            }
        });
    };
}
export function createSdhTsInfoToHop(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/to-hop';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Kích hoạt không thành công ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Kích hoạt tổ hợp thành công!', 'success');
                done && done();
            }
        });
    };
}