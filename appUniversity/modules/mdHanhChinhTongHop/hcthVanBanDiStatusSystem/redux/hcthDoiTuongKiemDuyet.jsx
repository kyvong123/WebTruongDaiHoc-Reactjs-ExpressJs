import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const hcthDoiTuongKiemDuyetGetPage = 'hcthDoiTuongKiemDuyet:GetPage';

export default function reducer(state = null, data) {
    switch (data.type) {
        case hcthDoiTuongKiemDuyetGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('hcthDoiTuongKiemDuyetPage', true);
export function getPage(pageNumber, pageSize, filter, pageCondition, done) {
    const page = T.updatePage('hcthDoiTuongKiemDuyetPage', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/doi-tuong-kiem-duyet/page/${page.pageNumber}/${page.pageSize}`;
        dispatch({ type: hcthDoiTuongKiemDuyetGetPage, page: null });
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đối tượng kiểm duyệt lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: hcthDoiTuongKiemDuyetGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách đối tượng kiểm duyệt lỗi', 'danger'));
    };
}


export function get(ma, done) {
    return () => {
        const url = `/api/hcth/doi-tuong-kiem-duyet/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông đối tượng lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin đối tượng lỗi', 'danger'));
    };
}

export function create(data, done, onFinish) {
    return dispatch => {
        const url = '/api/hcth/doi-tuong-kiem-duyet';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo đối tượng kiểm duyệt bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới đối tượng kiểm duyệt thành công!', 'success');
                dispatch(getPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo đối tượng kiểm duyệt bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function update(ma, changes, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/doi-tuong-kiem-duyet/item/${ma}`;
        T.put(url, { changes }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật đối tượng kiểm duyệt bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật đối tượng kiểm duyệt thành công!', 'success');
                done && done(data.item);
                dispatch(getPage());
            }
        }, (error) => T.notify('Cập nhật đối tượng kiểm duyệt bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDoiTuong(ma, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/doi-tuong-kiem-duyet/item/${ma}`;
        T.delete(url, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Xoá đối tượng kiểm duyệt bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa đối tượng kiểm duyệt thành công!', 'success', false, 800);
                dispatch(getPage());
            }
            done && done();
        }, (error) => T.notify('Xoá đối tượng kiểm duyệt bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

// export function deleteSystem(ma, done) {
//     return dispatch => {
//         const url = '/api/hcth/trang-thai-van-ban-di';
//         T.delete(url, { ma }, data => {
//             if (data.error) {
//                 T.notify('Xóa hệ thống trạng thái bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
//                 console.error(`DELETE: ${url}.`, data.error);
//             } else {
//                 T.alert('Xóa hệ thống trạng thái thành công!', 'success', false, 800);
//                 dispatch();
//             }
//             done && done();
//         }, () => T.notify('Xóa hệ thống trạng thái bị lỗi!', 'danger'));
//     };
// }

export const SelectAdapter_HcthDoiTuongKiemDuyet = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/hcth/doi-tuong-kiem-duyet/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (get(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};