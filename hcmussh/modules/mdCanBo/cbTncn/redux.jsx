import T from 'view/js/common';

export function getLichSuDangKyThue(done) {
    return () => {
        const url = '/api/cb/tncn/ke-khai';
        T.get(url, res => {
            if (res.error) {
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.alert('Lấy thông tin đăng ký thuế lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}

export function createKeKhaiThue(data, done) {
    return () => {
        const url = '/api/cb/tncn/ke-khai';
        T.post(url, data, res => {
            if (res.error) {
                console.error(`POST: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.alert('Đăng ký thuế lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}

export function updateDangKyThue(id, changes, done) {
    return () => {
        const url = '/api/cb/tncn/ke-khai';
        T.put(url, { id, changes }, res => {
            if (res.error) {
                console.error(`PUT: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.alert('Cập nhật đăng ký thuế lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}


export function getLichSuDangKyPhuThuoc(done) {
    return () => {
        const url = '/api/cb/tncn/phu-thuoc';
        T.get(url, res => {
            if (res.error) {
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.alert('Lấy thông tin đăng ký người phụ thuộc lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}


export function createPhieuPhuThuoc(data, done) {
    return () => {
        const url = '/api/cb/tncn/phu-thuoc';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo thông tin đăng ký người phụ thuộc lỗi ', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.alert('Tạo thông tin đăng ký người phụ thuộc lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}
export function updatePhieuPhuThuoc(id, changes, done) {
    return () => {
        const url = '/api/cb/tncn/phu-thuoc';
        T.put(url, { id, changes }, res => {
            if (res.error) {
                T.notify('Cập nhật thông tin lỗi', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật thông tin thành công', 'success');
                done && done(res);
            }
        }, () => T.notify('Cập nhật thông tin lỗi', 'danger'));
    };
}

export function getPhieuDangKyDetail(id, done) {
    return () => {
        const url = `/api/cb/tncn/phu-thuoc/${id}`;
        T.get(url, res => {
            if (res.error) {
                console.error(`GET: ${url}.`, res.error);
                if (res.error.message == 'Invalid Permission') {
                    window.location = '/user/tncn/phu-thuoc';
                }
                T.notify('Invalid', 'danger');
            } else {
                done && done(res);
            }
        }, (error) => T.alert('Lấy thông tin đăng ký người phụ thuộc lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}

export function createNguoiPhuThuoc(data, done) {
    return () => {
        const url = '/api/cb/tncn/phu-thuoc/detail';
        T.post(url, data, res => {
            if (res.error) {
                console.error(`POST: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        }, (error) => T.alert('Tạo thông tin đăng ký người phụ thuộc lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger', false, 800));
    };
}

export function deleteNguoiPhuThuoc(id, done) {
    return () => {
        const url = `/api/cb/tncn/phu-thuoc/detail/${id}`;
        T.delete(url, res => {
            if (res.error) {
                T.notify('Xóa người phụ thuộc lỗi');
                console.error(`POST: ${url}.`, res.error, 'danger');
            } else {
                done && done();
            }
        }, () => T.notify('Xóa người phụ thuộc lỗi', 'danger'));
    };
}

export function updateNguoiPhuThuoc(data, done) {
    return () => {
        const url = '/api/cb/tncn/phu-thuoc/detail';
        T.put(url, data, res => {
            if (res.error) {
                T.notify('Cập nhật người phụ thuộc lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error, 'danger');
            } else {
                done && done(res);
            }
        }, () => T.notify('Cập nhật người phụ thuộc lỗi', 'danger'));
    };
}

export function getLichSuUyQuyen(done) {
    return () => {
        const url = '/api/cb/tncn/uy-quyen';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách lịch sử ủy quyền thuế lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error, 'danger');
            } else {
                done && done(res);
            }
        }, () => T.notify('Lấy danh sách lịch sử ủy quyền thuế lỗi', 'danger'));
    };
}

export function createUyQuyenThue(data, done) {
    return () => {
        const url = '/api/cb/tncn/uy-quyen';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo phiếu ủy quyền thuế lỗi', 'danger');
                console.error(`POST: ${url}.`, res.error, 'danger');
            } else {
                done && done(res);
            }
        }, () => T.notify('Tạo phiếu ủy quyền thuế lỗi', 'danger'));
    };
}



