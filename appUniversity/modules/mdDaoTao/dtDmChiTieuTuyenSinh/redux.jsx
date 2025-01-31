import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtChiTieuTuyenSinhGetAll = 'DtChiTieuTuyenSinh:GetAll';
const DtChiTieuTuyenSinhGetData = 'DtChiTieuTuyenSinh:GetData';
const DtChiTieuTuyenSinhUpdate = 'DtChiTieuTuyenSinh:Update';

export default function reducer(state = null, data) {
    switch (data.type) {
        case DtChiTieuTuyenSinhGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtChiTieuTuyenSinhGetData:
            return Object.assign({}, state, { data: data.items });
        case DtChiTieuTuyenSinhUpdate: {
            const item = data.item;
            const loaiHinhDaoTao = state.data?.find(he => he.ma == item.loaiHinhDaoTao);
            if (loaiHinhDaoTao) {
                const nganh = loaiHinhDaoTao.nganh?.find(nganh => nganh.maNganh == item.nganh);
                nganh.soLuong = item.soLuong;
            }
            return Object.assign({}, state);
        }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAll(done) {
    return dispatch => {
        const url = '/api/dt/tuyen-sinh/chi-tieu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chỉ tiêu lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtChiTieuTuyenSinhGetAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy thông tin chỉ tiêu lỗi!', 'danger'));
    };
}

export function getNamTuyenSinh(namTuyenSinh, dot, done) {
    return dispatch => {
        // const url = '/api/dt/tuyen-sinh/chi-tieu/' + namTuyenSinh;
        const url = `/api/dt/tuyen-sinh/chi-tieu/${namTuyenSinh}/${dot}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin chỉ tiêu lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: DtChiTieuTuyenSinhGetData, items: data.data });
                done && done(data.data);
            }
        }, () => T.notify('Lấy thông tin chỉ tiêu lỗi!', 'danger'));
    };
}


export function updateSoLuong(namTuyenSinh, dot, data, done, onFinish) {
    return dispatch => {
        const url = `/api/dt/tuyen-sinh/chi-tieu/${namTuyenSinh}/${dot}`;
        T.put(url, data, res => {
            onFinish && onFinish();
            if (res.error) {
                T.notify(res.error.message || 'Cập nhật thông tin số lương lỗi', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                dispatch(({ type: DtChiTieuTuyenSinhUpdate, item: res.item }));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin số lương lỗi!', 'danger'));
    };
}
