import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetAll = 'sinhVien:GetAll';
const sinhVienGetPage = 'sinhVien:GetPage';
const sinhVienUpdate = 'sinhVien:Update';
const sinhVienGetEditPage = 'sinhVien:GetEditPage';
const sinhVienSetNull = 'sinhVien:SetNull';
const sinhVienGetChungNhanPage = 'sinhvien:GetChungNhanPage';
const sinhVienGetQuyetDinhPage = 'sinhvien:GetQuyetDinhPage';
const sinhVienGetDotChinhSuaPage = 'sinhvien:GetDotChinhSuaPage';
const sinhVienGetKhenThuongPage = 'sinhvien:GetKhenThuongPage';


export default function fwStudentsReducer(state = null, data) {
    switch (data.type) {
        case sinhVienSetNull:
            return Object.assign({}, state, { page: { ...data.page, list: null } });
        case sinhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case sinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case sinhVienGetEditPage:
            return Object.assign({}, state, { items: data.items });
        case sinhVienUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i]._id == updatedItem._id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i]._id == updatedItem._id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        case sinhVienGetChungNhanPage:
            return Object.assign({}, state, { chungNhanPage: data.page });
        case sinhVienGetQuyetDinhPage:
            return Object.assign({}, state, { quyetDinhPage: data.page });
        case sinhVienGetDotChinhSuaPage:
            return Object.assign({}, state, { dotChinhSuaPage: data.page });
        case sinhVienGetKhenThuongPage:
            return Object.assign({}, state, { khenThuongPage: data.page });
        default:
            return state;
    }
}

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageStudentsAdmin');

export function getStudentsPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    const page = T.updatePage('pageStudentsAdmin', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: sinhVienSetNull });
        const url = `/api/ctsv/student/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: sinhVienGetPage, page: result.page });
                done && done(result.page);
            }
        }, () => T.notify('Lấy danh sách sinh viên, học sinh bị lỗi!', 'danger'));
    };
}

export function getStudentAdmin(mssv, done) {
    return () => {
        const url = `/api/ctsv/item/${mssv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên, học sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                // dispatch({ type: sinhVienGetEditPage, items: data.items });
            }
        });
    };
}

export function getStudentInfo(mssv, done) {
    return () => {
        const url = `/api/ctsv/ttsv/${mssv}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên, học sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                // dispatch({ type: sinhVienGetEditPage, items: data.items });
            }
        });
    };
}

export function updateStudentAdmin(mssv, changes, done) {
    return dispatch => {
        const url = `/api/ctsv/item/${mssv}`;
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật không thành công!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done(data.items);
                dispatch(getStudentsPage());
            }
        });
    };
}

export function addStudentAdmin(data, done) {
    return () => {
        const url = '/api/ctsv/item';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Thêm sinh viên không thành công!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Thêm sinh viên thành công!', 'success');
                done && done();
            }
        });
    };
}

export function multiAddDssvAdmin(dssv, done) {
    return () => {
        const url = '/api/ctsv/item/create-multi';
        T.post(url, { dssv }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Lưu danh sách không thành công!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done();
            }
        });
    };
}

export function massUpdateStudentAdmin(dsMssv, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/mass-update-sinh-vien';
        T.put(url, { dsMssv, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                done && done();
                dispatch(getStudentsPage());
            }
        });
    };
}

T.initPage('pageLichSuChungNhan');

export function getStudentChungNhanAdmin(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageLichSuChungNhan', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/chung-nhan/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng nhận bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: sinhVienGetChungNhanPage, page: data.page });
                done && done();
            }
        }, () => T.notify('Lấy danh sách chứng nhận bị lỗi!', 'danger'));
    };
}

export function createStudentChungNhanAdmin(svManageForm, notification, done) {
    return dispatch => {
        const url = '/api/ctsv/form-dang-ky';
        T.post(url, { svManageForm, notification }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Đăng kí chứng nhận bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Đăng kí chứng nhận thành công!', 'success');
                done && done(data.item);
                dispatch(getStudentChungNhanAdmin());
            }
        }, () => T.notify('Đăng kí chứng nhận bị lỗi!', 'danger'));
    };
}

export function updateStudentChungNhanAdmin(id, changes, notification, done) {
    return dispatch => {
        const url = '/api/ctsv/form-dang-ky';
        T.put(url, { id, changes, notification }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin form bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
                dispatch(getStudentChungNhanAdmin());
            }
        }, () => T.notify('Cập nhật thông tin form bị lỗi!', 'danger'));
    };
}

export function deleteStudentChungNhanAdmin(id) {
    return dispatch => {
        const url = '/api/ctsv/form-dang-ky/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa chứng nhận  bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa chứng nhận thành công!', 'success', false, 800);
                dispatch(getStudentChungNhanAdmin());
            }
        }, () => T.notify('Xóa chứng nhận bị lỗi!', 'danger'));
    };
}

// Lich Su QUyet Dinh
T.initPage('pageLichSuQuyetDinh');

export function getStudentQuyetDinhAdmin(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageLichSuQuyetDinh', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/quyet-dinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách quyết định bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: sinhVienGetQuyetDinhPage, page: data.page });
                done && done();
            }
        }, () => T.notify('Lấy danh sách quyết định bị lỗi!', 'danger'));
    };
}

export function createStudentManageQuyetDinh(svManageQuyetDinh, done) {
    return dispatch => {
        const url = '/api/ctsv/quyet-dinh';
        T.post(url, { svManageQuyetDinh }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tạo mới quyết định thành công!', 'success');
                done && done(data.item);
                dispatch(getStudentQuyetDinhAdmin());
            }
        }, () => T.notify('Tạo mới quyết định bị lỗi!', 'danger'));
    };
}

export function updateStudentManageQuyetDinh(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/quyet-dinh';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin quyết định bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
                dispatch(getStudentQuyetDinhAdmin());
            }
        }, () => T.notify('Cập nhật thông tin quyết định bị lỗi!', 'danger'));
    };
}

export function huyQuyetDinh(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/quyet-dinh/huy';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Hủy quyết định bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Hủy quyết định thành công!', 'success');
                done && done(data.item);
                dispatch(getStudentQuyetDinhAdmin());
            }
        }, () => T.notify('Cập nhật thông tin quyết định bị lỗi!', 'danger'));
    };
}

export function downloadQuyetDinhWord(id, done) {
    return () => {
        const url = `/api/ctsv/quyet-dinh/download/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

export function downloadImage(changes, done) {
    return () => {
        const url = '/api/ctsv/image-card/download';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Tải ảnh thành công', 'success');
                done && done(data);
            }
        }, () => T.notify('Download ảnh thẻ sinh viên bị lỗi', 'danger'));
    };
}

