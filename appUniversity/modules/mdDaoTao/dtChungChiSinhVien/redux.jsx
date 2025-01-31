import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtChungChiSinhVienGetPage = 'DtChungChiSinhVien:GetAll';

export default function DtChungChiSinhVienReducer(state = null, data) {
    switch (data.type) {
        case DtChungChiSinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageDtChungChiSinhVien');
export function getDtChungChiSinhVienPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtChungChiSinhVien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/chung-chi-sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtChungChiSinhVienGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getDtChungChiSinhVienAll(mssv, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien-all';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify('Lấy thông tin chứng chỉ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function createDtChungChiSinhVien(data, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo thông tin chứng chỉ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo thông tin chứng chỉ thành công', 'success');
                done && done(result.item);
            }
        });
    };
}

export function updateDtChungChiSinhVien(id, data, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien';
        T.put(url, { id, data }, result => {
            if (result.error) {
                T.notify('Cập nhật thông tin chứng chỉ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thông tin chứng chỉ thành công', 'success');
                done && done(result.item);
            }
        });
    };
}

export function deleteDtChungChiSinhVien(item, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien';
        T.delete(url, { item }, result => {
            if (result.error) {
                T.notify('Xoá thông tin chứng chỉ bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xoá thông tin chứng chỉ thành công', 'success');
                done && done();
            }
        });
    };
}

export function getDtDmChungChiNgoaiNguItem(id, done) {
    return () => {
        const url = `/api/dt/chung-chi-sinh-vien/item/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin chứng chỉ lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export function downloadImage(listFileName, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien/download-image-zip';
        T.post(url, { listFileName }, data => {
            if (data.error) {
                T.notify('Download file minh chứng bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        }, () => T.notify('Download file minh chứng bị lỗi', 'danger'));
    };
}

export function updateStatusChungChi(listId, changes, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien/status';
        T.put(url, { listId, changes }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cập nhật xét duyệt chứng chỉ bị lỗi!', 'error', false, 1000);
                console.error(`PUT: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function saveImportChungChi(data, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien/save-import';
        T.post(url, { data }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Lưu dữ liệu import bị lỗi!', 'error', false, 1000);
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function saveImportStatusChungChi(data, done) {
    return () => {
        const url = '/api/dt/chung-chi-sinh-vien/save-import-status';
        T.post(url, { data }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Lưu dữ liệu import bị lỗi!', 'error', false, 1000);
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export const SelectAdapter_DtDmChungChiNgoaiNguFilter = ({ maNgoaiNgu, sv }) => ({
    ajax: true,
    url: '/api/dt/chung-chi-sinh-vien/filter',
    data: params => ({ searchTerm: params.term, maNgoaiNgu, sv }),
    processResults: response => {
        if (!maNgoaiNgu) {
            T.notify('Vui lòng chọn ngoại ngữ', 'danger');
            return { results: [] };
        } else {
            return { results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten, data: item })) : [] };
        }
    },
    fetchOne: (id, done) => (getDtDmChungChiNgoaiNguItem(id, item => item && done && done({ id: item.id, text: item.ten, data: item })))(),
});