import T from 'view/js/common';
const SdhTsLichThiNgoaiNguDsts = 'SdhTsLichThiNgoaiNgu:Dsts';
const SdhTsLichThiNgoaiNguGetPage = 'SdhTsLichThiNgoaiNgu:GetPage';
const SdhTsDangKyNgoaiNgu = 'SdhTsLichThiNgoaiNgu:Dsdk';
const SdhTsLichThiNgoaiNguDstsAddPage = 'SdhTsLichThiNgoaiNgu:DstsAddPage';


export const DsdkPage = 'pageSdhTsDsdkNn';
export const DstsPage = 'pageSdhTsDstsNn';
export const DstsAddPage = 'pageSdhTsDstsAddPage';

export const LichThiNNPage = 'pageSdhTsLichThiNgoaiNgu';

T.initPage(DsdkPage);
T.initPage(DstsPage);
T.initPage(LichThiNNPage);
T.initPage(DstsAddPage);

export default function SdhTsLichThiNgoaiNguReducer(state = null, data) {
    switch (data.type) {
        case SdhTsLichThiNgoaiNguGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhTsLichThiNgoaiNguDsts:
            return Object.assign({}, state, { dstsPage: data.page });
        case SdhTsDangKyNgoaiNgu:
            return Object.assign({}, state, { dsdkPage: data.page });
        case SdhTsLichThiNgoaiNguDstsAddPage:
            return Object.assign({}, state, { dstsAddPage: data.page });
        default:
            return state;
    }
}


export function getSdhTsLichThiNgoaiNguPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(LichThiNNPage, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi-nn/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu lịch thi ngoại ngữ không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsLichThiNgoaiNguGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function getSdhTsLichThiNgoaiNguDstsPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(DstsPage, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi-nn/dsts/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách dán phòng không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsLichThiNgoaiNguDsts, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function getSdhTsDsdkNgoaiNguPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(DsdkPage, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi-nn/dsdk/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thi ngoại ngữ không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsDangKyNgoaiNgu, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getSdhTsLichThiNgoaiNguDstsAddPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(DstsAddPage, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/lich-thi-nn/them-thi-sinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thêm không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsLichThiNgoaiNguDstsAddPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createSdhTsLichThiNgoaiNgu(data, done) {
    return () => {
        const url = '/api/sdh/lich-thi-nn';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo lịch thi ngoại ngữ không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error('POST: ' + url + '.', result.error);
            } else {
                T.notify('Tạo mới lịch thi thành công', 'success');
                done && done();
            }
        });
    };
}

export function updateSdhTsLichThiNgoaiNgu(id, changes, done) {
    return () => {
        const url = '/api/sdh/lich-thi-nn';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify('Cập nhật lịch thi ngoại ngữ không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Cập nhật lịch thi thành công', 'success');
                done && done(result.item);
            }
        });
    };
}

export function deleteSdhTsLichThiNgoaiNgu(id, done) {
    return () => {
        const url = '/api/sdh/lich-thi-nn';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify('Xoá lịch thi ngoại ngữ không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error('DELETE: ' + url + '.', result.error);
            } else {
                T.notify('Xoá lịch thi thành công', 'success');
                done && done();
            }
        });
    };
}

export function deleteSdhTsLichThiNgoaiNguDsts(data, done) {
    return () => {
        const url = '/api/sdh/lich-thi-nn/dsts';
        T.delete(url, { data }, result => {
            if (result.error) {
                T.notify('Xoá thí sinh không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error('DELETE: ' + url + '.', result.error);
            } else {
                T.notify('Xoá thí sinh thành công', 'success');
                done && done();
            }
        });
    };
}
export function deleteSdhTsDangKyNN(data, done) {
    return () => {
        const url = '/api/sdh/lich-thi-nn/dsdk';
        T.delete(url, { data }, result => {
            if (result.error) {
                T.notify('Xoá đăng ký không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error('DELETE: ' + url + '.', result.error);
            } else {
                T.notify('Xoá đăng ký thành công', 'success');
                done && done();
            }
        });
    };
}


export function updateSdhTsLichThiNgoaiNguDsts(data, done) {
    return () => {
        const url = '/api/sdh/lich-thi-nn/dsts';
        T.put(url, { data }, result => {
            if (result.error) {
                T.notify('Cập nhật danh sách dán phòng không thành công' + (result.error.message && (':<br>' + result.error.message)), 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Cập nhật danh sách dán phòng thành công', 'success');
                done && done();
            }
        });
    };
}

export function getSdhTsSldk(maMonThi, done) {
    return () => {
        const url = '/api/sdh/lich-thi-nn/get-sldk';
        T.get(url, { maMonThi }, result => {
            if (result.error) {
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export const SelectAdapter_DanPhong = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/lich-thi-nn/dan-phong',
        data: params => ({ searchTerm: params.term, filter }),
        processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: T.stringify({ idLichThi: item.id, kyNang: item.kyNang, tenPhongThi: item.tenPhongThi }), text: item.tenPhongThi })) : [] }),
    };
};