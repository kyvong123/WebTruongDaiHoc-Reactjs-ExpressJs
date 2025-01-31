import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const searchKeHoach = 'dkHocPhan:searchKeHoach';
const searchNgoaiKH = 'dkHocPhan:searchNgoaiKH';
const searchNgoaiCTDT = 'dkHocPhan:searchNgoaiCTDT';
const ketQuaDangKy = 'dkHocPhan:ketQua';
const GetFullData = 'dkHocPhan:getFullData';
const createDangKy = 'dkHocPhan:create';

export default function dkHocPhanReducer(state = null, data) {
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

                dataKetQua: data.dataKetQua,
                listDataTuanHoc: data.listDataTuanHoc,
                avrInfo: data.avrInfo,
                ngoaiNguInfo: data.ngoaiNguInfo,
            });
        case createDangKy: {
            let { listKH, fullDataKH, fullDataNKH, fullDataNCTDT, monHocKH, monHocNKH, monHocNCTDT, dataKetQua, ngoaiNguInfo } = state,
                { maLoaiDky, searchText, filter, configDispatch, hocPhan } = data,
                { theoKeHoach, ngoaiKeHoach, ngoaiCtdt } = filter;

            let itemDky = [];
            if (theoKeHoach) {
                itemDky = fullDataKH.filter(i => i.maHocPhan == hocPhan);
                fullDataKH = fullDataKH.filter(i => i.maHocPhan != hocPhan);
                monHocKH = monHocKH.filter(monHoc => !!fullDataKH.find(item => item.maMonHoc == monHoc.maMonHoc));
            }
            if (ngoaiKeHoach) {
                itemDky = fullDataNKH.filter(i => i.maHocPhan == hocPhan);
                fullDataNKH = fullDataNKH.filter(i => i.maHocPhan != hocPhan);
                monHocNKH = monHocNKH.filter(monHoc => !!fullDataNKH.find(item => item.maMonHoc == monHoc.maMonHoc));
            }
            if (ngoaiCtdt) {
                itemDky = fullDataNCTDT.filter(i => i.maHocPhan == hocPhan);
                fullDataNCTDT = fullDataNCTDT.filter(i => i.maHocPhan != hocPhan);
                monHocNCTDT = monHocNCTDT.filter(monHoc => !!fullDataNCTDT.find(item => item.maMonHoc == monHoc.maMonHoc));
            }

            dataKetQua = [...dataKetQua, ...itemDky.map(i => ({ ...i, maLoaiDky, type: maLoaiDky }))];

            if (configDispatch.ngoaiNgu) {
                let { status, tongSoTinChi, khoiKienThuc, ctdtDangKy } = ngoaiNguInfo;
                let dataDky = dataKetQua.filter((hp, index, self) => self.findIndex(i => i.maHocPhan == hp.maHocPhan && i.tongSoTinChi == hp.tongSoTinChi) == index);
                if (!status) {
                    if (tongSoTinChi) {
                        const curSoTinChi = dataDky.reduce((acc, cur) => acc + Number(cur.tongTinChi), 0);
                        monHocKH = monHocKH.map(i => ({ ...i, isCheckNN: Number((curSoTinChi + Number(i.tongTinChi)) > tongSoTinChi) }));
                        monHocNKH = monHocNKH.map(i => ({ ...i, isCheckNN: Number((curSoTinChi + Number(i.tongTinChi)) > tongSoTinChi) }));
                        monHocNCTDT = monHocNCTDT.map(i => ({ ...i, isCheckNN: Number((curSoTinChi + Number(i.tongTinChi)) > tongSoTinChi) }));
                    }
                    if (khoiKienThuc) {
                        khoiKienThuc = khoiKienThuc.split(',');
                        monHocKH = monHocKH.map(i => i.maKhoiKienThuc && !i.isCheckNN ? ({ ...i, isCheckNN: Number(!khoiKienThuc.includes(i.maKhoiKienThuc.toString())) }) : ({ ...i }));
                        monHocNKH = monHocNKH.map(i => i.maKhoiKienThuc && !i.isCheckNN ? ({ ...i, isCheckNN: Number(!khoiKienThuc.includes(i.maKhoiKienThuc.toString())) }) : ({ ...i }));
                    }
                    if (ctdtDangKy) {
                        ctdtDangKy = ctdtDangKy ? JSON.parse(ctdtDangKy) : [];
                        if (ctdtDangKy.length) {
                            let dataCheck = {};
                            dataCheck[`${configDispatch.namHoc.substring(2, 4)}${configDispatch.hocKy}`] = dataDky.filter(i => listKH.includes(i.maMonHoc)).reduce((acc, cur) => acc + Number(cur.tongTinChi), 0);
                            Object.keys(monHocNKH.filter(i => i.idSemester).groupBy('idSemester')).forEach(semester => {
                                dataCheck[semester] = dataDky.filter(i => monHocNKH.filter(i => i.idSemester == semester).map(i => i.maMonHoc).includes(i.maMonHoc)).reduce((acc, cur) => acc + Number(cur.tongTinChi), 0);
                            });

                            monHocKH = monHocKH.map(i => {
                                const isCheck = ctdtDangKy.find(ct => ct.semester == i.idSemester);
                                return !i.isCheckNN && i.idSemester ? (isCheck ? { ...i, isCheckNN: Number(isCheck.soTinChi != null && ((dataCheck[i.idSemester] + i.tongTinChi) > isCheck.soTinChi)) } : { ...i, isCheckNN: 1 }) : { ...i };
                            });

                            monHocNKH = monHocNKH.map(i => {
                                const isCheck = ctdtDangKy.find(ct => ct.semester == i.idSemester);
                                return !i.isCheckNN && i.idSemester ? (isCheck ? { ...i, isCheckNN: Number(isCheck.soTinChi != null && ((dataCheck[i.idSemester] + i.tongTinChi) > isCheck.soTinChi)) } : { ...i, isCheckNN: 1 }) : { ...i };
                            });
                        }
                    }
                }
            }

            let itemsKH = searchText ? monHocKH.filter(item => item.maMonHoc.toLowerCase().includes(searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(searchText.toLowerCase())) : monHocKH,
                itemsNKH = searchText ? monHocNKH.filter(item => item.maMonHoc.toLowerCase().includes(searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(searchText.toLowerCase())) : monHocNKH,
                itemsNCTDT = searchText ? monHocNCTDT.filter(item => item.maMonHoc.toLowerCase().includes(searchText.toLowerCase()) || item.tenMonHoc?.toLowerCase().includes(searchText.toLowerCase())) : monHocNCTDT;

            return Object.assign({}, state, { dataKetQua, monHocKH, monHocNKH, monHocNCTDT, fullDataKH, fullDataNKH, fullDataNCTDT, itemsKH, itemsNKH, itemsNCTDT, searchText });
        }
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
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getFullData(cauHinh, searchText, done) {
    return dispatch => {
        const url = '/api/dkmh/hoc-phan/get-data';
        T.post(url, { cauHinh }, data => {
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
                    listDataTuanHoc: data.listDataTuanHoc,
                    avrInfo: data.avrInfo,
                    ngoaiNguInfo: data.ngoaiNguInfo,
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

export function getLichSuDKHP(filter, done) {
    const url = '/api/sv/dkmh/lich-su';
    T.get(url, { filter }, data => {
        if (data.error) {
            T.notify('Lấy thông tin lịch sử đăng ký ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            if (done) done(data.items);
        }
    });
}

export function getKetQuaDangKy(cauHinh, done) {
    return dispatch => {
        const url = '/api/dkmh/hoc-phan/get-ket-qua-dky';
        T.get(url, { cauHinh }, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: ketQuaDangKy, dataKetQua: data.hocPhanDangKy });
                if (done) done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createDangKyHocPhan(hocPhan, filter, configDispatch, searchText, done) {
    return dispatch => {
        const url = '/api/dkmh/dang-ky-hoc-phan';
        T.post(url, { hocPhan, filter }, data => {
            if (data.error) {
                done && done(data.error);
                dispatch(getFullData(configDispatch, searchText));
            } else {
                dispatch({ type: createDangKy, hocPhan, maLoaiDky: data.maLoaiDky, searchText, filter, configDispatch });
                done && done(data);
                // dispatch(getFullData(configDispatch, searchText, done));
            }
        });
    };
}

export function deleteDangKyHocPhan(hocPhan, filter, configDispatch, done) {
    return dispatch => {
        const url = '/api/dkmh/dang-ky-hoc-phan';
        T.delete(url, { hocPhan, filter }, data => {
            if (data.error) {
                T.alert('Hủy đăng ký học phần bị lỗi!', 'danger', true);
                if (done) done(data.error);
            } else {
                const { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, cauHinh } = filter;
                if (theoKeHoach || ngoaiCtdt || ngoaiKeHoach) {
                    dispatch(getFullData(configDispatch, '', done));
                } else {
                    dispatch(getKetQuaDangKy(cauHinh, done));
                }
            }
        });
    };
}

export function updateDangKyHocPhan(currHocPhan, newHocPhan, filter, configDispatch, done) {
    return dispatch => {
        const url = '/api/dkmh/dang-ky-hoc-phan';
        T.put(url, { currHocPhan, newHocPhan, filter }, data => {
            const { searchText } = filter;
            if (data.error) {
                done && done(data.error);
                dispatch(getFullData(configDispatch, searchText));
            } else {
                dispatch(getFullData(configDispatch, searchText, done));
            }
        });
    };
}

export function getCauHinh(done) {
    return () => {
        const url = '/api/dkmh/setting/config';
        T.get(url, data => {
            if (data.error) {
                T.alert(data.error?.message || 'Lấy cấu hình đăng ký bị lỗi!', 'error', false, 2000);
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data);
            }
        });
    };
}

export function getDiem(maMonHoc, cauHinhDiem, done) {
    return () => {
        const url = '/api/dkmh/student/diem';
        T.get(url, { maMonHoc, cauHinhDiem }, data => {
            if (!data || data.error) {
                T.alert('Lấy dữ liệu điểm sinh viên bị lỗi! Vui lòng liên hệ PĐT', 'error', true);
                console.error(`GET ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                done && done(data);
            }
        });
    };
}