const SvBHYTGetAll = 'SvBHYT:GetAll';
export default function svManageBhytReducer(state = null, data) {
    switch (data.type) {
        case SvBHYTGetAll:
            return Object.assign({}, state, { items: data.items, dataSinhVien: data.dataSinhVien });
        default:
            return state;
    }
}

export function getSvBaoHiemYTe(done) {
    return () => {
        const url = '/api/sv/bhyt';
        T.get(url, result => {
            if (result.error) {
                T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
            } else {
                done(result.item);
            }
        });
    };
}

// export function getSvBaoHiemYTeThongTin(done) {
//     return () => {
//         const url = '/api/sv/bhyt/thong-tin-ca-nhan';
//         T.get(url, result => {
//             if (result.error) {
//                 T.notify('Có lỗi hệ thống! Vui lòng báo để được hỗ trợ', 'danger');
//             } else {
//                 done(result.item);
//             }
//         });
//     };
// }

export function getSvBaoHiemYTeThongTin(done) {
    return dispatch => {
        const url = '/api/sv/bhyt/thong-tin-ca-nhan';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu BHYT lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: SvBHYTGetAll, items: result.items, dataSinhVien: result.dataSinhVien });
                done && done(result);
            }
        });
    };
}

export function getSvBaoHiemYTeLichSuDangKy(id, done) {
    return () => {
        const url = '/api/sv/bhyt/item-info';
        T.get(url, { id }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu BHYT lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function createSvBaoHiemYTeTanSinhVien(data, done) {
    return (dispatch) => {
        const url = '/api/sv/bhyt/tan-sinh-vien';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                done && done(result);
            } else {
                done && done(result.item);
                dispatch(getSvBaoHiemYTeThongTin());
                T.notify('Đăng ký thành công!', 'success');
            }
        });
    };
}

export function createSvBaoHiemYTe(data, done) {
    return (dispatch) => {
        const url = '/api/sv/bhyt/sinh-vien';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                done && done(result);
            } else {
                done && done(result.item);
                dispatch(getSvBaoHiemYTeThongTin());
                T.notify('Đăng ký thành công!', 'success');
            }
        });
    };
}

export function huyDangKySvBaoHiemYTe(maDangKy, done) {
    return (dispatch) => {
        const url = `/api/sv/bhyt/huy-dang-ky/${maDangKy}`;
        T.delete(url, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                done && done(result);
            } else {
                done && done(result.item);
                T.notify('Hủy đăng ký thành công!', 'success');
                dispatch(getSvBaoHiemYTeThongTin());
            }
        });
    };
}

export function updateSvBaoHiemYTeBhyt(id, changes, done) {
    return () => {
        const url = '/api/sv/bhyt';
        T.put(url, { id, changes }, result => {
            if (result.error) {
                T.notify(`${result.error?.message || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Cập nhật thành công!', 'success');
            }
            done && done(result);
        });
    };
}
