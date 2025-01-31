import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtThoiKhoaBieuGetAll = 'DtThoiKhoaBieu:GetAll';
const DtThoiKhoaBieuGetPage = 'DtThoiKhoaBieu:GetPage';
const DtThoiKhoaBieuUpdate = 'DtThoiKhoaBieu:Update';
const DtThoiKhoaBieuConfig = 'DtThoiKhoaBieu:Config';
const DtThoiKhoaBieuConfigUpdate = 'DtThoiKhoaBieu:ConfigUpdate';
const DtThoiKhoaBieuNull = 'DtThoiKhoaBieu:Null';
const DtThoiKhoaBieuResultGen = 'DtThoiKhoaBieu:ResultGen';
const DtThoiKhoaBieuThongKeGetPage = 'DtThoiKhoaBieuThongKe:GetPage';
const UpdateTinhTrangKhoa = 'DtThoiKhoaBieu:UpdateKhoa';

export default function dtThoiKhoaBieuReducer(state = null, data) {
    switch (data.type) {
        case DtThoiKhoaBieuNull:
            return Object.assign({});
        case DtThoiKhoaBieuConfigUpdate:
            if (state) {
                let currentState = Object.assign({}, state),
                    dataCanGen = currentState.dataCanGen;
                for (let i = 0, n = dataCanGen.length; i < n; i++) {
                    if (dataCanGen[i].id == data.item.id) {
                        dataCanGen.splice(i, 1, { ...dataCanGen[i], ...data.item });
                        break;
                    }
                }
                return Object.assign({}, state, currentState);
            } else {
                return null;
            }
        case DtThoiKhoaBieuConfig:
            return Object.assign({}, data.items);
        case DtThoiKhoaBieuResultGen:
            return Object.assign({}, state, data.items);
        case DtThoiKhoaBieuGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtThoiKhoaBieuGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtThoiKhoaBieuThongKeGetPage:
            return Object.assign({}, state, { pageThongKe: data.page });
        case DtThoiKhoaBieuUpdate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedPage.list) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        case UpdateTinhTrangKhoa: {
            let { page } = state, { maHocPhan, isOnlyKhoa } = data.item;
            if (page && page.list) {
                let { list } = page;
                list = list.map(i => i.maHocPhan == maHocPhan ? { ...i, isOnlyKhoa } : { ...i });
                return Object.assign({}, state, { page: { ...page, list } });
            } else {
                return null;
            }
        }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtThoiKhoaBieuAll(filter, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/all';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getDtThoiKhoaBieuStudentList(maHocPhan, filter, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/hocPhan/student-list';
        T.get(url, { maHocPhan, filter }, data => {
            if (data.error) {
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

T.initPage('pageDtThoiKhoaBieu');
export function getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThoiKhoaBieu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thoi-khoa-bieu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtThoiKhoaBieuGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

T.initPage('pageDtThoiKhoaBieuThongKe');
export function getDtThoiKhoaBieuThongKePage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThoiKhoaBieuThongKe', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/thoi-khoa-bieu/thong-ke/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtThoiKhoaBieuThongKeGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createDtThoiKhoaBieu(item, settings, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/thoi-khoa-bieu/multiple';
        T.post(url, { item, settings }, data => {
            if (data.error) {
                T.notify('Tạo thời khoá biểu bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo thời khoá biểu thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        });
    };
}

export function checkIfExistDtThoiKhoaBieu(data, done) {
    return () => {
        const url = '/api/dt/hoc-phan/check-if-exist';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Kiểm tra các ràng buộc lỗi', 'danger');
            } else if (result.warning) {
                T.confirm('Cảnh báo', `${result.warning}. Bạn vẫn muốn tạo thêm?`, true, isConfirm => {
                    if (isConfirm) {
                        done(result.maxNhomCurrent);
                    } else {
                        done(-1);
                    }
                });
            } else {
                done && done(0);
            }
        });
    };
}

export function createDtThoiKhoaBieuMultiple(data, settings, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/hoc-phan/create-multiple';
        T.post(url, { data, settings }, result => {
            if (result.error) {
                T.notify('Tạo lớp bị lỗi!', 'danger');
                console.error(`POST ${url}. ${result.error.message}`);
                done && done();
            } else if (result.warning) {
                T.confirm('Cảnh báo', `${result.warning}. Bạn vẫn muốn tạo thêm?`, true, isConfirm => {
                    if (isConfirm) {
                        createDtThoiKhoaBieuMultiple({ ...data, confirmCreate: true }, settings, done);
                    }
                });
            }
            else {
                T.notify(`Tạo lớp cho môn ${settings.maMonHoc} thành công!`, 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(result);
            }
        });
    };
}
export function deleteDtThoiKhoaBieu(maHocPhan, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/thoi-khoa-bieu';
        T.delete(url, { maHocPhan }, data => {
            if (data.error) {
                T.notify('Xóa thời khoá biểu bị lỗi!' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Thời khoá biểu đã xóa thành công!', 'success', false, 800);
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Xóa thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieu(id, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/thoi-khoa-bieu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật thông tin thời khoá biểu thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieuCondition(condition, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/thoi-khoa-bieu-condition';
        T.put(url, { condition, changes }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result);
            } else {
                // T.notify('Điều chỉnh thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                dispatch({ type: DtThoiKhoaBieuConfigUpdate, data: { currentId: result.item.id, currentData: result.item } });
                done && done(result);
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateTinhTrangHocPhan(maHocPhan, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/thoi-khoa-bieu/tinh-trang';
        T.put(url, { maHocPhan, changes }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result);
            } else {
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(result);
            }
        }, () => T.notify('Cập nhật tình trạng bị lỗi'));
    };
}

export function updateMultipleSLDK(listHocPhan, soLuongDuKien, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/thoi-khoa-bieu/so-luong-du-kien-multiple';
        T.put(url, { listHocPhan, soLuongDuKien }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result);
            } else {
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(result);
            }
        }, () => T.notify('Cập nhật số lượng dự kiến bị lỗi'));
    };
}

export function autoGenSched(config, listConfig, done) {
    return dispatch => {
        T.post('/api/dt/gen-schedule', { config, listConfig }, result => {
            if (result.error) {
                T.notify(`Lỗi sinh thời khoá biểu: ${result.error.message}`, 'danger');
            } else {
                T.alert('Sinh thời khoá biểu thành công', 'success', false);
                dispatch(getDtThoiKhoaBieuPage());
                done && done(result);
            }
        });
    };
}

export function changeDtThoiKhoaBieu(item) {
    return { type: DtThoiKhoaBieuUpdate, item };
}

export function getDtLichDayHoc(phong, done) {
    return () => {
        T.get('/api/dt/get-schedule', { phong }, data => {
            if (data.error) {
                T.notify(`Lỗi: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            } else {
                done && done(data);
            }
        });
    };
}

export function deleteMultipleDtThoiKhoaBieu(listChosen = [], done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/thoi-khoa-bieu/condition';
        T.delete(url, { listChosen }, data => {
            if (data.error) {
                T.notify('Xoá bị lỗi!', 'danger');
                console.error(`DELETE ${url}. ${data.error.message}`);
            } else {
                T.alert('Xoá thời khoá biểu không có sinh viên đăng ký thành công!', 'success', false, 1000);
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                if (data.errorList && data.errorList.length) {
                    data.errorList.map(hocPhan => T.notify(`Xoá bị lỗi: Mã học phần ${hocPhan} đã có sinh viên đăng ký!`, 'danger'));
                }
                done && done();
            }
        });
    };
}

// Generate action -----------------------------------------------------------------------------------------------------------------------------------------------------------
export function getDtThoiKhoaBieuByConfig(config, done) {
    return dispatch => {
        T.post('/api/dt/thoi-khoa-bieu/get-by-config', { config }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error.message);
                done && done(result);
            } else {
                dispatch({ type: DtThoiKhoaBieuConfig, items: result });
                done && done(result);
            }
        });
    };
}

export function resetDtThoiKhoaBieuConfig(done) {
    return dispatch => {
        dispatch({ type: DtThoiKhoaBieuConfig, items: {} });
        done && done();
    };
}

export function saveDtThoiKhoaBieuData(items, done) {
    return dispatch => {
        dispatch({ type: DtThoiKhoaBieuConfig, items });
        done && done();
    };
}

export function updateCheckDtThoiKhoaBieu(data, config, done) {
    return dispatch => {
        T.put('/api/dt/thoi-khoa-bieu/update-check', data, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message || 'hệ thống'}`, 'danger');
                console.error(result.error);
            } else {
                dispatch(getDtThoiKhoaBieuByConfig(config));
                done && done();
            }
        });

    };
}

export function updateDtThoiKhoaBieuConfig(data, done) {
    return dispatch => {
        const url = '/api/dt/thoi-khoa-bieu-condition';
        T.put(url, { condition: data.currentId, changes: data.currentData, config: data.config }, result => {
            if (result.warning) {
                T.confirm('Cảnh báo', result.warning + '. Bạn có muốn tiếp tục?', 'warning', true, isConfirm => {
                    if (isConfirm) {
                        T.notify('Cập nhật thành công', 'success');
                        dispatch(getDtThoiKhoaBieuByConfig(data.config));
                        done && done();
                    }
                });
            }
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getDtThoiKhoaBieuByConfig(data.config));
                done && done();
            }
        });
    };
}

export function dtThoiKhoaBieuGenTime(data, doneError, done) {
    return dispatch => {
        const url = '/api/dt/thoi-khoa-bieu/generate-time';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lỗi ${result.error.message || 'hệ thống'}`, 'danger');
                doneError && doneError();
            } else {
                let dataErr = result.dataReturn.filter(item => !item.thoiGianPhuHop);
                dataErr.map(item => T.notify(`Học phần ${item.maHocPhan} hiện không tìm được thời gian phù hợp!`, 'danger'));
                dispatch({ type: DtThoiKhoaBieuConfig, items: { dataCanGen: result.dataReturn, config: data.config } });
                done && done(result.dataReturn);
            }
        });
    };
}

export function dtThoiKhoaBieuGenRoom(data, doneError, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/generate-room-end-date';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message || 'Sinh tự động thất bại'}`, 'danger');
                doneError && doneError();
            } else {
                done && done(result.dataReturn);
            }
        });
    };
}

