import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDangKyHocPhanGetAll = 'SdhDangKyHocPhan:GetAll';
const SdhDangKyHocPhanGetPage = 'SdhDangKyHocPhan:GetPage';
const SdhDangKyHocPhan = 'SdhDangKyHocPhan:All';
const SdhMonHocChuongTrinhDaoTao = 'SdhChuongTrinhDaoTao:GetPage';
const SdhDangKyHocPhanUpdate = 'SdhDangKyHocPhan:Update';
const SdhMonHocDangKy = 'SdhMonHocDangKy:GetAll';
const SdhDanhSachHocPhan = 'SdhDanhSachHocPhan:GetAll';
const SdhDanhSachHocPhanDotDangKy = 'SdhDanhSachHocPhanDotDangKy:GetAll';
const SdhHocVienDangKyHocPhanGetPage = 'SdhHocVienDangKyHocPhanGetPage:GetPage';

export default function SdhDangKyHocPhanReducer(state = null, data) {
    switch (data.type) {
        case SdhDangKyHocPhanGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhDangKyHocPhanGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhHocVienDangKyHocPhanGetPage:
            return Object.assign({}, state, { pageHocVien: data.pageHocVien });
        case SdhDangKyHocPhan:
            return Object.assign({}, state, { all: data.page });
        case SdhMonHocDangKy:
            return Object.assign({}, state, { mon: data.mon });
        case SdhMonHocChuongTrinhDaoTao:
            return Object.assign({}, state, { ctdt: data.ctdt });
        case SdhDanhSachHocPhan:
            return Object.assign({}, state, { subject: data.subject });
        case SdhDanhSachHocPhanDotDangKy:
            return Object.assign({}, state, { subjectddk: data.subject });
        case SdhDangKyHocPhanUpdate:
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

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageSdhDangKyHocPhan';
export function getSdhDangKyHocPhanAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/sdh/dang-ky-hoc-phan/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký học phần bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: SdhDangKyHocPhanGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage(PageName);

export function getSdhDangKyHocPhan(dotDangKy, done) {
    return (dispatch) => {
        const url = '/api/sdh/user/dang-ky-hoc-phan/all';
        T.get(url, { dotDangKy }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page);
                dispatch({ type: SdhDangKyHocPhanGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đăng ký học phần bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getSvSdhDangKyHocPhanPage(pageNumber, pageSize, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSdhDangKyHocPhan', pageNumber, pageSize, {}, filter);
    return dispatch => {
        const url = `/api/sdh/dang-ky-hoc-phan/danh-sach-hoc-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên sau đại học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: SdhHocVienDangKyHocPhanGetPage, pageHocVien: data.page });
            }
        }, () => T.notify('Lấy danh sách sinh viên sau đại học bị lỗi!', 'danger'));
    };
}

export function getSdhDangKyHocPhanPage(pageNumber, pageSize, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSdhDangKyHocPhan', pageNumber, pageSize, filter);

    return (dispatch) => {
        const url = `/api/sdh/dang-ky-hoc-phan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: SdhDangKyHocPhan, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đăng ký học phần bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function getSdhChuongTrinhDaoTao(done) {
    return (dispatch) => {
        const url = '/api/sdh/user/chuong-trinh-dao-tao/all';
        T.get(url, (data) => {
            if (data.error) {
                T.notify('Lấy chương trình đào tạo bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.ctdt);
                dispatch({ type: SdhMonHocChuongTrinhDaoTao, ctdt: data.ctdt });
            }
        }, (error) => T.notify('Lấy chương trình đào tạo lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhDangKyHocPhan(changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/user/dang-ky-hoc-phan';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Đăng ký học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Đăng ký học phần thành công!', 'success');
                done && done(data);
                dispatch(sdhDanhSachHocPhan(changes.idDotDangKy));
                dispatch(getSdhDangKyHocPhan(changes.idDotDangKy));
            }
        }, (error) => T.notify('Đăng ký học phần bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhDangKyHocPhanMultiple(changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/dang-ky-hoc-phan/multiple';
        T.post(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Đăng ký học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Đăng ký học phần thành công!', 'success');
                done && done(data);
                dispatch(sdhDanhSachHocPhanDotDangKy(changes.idDotDangKy));
            }
        }, (error) => T.notify('Đăng ký học phần bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function createSdhDangKyHocPhanAdvance(list, filter, done) {
    return dispatch => {
        const url = '/api/sdh/dang-ky-hoc-phan';
        T.post(url, { list, filter }, data => {
            if (data.error) {
                T.notify('Lưu đăng ký học phần bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                T.notify('Lưu đăng ký học phần thành công!', 'success');
                dispatch({ type: SdhDangKyHocPhanGetAll });
                if (done) done();
            }
        });
    };
}

export function deleteSdhDangKyHocPhan(hocPhan, mssv, filter, done) {
    return (dispatch) => {
        const url = '/api/sdh/user/dang-ky-hoc-phan';
        T.put(url, { hocPhan, mssv, filter }, (data) => {
            if (data.error) {
                T.notify('Huỷ học phầnbị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Huỷ học phần thành công!', 'success');
                done && done();
                filter.idDotDangKy ? dispatch(sdhChangeTabDanhSachHocPhan(filter.idDotDangKy)) : null;
            }
        }, (error) => T.notify('Huỷ học phần bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function deleteSdhDangKyHocPhanMultiple(changes, done) {
    return (dispatch) => {
        const url = '/api/sdh/dang-ky-hoc-phan/multiple';
        T.put(url, { changes }, (data) => {
            if (data.error) {
                T.notify('Huỷ học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Huỷ học phần thành công!', 'success');
                done && done();
                dispatch(getSdhDangKyHocPhanPage());
                dispatch(sdhDanhSachHocPhanDotDangKy(changes.idDotDangKy));
            }
        }, (error) => T.notify('Huỷ học phần bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}

export function sdhDanhSachHocPhan(dotDangKy, done) {
    return (dispatch) => {
        const url = '/api/sdh/user/danh-sach-hoc-phan/all';
        T.get(url, { dotDangKy }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done({ items: data.items });
                dispatch({ type: SdhDanhSachHocPhan, subject: data.items });
            }
        });
    };
}

export function sdhDanhSachHocPhanDotDangKy(filter, done) {
    return (dispatch) => {
        const url = '/api/sdh/user/dang-ky-hoc-phan/danh-sach-hoc-phan';
        T.get(url, { filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done({ items: data.items });
                dispatch({ type: SdhDanhSachHocPhanDotDangKy, subject: data.items });
            }
        });
    };
}
export function getHocPhan(filterhp, done) {
    return () => {
        T.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/filter', { filterhp }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.items);
            }
        });
    };
}

export function getHocPhanByHocVien(filterhp, done) {
    return () => {
        T.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/filterByHocVien', { filterhp }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.items);
            }
        });
    };
}

export function getHocPhanByLop(filter, done) {
    return () => {
        T.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/filterByLop', { filter }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.items);
            }
        });
    };
}

export function getCtdtByLop(filter, done) {
    return () => {
        T.get('/api/sdh/dang-ky-hoc-phan/hoc-phan/ctdt', { filter }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.items);
            }
        });
    };
}

export function getSdhDangKyHocPhanByStudent(mssv, filter, done) {
    return () => {
        const url = '/api/sdh/dang-ky-hoc-phan/student/hoc-phan';
        T.get(url, { mssv, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần sinh viên đăng ký bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getSoLuongSinhVienDky(filter, done) {
    if (typeof filter == 'function') {
        done = filter;
        filter = null;
    }
    return () => {
        const url = '/api/sdh/dang-ky-hoc-phan/so-luong-dky';
        T.get(url, { filter }, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items[0]);
            }
        });
    };
}

export function checkCondition(list, done) {
    return () => {
        const url = '/api/sdh/dang-ky-hoc-phan/check';
        T.get(url, { list }, data => {
            if (data.error) {
                T.notify('Đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                if (done) done(data.listData);
            }
        });
    };
}

export function getHocPhanSdhCtdt(filterSV, done) {
    return () => {
        T.get('/api/sdh/dang-ky-hoc-phan/hoc-phan-ctdt/all', { filterSV }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.listHocPhan);
            }
        });
    };
}

export function updateSdhDangKyHocPhan(condition, changes, filter, done) {
    return dispatch => {
        const url = '/api/sdh/dang-ky-hoc-phan';
        T.put(url, { condition, changes, filter }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Cập nhật đăng ký học phần bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký học phần thành công!', 'success');
                dispatch({ type: SdhDangKyHocPhanGetAll });
                done && done();
            }
        }, () => T.notify('Cập nhật đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function getSdhDangKyHocPhanItem(id, done) {
    return () => {
        const url = `/api/sdh/dang-ky-hoc-phan/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin đăng ký học phần bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}


export function sdhDanhSachMonSinhVienDangKy(data) {
    return (dispatch) => {
        dispatch({ type: SdhMonHocDangKy, subject: data });
    };
}

export function sdhChangeTabDanhSachHocPhan(dotDangKy) {
    return (dispatch) => {
        dispatch(sdhDanhSachHocPhan(dotDangKy));
        dispatch(getSdhDangKyHocPhan(dotDangKy));
    };
}

export const SelectAdapter_DangKyHocPhanStudentSdh = {
    ajax: true,
    url: '/api/sdh/dang-ky-hoc-phan/students/page/1/50',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, item, userData: { mssv: item.mssv, loaiHinhDaoTao: item.loaiHinhDaoTao, lop: item.lop, maCtdt: item.maCtdt }, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (done) => (getStudentsFilter({}, item => done && done({ id: item.mssv, item, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};

export function getStudentsFilter(filter, done) {
    return () => {
        T.get('/api/sdh/dang-ky-hoc-phan/students-filter', { filter }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else done && done(result.items);
        });
    };
}



