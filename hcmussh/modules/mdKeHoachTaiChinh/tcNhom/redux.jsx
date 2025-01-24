import T from 'view/js/common';


const TcNhomGetPage = 'TcNhom:GetPage';
const TcNhomGetItem = 'TcNhom:GetItem';
export default function tcNhomReducer(state = null, data) {
    switch (data.type) {
        case TcNhomGetPage:
            return Object.assign({}, state, { items: data.items });
        case TcNhomGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

export const PageName = 'pageTcNhom';
T.initPage(PageName);
export function getPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khtc/nhom/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TcNhomGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách nhóm bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getNhom(id, done) {
    const url = `/api/khtc/nhom/item/${id}`;
    return dispatch => {
        T.get(url, {}, (data) => {
            if (data.error) {
                T.notify('Lấy nhóm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
                dispatch({ type: TcNhomGetItem, item: data.item });
            }
        }, () => T.notify('Lấy nhóm lỗi'));
    };
}

export function createNhom(data, done) {
    const url = '/api/khtc/nhom';
    return () => {
        T.post(url, data, (res) => {
            if (res.error) {
                T.notify('Tạo nhóm bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo nhóm thành công', 'success');
                done && done(data.item);
                // dispatch({ type: TcNhomGetItem, item: data.item });
            }
        }, () => T.notify('Tạo nhóm lỗi'));
    };
}

export const SelectAdapter_TcNhom = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/khtc/nhom/page/1/20',
    processResults: response => ({ results: response?.page?.list?.length ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getNhom(id, item => done && done({ id: item.id, text: item.ten })))(),
};

export function SelectAdapter_TcNhomFilter(namHoc, hocKy) {
    return {
        ajax: true,
        data: params => ({ condition: params.term, namHoc, hocKy }),
        url: '/api/khtc/nhom/page/1/20',
        processResults: response => ({ results: response?.page?.list?.length ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
        fetchOne: (id, done) => (getNhom(id, item => done && done({ id: item.id, text: item.ten })))(() => { }),
    };
}

export function getNhomDetails(namHoc, hocKy, done) {
    return () => {
        const url = `/api/khtc/nhom/${namHoc}/${hocKy}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy danh sách nhóm ngành bị lỗi', 'danger');
                console.error(result.error);
            }
            else {
                done && done(result);
            }
        }, () => T.notify('Lấy danh sách nhóm ngành lỗi'));
    };
}

export function getNamHocHocKy(done) {
    return () => {
        const url = '/api/khtc/nhom';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy danh sách nhóm ngành bị lỗi', 'danger');
                console.error(result.error);
            }
            else {
                done && done(result);
            }
        }, () => T.notify('Lấy danh sách năm học - học kỳ bị lỗi'));
    };
}

export function getNhomItem(id, done) {
    return () => {
        const url = `/api/khtc/nhom/item/${id}`;
        T.get(url, (res) => {
            if (res.error) {
                T.notify('Lấy thông tin nhóm lỗi', 'danger');
                console.error('GET:', url, res.error);
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Lấy thông tin nhóm lỗi', 'danger'));
    };
}

export function deleteNhomItem(id, done) {
    return () => {
        const url = `/api/khtc/nhom/item/${id}`;
        T.delete(url, (res) => {
            if (res.error) {
                T.notify('Xóa nhóm lỗi', 'danger');
                console.error('DELETE:', url, res.error);
            } else {
                T.notify('Xóa nhóm thành công', 'success');
                done && done();
            }
        }, () => T.notify('Xóa nhóm lỗi', 'danger'));
    };
}

export function updateNhom(id, data, done, onFinish) {
    return () => {
        const url = `/api/khtc/nhom/item/${id}`;
        T.put(url, data, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Cập nhật thông tin nhóm lỗi', 'danger');
                console.error('PUT:', url, res.error);
            } else {
                T.notify('Cập nhật thông tin nhóm thành công', 'success');
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật thông tin nhóm lỗi', 'danger'));
    };
}

export function cloneNhom(data, done) {
    return () => {
        const url = '/api/khtc/nhom/clone';
        T.post(url, data, res => {
            if (res.error) {
                T.notify('Sao chép nhóm - ngành lỗi', 'danger');
                console.error('POST:', url, res.error);
            } else {
                T.notify('Sao chép nhóm - ngành thành công', 'success');
                done && done();
            }
            done && done();
        });
    };
}








