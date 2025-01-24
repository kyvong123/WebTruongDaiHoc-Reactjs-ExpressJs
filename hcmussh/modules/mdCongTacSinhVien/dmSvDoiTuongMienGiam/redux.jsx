import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDoiTuongMienGiamGetPage = 'DmDoiTuongMienGiam:GetPage';

export default function dmDoiTuongMienGiamReducer(state = null, data) {
    switch (data.type) {
        case DmDoiTuongMienGiamGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmDoiTuongMienGiamPage', true);
export function getDmDoiTuongMienGiamPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmDoiTuongMienGiamPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/doi-tuong-mien-giam/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đối tượng miễn giảm bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmDoiTuongMienGiamGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đối tượng miễn giảm bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createDmDoiTuongMienGiam(dmDoiTuongMienGiam, done) {
    return dispatch => {
        const url = '/api/ctsv/doi-tuong-mien-giam';
        T.post(url, { dmDoiTuongMienGiam }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một đối tượng miễn giảm bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một đối tượng miễn giảm thành công!', 'success');
                dispatch(getDmDoiTuongMienGiamPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một đối tượng miễn giảm bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDoiTuongMienGiam(ma, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/doi-tuong-mien-giam';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu đối tượng miễn giảm bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu đối tượng miễn giảm thành công!', 'success');
                done && done(data.item);
                dispatch(getDmDoiTuongMienGiamPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu đối tượng miễn giảm bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDoiTuongMienGiam(ma, done) {
    return dispatch => {
        const url = '/api/ctsv/doi-tuong-mien-giam';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa đối tượng miễn giảm bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa đối tượng miễn giảm thành công!', 'success', false, 800);
                dispatch(getDmDoiTuongMienGiamPage());
            }
            done && done();
        }, () => T.notify('Xóa đối tượng miễn giảm bị lỗi!', 'danger'));
    };
}

export function getSvDmMienGiam(ma, done) {
    return () => {
        const url = `/api/ctsv/doi-tuong-mien-giam/item/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy đối tượng miễn giảm bị lỗi', 'danger');
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_DmMienGiam = {
    ajax: true,
    url: '/api/ctsv/doi-tuong-mien-giam/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten}: ${item.dinhMuc}% : ${item.thoiGian == 'TK' ? 'Toàn khóa' : 'Năm tài chính'}`, thoiGian: item.thoiGian })) : [] }),
    fetchOne: (ma, done) => (getSvDmMienGiam(ma, item => done && done({ id: item.ma, text: `${item.ten}: ${item.dinhMuc}% : ${item.thoiGian == 'TK' ? 'Toàn khóa' : 'Năm tài chính'}`, thoiGian: item.thoiGian })))(),
};