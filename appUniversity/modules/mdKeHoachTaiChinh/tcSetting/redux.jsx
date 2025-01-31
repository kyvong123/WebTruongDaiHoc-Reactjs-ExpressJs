import T from 'view/js/common';
const listKeys = ['hocPhiNamHoc', 'hocPhiHocKy', 'email', 'tcAddress',
    'tcPhone', 'tcEmail', 'tcSupportPhone',
    'hocPhiEmailDongTitle', 'hocPhiEmailDongEditorText', 'hocPhiEmailDongEditorHtml',
    'hocPhiEmailPhatSinhTitle', 'hocPhiEmailPhatSinhEditorText', 'hocPhiEmailPhatSinhEditorHtml',
    'hocPhiEmailHoanTraTitle', 'hocPhiEmailHoanTraEditorText', 'hocPhiEmailHoanTraEditorHtml',
    'hocPhiSmsDong', 'hocPhiSmsPhatSinh', 'hocPhiSmsHoanTra',
    'hocPhiEmailNhacNhoTitle', 'hocPhiEmailNhacNhoEditorText', 'hocPhiEmailNhacNhoEditorHtml',
    'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'hocPhiEmailTraHoaDonEditorHtml',
    'autoDinhPhi', 'dungSoTien', 'emailInvoice',
    'thueEmailDongTitle', 'thueEmailDongEditorText', 'thueEmailDongEditorHtml'
];
// Reducer ------------------------------------------------------------------------------------------------------------
const TcSettingAll = 'TcSettingAll';
const TcSettingUpdate = 'TcSettingUpdate';
const TcSettingAllMail = 'TcSetting:AllMail';

export default function TcSettingReducer(state = null, data) {
    switch (data.type) {
        case TcSettingAll:
            return Object.assign({}, state, { items: data.item });
        case TcSettingAllMail:
            return Object.assign({}, state, { mails: data.items });
        case TcSettingUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].mssv == updatedItem.mssv) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems });
            } else {
                return null;
            }

        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
export function getTcSettingAll(done) {
    return dispatch => {
        const url = '/api/khtc/setting/all';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TcSettingAll, items: result.items });
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

export function getTcSettingKeys(keys, done) {
    return dispatch => {
        const url = '/api/khtc/setting/keys';
        T.get(url, { keys: keys.join(',') }, result => {
            if (result.error) {
                T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: TcSettingAll, item: result.items });

                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
    };
}

// export function getTcSetting(key, done) {
//     return dispatch => {
//         const url = '/api/khtc/setting';
//         T.get(url, { key }, result => {
//             if (result.error) {
//                 T.notify('Lấy thống tin cấu hình bị lỗi', 'danger');
//                 console.error(result.error);
//             } else {
//                 dispatch({ type: TcSettingUpdate, item: result.item });
//                 done && done(result.item);
//             }
//         }, () => T.notify('Lấy thông tin cấu hình bị lỗi!', 'danger'));
//     };
// }

export function updateTcSetting(changes, done) {
    return dispatch => {
        const url = '/api/khtc/setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Cập nhật thống tin cấu hình bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Cập nhật thông tin cấu hình thành công!', 'success');
                dispatch({ type: TcSettingUpdate, item: result.item });
                done && done(result.item);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình bị lỗi!', 'danger'));
    };
}
export function updateAutoDinhPhi(changes, done) {
    return dispatch => {
        const url = '/api/khtc/setting/change-auto-dinh-phi';
        T.put(url, { changes }, result => {
            if (result.error == 100) {
                T.notify('Chưa có đợt đóng học phí', 'danger');
                dispatch(getTcSettingKeys);
                done && done(result);
            } else if (result.error) {
                T.notify('Kích hoạt tự động định phí lỗi', 'danger');
                done && done(result);
            } else {
                T.notify('Thay đổi chế độ định phí thành công', 'success');
                dispatch(getTcSettingKeys(listKeys));
                done && done(result);
            }
        }, () => T.notify('Cập nhật thông tin cấu hình bị lỗi!', 'danger'));
    };
}
export function deleteTcSetting(key, done) {
    return dispatch => {
        const url = '/api/khtc/setting';
        T.delete(url, { key }, result => {
            if (result.error) {
                T.notify('Xóa thống tin cấu hình bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${result.error}`);
                done && done(result.error);
            } else {
                T.notify('Xóa thông tin cấu hình thành công!', 'success');
                dispatch(getTcSettingAll());
                done && done();
            }
        }, () => T.notify('Xóa thông tin cấu hình bị lỗi!', 'danger'));
    };
}


export function getAllMail(done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/khtc/setting/mail/all';
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Lấy thông tin email lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                dispatch({ type: TcSettingAllMail, items: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin email lỗi', 'danger') || (onFinish && onFinish()) || (onError && onError()));
    };
}


export function getMailUrl(mail, done, onFinish, onError) {
    return () => {
        const url = '/api/khtc/setting/mail/url';
        T.get(url, { mail }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Lấy url xác thực email lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.authUrl);
            }
        }, () => T.notify('Lấy url xác thực email lỗi', 'danger') || (onFinish && onFinish()) || (onError && onError()));
    };
}
