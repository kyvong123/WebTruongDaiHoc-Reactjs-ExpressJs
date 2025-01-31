import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
// const hcthDoiTuongKiemDuyetGetPage = 'hcthDoiTuongKiemDuyet:GetPage';

// export default function reducer(state = null, data) {
//     console.log({ data });
//     switch (data.type) {
//         default:
//             return state;
//     }
// }

// Actions ------------------------------------------------------------------------------------------------------------


export function get(id, done) {
    return () => {
        const url = `/api/hcth/trang-thai-van-ban-di/detail/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin trạng thái lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin trạng thái lỗi', 'danger'));
    };
}

export function getByTrangThai(systemId, trangThai, done) {
    return () => {
        const url = `/api/hcth/trang-thai-van-ban-di/detail/item/${systemId}/${trangThai}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin trạng thái lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin trạng thái lỗi', 'danger'));
    };
}

export function create(data, done, onFinish) {
    return () => {
        const url = '/api/hcth/trang-thai-van-ban-di/detail';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo trạng thái văn bản đi lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo trạng thái văn bản đi thành công!', 'success');
                done && done(data);
            }
        }, (error) => T.notify('Tạo trạng thái văn bản đi lỗi!' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function update(id, changes, done, onFinish) {
    return () => {
        const url = `/api/hcth/trang-thai-van-ban-di/detail/item/${id}`;
        T.put(url, { changes }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật trạng thái văn bản đi lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật trạng thái văn bản đi thành công!', 'success');
                done && done(data.item);
            }
        }, (error) => T.notify('Cập nhật trạng thái văn bản đi lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDetail(id, done) {
    return () => {
        const url = '/api/hcth/trang-thai-van-ban-di/detail/item/' + id;
        T.delete(url, data => {
            if (data.error) {
                T.notify('Xóa trạng thái bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa trạng thái thành công!', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa trạng thái bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_HcthVanBanDiStatusDetail = (systemId) => ({
    ajax: true,
    data: params => ({ condition: params.term }),
    url: `/api/hcth/trang-thai-van-ban-di/item/${systemId}`,
    processResults: response => ({ results: response && response.item && response.item.details ? response.item.details.map(item => ({ id: item.id, text: item.tenTrangThai })) : [] }),
    fetchOne: (id, done) => (get(id, item => done && done({ id: item.id, text: item.trangThaiObject?.ten })))(),
});

export const SelectAdapter_HcthVanBanDiMaStatusDetail = (systemId) => ({
    ajax: true,
    data: params => ({ condition: params.term }),
    url: `/api/hcth/trang-thai-van-ban-di/item/${systemId}`,
    processResults: response => ({ results: response && response.item && response.item.details ? response.item.details.map(item => ({ id: item.trangThai, text: item.tenTrangThai })) : [] }),
    fetchOne: (trangThai, done) => (getByTrangThai(systemId, trangThai, item => done && done({ id: item.trangThai, text: item.trangThaiObject?.ten })))(),
});