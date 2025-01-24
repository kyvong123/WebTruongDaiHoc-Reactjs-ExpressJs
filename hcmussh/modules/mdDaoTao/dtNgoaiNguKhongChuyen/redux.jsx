import T from 'view/js/common';

// Reducer ------------------------------
const DtNgoaiNguKhongChuyenGetAll = 'DtNgoaiNguKhongChuyen:GetAll';
const DtNgoaiNguGetPage = 'DtNgoaiNguGetPage:GetPage';

export default function dtMonTuongDuongReducer(state = null, data) {
    switch (data.type) {
        case DtNgoaiNguKhongChuyenGetAll:
            return Object.assign({}, state, { items: data.items, listNgoaiNgu: data.listNgoaiNgu });
        case DtNgoaiNguGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------
export function getListKhoaHe(filter, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/data-khoa-he';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu khóa sinh viên bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function getDataDtNgoaiNguKC(khoaSinhVien, loaiHinhDaoTao, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/data';
        T.get(url, { khoaSinhVien, loaiHinhDaoTao }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu ngoại ngữ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getDataKhoaSinhVien(done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/khoa-sinh-vien';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu khóa sinh viên bị lỗi', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function createDtNgoaiNguKC(data, config, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen';
        T.post(url, { data, config }, result => {
            if (result.error) {
                T.alert('Tạo ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Tạo ngoại ngữ không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}

export function cloneDtNgoaiNguKC(data, dataClone, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/clone';
        T.post(url, { data, dataClone }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Sao chép ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Sao chép ngoại ngữ không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}

export function createConditionDtNgoaiNguKC(data, config, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/condition';
        T.post(url, { data, config }, result => {
            if (result.error) {
                T.alert('Tạo điều kiện ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Tạo điều kiện không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}

export function updateConditionDtNgoaiNguKC(id, changes, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/condition';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.alert('Xét điều kiện ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Xét điều kiện không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}

export function deleteConditionDtNgoaiNguKC(id, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/condition';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.alert('Xóa điều kiện ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Xóa điều kiện không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}


export function createMienDtNgoaiNguKC(data, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/mien';
        T.post(url, { data }, result => {
            if (result.error) {
                T.alert('Tạo miễn ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Tạo miễn không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}

export function updateMienDtNgoaiNguKC(id, changes, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/mien';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.alert('Xét miễn ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Xét miễn không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}

export function deleteMienDtNgoaiNguKC(id, done) {
    return () => {
        const url = '/api/dt/ngoai-ngu-khong-chuyen/mien';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.alert('Xóa miễn ngoại ngữ không chuyên bị lỗi', 'error', false, 1000);
                console.error(`GET: ${url}.`, result.error);
            } else {
                T.alert('Xóa miễn không chuyên thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}


T.initPage('pageDtNgoaiNguKhongChuyen');
export function getDtNgoaiNguKhongChuyenPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtNgoaiNguKhongChuyen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/ngoai-ngu-khong-chuyen/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tình trạng ngoại ngữ bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtNgoaiNguGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}