import T from 'view/js/common';

const SdhDoiTuongUuTienAll = 'SdhDoiTuongUuTien:GetAll';
export default function SdhDoiTuongUuTienReducer(state = null, data) {
    switch (data.type) {
        case SdhDoiTuongUuTienAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getAllSdhDoiTuongUuTien(done) {
    return dispatch => {
        const url = '/api/sdh/doi-tuong-uu-tien/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu đối tượng tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SdhDoiTuongUuTienAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function createSdhDoiTuongUuTien(data, done) {
    return dispatch => {
        const url = '/api/sdh/doi-tuong-uu-tien';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi tạo đối tượng tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo mới thành công', 'success');
                dispatch(getAllSdhDoiTuongUuTien());
                done && done(result.item);
            }
        });
    };
}

export function updateSdhDoiTuongUuTien(ma, data, done) {
    return dispatch => {
        const url = '/api/sdh/doi-tuong-uu-tien';
        T.put(url, { ma, data }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật đối tượng tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getAllSdhDoiTuongUuTien());
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhDoiTuongUuTien(ma, done) {
    return dispatch => {
        const url = '/api/sdh/doi-tuong-uu-tien';
        T.delete(url, { ma }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật đối tượng tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                dispatch(getAllSdhDoiTuongUuTien());
                done && done(result.item);
            }
        });
    };
}

export function getSdhDoiTuongUuTien(ma, done) {
    return () => {
        const url = `/api/sdh/doi-tuong-uu-tien/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu đối tượng tuyển sinh', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SdhDoiTuongUuTien = {
    ajax: true,
    url: '/api/sdh/doi-tuong-uu-tien/all',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhDoiTuongUuTien(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};