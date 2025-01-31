
import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TcHocPhiGetPage = 'TcHocPhi:GetPage';
const TcHocPhiGet = 'TcHocPhi:GetHocPhi';
const TcHocPhiAll = 'TcHocPhi:All';
const TcHocPhiUpdate = 'TcHocPhi:Update';
const TcHocPhiGetHuongDan = 'TcHocPhi:GetHuongDan';
const TcGetHoaDonHocPhi = 'TcHocPhi:Get';
const TcHocPhiGetDetail = 'TcHocPhi:GetDetailSinhVien';
export default function TcHocPhiReducers(state = null, data) {
    switch (data.type) {
        case TcHocPhiGetPage:
            return Object.assign({}, state, { page: data.page });
        case TcHocPhiGet:
            return Object.assign({}, state, { data: data.result });
        case TcHocPhiAll:
            return Object.assign({}, state, { dataAll: data.result });
        case TcHocPhiGetHuongDan:
            return Object.assign({}, state, { hocPhiHuongDan: data.result });
        case TcGetHoaDonHocPhi:
            return Object.assign({}, state, { data: data.result });
        case TcHocPhiGetDetail:
            return Object.assign({}, state, { hocPhiDetail: data.data.hocPhiDetail, hocPhiTong: data.data.hocPhiTong });
        case TcHocPhiUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].mssv == updatedItem.mssv) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].mssv == updatedItem.mssv) {
                            updatedItem['hoTenSinhVien'] = updatedPage.list[i]['hoTenSinhVien'];
                            updatedPage.list[i] = updatedItem;
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

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('pageTcHocPhi');
export function getTcHocPhiPage(pageNumber, pageSize, pageCondition, pageFilter, done) {
    const page = T.updatePage('pageTcHocPhi', pageNumber, pageSize, pageCondition, pageFilter);
    return dispatch => {
        const url = `/api/khtc/page/${page.pageNumber}/${page.pageSize}`;
        dispatch({ type: TcHocPhiGetPage, page: null });
        T.get(url, { searchTerm: pageCondition, filter: pageFilter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phí bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: TcHocPhiGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getStatisticTcHocPhi(filter, done) {
    const url = '/api/khtc/statistic';
    T.get(url, { filter }, result => {
        if (result.error) {
            T.notify('Thống kê bị lỗi', 'danger');
            console.error(result.error);
        }
        else {
            done && done(result);
        }
    });
}

export function getTcHocPhiTransactionByMssv(mssv, done) {
    return () => {
        const url = `/api/khtc/hoc-phi-transactions/${mssv}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy các đợt thanh toán của sinh viên bị lỗi', 'danger');
                console.error(result.error);
            }
            else {
                done(result);
            }
        });
    };
}

export function createMultipleHocPhi(data, done) {
    return dispatch => {
        const url = '/api/khtc/hoc-phi/multiple';
        T.post(url, { data }, (data) => {
            if (!data.error) {
                dispatch({ type: TcHocPhiUpdate, item: data.item });
                done && done();
            } else {
                T.notify('Lưu danh sách học phí có lỗi', 'danger');
            }
        });
    };
}

export function updateTrangThai(item, changes, done) {
    return () => {
        const url = '/api/khtc/hoc-phi/trang-thai';
        T.put(url, { item, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật trạng thái sinh viên bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật trạng thái sinh viên thành công!', 'success');
                // dispatch({ type: TcHocPhiUpdate, item: data.item });
                done && done();
            }
        }, () => T.notify('Cập nhật trạng thái sinh viên bị lỗi!', 'danger'));
    };
}

export function getTcHocPhiHuongDan(done) {
    return dispatch => {
        const url = '/api/khtc/huong-dan-dong-hoc-phi';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy các hướng dẫn đóng học phí bị lỗi', 'danger');
                console.error(result.error);
            }
            else {
                dispatch({ type: TcHocPhiGetHuongDan, result: result?.hocPhiHuongDan });
                done && done(result);
            }
        });
    };
}

export function getAllHocPhiStudent(mssv, done) {
    return dispatch => {
        const url = '/api/khtc/user/get-all-hoc-phi';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
                dispatch({ type: TcHocPhiAll, result });
            }
        });
    };
}

export function getHocPhi(mssv, done) {
    return dispatch => {
        const url = '/api/khtc/user/hoc-phi';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
                dispatch({ type: TcHocPhiGet, result });
            }
        });
    };
}

export function getHoaDonDetail(data, done, onError) {
    return () => {
        const url = '/api/khtc/invoice/detail';
        T.get(url, data, response => {
            if (response.error) {
                T.notify('Lỗi khi lấy thông tin hóa đơn! ' + (response.error.message || ''), 'danger');
                onError && onError();
                console.error(response.error);
            } else {
                done && done(response.result);
            }
        });
    };
}

export function createInvoice(mssv, hocKy, namHoc, loaiPhi, done, onError) {
    return () => {
        const url = '/api/khtc/invoice';
        T.post(url, { mssv, hocKy, namHoc, loaiPhi }, res => {
            if (res.error) {
                T.notify('Tạo hóa đơn lỗi', 'danger');
                console.error(`GET: ${url}.`, res.error);
                onError && onError();
            }
            else {
                T.notify('Tạo hóa đơn thành công', 'success');
                // dispatch(getTongGiaoDichPage());
                done && done(res.item);
            }
        }, () => T.notify('Tạo hóa đơn lỗi', 'danger'));
    };
}

export function getStudentHocPhi(mssv, namHoc, hocKy, done) {
    return () => {
        const url = `/api/khtc/hoc-phi/item/${mssv}`;
        T.get(url, { namHoc, hocKy }, res => {
            if (res.error) {
                T.notify('Lấy dữ liệu học phí lỗi. ' + (res.error.errorMessage && typeof res.error.errorMessage === 'string' ? res.error.errorMessage : ''), 'danger');
                console.error(`GET: ${url}.`, res.error);
            }
            else {
                T.notify('Lấy dữ liệu học phí thành công', 'success');
                done && done(res.hocPhi, res.transaction);
            }
        }, () => T.notify('Lấy dữ liệu học phí lỗi', 'danger'));
    };
}

export function getLengthRemindMail(filter, done, onError) {
    const url = '/api/khtc/hoc-phi/remind-mail/length';
    return () => {
        T.post(url, filter, res => {
            if (res.error) {
                T.notify('Lấy dữ liệu sinh viên nợ học phí lỗi ' + (res.error.errorMessage && typeof res.error.errorMessage === 'string' ? res.error.errorMessage : ''), 'danger');
                console.error(`POST: ${url}.`, res.error);
                onError && onError();
            } else {
                done && done(res);
            }
        });
    };
}

export function sendRemindMail(filter, done, onError) {
    const url = '/api/khtc/hoc-phi/remind-mail';
    return () => {
        T.post(url, filter, res => {
            if (res.error) {
                T.notify('Không gửi thành công email', 'danger');
                console.error(`POST: ${url}.`, res.error);
                onError && onError();
            }
            else {
                T.notify('Gửi email nhắc nợ thành công', 'success');
                done && done(res);
            }
        });
    };
}

export function getDetailHocPhiSinhVien(data, done, onError) {
    return dispatch => {
        const url = '/api/khtc/get-hoc-phi-sinh-vien';
        T.get(url, { data }, res => {
            if (res.error) {
                T.notify('Lấy thông tin chi tiết học phí lỗi', 'danger');
                onError && onError();
            }
            else {
                done && done(res);
                dispatch({ type: TcHocPhiGetDetail, data: { hocPhiDetail: res.hocPhiDetail, hocPhiTong: res.hocPhiTong } });

            }
        }, (error) => T.notify('Cập nhật thông tin học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSubDetailHocPhi(data, done) {
    return () => {
        const url = '/api/khtc/hoc-phi-sub-detail/all';
        T.get(url, { data }, result => {
            if (result.error) {
                T.notify('Lấy thông tin chi tiết học phí lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function updateActiveLoaiPhi(data, value, done) {
    return dispatch => {
        const url = '/api/khtc/hoc-phi/active-loai-phi';
        T.put(url, { data, value }, result => {
            if (result.error) {
                T.notify('Lấy thông tin chi tiết học phí lỗi', 'danger');
                console.error(result.error);
            } else {
                const cookie = T.updatePage('pageTcHocPhi');
                const { pageNumber, pageSize, pageCondition, filter } = cookie;
                done && done();
                dispatch(getTcHocPhiPage(pageNumber, pageSize, pageCondition, filter));
                dispatch(getDetailHocPhiSinhVien({ mssv: data.mssv, namHoc: data.namHoc, hocKy: data.hocKy }));

            }
        }, (error) => T.notify('Cập nhật thông tin học phí bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateXoaSoDuPsc(data, done) {
    return dispatch => {
        const url = '/api/khtc/hoc-phi/xoa-psc';
        T.put(url, data, result => {
            if (result.error) {
                T.notify('Xóa số dư PSC lỗi', 'danger');
                console.error(result.error);
            } else {
                const cookie = T.updatePage('pageTcHocPhi');
                const { pageNumber, pageSize, pageCondition, filter } = cookie;
                done && done(result);
                dispatch(getTcHocPhiPage(pageNumber, pageSize, pageCondition, filter));

            }
        }, (error) => T.notify('Xóa số dư PSC lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateLoaiTinhPhi(item, done) {
    return dispatch => {
        const url = '/api/khtc/hoc-phi/tat-tinh-phi';
        T.put(url, { item }, result => {
            if (result.error) {
                T.notify('Cập nhật loại tính phí lỗi', 'danger');
                console.error(result.error);
            } else {
                const cookie = T.updatePage('pageTcHocPhi');
                const { pageNumber, pageSize, pageCondition, filter } = cookie;
                // T.notify('Cập nhật loại tính phí thành công', 'success');
                done && done(result);
                dispatch(getTcHocPhiPage(pageNumber, pageSize, pageCondition, filter));

            }
        }, (error) => T.notify('Cập nhật loại tính phí lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDataBhyt(item, done) {
    return () => {
        const url = '/api/khtc/hoc-phi/bhyt/data';
        T.get(url, { item }, result => {
            if (result.error) {
                T.notify('Lấy thông tin BHYT lỗi', 'danger');
                console.error(result);
            } else {
                done && done(result);
            }
        }, (error) => T.notify('Lấy thông tin BHYT lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDienDongBhyt(data, done) {
    return (dispatch) => {
        const url = '/api/khtc/hoc-phi/bhyt/change-dien-dong';
        T.post(url, data, result => {
            if (result.error) {
                T.notify('Thay đổi diện đóng BHYT lỗi', 'danger');
                console.error(result);
            } else {
                const cookie = T.updatePage('pageTcHocPhi');
                const { pageNumber, pageSize, pageCondition, filter } = cookie;
                // T.notify('Cập nhật loại tính phí thành công', 'success');
                done && done(result);
                dispatch(getTcHocPhiPage(pageNumber, pageSize, pageCondition, filter));
                done && done(result);
            }
        }, (error) => T.notify('Thay đổi diện đóng BHYT lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function sendThongBaoHocPhiLength(data, done) {
    return () => {
        const url = '/api/khtc/hoc-phi/thongBao/length';
        T.post(url, data, result => {
            if (result.error) {
                T.notify('Gửi thông báo học phí lỗi', 'danger');
                console.error(result);
            } else {
                done && done(result);
            }
        }, (error) => T.notify('Gửi thông báo học phí lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function sendThongBaoHocPhi(data, done) {
    return () => {
        const url = '/api/khtc/hoc-phi/thongBao';
        T.post(url, data, result => {
            if (result.error) {
                T.notify('Gửi thông báo học phí lỗi', 'danger');
                console.error(result);
            } else {
                done && done(result);
            }
        }, (error) => T.notify('Gửi thông báo học phí lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}