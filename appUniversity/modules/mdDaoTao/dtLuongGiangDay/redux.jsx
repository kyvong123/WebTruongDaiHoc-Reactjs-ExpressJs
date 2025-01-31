import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtThuLaoGiangDayGetPage = 'dtThuLaoGiangDay:GetPage';
const DtThuLaoGiangDaySetNull = 'dtThuLaoGiangDay:SetNull';
// const DtDmHeSoKhoiLuongUpdate = 'dtDmHeSoKhoiLuong:Update';

export default function dtThuLaoGiangDayReducer(state = null, data) {
    switch (data.type) {
        case DtThuLaoGiangDaySetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case DtThuLaoGiangDayGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDtThuLaoGiangDay');
export function getDtThuLaoGiangDayPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageDtThuLaoGiangDay', pageNumber, pageSize, pageCondition, filter, sortTerm);
    return dispatch => {
        dispatch({ type: DtThuLaoGiangDaySetNull });
        const url = `/api/dt/thu-lao-giang-day/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter, sortTerm }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thù lao giảng dạy lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtThuLaoGiangDayGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function updateThuLaoGiangDay(id, changes, done) {
    const cookie = T.updatePage('pageDtThuLaoGiangDay');
    const { pageNumber, pageSize, pageCondition, filter, sortTerm } = cookie;
    return dispatch => {
        const url = '/api/dt/thu-lao-giang-day/update';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error || 'Cập nhật thù lao giảng dạy lỗi!', 'danger');
                console.error(`Upadte: ${url}.`, result.error);
                done && done();
            } else {
                T.notify('Cập nhật thù lao giảng dạy thành công!', 'success');
                dispatch(getDtThuLaoGiangDayPage(pageNumber, pageSize, pageCondition, filter, sortTerm));
                done && done();
            }
        }, () => T.notify('Cập nhật thù lao giảng dạy lỗi!', 'danger'));
    };
}

export function getInfoDetailPage(id, done) {
    return () => {
        const url = '/api/dt/thu-lao-giang-day/detail/get-info';
        T.get(url, { id }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Lấy thông tin thù lao thất bại!', 'danger');
                console.error('POST: ' + url, res.error);
            } else {
                done && done(res);
            }
        }, () => T.notify('Lấy thông tin thù lao thất bại!', 'danger')
        );
    };
}

export function updateChiaTiet(data, done) {
    const cookie = T.updatePage('pageDtThuLaoGiangDay');
    const { pageNumber, pageSize, pageCondition, filter, sortTerm } = cookie;
    return dispatch => {
        const url = '/api/dt/thu-lao-giang-day/chia-tiet/change';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Lấy thông tin thù lao thất bại!', 'danger');
                console.error('POST: ' + url, res.error);
            } else {
                T.notify('Cập nhật thù lao giảng dạy thành công!', 'success');
                dispatch(getDtThuLaoGiangDayPage(pageNumber, pageSize, pageCondition, filter, sortTerm));
                done && done(res);
            }
        }, () => T.notify('Lấy thông tin thù lao thất bại!', 'danger')
        );
    };
}
export function getListHopDong(data, done) {
    return () => {
        const url = '/api/dt/thu-lao-giang-day/get-list-hop-dong';
        T.get(url, data, res => {
            if (res.error) {
                T.notify(res.error.message || 'Lấy danh sách hợp đồng thất bại', 'danger');
                console.error('POST: ' + url, res.error);
            }
            else {
                done && done(res);
            }
        }, () => T.notify('Lấy danh sách hợp đồng thất bại', 'danger'));
    };
}

export function exportHopDong(data, info, done) {
    return () => {
        const url = '/api/dt/thu-lao-giang-day/export-hop-dong';
        T.post(url, { data, info }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Lấy danh sách hợp đồng thất bại', 'danger');
                console.error('POST: ' + url, res.error);
            }
            else {
                done && done(res);
            }
        }, () => T.notify('Lấy danh sách hợp đồng thất bại', 'danger'));
    };
}

export function genThuLao(namHoc, hocKy, done) {
    const cookie = T.updatePage('pageDtThuLaoGiangDay');
    const { pageNumber, pageSize, pageCondition, filter, sortTerm } = cookie;
    return dispatch => {
        const url = '/api/dt/thu-lao-giang-day/auto-gen';
        T.post(url, { namHoc, hocKy }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Lấy thông tin thù lao thất bại!', 'danger');
                console.error('POST: ' + url, res.error);
            } else {
                // T.notify('Tự động sinh thù lao giảng dạy thành công!', 'success');
                dispatch(getDtThuLaoGiangDayPage(pageNumber, pageSize, pageCondition, filter, sortTerm));
                done && done(res);
            }
        }, () => T.notify('Lấy thông tin thù lao thất bại!', 'danger')
        );
    };
}

export function chotHopDong(data, info, done) {
    const cookie = T.updatePage('pageDtThuLaoGiangDay');
    const { pageNumber, pageSize, pageCondition, filter, sortTerm } = cookie;
    return dispatch => {
        const url = '/api/dt/thu-lao-giang-day/chot-hop-dong';
        T.post(url, { data, info }, res => {
            if (res.error) {
                T.notify(res.error.message || 'Chốt hợp đồng thất bại', 'danger');
                console.error('POST: ' + url, res.error);
            }
            else {
                dispatch(getDtThuLaoGiangDayPage(pageNumber, pageSize, pageCondition, filter, sortTerm));
                done && done();
            }
        }, () => T.notify('Chốt hợp đồng thất bại', 'danger'));
    };
}


