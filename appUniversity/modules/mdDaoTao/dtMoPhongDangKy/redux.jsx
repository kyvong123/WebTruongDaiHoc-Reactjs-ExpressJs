import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const searchKeHoach = 'moPhongDangKy:searchKeHoach';
const searchNgoaiKH = 'moPhongDangKy:searchNgoaiKH';
const searchNgoaiCTDT = 'moPhongDangKy:searchNgoaiCTDT';
const ketQuaDangKy = 'moPhongDangKy:ketQua';
const createKetQuaDangKy = 'moPhongDangKy:createketQua';
const updateKetQuaDangKy = 'moPhongDangKy:updateketQua';
const deleteKetQuaDangKy = 'moPhongDangKy:deleteketQua';
const GetFullData = 'moPhongDangKy:getFullData';
const SvHocPhi = 'SvHocPhi:All';

export default function moPhongDangKyReducer(state = null, data) {
    switch (data.type) {
        case GetFullData:
            return Object.assign({}, state, {
                itemsKH: data.searchText ? data.monHocKH.filter(item => item.maMonHoc.toLowerCase().includes(data.searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(data.searchText.toLowerCase())) : data.monHocKH,
                itemsNKH: data.searchText ? data.monHocNKH.filter(item => item.maMonHoc.toLowerCase().includes(data.searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(data.searchText.toLowerCase())) : data.monHocNKH,
                itemsNCTDT: data.searchText ? data.monHocNCTDT.filter(item => item.maMonHoc.toLowerCase().includes(data.searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(data.searchText.toLowerCase())) : data.monHocNCTDT,

                fullDataKH: data.fullDataKH,
                fullDataNKH: data.fullDataNKH,
                fullDataNCTDT: data.fullDataNCTDT,

                listKH: data.listKH,
                monHocKH: data.monHocKH,
                listNKH: data.listNKH,
                monHocNKH: data.monHocNKH,
                listNCTDT: data.listNCTDT,
                monHocNCTDT: data.monHocNCTDT,
                avrInfo: data.avrInfo,
            });
        case searchKeHoach: {
            let { monHocKH } = state;
            const itemsKH = monHocKH?.filter(item => item.maMonHoc.toLowerCase().includes(data.searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(data.searchText.toLowerCase())) || [];
            if (!itemsKH.length) {
                T.notify('Không tìm thấy học phần phù hợp!', 'danger');
            }
            return Object.assign(state, { itemsKH, searchTextKH: data.searchText });
        }
        case searchNgoaiKH: {
            let { monHocNKH } = state;
            const itemsNKH = monHocNKH?.filter(item => item.maMonHoc.toLowerCase().includes(data.searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(data.searchText.toLowerCase())) || [];
            if (!itemsNKH.length) {
                T.notify('Không tìm thấy học phần phù hợp!', 'danger');
            }
            return Object.assign(state, { itemsNKH, searchTextNKH: data.searchText });
        }
        case searchNgoaiCTDT: {
            let { monHocNCTDT } = state;
            const itemsNCTDT = monHocNCTDT?.filter(item => item.maMonHoc.toLowerCase().includes(data.searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(data.searchText.toLowerCase())) || [];
            if (!itemsNCTDT.length) {
                T.notify('Không tìm thấy học phần phù hợp!', 'danger');
            }
            return Object.assign(state, { itemsNCTDT, searchTextNCTDT: data.searchText });
        }
        case ketQuaDangKy:
            return Object.assign({}, state, {
                dataKetQua: data.dataKetQua,
            });
        case createKetQuaDangKy: {
            let { dataKetQua } = state;
            return Object.assign(state, { dataKetQua: [...dataKetQua, ...data.data] });
        }
        case deleteKetQuaDangKy: {
            let { dataKetQua } = state;
            let items = dataKetQua.filter(i => i.maHocPhan != data.data);
            return Object.assign(state, { dataKetQua: items });
        }
        case updateKetQuaDangKy: {
            let { dataKetQua } = state;
            let items = dataKetQua.filter(i => i.maHocPhan != data.data.currHocPhan);
            let currHocPhan = dataKetQua.find(i => i.maHocPhan == data.data.currHocPhan);

            let hocPhanChuyen = data.hocPhanChuyen.map(i => ({ ...i, maLoaiDky: currHocPhan.maLoaiDky, type: currHocPhan.maLoaiDky }));
            items.push(...hocPhanChuyen);
            return Object.assign(state, { dataKetQua: items });
        }
        case SvHocPhi:
            return Object.assign({}, state, { dataAll: data.result });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getFullData(filter, searchText, done) {
    return dispatch => {
        const url = '/api/dt/hoc-phan/get-data/mo-phong';
        T.post(url, { filter }, data => {
            if (data.error) {
                T.alert('Lấy danh sách học phần bị lỗi. Vui lòng tải lại trang để load dữ liệu!', 'danger', () => location.reload(), null, true);
            } else if (data.warning) {
                T.alert('Cảnh báo: ' + (data.warning && (' ' + data.warning)), 'warning', () => location.reload(), null, true);
            } else {
                dispatch({
                    type: GetFullData,
                    fullDataKH: data.fullDataKH,
                    fullDataNKH: data.fullDataNKH,
                    fullDataNCTDT: data.fullDataNCTDT,
                    listKH: data.listKH,
                    listNKH: data.listNKH,
                    listNCTDT: data.listNCTDT,
                    monHocKH: data.monHocKH,
                    monHocNCTDT: data.monHocNCTDT,
                    monHocNKH: data.monHocNKH,
                    searchText,
                    dataKetQua: data.hocPhanDangKy,
                    avrInfo: data.avrInfo,
                });
                done && done(data);
            }
        }, error => console.error(`POST: ${url}.`, error));
    };
}

export function handleSearchKeHoach(searchText, done) {
    return dispatch => {
        dispatch({ type: searchKeHoach, searchText });
        done && done();
    };
}

export function handleSearchNgoaiKeHoach(searchText, done) {
    return dispatch => {
        dispatch({ type: searchNgoaiKH, searchText });
        done && done();
    };
}

export function handleSearchNgoaiCtdt(searchText, done) {
    return dispatch => {
        dispatch({ type: searchNgoaiCTDT, searchText });
        done && done();
    };
}

export function getKetQuaDangKy(mssv, cauHinh, done) {
    return dispatch => {
        const url = '/api/dt/hoc-phan/get-ket-qua-dky/mo-phong';
        T.get(url, { mssv, cauHinh }, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: ketQuaDangKy, dataKetQua: data.hocPhanDangKy });
                if (done) done(data.hocPhanDangKy);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDangKyHocPhan(data, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan/mo-phong';
        let { hocPhan, filter, userData } = data;
        T.post(url, { hocPhan, filter, userData }, data => {
            if (data.error) {
                done && done(data.error);
            } else {
                dispatch({ type: createKetQuaDangKy, data: data.data });
                done && done(data);
            }
        });
    };
}

export function deleteDangKyHocPhan(data, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan/mo-phong';
        let { hocPhan, filter, userData } = data;
        T.delete(url, { hocPhan, filter, userData }, data => {
            if (data.error) {
                T.alert('Hủy đăng ký học phần bị lỗi!', 'danger', true);
                if (done) done(data.error);
            } else {
                dispatch({ type: deleteKetQuaDangKy, data: data.hocPhan });
                done && done();
            }
        });
    };
}

export function updateDangKyHocPhan(data, done) {
    return dispatch => {
        const url = '/api/dt/dang-ky-hoc-phan/mo-phong';
        let { currHocPhan, newHocPhan, filter, userData } = data;
        T.put(url, { currHocPhan, newHocPhan, filter, userData }, data => {
            if (data.error) {
                done && done(data.error);
            } else {
                dispatch({ type: updateKetQuaDangKy, data: data.data, hocPhanChuyen: data.hocPhanChuyen });
                done && done(data);
            }
        });
    };
}

export function getCauHinh(mssv, done) {
    return () => {
        const url = '/api/dt/setting/config/mo-phong';
        T.get(url, { mssv }, data => {
            if (data.error) {
                T.notify('Lấy cấu hình đăng ký bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                if (done) done(data);
            }
        });
    };
}

export function getDetailHocPhi(mssv, done) {
    return () => {
        const url = '/api/dt/hoc-phi-page/all';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getSubDetailHocPhi(idDotDong, done) {
    return () => {
        const url = '/api/dt/hoc-phi-sub-detail/all';
        T.get(url, { idDotDong }, result => {
            if (result.error) {
                T.notify('Lỗi khi lấy thông tin học phí!', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getSinhVienInfo(mssv, done) {
    return () => {
        const url = '/api/dt/mo-phong/profile';
        T.get(url, { mssv }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error.message);
            } else {
                done && done(data);
            }
        }, () => console.log('Lấy thông tin sinh viên bị lỗi!'));
    };
}

export function getThoiKhoaBieu(mssv, filter, done) {
    const url = '/api/dt/mo-phong/thoi-khoa-bieu';
    T.get(url, { mssv, filter }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy thời khóa biểu bị lỗi!', 'danger'));
}

export function getLichNghiBu(mssv, filter, done) {
    const url = '/api/dt/mo-phong/lich-nghi-bu';
    T.get(url, { mssv, filter }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy lịch nghỉ bù bị lỗi!', 'danger'));
}

export function getLichThi(mssv, filter, done) {
    const url = '/api/dt/mo-phong/lich-thi';
    T.get(url, { mssv, filter }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy lịch thi bị lỗi!', 'danger'));
}

export function getDiem(mssv, filter, done) {
    const url = '/api/dt/mo-phong/bang-diem';
    T.get(url, { mssv, filter }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy bảng điểm bị lỗi!', 'danger'));
}

export function getInfo(mssv, done) {
    const url = '/api/dt/mo-phong/bang-diem/info';
    T.get(url, { mssv }, result => {
        if (result.error) {
            T.notify(result.error.message, 'danger');
            console.error(`GET: ${url}.`, result.error.message);
        } else {
            done && done(result);
        }
    }, () => () => T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger'));
}

T.initPage('pageDtLichSuDkhp');
export function getDtLichSuDkhpPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtLichSuDkhp', pageNumber, pageSize, pageCondition, filter);
    return () => {
        const url = `/api/dt/mo-phong/lich-su-dang-ky/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch sử đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.page);
            }
        });
    };
}

export function getKetQuaTotNghiep(mssv, done) {
    return () => {
        const url = '/api/dt/mo-phong/ket-qua-tot-nghiep';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
            }
        });
    };
}

export function getSvChungChi(mssv, done) {
    return () => {
        const url = '/api/dt/mo-phong/chung-chi';
        T.get(url, { mssv }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
            }
        }, () => () => T.notify('Đăng ký chứng chỉ bị lỗi!', 'danger'));
    };
}

export function svChungChiCreate(data, done) {
    return () => {
        const url = '/api/dt/mo-phong/chung-chi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.item);
            }
        }, () => () => T.notify('Đăng ký chứng chỉ bị lỗi!', 'danger'));
    };
}