export function updateDtThoiKhoaBieuGenData(data, config, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/save-gen-data';
        T.put(url, { data, config }, result => {
            if (result.error) {
                T.notify(`Lồi: ${result.error.message || 'cập nhật thất bại'}`, 'danger');
            }
            done && done(result);
        });
    };
}

export function dtThoiKhoaBieuTraCuu(thu, maCoSo, namHoc, hocKy, loaiHinh, fromTime, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/tra-cuu';
        T.get(url, { thu, maCoSo, namHoc, hocKy, loaiHinh, fromTime }, result => {
            if (result.error) {
                T.notify(`Lồi: ${result.error.message || 'Tra cứu thất bại'}`, 'danger');
            }
            else {
                if (!result.items.length) T.notify('Cơ sở chưa có phòng học', 'warning');
                done && done(result.items);
            }
        });
    };
}

export function dtTKBTraCuuPhongTrong(filter, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/tra-cuu-phong-trong';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(`Lồi: ${result.error.message || 'Tra cứu thất bại'}`, 'danger');
            }
            else {
                done && done(result);
            }
        });
    };
}

export function dtTKBTraCuuSchedule(filter, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/tra-cuu-thoi-khoa-bieu';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message || 'Tra cứu thất bại'}`, 'danger');
            }
            else {
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuGiangVienGetById(id, done) {
    return () => {
        const url = `/api/dt/giang-vien/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu giảng viên', 'danger');
            } else {
                done && done(result.data);
            }
        });
    };
}

export function DtThoiKhoaBieuGiangVienCreate(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/giang-vien';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo thời khóa biểu giảng viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo thời khóa biểu giảng viên thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuGetDataHocPhan(maHocPhan, done) {
    return () => {
        const url = '/api/dt/hoc-phan/get-data';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                console.error(result.error);
                T.notify('Lấy học phần lỗi!', 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function UpdateThanhPhanDiem(dataHocPhan, dataThanhPhan, done) {
    return () => {
        const url = '/api/dt/hoc-phan/cau-hinh-thanh-phan-diem';
        T.post(url, { dataHocPhan, dataThanhPhan }, result => {
            if (result.error) {
                console.error(result.error);
                T.alert(result.error.message || 'Cập nhật thành phần điểm bị lỗi!', 'error', false, 2000);
            } else {
                done && done(result);
            }
        });
    };
}

export function UpdateDiemSinhVienByHocPhan(changes, done) {
    return () => {
        const url = '/api/dt/hoc-phan/diem-sinh-vien';
        T.post(url, { changes }, result => {
            if (result.error) {
                console.error(result.error);
                T.notify('Cập nhật điểm sinh viên bị lỗi!', 'danger');
            } else {
                done && done(result);
            }
        });
    };
}

export function GhiChuDiemSinhVien(changes, done) {
    return () => {
        const url = '/api/dt/hoc-phan/diem-sinh-vien/ghi-chu';
        T.post(url, { changes }, result => {
            if (result.error) {
                console.error(result.error);
                T.notify('Cập nhật ghi chú điểm sinh viên bị lỗi!', 'danger');
            } else {
                T.notify('Cập nhật ghi chú điểm sinh viên thành công!', 'success');
                done && done(result);
            }
        });
    };
}

export function NhapDiemSinhVien(changes, done) {
    return () => {
        const url = '/api/dt/hoc-phan/diem-sinh-vien/nhap-diem';
        T.post(url, { changes }, result => {
            if (result.error) {
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export const FullScheduleGenerated = (item, customFunction) => {
    let { fullData, dataTiet, listNgayLe, dataTeacher } = item;
    let dataFull = [...fullData];
    const ngayBatDauChung = dataFull[0].ngayBatDau;
    let thuBatDau = new Date(dataFull[0].ngayBatDau).getDay() + 1;
    if (thuBatDau == 1) thuBatDau = 8;
    let newData = [];
    dataFull = dataFull.map(item => {
        if (item.thu != thuBatDau) {
            let deviant = parseInt(item.thu) - thuBatDau;
            if (deviant < 0) deviant += 7;
            item.ngayBatDau = ngayBatDauChung + deviant * 24 * 60 * 60 * 1000;
        }
        item.tuanBatDau = new Date(item.ngayBatDau).getWeek();
        return item;
    });
    dataFull.sort((a, b) => a.ngayBatDau - b.ngayBatDau);
    let sumTiet = 0;
    let currentWeek = dataFull[0].tuanBatDau;
    const tongTiet = parseInt(dataFull[0].tongTiet);
    const cloneData = [];
    dataFull.forEach(item => cloneData.push(Object.assign({}, item)));
    while (sumTiet < tongTiet) {

        for (let i = 0; i < cloneData.length; i++) {
            const hocPhan = Object.assign({}, cloneData[i]);
            if (cloneData[i].tuanBatDau == currentWeek) {
                const checkNgayLe = listNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(hocPhan.ngayBatDau).setHours(0, 0, 0));
                if (!checkNgayLe) {
                    sumTiet += parseInt(cloneData[i].soTietBuoi);
                    const [gioBatDau, phutBatDau] = cloneData[i].thoiGianBatDau?.split(':'),
                        [gioKetThuc, phutKetThuc] = cloneData[i].thoiGianKetThuc?.split(':');
                    hocPhan.ngayBatDau = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                    hocPhan.ngayKetThuc = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

                    hocPhan.giangVien = dataTeacher.filter(item => item.type == 'GV' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.hoTen);
                    hocPhan.troGiang = dataTeacher.filter(item => item.type == 'TG' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.hoTen);

                    hocPhan.shccGiangVien = dataTeacher.filter(item => item.type == 'GV' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.shcc);
                    hocPhan.shccTroGiang = dataTeacher.filter(item => item.type == 'TG' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.shcc);

                    hocPhan.ngayHoc = new Date(hocPhan.ngayBatDau).setHours(0, 0, 0);
                    newData = [...newData, hocPhan];
                } else {
                    newData = [...newData, { ...hocPhan, isNgayLe: true, ngayLe: checkNgayLe.moTa, ngayHoc: new Date(hocPhan.ngayBatDau).setHours(0, 0, 0) }];
                }
                cloneData[i].tuanBatDau++;
                cloneData[i].ngayBatDau += 7 * 24 * 60 * 60 * 1000;
            }

            if (sumTiet >= tongTiet) {
                let deviant = sumTiet - tongTiet;
                if (deviant != 0) {
                    const lastHocPhan = newData.pop();
                    lastHocPhan.soTietBuoi = parseInt(lastHocPhan.soTietBuoi) - deviant;
                    const thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(lastHocPhan.soTietBuoi) + parseInt(lastHocPhan.tietBatDau) - 1).thoiGianKetThuc,
                        [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                    lastHocPhan.thoiGianKetThuc = thoiGianKetThuc;
                    lastHocPhan.ngayKetThuc = new Date(lastHocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
                    lastHocPhan.giangVien = dataTeacher.filter(item => item.type == 'GV' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.hoTen);
                    lastHocPhan.troGiang = dataTeacher.filter(item => item.type == 'TG' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.hoTen);

                    lastHocPhan.shccGiangVien = dataTeacher.filter(item => item.type == 'GV' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.shcc);
                    lastHocPhan.shccTroGiang = dataTeacher.filter(item => item.type == 'TG' && item.ngayBatDau == hocPhan.ngayBatDau && item.ngayKetThuc == hocPhan.ngayKetThuc).map(item => item.shcc);

                    newData.push(lastHocPhan);
                }

                customFunction && customFunction(newData, fullData);
                break;
            }

        }
        cloneData.sort((a, b) => parseInt(a.ngayBatDau) - parseInt(b.ngayBatDau));
        currentWeek++;
    }
    return newData;
};

export const CustomScheduleGenerated = ({ fullData, dataTiet, listNgayLe, listTKB, listThi, listEvent, listTKBGv = [], isGenTrung }) => {
    try {
        const calTuanHoc = (hocPhan) => {
            const checkNgayLe = listNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(hocPhan.ngayBatDau).setHours(0, 0, 0));

            const [gioBatDau, phutBatDau] = hocPhan.thoiGianBatDau?.split(':'),
                [gioKetThuc, phutKetThuc] = hocPhan.thoiGianKetThuc?.split(':');
            let ngayBatDau = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
            let ngayKetThuc = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

            const checkTrungThi = listThi.find(i => hocPhan.phong && hocPhan.phong == i.phong && !(ngayBatDau > i.ketThuc || ngayKetThuc < i.batDau));
            const checkTrungTKB = listTKB.find(i => hocPhan.phong && hocPhan.phong == i.phong && !(ngayBatDau > i.thoiGianKetThuc || ngayKetThuc < i.thoiGianBatDau));
            const checkTrungEvent = listEvent.find(i => hocPhan.phong && hocPhan.phong == i.phong && !(ngayBatDau > i.thoiGianKetThuc || ngayKetThuc < i.thoiGianBatDau));
            const checkTrungGV = listTKBGv.filter(i => hocPhan.shccGV ? hocPhan.shccGV.split(',').includes(i.giangVien) : false).find(i => hocPhan.id != i.idThoiKhoaBieu && !(ngayBatDau > i.ngayKetThuc || ngayKetThuc < i.ngayBatDau));

            let ghiChu = '';
            if (checkTrungTKB) {
                ghiChu = `Trùng thời khóa biểu với ngày ${T.dateToText(ngayBatDau, 'dd/mm/yyyy')} của học phần ${checkTrungTKB.maHocPhan}`;
            } else if (checkTrungThi) {
                ghiChu = `Trùng lịch thi với ngày ${T.dateToText(ngayBatDau, 'dd/mm/yyyy')} của học phần ${checkTrungThi.maHocPhan}`;
            } else if (checkTrungEvent) {
                ghiChu = `Trùng lịch với ngày ${T.dateToText(ngayBatDau, 'dd/mm/yyyy')} của sự kiện ${checkTrungEvent.ten}`;
            } else if (checkTrungGV) {
                ghiChu = `Trùng lịch dạy của giảng viên ngày ${T.dateToText(ngayBatDau, 'dd/mm/yyyy')}`;
            }

            return {
                ...hocPhan, originTuan: hocPhan.tuanBatDau, tuanBatDau: new Date(hocPhan.ngayBatDau).getWeek(), ngayHoc: new Date(hocPhan.ngayBatDau).setHours(0, 0, 0), ngayBatDau, ngayKetThuc,
                isNgayLe: checkNgayLe ? true : '', ngayLe: checkNgayLe ? checkNgayLe.moTa : '', isThi: !!checkTrungThi, isEvent: !!checkTrungEvent, ghiChu, isGiangVien: !!checkTrungGV,
            };
        };

        // Tinh ngay bat dau:
        let listTuanHoc = [];
        let cloneData = [...fullData];

        cloneData = cloneData.map(item => {
            let thuBatDau = new Date(parseInt(item.weekStart)).getDay() + 1;
            if (thuBatDau == 1) thuBatDau = 8;
            let deviant = parseInt(item.thu) - thuBatDau;
            if (deviant < 0) deviant += 7;
            item.ngayBatDau = parseInt(item.weekStart) + deviant * 24 * 60 * 60 * 1000;
            return item;
        });

        for (let i = 0; i < cloneData.length; i++) {
            let hocPhan = Object.assign({}, cloneData[i]);
            if (hocPhan.soTuan) {
                let currentWeek = parseInt(hocPhan.tuanBatDau), lastWeek = currentWeek + parseInt(hocPhan.soTuan);
                while (currentWeek < lastWeek) {
                    let tuanHoc = calTuanHoc(hocPhan);
                    if (!tuanHoc.ghiChu || isGenTrung || tuanHoc.isTrungTKB) {
                        listTuanHoc.push({ ...tuanHoc, index: i });
                        if (!tuanHoc.isNgayLe) currentWeek++;
                    }
                    hocPhan.ngayBatDau += 7 * 24 * 60 * 60 * 1000;
                }
            } else {
                let sumTiet = 0, tongTiet = parseInt(hocPhan.tongTiet);
                while (sumTiet < tongTiet) {
                    let tuanHoc = calTuanHoc(hocPhan);
                    if (!tuanHoc.ghiChu || isGenTrung || tuanHoc.isTrungTKB) {
                        listTuanHoc.push({ ...tuanHoc, index: i });
                        if (!tuanHoc.isNgayLe) sumTiet += parseInt(hocPhan.soTietBuoi);
                    }
                    hocPhan.ngayBatDau += 7 * 24 * 60 * 60 * 1000;
                }
            }
        }

        let newData = [], sumTiet = 0, tongTiet = cloneData[0].tongTiet;
        for (let tuan of listTuanHoc.sort((a, b) => a.ngayBatDau - b.ngayBatDau)) {
            if (!tuan.isNgayLe) sumTiet += parseInt(tuan.soTietBuoi);
            if (sumTiet >= tongTiet) {
                let deviant = sumTiet - tongTiet;
                const lastHocPhan = Object.assign({}, tuan);
                lastHocPhan.soTietBuoi = parseInt(lastHocPhan.soTietBuoi) - deviant;
                const thoiGianKetThuc = dataTiet.filter(i => i.maCoSo == lastHocPhan.coSo).find(item => item.ten == parseInt(lastHocPhan.soTietBuoi) + parseInt(lastHocPhan.tietBatDau) - 1).thoiGianKetThuc,
                    [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                lastHocPhan.thoiGianKetThuc = thoiGianKetThuc;
                lastHocPhan.ngayKetThuc = new Date(lastHocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
                newData.push(lastHocPhan);
                break;
            }
            newData.push(tuan);
        }

        for (let i = 0; i < newData.length - 1; i++) {
            let curr = { ...newData[i] },
                next = { ...newData[i + 1] };
            if (curr.ngayKetThuc >= next.ngayBatDau) {
                newData = [];
                break;
            }
        }
        return newData;
    } catch (error) {
        console.log(error);
    }
};

export const calStartEndDate = (item) => {
    let { fullData, listNgayLe } = item;
    let { tongTiet, thu, ngayBatDau, soTietBuoi } = fullData[0],
        soTuan = Math.ceil(tongTiet / soTietBuoi);

    let ngayKetThuc = ngayBatDau + (soTuan - 1) * 7 * 24 * 60 * 60 * 1000;
    for (let ngayLe of listNgayLe) {
        if (ngayLe > ngayBatDau && ngayLe <= ngayKetThuc && new Date(ngayLe).getDay() == thu - 1) ngayKetThuc += 7 * 24 * 60 * 60 * 1000;
    }
    if (isNaN(ngayKetThuc)) ngayKetThuc = '';
    return ngayKetThuc;
};

export function DtThoiKhoaBieuGetGiangVienFilter(filter, done) {
    const url = '/api/dt/staff/get-giang-vien/filter';
    T.get(url, { filter }, result => {
        if (result.error) {
            T.notify('Lấy giảng bị viên lỗi', 'danger');
        } else {
            done && done(result.items);
        }
    });
}

export function DtThoiKhoaBieuTreSomCreate(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/tre-som';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Ghi chú đi trễ/về sớm học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Ghi chú đi trễ/về sớm học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuBaoNghiCreate(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/bao-nghi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Báo nghỉ học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Báo nghỉ học phần thành công', 'success');
                done && done(result.item);
            }
        });
    };
}

export function DtThoiKhoaBieuBaoNghiDelete(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/bao-nghi';
        T.delete(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Hủy nghỉ học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Hủy nghỉ học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuBaoNghiGet(maHocPhan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/bao-nghi';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy danh sách báo nghỉ của học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function DtThoiKhoaBieuBaoBuCreate(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/bao-bu';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Báo bù học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Báo bù học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuBaoBuGet(maHocPhan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/bao-bu';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy danh sách báo bù của học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function DtThoiKhoaBieuBaoBuUpdate(idBu, data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/bao-bu';
        T.put(url, { idBu, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật báo bù của học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật lịch bù học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuBaoBuDelete(id, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/bao-bu';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Hủy báo bù của học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Hủy bù học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuGetNotFree(filter, dataGiangVien, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/get-not-free';
        T.get(url, { filter, dataGiangVien }, result => {
            if (result.error) {
                console.error(`GET ${url}: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuImportNew(filter, datas, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/import-new-data';
        T.post(url, { filter, datas }, result => {
            if (result.error) {
                console.error(`POST ${url}: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuImportUpdate(filter, datas, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/import-update-data';
        T.put(url, { filter, datas }, result => {
            if (result.error) {
                console.error(`PUT ${url}: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function DtTKBGetDataHocPhanMultiple(filter, listMaHocPhan, done) {
    return () => {
        const url = '/api/dt/hoc-phan/get-data-multiple';
        T.get(url, { filter, listMaHocPhan }, result => {
            if (result.error) {
                console.error(`GET ${url}: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function DtTKBSaveGenData(data, done) {
    return () => {
        const url = '/api/dt/hoc-phan/save-gen-data';
        T.post(url, { data }, result => {
            if (result.error) {
                console.error(`GET ${url}: ${result.error}`);
            } else {
                T.notify('Cập nhật thông tin học phần thành công', 'success');
                done && done(result.items);
            }
        });
    };
}

export function DtTKBCustomSaveGen(dataTuan, dataHocPhan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/save-gen';
        T.post(url, { dataTuan, dataHocPhan }, result => {
            if (result.error) {
                console.error(`POST ${url}: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function DtTKBCustomAddTuan(dataTuan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/add-tuan';
        T.post(url, { dataTuan }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Thêm tuần học bị lỗi!', 'error', false, 2000);
                console.error(`POST ${url}: ${result.error}`);
            } else {
                done && done(result.dataNgay);
            }
        });
    };
}

export function DtTKBCustomBaoNghiCreate(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/bao-nghi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Báo nghỉ học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Báo nghỉ học phần thành công', 'success');
                done && done(result.dataNgay);
            }
        });
    };
}

export function DtTKBCustomBaoNghiMultCreate(list, data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/bao-nghi/multiple';
        T.post(url, { list, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Báo nghỉ học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Báo nghỉ học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtTKBCustomBaoNghiHoanTac(dataTuan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/hoan-tac-nghi';
        T.post(url, { dataTuan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Hoàn tác nghỉ học phần bị lỗi', 'danger');
                console.error(result.error);
                done && done(result);
            } else {
                T.notify('Hoàn tác nghỉ học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}


export function DtTKBCustomBaoBuCreate(data, dataTuan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/bao-bu';
        T.post(url, { data, dataTuan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Báo bù học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Báo bù học phần thành công', 'success');
                done && done(result.dataNgay);
            }
        });
    };
}

export function DtTKBCustomBaoBuUpdate(dataTuan, data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/bao-bu';
        T.put(url, { dataTuan, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật báo bù của học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật lịch bù học phần thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function DtTKBCustomDeleteTuan(dataTuan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/delete-tuan';
        T.delete(url, { dataTuan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa tuần học của học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Xóa tuần học của học phần thành công', 'success');
                done && done(result.dataNgay);
            }
        });
    };
}

export function DtTKBCustomMultiUpdate(data, dataTuan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/multiple-update';
        T.put(url, { dataTuan, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Cập nhật tuần học bị lỗi', 'danger');
                console.error(result.error);
            } else {
                if (!result.dataError.length) {
                    T.notify('Cập nhật tuần học thành công', 'success');
                    done && done(result.dataError);
                } else {
                    T.notify('Tuần học bị trùng', 'danger');
                    done && done(result.dataError);
                }
            }
        });
    };
}

export function DtTKBCustomCheckData(listTuanHoc, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/check-data';
        T.post(url, { listTuanHoc }, result => {
            if (result.error) {
                console.error(`POST ${url}: ${result.error}`);
            } else {
                done && done(result.listTuanHoc);
            }
        });
    };
}

export function DtTKBCustomGetNotFree(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/get-not-free';
        T.get(url, { data }, result => {
            if (result.error) {
                console.error(`GET ${url}: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function DtTKBDeleteInfoHocPhan(maHocPhan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/delete-thong-tin-hoc-phan';
        T.delete(url, { maHocPhan }, result => {
            if (result.error) {
                console.error(`DELETE ${url}: ${result.error}`);
            } else {
                done && done();
            }
        });
    };
}

export function deletePhong(listTime, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/delete-phong';
        T.put(url, { listTime }, result => {
            if (result.error) {
                console.error(`DELETE ${url}: ${result.error}`);
            } else {
                done && done(result);
            }

        });
    };
}

export function exportThoiKhoaBieuFileMultiple(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/download-multiple';
        T.get(url, { data }, result => {
            if (result.error) {
                console.error(result.error);
            } else {
                if (['danhSachSinhVien', 'danhSachDiemDanh', 'lichDay'].includes(data.loaiFile)) {
                    T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), result.filename);
                    T.alert('Tải danh sách thành công!', 'success', true, 5000);
                }
                done && done(result);
            }
        });
    };
}

export function DtTKBCustomThongKe(filter, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/thong-ke';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message || 'Lấy dữ liệu thất bại!'}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function DtThoiKhoaBieuTraCuuPhong(filter, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu-custom/tra-cuu-phong';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message || 'Lấy dữ liệu thất bại!'}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function updateTinhTrangKhoaHocPhan(maHocPhan, isOnlyKhoa, done) {
    return (dispatch) => {
        const url = '/api/dt/thoi-khoa-bieu/tinh-trang-khoa';
        T.put(url, { maHocPhan, isOnlyKhoa }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result);
            } else {
                dispatch({ type: UpdateTinhTrangKhoa, item: { maHocPhan, isOnlyKhoa } });
                T.notify('Cập nhật tình trạng thành công!', 'success');
                done && done(result);
            }
        }, () => T.notify('Cập nhật tình trạng bị lỗi'));
    };
}

// Generate
export function getGenDtThoiKhoaBieuByConfig(config, done) {
    return () => {
        T.get('/api/dt/thoi-khoa-bieu/generate/get-by-config', { config }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error.message);
                done && done(result);
            } else {
                done && done(result);
            }
        });
    };
}

export function updateGenDtThoiKhoaBieuConfig(data, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/generate/save-config';
        T.put(url, { idThoiKhoaBieu: data.currentId, changes: data.currentData }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                done && done();
            }
        });
    };
}

export function resultGenDtThoiKhoaBieu(config, listHocPhan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/generate/';
        T.post(url, { config, listHocPhan }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function saveGenDtThoiKhoaBieu(listHocPhan, done) {
    return () => {
        const url = '/api/dt/thoi-khoa-bieu/generate/save';
        T.post(url, { listHocPhan }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export const SelectAdapter_HocPhan = (filter) => ({
    ajax: true,
    url: '/api/dt/thoi-khoa-bieu/page/1/50',
    data: params => ({ condition: params.term, filter }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maHocPhan, item, text: `${item.maHocPhan}: ${T.parse(item.tenMonHoc, { vi: '' })?.vi}` })) : [] }),
    // fetchOne: (done) => (getHocPhan({}, item => done && done({ id: item.maHocPhan, item, text: `${item.maHocPhan}: ${T.parse(item.tenMonHoc, { vi: '' })?.vi}` })))(),
});