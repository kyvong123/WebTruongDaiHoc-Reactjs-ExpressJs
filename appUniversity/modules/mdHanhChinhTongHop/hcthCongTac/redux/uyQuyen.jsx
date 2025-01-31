import { HcthLichCongTacGetUyQuyen } from './congTac';

export function getUyQuyen(done) {
    return dispatch => {
        const url = '/api/hcth/cong-tac/uy-quyen/all';
        T.get(url, {}, (res) => {
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Lấy danh sách ủy quyền. ' + (res.error.message ? res.error.message : res.error), 'danger');
            } else {
                done && done(res.items);
                dispatch({ type: HcthLichCongTacGetUyQuyen, items: res.items });
            }
        });
    };
}

export function getNguoiUyQuyen(done) {
    return () => {
        const url = '/api/hcth/cong-tac/uy-quyen/list';
        T.get(url, {}, (res) => {
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Lấy danh sách cán bộ ủy quyền. ' + (res.error.message ? res.error.message : res.error), 'danger');
            } else {
                done && done(res.items);
            }
        });
    };
}


export function createUyQuyen(shcc, done) {
    return dispatch => {
        const url = '/api/hcth/cong-tac/uy-quyen/all';
        T.post(url, { shcc }, (res) => {
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Tạo cán bộ ủy quyền. ' + (res.error.message ? res.error.message : res.error), 'danger');
            } else {
                done && done(res.items);
                dispatch(getUyQuyen());
                T.notify('Tạo cán bộ ủy quyền thành công', 'success');
            }
        });
    };
}

export function updateUyQuyen(id, shcc, done) {
    return dispatch => {
        const url = '/api/hcth/cong-tac/uy-quyen/all';
        T.put(url, { id, shcc }, (res) => {
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Cập nhật cán bộ ủy quyền. ' + (res.error.message ? res.error.message : res.error), 'danger');
            } else {
                done && done(res.items);
                dispatch(getUyQuyen());
                T.notify('Cập nhật cán bộ ủy quyền thành công', 'success');
            }
        });
    };
}

export function deleteUyQuyen(id, done) {
    return dispatch => {
        const url = '/api/hcth/cong-tac/uy-quyen/all';
        T.delete(url, { id }, (res) => {
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Xóa cán bộ ủy quyền. ' + (res.error.message ? res.error.message : res.error), 'danger');
            } else {
                done && done(res.items);
                dispatch(getUyQuyen());
                T.notify('Xóa cán bộ ủy quyền thành công', 'success');
            }
        });
    };
}

export function getUserUyQuyenCongTacPage(pageNumber, pageSize, filter, done) {
    return () => {
        const url = `/api/hcth/cong-tac/user-uy-quyen/page/${pageNumber}/${pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}