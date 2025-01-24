import T from 'view/js/common';
const SdhTsMonThiAll = 'SdhTsMonThi:GetAll';

export default function SdhTsMonThiReducer(state = null, data) {
    switch (data.type) {
        case SdhTsMonThiAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getSdhTsInfoMonThiAll(done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/mon-thi/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các môn thi không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhTsMonThiAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}
export function deleteSdhTsInfoMonThi(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/mon-thi';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Hủy môn thi không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                done && done();
            }
        });
    };
}
export function createSdhTsInfoMonThi(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/mon-thi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Kích hoạt môn thi không thành công', 'danger');
                console.error(`UPDATE: ${url}.`, result.error);
            } else {
                done && done();
            }
        });
    };
}
export function updateSdhTsInfoMonThi(changes, done) {
    return () => {
        const url = '/api/sdh/ts-info/mon-thi';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Lấy thông tin môn thi không thành công!', 'danger');
                console.error(`PUT: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(result.item);
            }
        });
    };
}
export function getSdhTsInfoMonThi(id, done) {
    return () => {
        const url = `/api/sdh/ts-info/mon-thi/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin môn thi không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export const SelectAdapter_MonThi = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-info/mon-thi/filter',
        data: params => ({ searchTerm: params.term, filter }),
        processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.idMonThi, text: `${item.ma}: ${item.ten}`, maMonThi: item.ma })) : [] }),
        fetchOne: (id, done) => (getSdhTsInfoMonThi(id, item => item && done && done()))
    };
};

export const SelectAdapter_MonThiByDot = (idDot) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-info/mon-thi/by-dot',
        data: params => ({ searchTerm: params.term, idDot }),
        processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.maMonThi + (item.kyNang || ''), text: `${item.maMonThi}: ${item.tenMonThi} ${item.kyNang}`, kyNang: item.kyNang, maMonThi: item.maMonThi })) : [] }),
    };
};