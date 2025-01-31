import T from 'view/js/common';
// Reducer ------------------------------
const SdhKyThiTsGetAll = 'SdhKyThiTs:GetAll';
const SdhKyThiTsGetOne = 'SdhKyThiTs:GetOne';
export default function SdhKyThiTsReducer(state = null, data) {
    switch (data.type) {
        case SdhKyThiTsGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhKyThiTsGetOne:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}
// Actions ------------------------------

export function getSdhKyThiTsAll(done) {
    return dispatch => {
        const url = '/api/sdh/ky-thi-ts';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin kỳ tuyển sinh bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhKyThiTsGetAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}
export function getSdhKyThiTsCurrent(done) {
    return () => {
        const url = '/api/sdh/ky-thi/current';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin kỳ tuyển sinh bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export function getSdhKyThiTS(id, done) {
    return () => {
        const url = `/api/sdh/ky-thi-ts/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin kỳ tuyển sinh bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSdhKyThiTs(data, done) {
    return dispatch => {
        const url = '/api/sdh/ky-thi-ts';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới thông số kỳ tuyển sinh bị lỗi', 'danger');
                console.error('POST: ' + url + '.', result.error);
            } else {
                T.notify('Tạo mới thông số kỳ tuyển sinh thành công', 'success');
                dispatch(getSdhKyThiTsAll());
                done && done();
            }
        });
    };
}

export function updateSdhKyThiTs(ma, changes, done) {
    return dispatch => {
        const url = '/api/sdh/ky-thi-ts';
        T.put(url, { ma, changes }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Cập nhật thông số kỳ tuyển sinh thành công', 'success');
                dispatch(getSdhKyThiTsAll());
                done && done();
            }
        }, () => T.notify('Lấy thông tin kỳ tuyển sinh bị lỗi!', 'danger'));
    };
}

export function deleteSdhKyThiTs(ma, done) {
    return dispatch => {
        const url = '/api/sdh/ky-thi-ts';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', result.error);
            } else {
                T.notify('Xóa thông số kỳ tuyển sinh thành công', 'success');
                dispatch(getSdhKyThiTsAll());
                done && done();
            }
        }, () => T.notify('Lấy thông tin kỳ tuyển sinh bị lỗi!', 'danger'));
    };
}
export function getSdhChktts(filter, done) {
    return () => {
        const url = '/api/sdh/tuyen-sinh/chktts';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(`${result.error.message}`, 'danger');
                console.error(`GET: ${url}.`, result.error);
                done && done();
            } else {
                done && done(result.data);
            }
        });
    };
}
export const SelectAdapter_KyThiTS = {
    ajax: true,
    url: '/api/sdh/ky-thi-ts',
    data: params => ({ searchTerm: params.term || '' }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma} năm ${item.namTuyenSinh}` })) : [] }),
    fetchOne: (ma, done) => (getSdhKyThiTS(ma, item => done && done({ id: item.ma, text: `${item.ma} năm ${item.namTuyenSinh}` })))(),
};