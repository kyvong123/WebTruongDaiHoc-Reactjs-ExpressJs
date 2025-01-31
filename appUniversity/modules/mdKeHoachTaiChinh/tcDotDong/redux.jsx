import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcDotDongGetPage = 'TcDotDong:GetPage';
const TcDotDongGetItem = 'TcDotDong:GetItem';
const TcCauHinhDotDongGetAll = 'TcCauHinhDotDong:GetAll';
const TcCauHinhDotDongGetDetail = 'TcCauHinhDotDong:GeDetail';
const TcCauHinhDotDongGetListSV = 'TcCauHinhDotDong:GetListSV';

export default function TcDotDongReducer(state = null, data) {
    switch (data.type) {
        case TcDotDongGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcDotDongGetItem:
            return Object.assign({}, state, { item: data.item });
        case TcCauHinhDotDongGetAll:
            return Object.assign({}, state, { item: data.item });
        case TcCauHinhDotDongGetDetail:
            return Object.assign({}, state, { detail: data.item });
        case TcCauHinhDotDongGetListSV:
            return Object.assign({}, state, { listSinhVienAll: data.item.listSinhVienAll });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageTcDotDong';
T.initPage(PageName);
export function getTcDotDongPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khtc/dot-dong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đợt đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TcDotDongGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đợt đóng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getTcDotDong(id, done) {
    return () => {
        const url = `/api/khtc/dot-dong/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đợt đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createTcDotDong(item, done) {
    return dispatch => {
        const url = '/api/khtc/dot-dong';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify('Tạo đợt đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo đợt đóng học phí thành công!', 'success');
                done && done(data.item);
                dispatch(getTcDotDongPage());
            }
        }, (error) => T.notify('Tạo đợt đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTcDotDong(keys, changes, done) {
    return dispatch => {
        const url = '/api/khtc/dot-dong';
        T.put(url, { keys, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật đợt đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật đợt đóng học phí thành công!', 'success');
                done && done();
                dispatch(getTcDotDongPage());
            }
        }, (error) => T.notify('Cập nhật đợt đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTcDotDong(idDotDong) {
    return dispatch => {
        const url = '/api/khtc/dot-dong';
        T.delete(url, { idDotDong }, data => {
            if (data.error) {
                T.notify('Xóa đợt đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                dispatch(getTcDotDongPage());
            }
        }, (error) => T.notify('Xóa đợt đóng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getListLoaiPhi(data, done) {
    return () => {
        const url = '/api/khtc/dot-dong/get-loai-phi';
        T.get(url, data, res => {
            if (res.error) {
                T.notify('Lấy danh sách loại phí bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                // T.notify('Lấy danh sách loại phí thành công!', 'success');
                done && done(res.item);
            }
        }, (error) => T.notify('Lấy danh sách loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function capNhatSoTien(data, done) {
    return () => {
        const url = '/api/khtc/dot-dong/cap-nhat-so-tien';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Cập nhật số tiền bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật số tiền thành công!', 'success');
                done && done();
            }
        }, (error) => T.notify('Cập nhật số tiền bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateListLoaiPhi(idDotDong, namHoc, hocKy, listLoaiPhi, done) {
    return () => {
        const url = '/api/khtc/dot-dong/cap-nhat-loai-phi';
        T.post(url, { idDotDong, namHoc, hocKy, listLoaiPhi }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật danh sách loại phí thành công!', 'success');
                done && done();
            }
        }, (error) => T.notify('Cập nhật danh sách loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getAllHeDaoTao(done) {
    return dispatch => {
        const url = '/api/khtc/cau-hinh-dot-dong/he-dao-tao/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hệ đào tạo bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(data.error);
            } else {
                dispatch({ type: TcCauHinhDotDongGetAll, item: data.item });
                done && done(data.item);
            }
        });
    };
}

export function getCauHinhDotDongBacHe(data, done) {
    return dispatch => {
        const url = '/api/khtc/cau-hinh-dot-dong/detail/all';
        T.get(url, { data }, res => {
            if (res.error) {
                T.notify('Lấy danh sách chi tiết đợt đóng bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                dispatch({ type: TcCauHinhDotDongGetDetail, item: res });
                done && done(res);
            }
        });
    };
}

export function luuCauHinhDotDongBacHe(data, done) {
    return () => {
        const url = '/api/khtc/cau-hinh-dot-dong/save';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Lưu cấu hình đợt đóng bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                done && done();
            }
        });
    };
}

export function xoaCauHinhDotDongBacHe(data, done) {
    return () => {
        const url = '/api/khtc/cau-hinh-dot-dong/delete';
        T.delete(url, { data }, res => {
            if (res.error) {
                T.notify('Xóa cấu hình đợt đóng bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, res.error);
            } else {
                T.notify('Xóa cấu hình đợt đóng thành công!', 'success');
                done && done();
            }
        });
    };
}

export function apDungDotDongPreview(data, done) {
    return dispatch => {
        const url = '/api/khtc/cau-hinh-dot-dong/ap-dung/preview';
        T.get(url, { data }, res => {
            if (res.error) {
                T.notify('Lấy danh sách chi tiết đợt đóng bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                dispatch({ type: TcCauHinhDotDongGetListSV, item: res });
                done && done(res);
            }
        });
    };
}

export function apDungDotDong(data, done) {
    return () => {
        const url = '/api/khtc/cau-hinh-dot-dong/ap-dung';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Áp dụng đợt đóng bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                done && done(res.length);
            }
        });
    };
}

export function getInfoSinhVien(mssv, done) {
    return () => {
        const url = '/api/khtc/dot-dong/sinh-vien/info';
        T.get(url, { mssv }, res => {
            if (res.error) {
                T.notify('Lấy thông tin sinh viên bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done(res);
            }
        });
    };
}

export function rollBackDotDong(data, done) {
    return () => {
        const url = '/api/khtc/dot-dong/roll-back';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Hoàn tác đợt đóng bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                done && done();
            }
        });
    };
}

export function getAllKhoaGiaoDich(filter, done) {
    return () => {
        const url = '/api/khtc/khoa-giao-dich/get-all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình khóa giao dịch bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function createKhoaGiaoDichBacHe(data, done) {
    return () => {
        const url = '/api/khtc/khoa-giao-dich/bac-he';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm cấu hình khóa giao dịch bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(res.error);
            } else {
                done && done(res.item);
                T.notify('Cấu hình khóa giao dịch thành công!', 'success');
            }
        });
    };
}

export function moKhoaSinhVien(mssv, done) {
    return () => {
        const url = '/api/khtc/khoa-giao-dich/sinh-vien';
        T.post(url, { mssv }, res => {
            if (res.error) {
                T.notify('Mở khóa giao dịch sinh viên bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(res.error);
            } else {
                done && done();
                T.notify('Mở khóa giao dịch sinh viên thành công!', 'success');
            }
        });
    };
}

export const SelectAdapter_TcDotDong = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/khtc/dot-dong/page/1/50',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getTcDotDong(id, item => done && done({ id: item.id, text: item.ten })))(),
};