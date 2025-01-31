import T from 'view/js/common';
const SdhTsDiemThiGetPage = 'SdhTsDiemThi:All';

export default function SdhTsDiemThiReducer(state = null, data) {
    switch (data.type) {
        case SdhTsDiemThiGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

export const pageName = 'pageSdhDanhSachDiemPage';
T.initPage(pageName);
export function getSdhDanhSachDiemThiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(pageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts/ket-qua-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm thi tuyển sinh không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsDiemThiGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getSdhTsDiemThiThiSinh(idThiSinh, done) {
    return () => {
        const url = `/api/sdh/ts-info/thi-sinh/diem-thi/${idThiSinh}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin điểm thi thí sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export const SelectAdapter_ThiSinh = (idDot) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-info/thi-sinh/items',
        data: params => ({ searchTerm: params.term, idDot: idDot }),
        processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.id, text: `${item.sbd ? (item.sbd + ': ') : ''}${item.ho} ${item.ten}`, sbd: item.sbd, firstName: item.ho, lastName: item.ten })) : [] }),
        fetchOne: (id, done) => (getSdhTsDiemThiThiSinh(id, item => done && done({ id: item.id, text: `${item.sbd ? (item.sbd + ': ') : ''}${item.ho} ${item.ten}`, sbd: item.sbd })))()
    };
};

export function getSdhTsThiSinhMp(maTui, id, done) {
    return () => {
        const url = '/api/sdh/ts-info/thi-sinh-mp/item';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin thí sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export function createSdhTsDiemThiSinhMp(id, diem, diemCu, done) {
    return () => {
        const url = '/api/sdh/ts-info/thi-sinh-mp/item';
        T.put(url, { id, diem, diemCu }, result => {
            if (result.error) {
                T.notify('Cập nhật điểm thi tuyển sinh không thành công!', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật điểm thi tuyển sinh thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật mới điểm thi tuyển sinh bị lỗi!', 'danger'));
    };
}
export function getSdhTsPhongThiMaTui(idDot, maTui, done) {
    return () => {
        const url = '/api/sdh/ts-info/phong-thi/diem-thi/item';
        T.get(url, { idDot, maTui }, result => {
            if (result.error) {
                T.notify('Lấy thông tin điểm thi không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function getSdhTsPhongThiMonThi(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/phong-thi/diem-thi/mon-thi';
        T.get(url, { data }, result => {
            if (result.error) {
                T.notify('Lấy thông tin điểm thi không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function createSdhTsDiemPhongThi(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/phong-thi/diem-thi';
        T.put(url, { data }, result => {
            if (result.error) {
                T.notify('Cập nhật điểm thi tuyển sinh không thành công!', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Cập nhật điểm thi tuyển sinh thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật mới điểm thi tuyển sinh bị lỗi!', 'danger'));
    };
}
export function createSdhTsDiemThiExcel(filter, done) {
    return () => {
        const url = '/api/sdh/ts/diem-thi/excel';
        T.post(url, { filter }, (data) => {
            if (data.errors && data.errors.length > 0) {
                T.notify('Cập nhật điểm thi bị lỗi', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                done && done();
            }
        });
    };
}
export function exportSdhTsKetQuaThiPdf(filter, done) {
    return () => {
        T.get('/api/sdh/ts/ket-qua-thi/export-pdf', { filter }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            }
        });
        done && done();
    };
}
