// import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const GvLichGiangDayGetAll = 'GvLichGiangDay:GetAll';
const GvLichGiangDayGet = 'GvLichGiangDay:Get';
const GvLichGiangDayGetPage = 'GvThoiKhoaBieuGiangVien:GetPage';

export default function gvLichGiangDayReducer(state = null, data) {
    switch (data.type) {
        case GvLichGiangDayGetAll:
            return data.items;
        case GvLichGiangDayGet:
            return data.item;
        case GvLichGiangDayGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getGvLichGiangDayPage(pageNumber, pageSize, filter, done) {
    const page = T.updatePage('pageGvLichGiangDay', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/dt/gv/lich-giang-day/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch giảng dạy bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: GvLichGiangDayGetPage, page: data.page });
                done && done();
            }
        });
    };
}

export function getLichGiangDay(filter, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/get-lich';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.items);
            }
        }, () => T.notify('Lấy thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function downLoadLichDay(filter, done) {
    return () => {
        const url = '/api/dt/gv/thoi-khoa-bieu/export';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.alert(result.error.message, 'error', false, 2000);
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                T.alert('Tải về thành công!', 'success', false, 2000);
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), 'lichGiangDay.pdf');
                done && done();
            }
        }, () => T.notify('Lấy thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function getLichGiangDayHocPhan(maHocPhan, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/get-lich-hoc-phan';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin học phần bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
            }
        });
    };
}

export function getLichHocPhan(maHocPhan, done) {
    return () => {
        const url = '/api/dt/gv/get-lich-hoc-phan';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin học phần bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.listTuanHoc);
            }
        });
    };
}

export function getLichGiangDayStudentList(maHocPhan, filter, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/hocPhan/student-list';
        T.get(url, { maHocPhan, filter }, data => {
            if (data.error) {
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function gvLichDayGetDiemDanh(maHocPhan, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/diem-danh';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy danh sách điểm danh bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function gvLichDayCreateVang(data, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/diem-danh/vang';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Điểm danh vắng bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Điểm danh vắng thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function gvLichDayCreateGhiChu(maHocPhan, data, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/diem-danh/ghi-chu';
        T.post(url, { maHocPhan, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Điểm danh vắng bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function gvLichGiangDayUpdateTiLeDiem(dataHocPhan, dataThanhPhan, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/cau-hinh-thanh-phan-diem';
        T.post(url, { dataHocPhan, dataThanhPhan }, result => {
            if (result.error) {
                console.error(result.error);
                T.alert(result.error.message || 'Cập nhật thành phần điểm bị lỗi!', 'error', false, 2000);
            } else {
                done && done(result.allRole);
            }
        });
    };
}

export function gvLichGiangDayBaoNghi(data, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/bao-nghi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Báo nghỉ học phần bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.alert('Báo nghỉ học phần thành công', 'success', false, 2000);
                done && done(result);
            }
        });
    };
}

export function gvLichGiangDayBaoBuGet(maHocPhan, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/bao-bu';
        T.get(url, { maHocPhan }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy dữ liệu lịch bù bị lỗi!', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function gvLichGiangDayBaoBuCreate(data, dataTuan, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/bao-bu';
        T.post(url, { data, dataTuan }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Báo bù học phần bị lỗi', 'error', false, 2000);
                console.error(result.error);
            } else {
                T.alert('Báo bù học phần thành công', 'success', false, 2000);
                done && done(result.dataNgay);
            }
        });
    };
}

export function gvLichGiangDayBaoBuUpdate(dataTuan, data, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/bao-bu';
        T.put(url, { dataTuan, data }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Cập nhật báo bù của học phần bị lỗi', 'error', false, 2000);
                console.error(result.error);
            } else {
                T.alert('Cập nhật lịch bù học phần thành công', 'success', false, 2000);
                done && done(result);
            }
        });
    };
}

export function gvLichGiangDayBaoBuDelete(idTuan, done) {
    return () => {
        const url = '/api/dt/gv/lich-giang-day/bao-bu';
        T.delete(url, { idTuan }, result => {
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