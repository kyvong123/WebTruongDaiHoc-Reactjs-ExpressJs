import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDotDanhGiaDrlGetAll = 'svDotDanhGiaDrl:GetAll';
const SvDotDanhGiaDrlGetPage = 'svDotDanhGiaDrl:GetPage';
const SvDotDanhGiaDrlUpdate = 'svDotDanhGiaDrl:Update';

export default function SvDotDanhGiaDrlReducer(state = null, data) {
    switch (data.type) {
        case SvDotDanhGiaDrlGetAll:
            return Object.assign({}, state, { items: data.items });
        case SvDotDanhGiaDrlGetPage:
            return Object.assign({}, state, { page: data.page });
        case SvDotDanhGiaDrlUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

T.initPage('pageSvDotDanhGiaDrl');
export function getSvDotDanhGiaDrlPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSvDotDanhGiaDrl', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/dot-danh-gia-drl/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt đánh giá bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvDotDanhGiaDrlGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createSvDotDanhGiaDrl(item, done) {
    const cookie = T.updatePage('pageSvDotDanhGiaDrl');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/ctsv/dot-danh-gia-drl';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Tạo cấu hình đợt đánh giá điểm rèn luyện bị lỗi!', 'error', false, 1000);
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo cấu hình đợt đánh giá điểm rèn luyện thành công!', 'success');
                dispatch(getSvDotDanhGiaDrlPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data.item);
            }
        });
    };
}

export function deleteSvDotDanhGiaDrl(id, done) {
    const cookie = T.updatePage('pageSvDotDanhGiaDrl');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/ctsv/dot-danh-gia-drl';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa đợt đánh giá điểm rèn luyện bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Đợt đánh giá điểm rèn luyện đã xóa thành công!', 'success', false, 800);
                dispatch(getSvDotDanhGiaDrlPage(pageNumber, pageSize, pageCondition, filter));
            }
            done && done();
        }, () => T.notify('Xóa đợt đánh giá điểm rèn luyện bị lỗi!', 'danger'));
    };
}

export function updateSvDotDanhGiaDrl(id, changes, done) {
    const cookie = T.updatePage('pageSvDotDanhGiaDrl');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/ctsv/dot-danh-gia-drl';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cập nhật thông tin đợt đánh giá điểm rèn luyện bị lỗi!', 'error');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.alert('Cập nhật thông tin đợt đánh giá điểm rèn luyện thành công!', 'success');
                dispatch(getSvDotDanhGiaDrlPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật thông tin đợt đánh giá điểm rèn luyện bị lỗi!', 'danger'));
    };
}

export function getSvDotDanhGiaDrl(id, done) {
    return () => {
        const url = `/api/ctsv/dot-danh-gia-drl/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin cấu hình đợt đánh giá điểm rèn luyện bị lỗi !' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.data);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function getSoLuongSinhVien(id, done) {
    return () => {
        const url = '/api/ctsv/dot-danh-gia-drl/count';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy số lượng sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.count);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

// Gia han khoa redux

export function updateDrlGiaHanKhoa(id, changes, done) {
    const url = '/api/ctsv/danh-gia-drl/gia-han/khoa';
    return () => {
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`PUT: ${url}.`, result.error.message);
            } else {
                T.notify('Cập nhật đăng ký gia hạn thành công', 'success');
                done && done(result.items);
            }
        }, () => T.notify('Cập nhật đăng ký gia hạn bị lỗi!', 'danger'));
    };
}


// Kien nghi redux

export function getPendingGiaHan(idDot, condition = '', done) {
    if (typeof condition == 'function') {
        [done, condition] = [condition, ''];
    }
    return () => {
        const url = '/api/ctsv/dot-danh-gia-drl/kien-nghi/all';
        T.get(url, { idDot, condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách kiến nghị bị lỗi!', 'danger');
                console.error('GET:', data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function createDrlGiaHanSinhVien(data, done) {
    const url = '/api/ctsv/dot-danh-gia-drl/gia-han';
    T.post(url, { data }, data => {
        if (data.error) {
            T.notify('Gia hạn đánh giá bị lỗi!', 'danger');
            console.error('GET:', data.error);
        } else {
            T.notify('Gia hạn đánh giá thành công!', 'success');
            done && done();
        }
    });
}

export function tuChoiGiaHan(data, done) {
    const url = '/api/ctsv/dot-danh-gia-drl/kien-nghi/tu-choi';
    T.put(url, { data }, data => {
        if (data.error) {
            T.notify('Từ chối bị lỗi!', 'danger');
            console.error('PUT:', data.error);
        } else {
            T.notify('Phản hồi của bạn đã được gửi đến sinh viên!', 'success');
            done && done(data.item);
        }
    });
}

export function chapNhanKienNghi(data, done) {
    const url = '/api/ctsv/dot-danh-gia-drl/kien-nghi/chap-nhan';
    T.put(url, { data }, data => {
        if (data.error) {
            T.notify('Hệ thống bị lỗi!', 'danger');
            console.error('PUT:', data.error);
        } else {
            T.notify('Chấp nhận thành công!', 'success');
            done && done(data.item);
        }
    });
}

export const SelectApdaterDotDrlByNamHocHocKy = ({ namHoc, hocKy }) => ({
    ajax: true,
    url: (params) => `/api/ctsv/dot-danh-gia-drl/page/${params?.page || 1}/20`,
    data: () => ({ filter: { namHoc, hocKy } }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.tenDot })) : [] }),
    fetchOne: (id, done) => (getSvDotDanhGiaDrl(id, item => done({ id: item.id, text: item.ten })))()
});

export const SelectAdapter_DssvDotDrl = ({ idDot }) => ({
    ajax: true,
    url: (params) => `/api/ctsv/dssv-dot-danh-gia-drl/page/${params?.page || 1}/20`,
    data: (params) => ({ idDot, condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, text: `${item.mssv}: ${item.hoTen}` })) : [] }),
    fetchOne: (id, done) => (getSvDotDanhGiaDrl(id, item => done({ id: item.mssv, text: item.hoTen })))()
});