// Quyet dinh khen thuong
T.initPage('pageQuyetDinhKhenThuong');

export function getStudentQuyetDinhKhenThuong(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageQuyetDinhKhenThuong', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/danh-sach-khen-thuong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: sinhVienGetKhenThuongPage, page: data.page });
                done && done();
            }
        }, () => T.notify('Lấy danh sách khen thưởng bị lỗi!', 'danger'));
    };
}
// export function deleteSinhVienAdmin(mssv, done) {
//     return dispatch => {
//         const url = '/api/svs';
//         T.delete(url, { mssv }, data => {
//             if (data.error) {
//                 T.notify('Xoá sinh viên, học sinh không thành công!', 'danger');
//                 console.error(`GET: ${url}.`, data.error);
//             } else {
//                 done && done();
//                 dispatch({ type: sinhVienGetPage });
//             }
//         });
//     };
// }

export const SelectAdapter_FwStudent = {
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term, filter: { sortTerm: 'mssv_ASC' } }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.mssv,
            text: `${item.mssv}: ${item.ho} ${item.ten}`,
            hoTen: `${item.ho} ${item.ten}`,
            dienThoai: item.dienThoaiCaNhan,
            soTkNh: item.soTkNh,
            tenNganHang: item.tenNganHang,
            maKhoa: item.khoa,
            tenKhoa: item.tenKhoa,
            heDaoTao: item.loaiHinhDaoTao,
            tinhTrang: item.tinhTrangSinhVien,
            maTinhTrang: item.tinhTrang,
            lop: item.lop, maCtdt: item.maCtdt
        })) : []
    }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))()
};

export const SelectAdapter_FwStudentFilter = (filter) => ({
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term, filter: { ...filter, sortTerm: 'mssv_ASC' } }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.mssv,
            text: `${item.mssv}: ${item.ho} ${item.ten}`,
            hoTen: `${item.ho} ${item.ten}`,
            dienThoai: item.dienThoaiCaNhan,
            soTkNh: item.soTkNh,
            tenNganHang: item.tenNganHang,
            maKhoa: item.khoa,
            tenKhoa: item.tenKhoa,
            heDaoTao: item.loaiHinhDaoTao,
            tinhTrang: item.tinhTrangSinhVien,
            maTinhTrang: item.tinhTrang,
            lop: item.lop, maCtdt: item.maCtdt
        })) : []
    }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))()
});

export const SelectAdapter_FwStudentKyLuat = {
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term, filter: { sortTerm: 'mssv_ASC' } }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.mssv,
            text: `${item.mssv}: ${item.ho} ${item.ten}`,
            hoTen: `${item.ho} ${item.ten}`,
            dienThoai: item.dienThoaiCaNhan,
            tenKhoa: item.tenKhoa,
            tenTinhTrang: item.tinhTrangSinhVien,
            tinhTrang: item.tinhTrang,
        })) : []
    }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))()
};

export const SelectAdapter_FwNamTuyenSinh = {
    ajax: true,
    url: '/api/ctsv/nam-tuyen-sinh',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.namTuyenSinh, text: `${item.namTuyenSinh} - ${item.namTuyenSinh + 4}` })) : [] })
    // fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};

