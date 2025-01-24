import T from 'view/js/common';

const SdhHinhThucTuyenSinhAll = 'SdhHinhThucTuyenSinh:GetAll';
export default function SdhHinhThucTuyenSinhReducer(state = null, data) {
    switch (data.type) {
        case SdhHinhThucTuyenSinhAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhHinhThucTuyenSinh(done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-tuyen-sinh/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu hình thức tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhHinhThucTuyenSinhAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhHinhThucTuyenSinh(data, done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-tuyen-sinh';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo hình thức tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhHinhThucTuyenSinh());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhHinhThucTuyenSinh(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-tuyen-sinh';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật hình thức tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhHinhThucTuyenSinh());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhHinhThucTuyenSinh(ma, done) {
    return dispatch => {
        const url = '/api/sdh/hinh-thuc-tuyen-sinh';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật hình thức tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thành công', 'success');
                dispatch(getAllSdhHinhThucTuyenSinh());
                done && done(result.item);
            }
        });
    };
}

export function getSdhHinhThucTuyenSinh(ma, done) {
    return () => {
        const url = `/api/sdh/hinh-thuc-tuyen-sinh/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu hình thức tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}


export const SelectAdapter_SdhHinhThucTuyenSinh = {
    ajax: true,
    url: '/api/sdh/hinh-thuc-tuyen-sinh/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => {
        let results = response.items || [];
        results = results.filter(i => i.kichHoat == 1);
        if (response.searchTerm) {
            let st = response.searchTerm;
            results = results.filter(i=> i.tenHinhThuc.toLowerCase().includes(st.toLowerCase()));
        }
        return { results: results.map(item => ({ id: item.ma, text: item.tenHinhThuc }))  };
    },
    fetchOne: (ma, done) => (getSdhHinhThucTuyenSinh(ma, item => done && done({ id: item.ma, text: item.tenHinhThuc })))(),
};

export function getDmHinhThucAll(done) {
    return () => {
        const url = '/api/sdh/ts/hinh-thuc/all';
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
export function getSdhTsHinhThuc(ma, done) {
    return () => {
        const url = `/api/sdh/ts/hinh-thuc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các hình thức không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export const SelectAdapter_HinhThuc = (idPhanHe) => {
    return {
        ajax: true,
        url: '/api/sdh/ts/hinh-thuc/all',
        data: params => ({ searchTerm: params.term, idPhanHe }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
        fetchOne: (ma, done) => (getSdhTsHinhThuc(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.tenHinhThuc}` })))()
    };
};

