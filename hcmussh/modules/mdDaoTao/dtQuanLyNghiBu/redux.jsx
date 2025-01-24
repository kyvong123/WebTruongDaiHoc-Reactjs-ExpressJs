import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

export default function dtQuanLyNghiBuReducer(state = null, data) {
    switch (data.type) {
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('DtQuanLyBu');
export function getBaoBuPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('DtQuanLyBu', pageNumber, pageSize, pageCondition, filter);
    return () => {
        const url = `/api/dt/thoi-khoa-bieu/bao-bu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, data => {
            if (data.error) {
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page);
            }
        });
    };
}

T.initPage('DtQuanLyNghi');
export function getBaoNghiPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('DtQuanLyNghi', pageNumber, pageSize, pageCondition, filter);
    return () => {
        const url = `/api/dt/thoi-khoa-bieu/bao-nghi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, data => {
            if (data.error) {
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page);
            }
        });
    };
}

T.initPage('GiangVienBu');
export function getGiangVienBuPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('GiangVienBu', pageNumber, pageSize, pageCondition, filter);
    return () => {
        const url = `/api/dt/thoi-khoa-bieu-giang-vien/bao-bu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, data => {
            if (data.error) {
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.page);
            }
        });
    };
}

export function giangVienBuVerify(item, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-giang-vien/bao-bu/verify';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Xác nhận lịch bù bị lỗi!', 'error', false, 2000);
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.alert('Xác nhận lịch bù thành công!', 'success', false, 500);
                done && done(data);
            }
        });
    };
}

export function giangVienBuCancel(item, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-giang-vien/bao-bu/cancel';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Từ chối lịch bù bị lỗi!', 'error', false, 2000);
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.alert('Từ chối lịch bù thành công!', 'success', false, 500);
                done && done(data);
            }
        });
    };
}
