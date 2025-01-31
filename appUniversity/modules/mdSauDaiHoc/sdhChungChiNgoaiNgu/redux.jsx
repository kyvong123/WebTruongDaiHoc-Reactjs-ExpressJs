import T from 'view/js/common';

const SdhChungChiNgoaiNguAll = 'SdhChungChiNgoaiNgu:GetAll';
export default function SdhChungChiNgoaiNguReducer(state = null, data) {
    switch (data.type) {
        case SdhChungChiNgoaiNguAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhChungChiNgoaiNgu(done) {
    return dispatch => {
        const url = '/api/sdh/ccnn/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhChungChiNgoaiNguAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhChungChiNgoaiNgu(data, done) {
    return dispatch => {
        const url = '/api/sdh/ccnn';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhChungChiNgoaiNgu());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhChungChiNgoaiNgu(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/ccnn';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhChungChiNgoaiNgu());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhChungChiNgoaiNgu(ma, done) {
    return dispatch => {
        const url = '/api/sdh/ccnn';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllSdhChungChiNgoaiNgu());
                done && done(result.item);
            }
        });
    };
}

export function getSdhChungChiNgoaiNgu(ma, done) {
    return () => {
        const url = `/api/sdh/ccnn/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu chứng chỉ ngoại ngữ', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SdhChungChiNgoaiNgu = {
    ajax: true,
    url: '/api/sdh/ccnn/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: `${item.loaiChungChi} - ${item.trinhDo}` })) : [] }),
    fetchOne: (ma, done) => (getSdhChungChiNgoaiNgu(ma, item => done && done({ id: item.ma, text: `${item.loaiChungChi} : ${item.trinhDo}` })))(),
};