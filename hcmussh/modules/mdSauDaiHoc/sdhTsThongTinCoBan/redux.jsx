import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const svTsSdhGetPage = 'svTsSdh:GetPage';
const svTsSdhUpdate = 'svTsSdh:Update';
const svTsSdhUserGet = 'svTsSdh:UserGet';
const svTsSdhGetEditPage = 'svTsSdh:GetEditPage';

export default function svTsSdhReducer(state = null, data) {
    switch (data.type) {
        case svTsSdhGetPage:
            return Object.assign({}, state, { page: data.page });
        case svTsSdhUserGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case svTsSdhGetEditPage:
            return Object.assign({}, state, { items: data.items });
        case svTsSdhUpdate:
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
        default:
            return state;
    }
}

//ACTIONS--------------------------------------------------------------------------------------------------

//Admin -----------------------------------------------------------------------------------------------------
T.initPage('pageSvTsSdhAdmin');
export function getSvTsSdhPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageSvTsSdhAdmin', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/tuyen-sinh/sinh-vien/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter, sortTerm }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyển sinh sau đại học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: svTsSdhGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách tuyển sinh sau đại học bị lỗi!', 'danger'));
    };
}



export function deleteSvTsSdhAdmin(mssv, done) {
    return dispatch => {
        const url = '/api/sdh/tuyen-sinh/sinh-vien';
        T.delete(url, { mssv }, data => {
            if (data.error) {
                T.notify('Xoá sinh viên sau đại học không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done();
                dispatch({ type: svTsSdhGetPage });
            }
        });
    };
}

export function createTsSdh(dataXacThuc, studentData, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky';
        T.post(url, { studentData, dataXacThuc }, (data) => {
            if (data.error) {
                done && done({ err: data.error });
            } else {
                T.notify('Tạo mới sinh viên thành công', 'success');
                done && done({ result: data.item });
            }
        });
    };
}

export function createTsSdhAdmin(data, done) {
    return () => {
        const url = '/api/sdh/dsts/new';
        T.post(url, { data }, (data) => {
            if (data.error) {
                T.notify('Tạo mới hồ sơ không thành công' + (data?.error?.message ? (':<br>' + data?.error?.message) : ''), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới hồ sơ thành công', 'success');
                done && done(data.item);
            }
        });
    };
}
export function sendMailXacNhanDangKy(data, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky/send-mail-confirm';
        T.post(url, { data }, (item) => {
            if (item.error) {
                T.notify('Gửi mail xác nhận không thành công' + (item?.error?.message ? (':<br>' + item?.error?.message) : ''), 'danger');
                console.error(`POST: ${url}.`, item.error);
            } else {
                T.notify('Vui lòng kiểm tra email để xác nhận tài khoản', 'success');
                done && done(item);
            }
        });
    };
}
export function sendMailThongTinDangNhap(data, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky/send-mail/thong-tin-dang-nhap';
        T.post(url, { data }, (item) => {
            if (item.error) {
                T.notify('Gửi mail thông tin đăng nhập không thành công' + (item?.error?.message ? (':<br>' + item?.error?.message) : ''), 'danger');
                console.error(`POST: ${url}.`, item.error);
            } else {
                done && done();
            }
        });
    };
}
export function confirmDangKy(maTruyXuat, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky/confirm';
        T.post(url, { maTruyXuat }, (data) => {
            if (data.error) {
                T.notify('Xác nhận không thành công' + (data?.error?.message ? (':<br>' + data?.error?.message) : ''), 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Xác nhận đăng ký thành công', 'success');
                done && done();
            }
        });
    };
}




export const PageName = 'pageSdhDanhSachTS';
T.initPage(PageName);
export function getSdhDanhSachTSPage(pageNumber, pageSize, pageCondition, filter, sortTerm, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/dsts/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tuyển sinh bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: svTsSdhGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách tuyển sinh bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}


export function deleteThiSinh(id, done) {
    return () => {
        const url = '/api/sdh/dsts/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin thí sinh không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa thông tin thí sinh thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function multiDeleteThiSinh(lst, done) {
    return () => {
        const url = '/api/sdh/dsts/multi-delete';
        T.delete(url, { lst }, data => {
            if (data.error) {
                T.notify(`Xóa thông tin của ${lst.length} thí sinh không thành công!`, 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify(`Xóa thông tin của ${lst.length} thí sinh thành công!`, 'success');
                done && done(data.item);
            }
        });
    };
}

export function getSbdSettingTsSdh(done) {
    return () => {
        const url = '/api/sdh/dsts/sbd/setting';
        T.get(url, data => {
            if (data.error) {
                T.notify('Chưa có cấu hình số báo danh', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.data);
            }
        });
    };
}

export function getAccountById(id, done) {
    return () => {
        const url = `/api/sdh/dsts/account/data/${id}`;
        T.get(url, rs => {
            done && done(rs);
        });
    };
}
export function updateSbdSettingTsSdh(changes, done) {
    return () => {
        const url = '/api/sdh/dsts/sbd/setting';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Lỗi cập nhật cấu hình số báo danh!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật cấu hình số báo danh thành công!', 'success');
                done && done();
            }
        });
    };
}

