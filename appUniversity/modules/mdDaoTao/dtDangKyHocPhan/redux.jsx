import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDangKyHocPhanGetAll = 'DtDangKyHocPhan:GetAll';
const DtDangKyHocPhanGetPage = 'DtDangKyHocPhan:GetPage';
const DtDangKyHocPhanUpdate = 'DtDangKyHocPhan:Update';
const dtDangKyHocPhanSetNull = 'DtDangKyHocPhan:SetNull';

export default function dtDangKyHocPhanReducer(state = null, data) {
    switch (data.type) {
        case dtDangKyHocPhanSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case DtDangKyHocPhanGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDangKyHocPhanGetPage:
            return Object.assign({}, state, {
                page: !data.tinhTrang ? data.page : state.page,
                pageFull: (data.tinhTrang && data.tinhTrang == 2) ? data.page : state.pageFull,
                pageKDky: (data.tinhTrang && data.tinhTrang == 3) ? data.page : state.pageKDky,
            });
        case DtDangKyHocPhanUpdate:
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

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDangKyHocPhanAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký học phần bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DtDangKyHocPhanGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDangKyHocPhan');
export function getDtDangKyHocPhanPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDangKyHocPhan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: dtDangKyHocPhanSetNull });
        const url = `/api/dt/dang-ky-hoc-phan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page);
                dispatch({ type: DtDangKyHocPhanGetPage, page: data.page, tinhTrang: filter.tinhTrang });
            }
        });
    };
}
export function getDtDangKyHocPhanStudentPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDangKyHocPhan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: dtDangKyHocPhanSetNull });
        const url = `/api/dt/dang-ky-hoc-phan/students/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page);
                dispatch({ type: DtDangKyHocPhanGetPage, page: data.page, tinhTrang: filter.tinhTrang });
            }
        });
    };
}

export const SelectAdapter_DangKyHocPhanStudent = {
    ajax: true,
    url: '/api/dt/dang-ky-hoc-phan/students/page/1/50',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, item, userData: { mssv: item.mssv, loaiHinhDaoTao: item.loaiHinhDaoTao, lop: item.lop, khoa: item.khoa }, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (done) => (getStudent({}, item => done && done({ id: item.mssv, item, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};

export const SelectAdapter_DangKyHocPhanHocPhan = {
    ajax: true,
    url: '/api/dt/dang-ky-hoc-phan/page/1/50',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maHocPhan, item, text: `${item.maHocPhan}: ${T.parse(item.tenMonHoc, { vi: '' })?.vi}` })) : [] }),
    fetchOne: (done) => (getHocPhan({}, item => done && done({ id: item.maHocPhan, item, text: `${item.maHocPhan}: ${T.parse(item.tenMonHoc, { vi: '' })?.vi}` })))(),
};

export const SelectAdapter_HocPhanByStudent = (mssv) => ({
    ajax: true,
    url: '/api/dt/dang-ky-hoc-phan/hoc-phan-student',
    data: params => ({ condition: params.term, mssv }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.maHocPhan, item, text: `${item.maHocPhan}: ${T.parse(item.tenMonHoc, { vi: '' })?.vi}` })) : [] }),
});

export const SelectAdapter_StudentChuongTrinhDaoTao = (filter) => ({
    ajax: true,
    url: '/api/dt/dang-ky-hoc-phan/students/page/1/50',
    data: params => ({ condition: params.term, filter }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.filter(item => !item.lop && item.tinhTrang == 1).map(item => ({ id: item.mssv, item, userData: { mssv: item.mssv, loaiHinhDaoTao: item.loaiHinhDaoTao, lop: item.lop }, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (done) => (getStudent({}, item => done && done({ id: item.mssv, item, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
});

export function getStudent(filter, done) {
    return () => {
        T.get('/api/dt/dang-ky-hoc-phan/student/all', { filter }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } done(result.items);
        });
    };
}

export function getHocPhan(filterhp, done) {
    return () => {
        T.get('/api/dt/dang-ky-hoc-phan/hoc-phan/all', { filterhp }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.items);
            }
        });
    };
}

export function getHocPhanCtdt(mssv, filterSV, maLoaiDky, done) {
    return () => {
        T.get('/api/dt/dang-ky-hoc-phan/hoc-phan-ctdt/all', { mssv, filterSV, maLoaiDky }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.listHocPhan);
            }
        });
    };
}

export function getHocPhanCheckDiemLichThi(listHocPhan, mssv, done) {
    return () => {
        T.get('/api/dt/dang-ky-hoc-phan/check-diem-lich-thi', { listHocPhan, mssv }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Kiểm tra điều kiện bị lỗi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result.listFalse);
            }
        });
    };
}

export function getHocPhanCheckListSv(maHocPhan, listMssv, done) {
    return () => {
        T.get('/api/dt/dang-ky-hoc-phan/check-list-sv', { maHocPhan, listMssv }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Kiểm tra điều kiện bị lỗi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (done) done(result);
            }
        });
    };
}

