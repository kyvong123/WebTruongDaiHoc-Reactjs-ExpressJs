import T from 'view/js/common';

const SdhLoaiChungChiNgoaiNguAll = 'SdhLoaiChungChiNgoaiNgu:GetAll';
export default function SdhLoaiChungChiNgoaiNguReducer(state = null, data) {
    switch (data.type) {
        case SdhLoaiChungChiNgoaiNguAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhLoaiChungChiNgoaiNgu(done) {
    return dispatch => {
        const url = '/api/sdh/loai-ccnn/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu loại chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhLoaiChungChiNgoaiNguAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhLoaiChungChiNgoaiNgu(data, done) {
    return dispatch => {
        const url = '/api/sdh/loai-ccnn';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo loại chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhLoaiChungChiNgoaiNgu());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhLoaiChungChiNgoaiNgu(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/loai-ccnn';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật loại chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhLoaiChungChiNgoaiNgu());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhLoaiChungChiNgoaiNgu(ma, done) {
    return dispatch => {
        const url = '/api/sdh/loai-ccnn';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật loại chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllSdhLoaiChungChiNgoaiNgu());
                done && done(result.item);
            }
        });
    };
}

export function getSdhLoaiChungChiNgoaiNgu(ma, done) {
    return () => {
        const url = `/api/sdh/loai-ccnn/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu loại chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export function getSdhLoaiChungChiNgoaiNguByIdCcnn(idCcnn, done) {
    return () => {
        const url = '/api/sdh/loai-ccnn/get-by-idccnn';
        T.get(url, { idCcnn }, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu loại chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SdhLoaiChungChiNgoaiNgu = {
    ajax: true,
    url: '/api/sdh/loai-ccnn/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.loaiChungChi, text: item.loaiChungChi })) : [] }),
    fetchOne: (ma, done) => (getSdhLoaiChungChiNgoaiNgu(ma, item => done && done({ id: item.ma, text: item.loaiChungChi })))(),
};
export const SelectAdapter_SdhLoaiChungChiNgoaiNguV2 = {
    ajax: true,
    url: '/api/sdh/loai-ccnn/page/1/100',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.page && response.page.list && response.page.list.length ? response.page.list.map(item => ({ id: T.stringify(item), text: `${item.ngonNgu ? item.ngonNgu + ':' : ''} ${item.loaiChungChi}` })) : [] }),
    fetchOne: (idCcnn, done) => (getSdhLoaiChungChiNgoaiNguByIdCcnn(idCcnn, item => done && done({ id: item.loaiChungChi, text: `${item.ngoaiNgu ? item.ngoaiNgu + ':' : ''} ${item.loaiChungChi}` })))(),
};
export const SelectAdapter_SdhLoaiChungChiNgoaiNguV3 = {
    ajax: true,
    url: '/api/sdh/loai-ccnn/page/1/100',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.page && response.page.list && response.page.list.length ? response.page.list.map(item => ({ id: item.ma, text: `${item.ngonNgu ? item.ngonNgu + ':' : ''} ${item.loaiChungChi}`, loaiChungChi: item.loaiChungChi, ngonNgu: item.ngonNgu })) : [] }),
    fetchOne: (ma, done) => (getSdhLoaiChungChiNgoaiNgu(ma, item => done && done({ id: item.ma, text: `${item.ngonNgu ? item.ngonNgu + ':' : ''} ${item.loaiChungChi}` })))(),
};
