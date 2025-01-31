import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDotXetHocBongKkhtGetAll = 'svDotXetHocBongKkht:GetAll';
const SvDotXetHocBongKkhtGetPage = 'svDotXetHocBongKkht:GetPage';
const SvDotXetHocBongKkhtGetPageTuDong = 'svDotXetHocBongKkht:GetPageTuDong';
const SvDotXetHocBongKkhtUpdate = 'svDotXetHocBongKkht:Update';
const SvDotXetHocBongKkhtGetAllDieuKien = 'svDotXetHocBongKkht:GetAllDieuKien';
const SvDotXetHocBongKkhtGetItem = 'SvDotXetHocBongKkht:GetItem';
const SvLichSuDssvHbkkGetAll = 'SvLichSuDssvHbkk:GetAll';

export default function svDotXetHocBongKkhtReducer(state = null, data) {
    switch (data.type) {
        case SvDotXetHocBongKkhtGetItem:
            return Object.assign({}, state, { data: data.data });
        case SvDotXetHocBongKkhtGetAll:
            return Object.assign({}, state, { items: data.items });
        case SvDotXetHocBongKkhtGetPageTuDong:
            return Object.assign({}, state, { pageAuto: data.page });
        case SvDotXetHocBongKkhtGetPage:
            return Object.assign({}, state, { page: data.page });
        case SvDotXetHocBongKkhtUpdate:
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
        case SvDotXetHocBongKkhtGetAllDieuKien: {
            const { namHoc, hocKy, dsDieuKien } = data;
            return Object.assign({}, { filter: { namHoc, hocKy }, dsDieuKienXet: (dsDieuKien || []).map((dk, index) => ({ ...dk, idDieuKien: index, dsNhom: dk.dsNhom.map((nhom, index) => ({ ...nhom, idNhom: index })) })) });
        }
        case SvLichSuDssvHbkkGetAll: {
            return Object.assign({}, state, { lichSuHbkk: data.lichSuHbkk });
        }
        default:
            return state;
    }
}

T.initPage('pageSvDotXetHocBongKkht');
export function getSvDotXetHocBongKkhtPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSvDotXetHocBongKkht', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/hoc-bong-khuyen-khich/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đợt xét học bổng bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvDotXetHocBongKkhtGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createSvDotXetHocBongKkht(item, done) {
    const cookie = T.updatePage('pageSvDotXetHocBongKkht');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return dispatch => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Tạo cấu hình đợt xét học bổng khuyến khích bị lỗi!', 'error', false, 1000);
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo cấu hình đợt xét học bổng khuyến khích thành công!', 'success');
                dispatch(getSvDotXetHocBongKkhtPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data.item);
            }
        });
    };
}

export function getSvDotXetHocBongKkht(id, done) {
    return (dispatch) => {
        const url = `/api/ctsv/hoc-bong-khuyen-khich/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin đợt xét học bổng khuyến khích bị lỗi:!' + (data.error.message && ('<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SvDotXetHocBongKkhtGetItem, data: data.data });
                done && done(data.data);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function deleteSvDotXetHocBongKkht(idDot, done) {
    const cookie = T.updatePage('pageSvDotXetHocBongKkht');
    const { pageNumber, pageSize, pageCondition, filter } = cookie;
    return (dispatch) => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/delete';
        T.delete(url, { idDot }, data => {
            if (data.error) {
                T.notify('Xóa đợt xét học bổng khuyến khích học tập bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Xóa đợt xét học bổng khuyến khích học tập thành công', 'success');
                dispatch(getSvDotXetHocBongKkhtPage(pageNumber, pageSize, pageCondition, filter));
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

T.initPage('pageSvDsTuDongHocBong');
export function getSvDsHocBongTuDongPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSvDsTuDongHocBong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/dssv-hoc-bong-tu-dong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvDotXetHocBongKkhtGetPageTuDong, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getSvDsHocBongByNhom(idNhom, filter, done) {
    return () => {
        const url = '/api/ctsv/dssv-hoc-bong/nhom';
        T.get(url, { idNhom, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getSvDssvTheoDieuKien(idDieuKien, done) {
    return () => {
        const url = '/api/ctsv/dssv-hoc-bong/dieu-kien';
        T.get(url, { idDieuKien }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function updateSvCauHinhHocBong(idDot, changes, done) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/update-cau-hinh';
        T.put(url, { idDot, changes }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Cập nhật cấu hình đợt xét học bổng bị lỗi!', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật cấu hình xét học bổng thành công!', 'success');
                done && done();
            }
        });
    };
}

export function updateSvDotHocBong(id, changes, done) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/dot-hoc-bong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Cập nhật cấu hình đợt xét học bổng bị lỗi!', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật cấu hình xét học bổng thành công!', 'success');
                done && done();
            }
        });
    };
}

export function autoPhanTienSvHocBongKkht(filter, tongKinhPhi, done) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/phan-muc-tu-dong';
        T.get(url, { filter, tongKinhPhi }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Tự động phân mức học bổng bị lỗi!', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Tự động phân mức học bổng thành công!', 'success');
                done && done(data.items);
            }
        });
    };
}

export function addSinhVienHbkk(data, done) {
    return () => {
        const url = '/api/ctsv/lich-su-hbkk/dssv/add-sinh-vien';
        T.post(url, { data }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Thêm sinh viên bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Thêm sinh viên thành công', 'success');
                done && done();
            }
        });
    };
}

export function deleteSinhVienHbkk(id, done) {
    return () => {
        const url = '/api/ctsv/lich-su-hbkk/dssv/delete-sinh-vien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Xóa sinh viên bị lỗi', 'error', false, 1000);
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Xóa sinh viên thành công', 'success');
                done && done();
            }
        });
    };
}

export function getDotXetHbkkThongKe(filter, done) {
    return () => {
        const url = '/api/ctsv/hoc-bong-khuyen-khich/thong-ke';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.alert(data.error.message ? data.error.message : 'Lấy danh sách bị lỗi', 'error', false, 1000);
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}