export function genSbdTsSdh(id, changes, genNull, done) {
    return () => {
        const url = '/api/sdh/dsts/sbd/gen';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                genNull ? T.notify(`Xóa số báo danh không thành công! ${data.error.message}`, 'danger') : T.notify(`Tạo số báo danh không thành công! ${data.error.message}`, 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                genNull ? T.notify('Xóa số báo danh thành công!', 'success') : T.notify('Tạo số báo danh thành công!', 'success');
                done && done(data.item);

            }
        });
    };
}
export function autoGenSbdTsSdh(sbdSetting, items, genNull, done) {
    return () => {
        const url = '/api/sdh/dsts/sbd/auto-gen';
        T.put(url, { sbdSetting, items, genNull }, data => {
            if (data.error) {
                genNull ? T.notify(`Xóa số báo danh cho ${items.length} thí sinh không thành công!`, 'danger') : T.notify(`Tạo số báo danh cho ${items.length} thí sinh không thành công!`, 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                genNull ? T.notify(`Xóa số báo danh cho ${items.length} thí sinh thành công!`, 'success') : T.notify(`Tạo số báo danh cho ${items.length} thí sinh thành công!`, 'success');
                done && done(data.item);
            }
        });
    };
}

export function getSdhThiSinhById(id, done) {
    return () => {
        const url = `/api/sdh/dsts/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin thí sinh không thành công' + (data.error.message && (':<br>' + data.error.message) || ''), 'danger');
                console.error(`GET: ${url}.`, data.error);
                done && done(data);

            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin thí sinh đăng ký bị lỗi!', 'danger'));
    };
}



export function deleteData(id, type, item, done) {
    return () => {
        const url = '/api/sdh/dsts/item';

        T.delete(url, { id, item }, data => {
            if (data.error) {
                T.notify(`Xóa thông tin ${type} không thành công!`, 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify(`Xóa thông tin ${type} thành công!`, 'success');
                done && done(data.item);
            }
        });
    };
}

export function updateThiSinh(inData, changes, done) {
    return () => {
        const url = '/api/sdh/dsts/update';
        T.put(url, { inData, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin thí sinh không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin thí sinh thành công!', 'success');
                done && done();
            }
        });
    };
}
export function resetPassword(inputData, done) {
    return () => {
        const url = '/api/sdh/dsts/reset/password';
        T.put(url, { inputData }, data => {
            if (data.error) {
                T.notify('Cập nhật password thí sinh không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật password thí sinh thành công!', 'success');
                done && done();
            }
        });
    };
}
export function updateMultiThiSinh(list, changes, done) {
    return () => {
        const url = '/api/sdh/dsts/update-multiple';

        T.put(url, { list, changes }, data => {
            if (data.error) {
                T.notify(`Cập nhật thông tin ${list.length} thí sinh không thành công!`, 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify(`Cập nhật thông tin ${list.length} thí sinh thành công!`, 'success');
                done && done();
            }
        });
    };
}

export function ttcbSendMailDangKy(studentData, ttcbCreated, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky/send-mail';
        T.put(url, { studentData, ttcbCreated }, data => {
            if (data.error) {
                T.notify('Gửi email không thành công!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                console.debug('Gửi email thành công');
                done && done();
            }
        });
    };
}
export function sdhTsSendMailPhanHoi(data, done) {
    return () => {
        const url = '/api/sdh/dsts/send-mail';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Gủi phản hồi không thành công!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Gửi phản hồi thành công!', 'success');
                done && done();
            }
        });
    };
}
export function sdhTsSendMailPhanHoiMultiple(data, done) {
    return () => {
        const url = '/api/sdh/dsts/send-mail/multiple';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Gủi phản hồi không thành công!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Gửi phản hồi thành công!', 'success');
                done && done();
            }
        });
    };
}

export function getSdhKetQuaDangKy(maTruyXuat, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky/detail';
        T.get(url, { maTruyXuat }, data => {
            if (data.error) {
                T.notify('Lấy thông tin đăng ký không thành công: ' + data.error.message, 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done(data.data);
            }
        }, () => T.notify('Lấy thông tin thí sinh đăng ký bị lỗi!', 'danger'));
    };
}

export function updateDataBMDK(id, changes, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky/update';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin đăng ký không thành công!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin đăng ký thành công!', 'success');
                done && done(data.item);
            }
        });
    };
}
export function deleteDataBMDK(id, type, item, done) {
    return () => {
        const url = '/api/sdh/bieu-mau-dang-ky/update';
        T.delete(url, { id, item }, data => {
            if (data.error) {
                T.notify(`Xóa thông tin đăng ký ${type} không thành công!`, 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify(`Xóa thông tin đăng ký ${type} thành công!`, 'success');
                done && done(data.item);
            }
        });
    };
}
export function createSdhTsDsts(createData, fileName, done) {
    return () => {
        const url = '/api/sdh/ts/dsts/multiple';
        T.post(url, { createData, fileName }, (data) => {
            if (data.error) {
                T.notify('Tạo mới thí sinh bị lỗi', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                // T.notify('Tạo mới thí sinh thành công', 'success');
                // T.FileSaver(new Blob([new Uint8Array(data.buffer.data)]), `uploadLog_${Date.now()}.txt`);
                done && done();
            }
        });
    };
}
export function getGioiTinhAll(condition, done) {
    return () => {
        const url = '/api/sdh/guest/gioi-tinh/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, (error) => T.notify('Lấy danh sách giới tính bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getSdhThiSinhByMaTruyXuat(maTruyXuat, done) {
    return () => {
        const url = '/api/sdh/bmdk/ma-truy-xuat';
        T.get(url, { maTruyXuat }, data => {
            if (data.error) {
                T.notify('Lấy thông tin đăng ký không thành công: ' + data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin thí sinh đăng ký bị lỗi!', 'danger'));
    };
}

export function getGioiTinhByMa(ma, done) {
    return () => {
        const url = `/api/sdh/bmdk/gioi-tinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin giới tính bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
//Dùng trong select adapter trang home ko check quyền (guest)
export function getSdhBmdkNganhByIdNganh(idNganh, done) {
    return () => {
        const url = `/api/sdh/bmdk/nganh/item/${idNganh}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function getSdhBmdkMonThiByMa(ma, done) {
    return () => {
        const url = `/api/sdh/bmdk/mon-thi/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function getSdhBmdkDoiTuongUuTienByMa(ma, done) {
    return () => {
        const url = `/api/sdh/bmdk/doi-tuong-uu-tien/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhBmdkCbhdByShcc(shcc, done) {
    return () => {
        const url = '/api/sdh/bmdk/cbhd/item';
        T.get(url, { shcc }, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSdhBmdkDmQuocGiaByMa(maCode, done) {
    return () => {
        const url = `/api/sdh/bmdk/dm-quoc-gia/item/${maCode}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function getSdhBmdkDmDanToc(ma, done) {
    return () => {
        const url = `/api/sdh/bmdk/dm-dan-toc/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function preCheckEmailRegister(data, done) {
    return () => {
        const url = '/api/sdh/ts/dang-ky-ho-so/check-email';
        T.get(url, { data }, (result) => {
            if (result.error) {
                T.notify('Email này đã được sử dụng cho phân hệ hiện tại, xin vui lòng sử dụng email khác!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result);
            }
        });
    };
}
export function preCheckTargetPhanHe(dataCoBan, phanHeTarget, done) {
    return () => {
        const url = '/api/sdh/ts/ho-so/check-phan-he';
        T.get(url, { dataCoBan, phanHeTarget }, ({ result }) => {
            if (result.error) {
                T.notify('Email này đã được sử dụng cho phân hệ hiện tại, xin vui lòng sử dụng email khác!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result);
            }
        });
    };
}
export function getNoiSinhByMa(ma, done) {
    return () => {
        const url = `/api/sdh/dsts/noi-sinh/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
export function lockEditDsts(data, done) {
    return () => {
        const url = '/api/sdh/dsts/lock';
        T.put(url, { data }, result => {
            if (result.error) {
                console.error(`PUT: ${url}.`, result.error);
            } else {
                done && done();
            }
        }, error => console.error(`PUT: ${url}.`, error));
    };
}

export function handleLogin(data, done) {
    return () => {
        const url = '/api/sdh/login';
        T.post(url, { data }, result => {
            if (result.error) {
                console.error(result.error);
                done(result);
            } else {
                done && done();
            }
        });
    };
}

export function handleForgetPassword(data, done) {
    return () => {
        const url = '/api/sdh/forget-password';
        T.post(url, { data }, result => {
            if (result.error) {
                console.error(result.error);
                done && done(result);

            } else {
                T.notify('Đổi mật khẩu thành công!', 'success');
                done && done();
            }
        });
    };
}
export function confirmCode(data, done) {
    return () => {
        const url = '/api/sdh/confirm-code';
        T.post(url, { data }, result => {
            if (result.error) {
                console.error(result.error);
                done && done(result);
            } else {
                done && done(result);
            }
        });
    };
}


export function exportDstsExcel(data, done) {
    return () => {
        const url = '/api/sdh/dsts/download-excel';
        T.post(url, { data }, () => {
            if (data.error) {
                T.notify('Export danh sách thí sinh bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done();
            }
        });
    };
}

export function exportPdf(data, done) {
    return () => {
        T.post('/api/sdh/dsts/export', { data }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            }
        });
        done && done();
    };
}


//nganh by ph
export const SelectAdapter_ChkttsNganh = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/bmdk/nganh/adapter',
        data: params => ({ searchTerm: params.term, filter }),
        processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: T.stringify(item), text: `${item.maVietTat ? item.maVietTat : item.ma}: ${item.ten}` })) : [] }),
        fetchOne: (id, done) => (getSdhBmdkNganhByIdNganh(id, item => item && done && done({ id: item.id, text: `${item.maVietTat ? item.maVietTat : item.ma}: ${item.ten}` })))(),
    };
};
//nganh by dot
export const SelectAdapter_ChkttsNganhNew = (idDot) => {
    return {
        ajax: true,
        url: '/api/sdh/bmdk/nganh-by-dot/adapter',
        data: params => ({ searchTerm: params.term, idDot }),
        processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: `${item.maVietTat ? item.maVietTat : item.ma}: ${item.ten}` })) : [] }),
        fetchOne: (id, done) => (getSdhBmdkNganhByIdNganh(id, item => item && done && done({ id: item.id, text: `${item.maVietTat ? item.maVietTat : item.ma}: ${item.ten}` })))(),
    };
};
export const SelectAdapter_BmdkGioiTinh = {
    ajax: true,
    url: '/api/sdh/bmdk/gioi-tinh/adapter',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: JSON.parse(item.ten).vi })) : [] }),
    fetchOne: (id, done) => (getGioiTinhByMa(id, item => item && done && done({ id: item.ma, text: JSON.parse(item.ten).vi })))(),

};
export const SelectAdapter_BmdkDoiTuongUuTien = {
    ajax: true,
    url: '/api/sdh/bmdk/doi-tuong-uu-tien/adapter',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
    fetchOne: (id, done) => (getSdhBmdkDoiTuongUuTienByMa(id, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))(),

};
export const SelectAdapter_BmdkDmQuocGia = {
    ajax: true,
    url: '/api/sdh/bmdk/dm-quoc-gia/page/1/50',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maCode, text: `${item.maCode}: ${item.tenKhac ? item.tenKhac : item.country}` })) : [] }),
    fetchOne: (id, done) => (getSdhBmdkDmQuocGiaByMa(id, item => item && done && done({ id: item.maCode, text: `${item.maCode}: ${item.tenKhac ? item.tenKhac : item.country}` })))(),

};
export const SelectAdapter_BmdkDanToc = {
    url: '/api/sdh/bmdk/dm-dan-toc/page/1/50',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getSdhBmdkDmDanToc(ma, item => done && done({ id: item.ma, text: item.ten })))(),

};

