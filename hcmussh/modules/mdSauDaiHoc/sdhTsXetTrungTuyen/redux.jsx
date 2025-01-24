import T from 'view/js/common';
const SdhTsXetTuyenGetPage = 'SdhTsXetTuyen:All';

export default function SdhTsXetTuyenReducer(state = null, data) {
    switch (data.type) {
        case SdhTsXetTuyenGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const pageName = 'pageSdhDanhSachXetTuyenPage';
T.initPage(pageName);
export function getSdhDanhSachXetTuyenPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(pageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts/xet-trung-tuyen/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách xét tuyển không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsXetTuyenGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function updateSdhTsTrungTuyen(data, done) {
    return () => {
        const url = '/api/sdh/ts/xet-trung-tuyen';
        T.put(url, { data }, data => {
            if (data.error) {
                T.notify('Cập nhật trạng thái trúng tuyển không thành công!', 'danger');
                console.error(`UPDATE: ${url}.`, data.error);
            } else {
                T.notify(`Cập nhật trạng thái trúng tuyển thành công, có ${data.count} thí sinh trúng tuyển`, 'success');
                done && done();
            }
        });
    };
}


export function updateSdhTsTrungTuyenSingle(data, done) {
    return () => {
        const url = '/api/sdh/ts/xet-trung-tuyen/single';
        T.put(url, { data }, data => {
            if (data.error) {
                T.notify('Cập nhật trạng thái trúng tuyển không thành công!', 'danger');
                console.error(`UPDATE: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật trạng thái trúng tuyển thành công', 'success');
                done && done();
            }
        });
    };
}

export function checkTargetChangeHinhThucByNganh(idNganh, done) {
    return () => {
        const url = '/api/sdh/ts/trung-tuyen/change/check-hinh-thuc';
        T.get(url, { idNganh }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Kiểm tra hình thức không thành công!', 'danger');
                console.error(`UPDATE: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function exportSdhTsTrungTuyenPdf(filter, done) {
    return () => {
        T.get('/api/sdh/ts/trung-tuyen/export-pdf', { filter }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            }
        });
        done && done();
    };
}


export function updateSdhTsCongBoTrungTuyen(data, done) {
    return () => {
        const url = '/api/sdh/ts/trung-tuyen/cong-bo';
        T.put(url, { data }, data => {
            if (data.error) {
                T.notify('Công bố trạng thái trúng tuyển không thành công!', 'danger');
                console.error(`UPDATE: ${url}.`, data.error);
            } else {
                T.notify('Công bố trạng thái trúng tuyển thành công', 'success');
                done && done();
            }
        });
    };
}

export function updateSdhTsCongBoListTrungTuyen(data, done) {
    return () => {
        const url = '/api/sdh/ts/trung-tuyen/cong-bo/list';
        T.put(url, { data }, result => {
            if (result.error) {
                T.notify('Công bố trạng thái trúng tuyển không thành công!', 'danger');
                console.error(`UPDATE: ${url}.`, result.error);
            } else {
                T.notify('Công bố trạng thái trúng tuyển thành công', 'success');
                done && done();
            }
        });
    };
}

export function updateSdhTsChangeHinhThuc(dataThiSinh, done) {
    return () => {
        const url = '/api/sdh/ts/trung-tuyen/change/hinh-thuc';
        T.put(url, { dataThiSinh }, data => {
            if (data.error) {
                T.notify('Chuyển hình thức thí sinh không thành công!', 'danger');
                console.error(`UPDATE: ${url}.`, data.error);
            } else {
                T.notify('Chuyển hình thức thí sinh thành công', 'success');
                done && done();
            }
        });
    };
}

export function getSdhTsTrungTuyenThiSinh(idThiSinh, done) {
    return () => {
        const url = `/api/sdh/ts-info/thi-sinh/trung-tuyen/${idThiSinh}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin kết quả tuyển sinh thí sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}