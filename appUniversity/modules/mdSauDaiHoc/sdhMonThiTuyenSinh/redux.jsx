import T from 'view/js/common';

const SdhMonThiTuyenSinhAll = 'SdhMonThiTuyenSinh:GetAll';
export default function SdhMonThiTuyenSinhReducer(state = null, data) {
    switch (data.type) {
        case SdhMonThiTuyenSinhAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhMonThiTuyenSinh(done) {
    return dispatch => {
        const url = '/api/sdh/mon-thi-tuyen-sinh/all';
        T.get(url, {}, result => {
            if (result.error) {
                T.notify(`Lỗi lấy dữ liệu ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhMonThiTuyenSinhAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhMonThiTuyenSinh(data, done) {
    return dispatch => {
        const url = '/api/sdh/mon-thi-tuyen-sinh';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lỗi tạo mới ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhMonThiTuyenSinh());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhMonThiTuyenSinh(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/mon-thi-tuyen-sinh';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify(`Lỗi tạo cập nhật ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhMonThiTuyenSinh());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhMonThiTuyenSinh(ma, done) {
    return dispatch => {
        const url = '/api/sdh/mon-thi-tuyen-sinh';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify(`Lỗi xoá ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllSdhMonThiTuyenSinh());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhTsMonThiMutiple(data, done) {
    return (dispatch) => {
        const url = '/api/sdh/mon-thi-tuyen-sinh/multiple';
        T.put(url, { data }, (result) => {
            if (result.error) {
                T.notify(`Lỗi import ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(result.error);
            } else {
                done && done();
                dispatch(getAllSdhMonThiTuyenSinh());
            }
        });
    };
}


export function getAllSdhMonThiNgoaiNgu(done) {
    return () => {
        const url = '/api/sdh/mon-thi-tuyen-sinh/ngoai-ngu/all';
        T.get(url, result => {
            if (result.error) {
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function getSdhMonThiTuyenSinh(ma, done) {
    return () => {
        const url = `/api/sdh/mon-thi-tuyen-sinh/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

// export const SelectAdapter_SdhMonThiTuyenSinh = (maToHop) => {
//     return {
//         ajax: true,
//         url: '/api/sdh/mon-thi-tuyen-sinh/adapter',
//         data: params => ({ searchTerm: params.term, maToHop }),
//         processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
//         fetchOne: (ma, done) => (getSdhMonThiTuyenSinh(ma, item => done && done({ id: item.ma, text: item.ten })))()
//     };
// };
export const SelectAdapter_SdhTsMonThi = {
    ajax: true,
    url: '/api/sdh/ts/mon-thi/adapter',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response.items && response.items.length ? response.items.filter(item => item.ma != 'XHS' || item.ma != 'VD').map(item => ({ id: item.ma, text: item.ten })) : []
    }),
    fetchOne: (ma, done) => (getSdhMonThiTuyenSinh(ma, item => done && done({ id: item.ma, text: item.ten })))()
};
export const SelectAdapter_SdhTsMonThiForDiem = {
    ajax: true,
    url: '/api/sdh/ts/mon-thi/adapter',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : []
    }),
    fetchOne: (ma, done) => (getSdhMonThiTuyenSinh(ma, item => done && done({ id: item.ma, text: item.ten })))()
};

export const SelectAdapter_SdhTsMonThiNgoaiNgu = {
    ajax: true,
    url: '/api/sdh/mon-thi-tuyen-sinh/ngoai-ngu/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : []
    }),
    fetchOne: (ma, done) => (getSdhMonThiTuyenSinh(ma, item => done && done({ id: item.ma, text: item.ten })))()
};

export const SelectAdapter_SdhTsMonThiNgoaiNguV2 = {
    ajax: true,
    url: '/api/sdh/mon-thi-tuyen-sinh/ngoai-ngu/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response.items && response.items.length ? [{ id: 0, text: 'XT Ngoại Ngữ' }, ...response.items.map(item => ({ id: item.ma, text: item.ten }))] : []
    }),
    fetchOne: (ma, done) => (getSdhMonThiTuyenSinh(ma, item => done && done({ id: item.ma, text: item.ten })))()
};