export const SelectAdapter_BmdkMonThiNgoaiNgu = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/bmdk/mon-thi-ngoai-ngu/adapter',
        data: params => ({ searchTerm: params.term, filter }),
        processResults: response => ({ results: response && response.page && response.page.list.length ? response.page.list.filter(item => item.isNgoaiNgu && item.kichHoat).map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
        fetchOne: (id, done) => (getSdhBmdkMonThiByMa(id, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))(),
    };
};

export const SelectAdapter_CanBoHuongDan = {
    url: '/api/sdh/bmdk/cbhd/adapter',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.shcc, text: `${item.tenHocHam || ''} ${item.tenHocVi || ''} ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (id, done) => (getSdhBmdkCbhdByShcc(id, item => item && done && done({ id: item.shcc, text: `${item.tenHocHam || ''} ${item.tenHocVi || ''} ${item.hoTen}` })))(),
};
//temp cho table head lọc 1 cột nơi sinh, sửa sau 22
export const SelectAdapter_NoiSinh = {
    url: '/api/sdh/dsts/noi-sinh/adapter',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: `${item.ten}` })) : [] }),
    fetchOne: (id, done) => (getNoiSinhByMa(id, item => item && done && done({ id: item.ma, text: `${item.ten}` })))(),
};

export const SelectAdapter_PhieuBaoHoSo = {
    url: '/api/sdh/dsts/phieu-bao-ho-so/adapter',
    data: params => ({ searchTerm: params.term }),
    processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.id, text: `${item.sbd}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (id, done) => (getSdhThiSinhById(id, item => item && done && done({ id: item.ma, text: `${item.sbd}: ${item.ho} ${item.ten}` })))(),
};



