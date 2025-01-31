import T from 'view/js/common';

const DrlXepLoaiGetPage = 'DrlXepLoai:GetPage';

export default function DrlXepLoaiReducer(state = null, data) {
    switch (data.type) {
        case DrlXepLoaiGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('PageCtsvDrlXepLoai');
export function getPageDrlXepLoai(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('PageCtsvDrlXepLoai', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/ctsv/drl-xep-loai/page';
        T.get(url, { ...page }, data => {
            if (data.error) {
                T.notify('Lấy xếp loại điểm rèn luyện bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: DrlXepLoaiGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDrlXepLoai(data, done) {
    return dispatch => {
        const url = '/api/ctsv/drl-xep-loai';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo xếp loại điểm rèn luyện bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch(getPageDrlXepLoai());
                T.notify('Tạo xếp loại điểm rèn luyện thành công', 'success');
                done && done(data.items);
            }
        });
    };
}

export function getDrlXepLoai(ma, done) {
    return () => {
        const url = '/api/ctsv/drl-xep-loai/item';
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy xếp loại điểm rèn luyện bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function updateDrlXepLoai(ma, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/drl-xep-loai';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật xếp loại điểm rèn luyện bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật xếp loại điểm rèn luyện thành công', 'success');
                dispatch(getPageDrlXepLoai());
                done && done();
            }
        });
    };
}

export function deleteDrlXepLoai(ma, done) {
    return dispatch => {
        const url = '/api/ctsv/drl-xep-loai';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa xếp loại điểm rèn luyện bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                T.notify('Xóa xếp loại điểm rèn luyện thành công', 'success');
                dispatch(getPageDrlXepLoai());
                done && done();
            }
        });
    };
}
export const SelectAdapter_DrlXepLoai = ({
    ajax: true,
    url: '/api/ctsv/drl-xep-loai/active/all',
    data: params => ({ searchTerm: params.term }),
    processResults: res => ({ results: res && res.items ? res.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDrlXepLoai(ma, item => done && done({ id: item.ma, text: item.ten })))()
});