import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtChuongTrinhDaoTaoGetAll = 'DtChuongTrinhDaoTao:GetAll';
const DtChuongTrinhDaoTaoGetPage = 'DtChuongTrinhDaoTao:GetPage';
const DtChuongTrinhDaoTaoGet = 'DtChuongTrinhDaoTao:GetByKhoa';
const DtChuongTrinhDaoTaoUpdate = 'DtChuongTrinhDaoTao:Update';
const GetDtKhungDaoTao = 'DtKhungDaoTao:Get';

export default function dtChuongTrinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case DtChuongTrinhDaoTaoGetAll:
        case DtChuongTrinhDaoTaoGet:
            return Object.assign({}, state, { items: data.items });
        case DtChuongTrinhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });

        case GetDtKhungDaoTao:
            return Object.assign({}, state, { dtKhungDaoTao: data.khungDaoTao });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtChuongTrinhDaoTaoAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dt/chuong-trinh-dao-tao/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtChuongTrinhDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtChuongTrinhDaoTao');
export function getDtChuongTrinhDaoTaoPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtChuongTrinhDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/chuong-trinh-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.page.list, data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DtChuongTrinhDaoTaoGetPage, page: data.page });
            }
        });
    };
}

export function getDtChuongTrinhDaoTao(maKhungDaoTao, done) {
    return dispatch => {
        const url = '/api/dt/chuong-trinh-dao-tao';
        T.get(url, { condition: { maKhungDaoTao } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DtChuongTrinhDaoTaoGet, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getDtKhungDaoTao(id, done) {
    return dispatch => {
        const url = `/api/dt/khung-dao-tao/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy danh sách khung đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${result.error}`);
            } else {
                dispatch({ type: GetDtKhungDaoTao, khungDaoTao: result.item });
                if (done) done(result.item);
            }
        });
    };
}

export function getDtKhungDaoTaoByMaCtdt(ma, done) {
    return () => {
        const url = `/api/dt/khung-dao-tao/ctdt/${ma}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy danh sách khung đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${result.error}`);
            } else {
                done && done(result.item);
            }
        });
    };
}

//Xoas
export function createMultiDtChuongTrinhDaoTao(data, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/multiple';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo chương trình đào tạo có lỗi!', 'danger');
            } else {
                T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} môn thành công!`, 'success');
            }
            done && done();
        });
    };
}

//Xoas
export function deleteMultiDtChuongTrinhDaoTao(data, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/multiple';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger');
            }
            done && done();
        });
    };
}


export function createDtChuongTrinhDaoTao(item, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo chương trình đào tạo thành công!', 'success');
                data.warning && T.notify(data.warning, 'warning');
            }
            if (done) done(data);
        });
    };
}

export function deleteDtChuongTrinhDaoTao(id, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.alert('Chương trình đào tạo đã xóa thành công!', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function updateDtChuongTrinhDaoTao(id, changes, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
                done && done(data);
            } else {
                // T.notify('Cập nhật thành công!', 'success');
                data.warning && T.notify(data.warning, 'warning');
                done && done(data);
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}


export const SelectAdapter_ChuongTrinhDaoTaoFilter = (maNganh = null) => {
    return {
        ajax: true,
        url: '/api/dt/chuong-trinh-dao-tao/all-mon-hoc',
        data: params => ({ searchTerm: params.term, maNganh }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.namDaoTao, data: { mucCha: item.mucCha, mucCon: item.mucCon } })) : [] }),
        fetchOne: (ma, done) => (getDtChuongTrinhDaoTao(ma, item => done && done({ id: item.id, text: item.namDaoTao, data: { mucCha: item.mucCha, mucCon: item.mucCon } })))()
    };
};

export const SelectAdapter_NamDaoTaoFilter = {
    ajax: true,
    url: '/api/dt/chuong-trinh-dao-tao/all-nam-dao-tao',
    data: params => ({ searchText: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.namDaoTao })) : [] }),
};

export const SelectAdapter_KhungDaoTaoCtsv = (donVi, listLoaiHinhDaoTao) => {
    return {
        ajax: true,
        url: '/api/dt/chuong-trinh-dao-tao/page/1/50',
        data: params => ({ searchTerm: params.term, filter: { donViFilter: donVi, heDaoTaoFilter: listLoaiHinhDaoTao } }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: `${item.maCtdt} (${item.loaiHinhDaoTao} - ${item.khoaSinhVien}): ${T.parse(item.tenNganh)?.vi}` })) : [] }),
    };
};

export const SelectAdapter_ChuongTrinhDaoTaoFilterV2 = (filter) => ({
    ajax: true,
    url: '/api/dt/chuong-trinh-dao-tao/filter',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.maCtdt}: ${T.parse(item.tenNganh)?.vi}`, maCtdt: item.maCtdt })) : [] }),
    fetchOne: (id, done) => (getDtKhungDaoTao(id, item => done && done({ id: item.id, text: item.maCtdt })))()
});

