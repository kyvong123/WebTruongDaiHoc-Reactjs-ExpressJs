import T from 'view/js/common';

const ENewsNguoiNhanGetPage = 'ENewsNguoiNhan:GetPage';

export default function eNewsNguoiNhanReducer(state = null, data) {
    switch (data.type) {
        case ENewsNguoiNhanGetPage: {
            return { ...state, page: data.page };
        }

        default:
            return state;
    }
}

// Functions
T.initPage('eNewsNguoiNhanPage');
export function getPageNguoiNhan(pageNumber, pageSize, done) {
    const page = T.updatePage('eNewsNguoiNhanPage', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/tt/e-news/nguoi-nhan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách người nhận bị lỗi !', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: ENewsNguoiNhanGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách người nhận bị lỗi !', 'danger'));
    };
}

export function createNguoiNhan(item, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/nguoi-nhan';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo người nhận bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Tạo người nhận thành công!', 'success');
                getPageNguoiNhan()(dispatch);
                done && done();
            }
        }, () => T.notify('Tạo người nhận bị lỗi !', 'danger'));
    };
}

export function createMultipleNguoiNhan(data, done) {
    return () => {
        const url = '/api/tt/e-news/nguoi-nhan/import/save-all';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo người nhận bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done();
            }
        }, () => T.notify('Tạo người nhận bị lỗi !', 'danger'));
    };
}

export function updateNguoiNhan(id, changes, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/nguoi-nhan';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật người nhận bị lỗi !', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật người nhận thành công!', 'success');
                getPageNguoiNhan()(dispatch);
                done && done();
            }
        }, () => T.notify('Cập nhật người nhận bị lỗi !', 'danger'));
    };
}

export function deleteNguoiNhan(id, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/nguoi-nhan';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa người nhận bị lỗi !', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Cập nhật người nhận thành công!', 'success', false, 800);
                getPageNguoiNhan()(dispatch);
                done && done();
            }
        }, () => T.notify('Cập nhật người nhận bị lỗi !', 'danger'));
    };
}