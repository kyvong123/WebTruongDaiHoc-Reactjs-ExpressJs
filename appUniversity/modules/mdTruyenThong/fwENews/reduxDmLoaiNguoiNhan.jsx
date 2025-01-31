import T from 'view/js/common';

const ENewsDmLoaiNguoiNhanGetAll = 'ENewsDmLoaiNguoiNhan:GetAll';

export default function eNewsDmLoaiNguoiNhanReducer(state = null, data) {
    switch (data.type) {
        case ENewsDmLoaiNguoiNhanGetAll: {
            return { ...state, items: data.items };
        }

        default:
            return state;
    }
}

// Functions
export function getAllDmLoaiNguoiNhan(done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/dm-nguoi-nhan/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục bị lỗi !', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: ENewsDmLoaiNguoiNhanGetAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy danh sách danh mục bị lỗi !', 'danger'));
    };
}
export function createDmLoaiNguoiNhan(item, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/dm-nguoi-nhan';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo danh mục bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Tạo danh mục thành công!', 'success');
                getAllDmLoaiNguoiNhan()(dispatch);
                done && done();
            }
        }, () => T.notify('Tạo danh mục bị lỗi !', 'danger'));
    };
}

export function updateDmLoaiNguoiNhan(id, changes, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/dm-nguoi-nhan';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh mục bị lỗi !', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật danh mục thành công!', 'success');
                getAllDmLoaiNguoiNhan()(dispatch);
                done && done();
            }
        }, () => T.notify('Cập nhật danh mục bị lỗi !', 'danger'));
    };
}

export function deleteDmLoaiNguoiNhan(id, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/dm-nguoi-nhan';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục bị lỗi !', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Cập nhật danh mục thành công!', 'success', false, 800);
                getAllDmLoaiNguoiNhan()(dispatch);
                done && done();
            }
        }, () => T.notify('Cập nhật danh mục bị lỗi !', 'danger'));
    };
}

export const searchDmNguoiNhanAdapter = {
    ajax: true,
    url: '/api/tt/e-news/dm-nguoi-nhan/all',
    processResults: data => {
        return { results: data && data.items ? data.items.map(item => ({ id: item.id, text: item.tenLoai })) : [] };
    },
    fetchOne: (id, done) => T.get('/api/tt/e-news/dm-nguoi-nhan/item/' + id, data => done && done({ id: data.item.id, text: data.item.tenLoai })),
};