export const SelectAdapter_ChuongTrinhDaoTaoRole = (filter) => ({
    ajax: true,
    url: '/api/dt/chuong-trinh-dao-tao/role',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.maCtdt}: ${T.parse(item.tenNganh)?.vi}`, maCtdt: item.maCtdt })) : [] }),
    fetchOne: (id, done) => (getDtKhungDaoTao(id, item => done && done({ id: item.id, text: item.maCtdt })))()
});

export const SelectAdapter_KhungDaoTaoFilter = (filter) => ({
    ajax: true,
    url: '/api/dt/chuong-trinh-dao-tao/page/1/50',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: `${item.maCtdt} (${item.loaiHinhDaoTao} - ${item.khoaSinhVien}): ${T.parse(item.tenNganh)?.vi}`, maCtdt: item.maCtdt })) : [] }),
    fetchOne: (id, done) => (getDtKhungDaoTaoByMaCtdt(id, item => done && done({ id: item.id, text: `${item.maCtdt} (${item.loaiHinhDaoTao} - ${item.khoaSinhVien}): ${T.parse(item.tenNganh)?.vi}` })))()
});

export function createDtChuongTrinhDaoTaoSv(listSv, id, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/sv';
        T.post(url, { listSv, id }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
                done && done(data.error);
            } else {
                T.notify('Thêm sinh viên thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Thêm sinh viên bị lỗi!', 'danger'));
    };
}

export function updateDtChuongTrinhDaoTaoSv(listSv, id, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/sv';
        T.put(url, { listSv, id }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
                done && done(data.error);
            } else {
                T.notify('Chuyển CTĐT cho sinh viên thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Chuyển CTĐT cho sinh viên bị lỗi!', 'danger'));
    };
}

export function deleteDtChuongTrinhDaoTaoSv(listSv, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/sv';
        T.delete(url, { listSv }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error.message}`, 'danger');
                console.error(`DELETE ${url}. ${data.error.message}`);
                done && done(data.error);
            } else {
                T.notify('Xoá sinh viên thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Xoá sinh viên bị lỗi!', 'danger'));
    };
}

export function changeDtChuongTrinhDaoTao(item) {
    return { type: DtChuongTrinhDaoTaoUpdate, item };
}


export function getDanhSachMonChuongTrinhDaoTao(condition, done) {
    return () => {
        T.get('/api/dt/chuong-trinh-dao-tao/all-mon-hoc', { condition }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách môn CTDT lỗi', 'danger');
                console.error(result.error);
            } done(result);
        });
    };
}

export function downloadWord(id, done) {
    return () => {
        const url = `/api/dt/chuong-trinh-dao-tao/download-word/${id}`;
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

//cau truc tin chi
export function checkTinChiCtdt(maCtdt, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/tin-chi-ctdt';
        T.get(url, { maCtdt }, data => {
            if (data.error) {
                T.notify('Kiểm tra cấu trúc tín chỉ của ctdt bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.list);
            }
        }, () => T.notify('Kiểm tra cấu trúc tín chỉ của ctdt bị lỗi', 'danger'));
    };
}

export function createTinChiCtdt(items, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/tin-chi-ctdt';
        T.post(url, { items }, data => {
            if (data.error) {
                T.notify('Tạo cấu trúc tín chỉ của ctdt bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Tạo cấu trúc tín chỉ của ctdt thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Tạo cấu trúc tín chỉ của ctdt bị lỗi', 'danger'));
    };
}

export function createTinChiCtdtMultiple(listCtdt, items, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/tin-chi-ctdt-multiple';
        T.post(url, { listCtdt, items }, data => {
            if (data.error) {
                T.notify('Sao chép cấu trúc tín chỉ của ctdt bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                T.notify('Sao chép cấu trúc tín chỉ của ctdt thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Sao chép cấu trúc tín chỉ của ctdt bị lỗi', 'danger'));
    };
}

export function getDataKhungTinChi(maKhungDaoTao, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/khung-tin-chi';
        T.get(url, { maKhungDaoTao }, data => {
            if (data.error) {
                T.notify('Kiểm tra cấu trúc tín chỉ của ctdt bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function setDefaultKhungTinChi(maKhungDaoTao, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/khung-tin-chi/default';
        T.post(url, { maKhungDaoTao }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cấu hình tín chỉ bị lỗi!', 'error', false, 3000);
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function configNhomTuChon(dataKhung, listNhom, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/nhom-tu-chon';
        T.post(url, { dataKhung, listNhom }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cấu hình nhóm tự chọn bị lỗi!', 'error', false, 3000);
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function huyConfigNhomTuChon(item, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/nhom-tu-chon/cancel';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Hủy cấu hình nhóm tự chọn bị lỗi!', 'error', false, 3000);
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function editTongSoTinChi(item, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/tong-tin-chi';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Chỉnh sửa số tín chỉ bị lỗi!', 'error', false, 3000);
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function configNhomTuongDuong(item, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/nhom-tuong-duong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cấu hình nhóm tương đương bị lỗi!', 'error', false, 3000);
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function saveImportSinhVien(items, maKhung, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/save-import-sinh-vien';
        T.post(url, { items, maKhung }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Lưu dữ liệu import bị lỗi!', 'error', false, 3000);
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data);
                T.alert('Lưu dữ liệu import thành công!', 'success', false, 2000);
            }
        });
    };
}

export function handleTyLeDiem({ items, maKhungDaoTao, tyLeDiem }, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/ty-le-diem';
        T.post(url, { items, maKhungDaoTao, tyLeDiem }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cấu hình tỷ lệ điểm bị lỗi!', 'error', false, 3000);
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function updateKeHoachChuyenNganh({ items, maKhungDaoTao }, done) {
    return () => {
        const url = '/api/dt/chuong-trinh-dao-tao/ke-hoach-chuyen-nganh';
        T.post(url, { items, maKhungDaoTao }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Cập nhật kế hoạch đào tạo chuyên ngành bị lỗi!', 'error', false, 3000);
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data);
                T.alert('Cập nhật kế hoạch đào tạo chuyên ngành thành công!', 'success', false, 2000);
            }
        });
    };
}