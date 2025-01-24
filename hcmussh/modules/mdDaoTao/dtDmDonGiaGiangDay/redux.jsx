import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmDonGiaGiangDayGetPage = 'dtDmDonGiaGiangDay:GetPage';

export default function dtDmDonGiaGiangDayReducer(state = null, data) {
    switch (data.type) {
        case DtDmDonGiaGiangDayGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDtDmDonGiaGiangDay');
export function getDtDmDonGiaGiangDayPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDmDonGiaGiangDay', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/don-gia-giang-day/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh mục đơn giá giảng dạy lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDmDonGiaGiangDayGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDonGiaGiangDay(data, done) {
    const cookie = T.updatePage('pageDtDmDonGiaGiangDay');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/don-gia-giang-day/create';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo đơn giá giảng dạy lỗi!', 'danger');
                console.error(`POST: ${url}.`, result.error);
                // done && done(result.error);
            } else {
                T.notify('Tạo mới đơn giá giảng dạy thành công!', 'success');
                dispatch(getDtDmDonGiaGiangDayPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Tạo đơn giá giảng dạy lỗi!', 'danger'));
    };
}

export function deleteDonGiaGiangDay(id, done) {
    const cookie = T.updatePage('pageDtDmDonGiaGiangDay');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/don-gia-giang-day/delete';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error || 'Xóa đơn giá giảng dạy bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, result.error);
                // done && done();
            } else {
                T.notify('Xóa đơn giá giảng dạy thành công!', 'success');
                dispatch(getDtDmDonGiaGiangDayPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Xóa đơn giá giảng dạy bị lỗi!', 'danger'));
    };
}

export function updateDonGiaGiangDay(id, changes, done) {
    const cookie = T.updatePage('pageDtDmDonGiaGiangDay');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/dt/don-gia-giang-day/update';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error || 'Cập nhật đơn giá giảng dạy lỗi!', 'danger');
                console.error(`Upadte: ${url}.`, result.error);
                // done && done();
            } else {
                T.notify('Cập nhật đơn giá giảng dạy thành công!', 'success');
                dispatch(getDtDmDonGiaGiangDayPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Cập nhật đơn giá giảng dạy bị lỗi!', 'danger'));
    };
}


function getDtDonGiaGiangDayItem(id, done) {
    return () => {
        const url = `/api/dt/don-gia-giang-day/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hệ số chất lượng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export const SelectAdapter_DonGiaGiangDayAll = (filter) => {
    return {
        ajax: true,
        url: '/api/dt/don-gia-giang-day/page/all',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => ({ results: response && response.items && response.items.map(item => ({ id: item.id, text: item.ten })) }),
        // getOne: getDtDonGiaGiangDayItem,
        fetchOne: (id, done) => (getDtDonGiaGiangDayItem(id, item => done && done({ id: item.id, text: item.ten })))(),
    };
};
