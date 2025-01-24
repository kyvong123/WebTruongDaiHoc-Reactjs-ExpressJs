import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDanhGiaCaNhanFormGetAll = 'TccbDanhGiaCaNhanForm:GetAll';
const TccbDanhGiaCaNhanFormUpdate = 'TccbDanhGiaCaNhanForm:Update';
const TccbDanhGiaCaNhanFormGetPage = 'TccbDanhGiaCaNhanForm:GetPage';

export default function TccbDanhGiaCaNhanFormReducer(state = null, data) {
    switch (data.type) {
        case TccbDanhGiaCaNhanFormGetPage:
            return Object.assign({}, state, { page: data.page });
        case TccbDanhGiaCaNhanFormGetAll:
            return Object.assign({}, state, { items: data.items, approvedDonVi: data.approvedDonVi });
        case TccbDanhGiaCaNhanFormUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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

export function getTccbKhungDanhGiaCanBoAll(nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia-khung-danh-gia-can-bo/all-by-year';
        T.get(url, { nam }, data => {
            if (data.error) {
                T.notify('Lấy khung đánh giá cán bộ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

T.initPage('pageTccbDanhGiaCaNhanForm');
export function getTccbDanhGiaCaNhanFormPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageTccbDanhGiaCaNhanForm', pageNumber, pageSize, pageCondition, filter);
    const route = T.routeMatcher('/user/tccb/danh-gia-ca-nhan-form/:nam');
    const nam = parseInt(route.parse(window.location.pathname)?.nam);
    return dispatch => {
        const url = `/api/tccb/danh-gia-ca-nhan-form/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { nam, condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TccbDanhGiaCaNhanFormGetPage, page: data.page });
            }
        });
    };
}

T.initPage('pageTccbHoiDongDanhGiaCaNhanForm');
export function getTccbHoiDongDonViDanhGiaFormPage(pageNumber, pageSize, pageCondition, nam, filter, done) {
    const page = T.updatePage('pageTccbHoiDongDanhGiaCaNhanForm', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/hoi-dong-danh-gia-don-vi-ca-nhan-form/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { nam, condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cán bộ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: TccbDanhGiaCaNhanFormGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getTccbDanhGiaChuyenVien(shcc, nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia-chuyen-vien';
        T.get(url, { nam, shcc }, data => {
            if (data.error) {
                T.notify('Lấy chuyên viên bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        });
    };
}

export function createDanhGiaChuyenVienByUnit(item, done) {
    return () => {
        const url = '/api/tccb/unit/danh-gia-chuyen-vien';
        T.post(url, { item, nam: item.nam }, data => {
            if (data.error) {
                T.notify(`Tạo đăng ký bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo đăng ký thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function createDanhGiaGiangDayByUnit(item, done) {
    return () => {
        const url = '/api/tccb/unit/danh-gia-giang-day';
        T.post(url, { item, nam: item.nam }, data => {
            if (data.error) {
                T.notify(`${item.id ? 'Cập nhật' : 'Tạo'} đăng ký bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify(`${item.id ? 'Cập nhật' : 'Tạo'} đăng ký thành công!`, 'success');
                done && done(data.item);
            }
        });
    };
}

export function createDanhGiaKhongGiangDayByUnit(item, done) {
    return () => {
        const url = '/api/tccb/unit/danh-gia-khong-giang-day';
        T.post(url, { item, nam: item.nam }, data => {
            if (data.error) {
                T.notify(`${item.id ? 'Cập nhật' : 'Tạo'} đăng ký bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify(`${item.id ? 'Cập nhật' : 'Tạo'} đăng ký thành công!`, 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateDanhGiaChuyenVienByUnit(id, changes, done) {
    return () => {
        const url = '/api/tccb/unit/danh-gia-chuyen-vien';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Cập nhật bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function deleteDanhGiaChuyenVienByUnit(id, done) {
    return () => {
        const url = '/api/tccb/unit/danh-gia-chuyen-vien';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(`Xoá công việc bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Xoá công việc thành công!', 'success');
                done && done();
            }
        });
    };
}

// Hội đồng đơn vị
export function tccbHoiDongDanhGiaChuyenVien(id, changes, done) {
    return () => {
        const url = '/api/tccb/hoi-dong-don-vi/danh-gia-chuyen-vien';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Đánh giá công việc bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
            } else {
                T.notify('Đánh giá công việc thành công!', 'success');
                done && done();
            }
        });
    };
}

export function tccbHoiDongDanhGiaDuyetDiemThuong(id, changes, done) {
    return () => {
        const url = '/api/tccb/hoi-dong-don-vi/duyet-diem-thuong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Duyệt điểm thưởng bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
            } else {
                T.notify('Duyệt điểm thưởng thành công!', 'success');
                done && done();
            }
        });
    };
}

//User
export function getTccbDanhGiaChuyenVienUser(nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia-chuyen-vien-user';
        T.get(url, { nam }, data => {
            if (data.error) {
                T.notify(`Lấy thông tin bị lỗi: ${data.error.message}`, 'danger');
                console.error(`GET ${url}. ${data.error.message}`);
            } else {
                done && done(data);
            }
        });
    };
}

export function createTccbDanhGiaChuyenVienUser(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-chuyen-vien-user';
        T.post(url, { item, nam: item.nam }, data => {
            if (data.error) {
                T.notify(`Cập nhật bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function createTccbDanhGiaGiangDayUser(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-giang-day-user';
        T.post(url, { item, nam: item.nam }, data => {
            if (data.error) {
                T.notify(`Cập nhật bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function createTccbDanhGiaKhongGiangDayUser(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-khong-giang-day-user';
        T.post(url, { item, nam: item.nam }, data => {
            if (data.error) {
                T.notify(`Cập nhật bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}

export function deleteTccbDanhGiaChuyenVienUser(id, nam, isDotXuat, done) {
    return () => {
        const url = '/api/tccb/danh-gia-chuyen-vien-user';
        T.delete(url, { id, nam, isDotXuat }, data => {
            if (data.error) {
                T.notify(`Xóa đăng ký đánh giá bị lỗi: ${data.error.message}`, 'danger');
                console.error(`DELETE ${url}. ${data.error.message}`);
            } else {
                T.alert('Xóa đăng ký đánh giá thành công!', 'success', false, 800);
                done && done();
            }
        });
    };
}

export function deleteTccbDanhGiaGiangDayUser(id, nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia-giang-day-user';
        T.delete(url, { id, nam }, data => {
            if (data.error) {
                T.notify(`Xóa đăng ký đánh giá bị lỗi: ${data.error.message}`, 'danger');
                console.error(`DELETE ${url}. ${data.error.message}`);
            } else {
                T.alert('Xóa đăng ký đánh giá thành công!', 'success', false, 800);
                done && done();
            }
        });
    };
}

export function deleteTccbDanhGiaKhongGiangDayUser(id, nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia-khong-giang-day-user';
        T.delete(url, { id, nam }, data => {
            if (data.error) {
                T.notify(`Xóa đăng ký đánh giá bị lỗi: ${data.error.message}`, 'danger');
                console.error(`DELETE ${url}. ${data.error.message}`);
            } else {
                T.alert('Xóa đăng ký đánh giá thành công!', 'success', false, 800);
                done && done();
            }
        });
    };
}