export const SelectAdapter_FwStudentsManageForm = {
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}`,
            lop: item.lop,
            email: item.emailTruong,
            tinhTrangSinhVien: item.tinhTrangSinhVien,
            tinhTrangHienTai: item.tinhTrang,
            loaiHinhDaoTao: item.loaiHinhDaoTao,
            maCtdt: item.maCtdt,
            khoa: item.khoa
        })) : []
    }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({
        id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}`,
        email: item.emailTruong,
        lop: item.lop,
        tinhTrangSinhVien: item.tinhTrangSinhVien,
        loaiHinhDaoTao: item.loaiHinhDaoTao,
        maCtdt: item.maCtdt
    })))()
};

export const SelectAdapter_FwStudentsMienGiam = {
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}`,
            lop: item.lop,
            email: item.emailTruong,
            tinhTrangSinhVien: item.tinhTrangSinhVien,
            tinhTrangHienTai: item.tinhTrang,
            loaiHinhDaoTao: item.loaiHinhDaoTao,
            ngayNhapHoc: item.ngayNhapHoc,
            nienKhoa: item.nienKhoa,
            namTuyenSinh: item.namTuyenSinh,
        })) : []
    }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({
        id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}`,
        lop: item.lop,
        email: item.emailTruong,
        tinhTrangSinhVien: item.tinhTrangSinhVien,
        tinhTrangHienTai: item.tinhTrang,
        loaiHinhDaoTao: item.loaiHinhDaoTao,
        namTuyenSinh: item.namTuyenSinh
    })))()
};

export const SelectAdapter_FwStudentKhenThuong = {
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}`, hoTen: `${item.ho} ${item.ten}`, maLop: item.lop })) : [] }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}`, hoTen: `${item.ho} ${item.ten}`, maLop: item.lop })))()
};

export function adminDownloadSyll(mssv, namTuyenSinh) {
    return () => {
        const url = '/api/ctsv/get-syll';
        T.get(url, { mssv, namTuyenSinh }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lỗi hệ thống', 'danger');
                console.error(result.error);
            } else {
                T.download(`${url}?mssv=${mssv}&namTuyenSinh=${namTuyenSinh}`, 'SYLL.pdf');
            }
        });
    };
}

export const SelectAdapter_FwStudentsTotNghiep = {
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.mssv,
            mssv: item.mssv,
            text: `${item.mssv}: ${item.ho} ${item.ten}`,
            hoTen: `${item.ho} ${item.ten}`,
            tenNganh: item.tenNganh,
            ngaySinh: item.ngaySinh,
            tenLoaiHinhDaoTao: item.tenLoaiHinhDaoTao,
            item: item

        })) : []
    }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({
        id: item.mssv,
        mssv: item.mssv,
        text: `${item.mssv}: ${item.ho} ${item.ten}`,
        hoTen: `${item.ho} ${item.ten}`,
        tenNganh: item.tenNganh,
        ngaySinh: item.ngaySinh,
        tenLoaiHinhDaoTao: item.tenLoaiHinhDaoTao,
    })))()
};
export const SelectAdapter_FwStudentsSuKien = {
    ajax: true,
    url: '/api/ctsv/student/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.mssv,
            mssv: item.mssv,
            text: `${item.mssv}`,
            hoTen: `${item.ho} ${item.ten}`,
            email: item.emailTruong,
            item: item

        })) : []
    }),
    fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({
        id: item.mssv,
        mssv: item.mssv,
        text: `${item.mssv}: ${item.ho} ${item.ten}`,
        hoTen: `${item.ho} ${item.ten}`,
        email: item.emailTruong,
    })))()
};

// ACTIONS -------------------------------------------------
export function getCtdtInfo(mssv, done) {
    const url = '/api/ctsv/ctdt-bang-diem';
    T.get(url, { mssv }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger'));
}

export function getDrlInfo(mssv, done) {
    const url = '/api/ctsv/drl-info';
    T.get(url, { mssv }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger'));
}

T.initPage('pageDotChinhSua');

export function getStudentDotChinhSuaPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDotChinhSua', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/dot-chinh-sua-info/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đợt chỉnh sửa bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: sinhVienGetDotChinhSuaPage, page: data.page });
                done && done();
            }
        }, () => T.notify('Lấy danh sách đợt chỉnh sửa bị lỗi!', 'danger'));
    };
}

export function createStudentDotChinhSuaPage(changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dot-chinh-sua-info/create';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch(getStudentDotChinhSuaPage());
                T.notify('Tạo mới đợt chỉnh sửa thành công', 'success');
                done && done();
            }
        }, () => T.notify('Tạo mới đợt chỉnh sửa bị lỗi!', 'danger'));
    };
}

export function updateStudentDotChinhSuaPage(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dot-chinh-sua-info/update';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch(getStudentDotChinhSuaPage());
                T.notify('Cập nhật đợt chỉnh sửa thành công', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật đợt chỉnh sửa bị lỗi!', 'danger'));
    };
}

export function deleteStudentDotChinhSuaPage(id, done) {
    return dispatch => {
        const url = '/api/ctsv/dot-chinh-sua-info/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch(getStudentDotChinhSuaPage());
                T.notify('Xóa đợt chỉnh sửa thành công', 'success');
                done && done();
            }
        }, () => T.notify('Xóa đợt chỉnh sửa bị lỗi!', 'danger'));
    };
}