export function checkHocPhanTrungLich(data, done) {
    return () => {
        T.get('/api/dt/dang-ky-hoc-phan/check-trung-lich', { data }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Kiểm tra trùng bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.listTrung);
            }
        });
    };
}

export function deleteDtDangKyHocPhan(listHocPhan, mssv, filter, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan';
        T.delete(url, { listHocPhan, mssv, filter }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Hủy đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${data.error}`);
                if (done) done(data);
            } else {
                T.notify('Hủy đăng ký học phần thành công!', 'success');
                dispatch({ type: DtDangKyHocPhanGetAll });
                done && done(data);
            }
        });
    };
}

export function deleteDtDangKyHocPhanMultiple(maHocPhan, listSv, filter, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan/multiple';
        T.delete(url, { maHocPhan, listSv, filter }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Hủy đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${data.error}`);
                if (done) done(data);
            } else {
                T.notify('Xóa đăng ký học phần thành công!', 'success');
                dispatch({ type: DtDangKyHocPhanGetAll });
                done && done(data);
            }
        });
    };
}

export function deleteDtDangKyHocPhanImport(list, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan/huy-import';
        T.delete(url, { list }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Hủy đăng ký học phần bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                T.notify('Xóa đăng ký học phần thành công!', 'success');
                dispatch({ type: DtDangKyHocPhanGetAll });
                done && done();
            }
        });
    };
}

export function checkCondition(list, done) {
    return () => {
        const url = '/api/dt/dang-ky-hoc-phan';
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

export function createDtDangKyHocPhan(list, filter, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan';
        T.post(url, { list, filter }, data => {
            if (data.error) {
                T.notify('Lưu đăng ký học phần bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                dispatch({ type: DtDangKyHocPhanGetAll });
                if (done) done();
            }
        });
    };
}

export function updateDtDangKyHocPhan(condition, listSv, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan';
        T.put(url, { condition, listSv }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Cập nhật đăng ký học phần bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                let { listFalse, listSuccess } = data;
                if (listSuccess.length == 1) T.notify(`Đã chuyển thành công sinh viên ${listSuccess[0]} vào học phần mới!`, 'success');
                else if (listSuccess.length) T.notify(`Đã chuyển thành công ${listSuccess.length} sinh viên vào học phần mới!`, 'success');
                if (listFalse.diem.length) T.notify(`Sinh viên ${listFalse.diem} đã có điểm!`, 'danger');
                if (listFalse.lhdt.length) T.notify(`Sinh viên ${listFalse.lhdt} đã đăng ký môn này ở học phần khác!`, 'danger');
                dispatch({ type: DtDangKyHocPhanGetAll });
                done && done(data);
            }
        }, () => T.notify('Cập nhật đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function updateDtDangKyHocPhanMultiple(listSv, changes, filter, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan/multiple';
        T.put(url, { listSv, changes, filter }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Cập nhật đăng ký học phần bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký học phần thành công!', 'success');
                dispatch({ type: DtDangKyHocPhanGetAll });
                done && done(data);
            }
        }, () => T.notify('Cập nhật đăng ký học phần bị lỗi!', 'danger'));
    };
}

export function SaveImportDtDangKyHocPhan(list, filter, done) {
    return () => {
        const url = '/api/dt/dang-ky-hoc-phan/save-import';
        T.post(url, { list, filter }, data => {
            if (data.error) {
                T.notify('Lưu đăng ký học phần bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                done && done();
            }
        });
    };
}

export function SaveDuHocPhiDKHP(list, filter, done) {
    return () => {
        const url = '/api/dt/dang-ky-hoc-phan/save-import-du-hoc-phi';
        T.post(url, { list, filter }, data => {
            if (data.error) {
                T.notify('Lưu đăng ký học phần bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                done && done();
            }
        });
    };
}

export function changeDtDangKyHocPhan(item) {
    return { type: DtDangKyHocPhanUpdate, item };
}
export function getDtDangKyHocPhan(id, done) {
    return () => {
        const url = `/api/dt/dang-ky-hoc-phan/item/${id}`;
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

export function getDtDangKyHocPhanStudent(id, filter, sort, done) {
    const url = '/api/dt/dang-ky-hoc-phan/student';
    T.get(url, { id, filter, sort }, data => {
        if (data.error) {
            T.notify('Lấy danh sách sinh viên đăng ký học phần bị lỗi' + (data.error.message && (' :<br>' + data.error.message)), 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            if (done) done(data.items);
        }
    });
}

export function getDtDangKyHocPhanByStudent(mssv, filter, done) {
    return () => {
        const url = '/api/dt/dang-ky-hoc-phan/student/hoc-phan';
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
        const url = '/api/dt/dang-ky-hoc-phan/so-luong-dky';
        T.get(url, { filter }, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items[0]);
            }
        });
    };
}

// export const SelectAdapter_DtDangKyHocPhan = {
//     ajax: true,
//     url: '/api/dao-tao/dang-ky-hoc-phan/all',
//     data: params => ({ condition: params.term, kichHoat: 1 }),
//     processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
//     fetchOne: (ma, done) => (getDtDangKyHocPhan(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
// };