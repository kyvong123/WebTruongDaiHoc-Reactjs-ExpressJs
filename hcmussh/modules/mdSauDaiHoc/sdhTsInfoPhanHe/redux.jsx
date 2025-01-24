import T from 'view/js/common';
const SdhTsPhanHeAll = 'SdhTsPhanHe:GetAll';

export default function SdhTsPhanHeReducer(state = null, data) {
    switch (data.type) {
        case SdhTsPhanHeAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

export function getSdhTsInfoPhanHeAll(done) {
    return () => {
        const url = '/api/sdh/ts-info/phan-he/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các phân hệ không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}
export function getSdhTsInfoPhanHeById(id, done) {
    return () => {
        const url = `/api/sdh/ts-info/phan-he/item/${id}`;
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
export function getSdhTsInfoPhanHeData(idDot, done) {
    return dispatch => {
        const url = `/api/sdh/ts-info/phan-he/${idDot}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhTsPhanHeAll, items: data.items });
                done && done(data.items);
            }
        });
    };
}
export function deleteSdhTsInfoPhanHe(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/phan-he';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Hủy kích hoạt phân hệ không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Hủy kích hoạt phân hệ thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function createSdhTsInfoPhanHe(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/phan-he';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Kích hoạt phân hệ không thành công ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Kích hoạt phân hệ thành công!', 'success');
                done && done(result.item);
            }
        });
    };
}

export function updateSdhTsInfoPhanHe(data, changes, done) {
    return () => {
        const url = '/api/sdh/ts-info/phan-he';
        T.put(url, { data, changes }, result => {
            if (result.error) {
                T.notify(`${changes.isOpen ? 'Mở' : 'Đóng'} đăng ký phân hệ không thành công ${result.error.message && ('<br>:' + result.error.message)}`, 'danger');
                console.error(`PUT: ${url}.`, result.error);
            } else {
                T.notify(`${changes.isOpen ? 'Mở' : 'Đóng'} đăng ký phân hệ thành công!`, 'success');
                done && done(result.item);
            }
        });
    };
}

export function getSdhTsInfoPhanHeDetailAll(done) {
    return () => {
        const url = '/api/sdh/ts-info/phan-he-all-detail';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin phân hệ tuyển sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function getSdhTsPhanHe(ma, done) {
    return () => {
        const url = `/api/sdh/ts/phan-he/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phân hệ không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export function getSdhTsInfoPhanHeDetail(id, done) {
    return () => {
        const url = `/api/sdh/ts-info/phan-he/detail/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin phân hệ tuyển sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
//phanHeKichHoat
export const SelectAdapter_PhanHe = (idDot) => {
    return {
        ajax: true,
        url: '/api/sdh/ts/phan-he/all',
        data: params => ({ searchTerm: params.term, idDot }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}`, idPhanHe: item.id })) : [] }),
        fetchOne: (ma, done) => (getSdhTsPhanHe(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))()
    };
};
//phanHeMoDangKy
export const SelectAdapter_PhanHeMoDangKy = (idDot, current) => {
    return {
        ajax: true,
        url: '/api/sdh/ts/phan-he/is-open',
        data: params => ({ searchTerm: params.term, idDot }),
        processResults: response => ({ results: response && response.items ? response.items.filter(item => item.isOpen && item.maPhanHe != current).map(item => ({ id: item.maPhanHe, text: `${item.maPhanHe}: ${item.tenPhanHe}`, idPhanHe: item.id })) : [] }),
        fetchOne: (ma, done) => (getSdhTsPhanHe(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))()
    };
};
//phanHeDangKyThem
export const SelectAdapter_PhanHeDangKyThem = (email, idDot, current) => {
    return {
        ajax: true,
        url: '/api/sdh/ts/phan-he/register',
        data: params => ({ searchTerm: params.term, email, idDot }),
        processResults: response => ({ results: response && response.items ? response.items.filter(item => item.isOpen && item.maPhanHe != current).map(item => ({ id: item.maPhanHe, text: `${item.maPhanHe}: ${item.tenPhanHe}`, idPhanHe: item.id })) : [] }),
        fetchOne: (ma, done) => (getSdhTsPhanHe(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))()
    };
};

// export const SelectAdapter_PhanHeSearch = (idDot) => {
//     return {
//         ajax: true,
//         url: '/api/sdh/ts/phan-he/all',
//         data: params => ({ searchTerm: params.term, idDot }),
//         processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}`, idPhanHe: item.id })) : [] }),
//         fetchOne: (ma, done) => (getSdhTsPhanHe(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))()
//     };
// };

export const SelectAdapter_PhanHeSearch = (idDot) => {
    return {
        ajax: true,
        url: '/api/sdh/ts/phan-he/all',
        data: params => ({ searchTerm: params.term, idDot }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}`, idPhanHe: item.id })) : [] }),
        fetchOne: (ma, done) => (getSdhTsPhanHe(ma, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))()
    };
};

export const SelectAdapter_SdhTsInfoPhanHe = {

    ajax: true,
    url: '/api/sdh/ts-info/phan-he-all-detail',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.id, text: `Năm: ${item.namTuyenSinh} Đợt: ${item.maDot} - Phân hệ: ${item.tenPhanHe}` })) : [] }),
    fetchOne: (id, done) => (getSdhTsInfoPhanHeDetail(id, item => done && done({ id: item.id, text: `Năm: ${item.namTuyenSinh} Đợt: ${item.maDot} - Phân hệ: ${item.tenPhanHe}` })))(),

};