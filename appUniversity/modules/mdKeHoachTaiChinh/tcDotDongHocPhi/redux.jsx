import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcDotDongHocPhiGetPage = 'TcDotDongHocPhi:GetPage';
const TcDotDongHocPhiGetItem = 'TcDotDongHocPhi:GetItem';

export default function TcDotDongHocPhiReducer(state = null, data) {
    switch (data.type) {
        case TcDotDongHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcDotDongHocPhiGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageTcDotDongHocPhi';
T.initPage(PageName);
export function getTcDotDongHocPhiPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/khtc/dot-dong-hoc-phi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TcDotDongHocPhiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createTcDotDongHocPhi(item, done) {
    return dispatch => {
        const url = '/api/khtc/dot-dong-hoc-phi';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify('Tạo đợt đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo đợt đóng học phí thành công!', 'success');
                done && done(data.item);
                dispatch(getTcDotDongHocPhiPage());
            }
        }, (error) => T.notify('Tạo đợt đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteTcDotDongHocPhi(idDotDong) {
    return dispatch => {
        const url = '/api/khtc/dot-dong-hoc-phi';
        T.delete(url, { idDotDong }, data => {
            if (data.error) {
                T.notify('Xóa đợt đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                dispatch(getTcDotDongHocPhiPage());
            }
        }, (error) => T.notify('Xóa đợt đóng bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateTcDotDongHocPhi(keys, changes, done) {
    return dispatch => {
        const url = '/api/khtc/dot-dong-hoc-phi';
        T.put(url, { keys, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật đợt đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật đợt đóng học phí thành công!', 'success');
                done && done();
                dispatch(getTcDotDongHocPhiPage());
            }
        }, (error) => T.notify('Cập nhật đợt đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getListLoaiPhi(id, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/get-loai-phi';
        T.post(url, id, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                // T.notify('Lấy danh sách loại phí thành công!', 'success');
                done && done(data.item);
            }
        }, (error) => T.notify('Lấy danh sách loại phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateListLoaiPhi(idDotDong, namHoc, hocKy, listLoaiPhi, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/cap-nhat-loai-phi';
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

export function getLengthApplyDotDong(filter, done) {
    const url = '/api/khtc/dot-dong-hoc-phi/ap-dung-dot-dong/length';
    return () => {
        T.post(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (data.error.errorMessage && typeof data.error.errorMessage === 'string' ? data.error.errorMessage : ''), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data.length);
            }
        });
    };
}

export function applyDotDong(listLoaiPhi, filter, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/ap-dung-dot-dong';
        T.post(url, { listLoaiPhi, filter }, data => {
            if (data.error) {
                T.notify('Áp dụng đợt đóng học phí bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Áp dụng đợt đóng học phí thành công!', 'success');
                done && done();
            }
        }, (error) => T.notify('Áp dụng đợt đóng học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getListSinhVienDongHocPhi(listLoaiPhi, filter, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/ap-dung-hoc-phi/length';
        T.post(url, { listLoaiPhi, filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data.length);
            }
        }, (error) => T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function sendMailPhatSinh(filter, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/mail-phat-sinh';
        T.post(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Gửi e-mail phát sinh học phí thành công!', 'success');
                done && done();
            }
        }, (error) => T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getLengthMailPhatSinh(filter, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/mail-phat-sinh/length';
        T.post(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data.length);
            }
        }, (error) => T.notify('Lấy dữ liệu sinh viên bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}
export function getTcDotDongHocPhi(id, done) {
    return () => {
        const url = `/api/khtc/dot-dong-hoc-phi/item/${id}`;
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

export function rollBackDotDongGetLength(filter, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/roll-back/length';
        T.post(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy số lượng sinh viên hoàn tác đợt đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data.length);
            }
        }, error => console.error(`POST: ${url}.`, error));
    };
}

export function rollBackDotDong(filter, done) {
    return () => {
        const url = '/api/khtc/dot-dong-hoc-phi/roll-back';
        T.post(url, { filter }, data => {
            if (data.error) {
                T.notify('Hoàn tác đợt đóng bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done();
            }
        }, error => console.error(`POST: ${url}.`, error));
    };
}

export const SelectAdapter_TcDotDongHocPhi = {
    ajax: true,
    data: params => ({ condition: params.term }),
    url: '/api/khtc/dot-dong-hoc-phi/page/1/50',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getTcDotDongHocPhi(id, item => done && done({ id: item.id, text: item.ten })))(),
};