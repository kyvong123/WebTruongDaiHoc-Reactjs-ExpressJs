// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiKhoaBieu.foo = () => { };
    const DATE_UNIX = 24 * 60 * 60 * 1000;

    /**
     * Period: Tiết
     * Room: Phòng
     * Subject: Môn học
     *
     * Condition:
     */

    app.model.dtThoiKhoaBieu.getDataGenerateSchedule = async (req, res) => {
        try {
            // 1.1: Config data theo loại hình, bậc.
            let { config, timeConfig } = req.body.data;
            // let fullDataTiet = config.fullDataTiet;
            let [dataFree, dataTietHoc] = await Promise.all([
                app.model.dtThoiKhoaBieu.getFree(JSON.stringify(config)),
                // app.model.dtLop.getAllData(JSON.stringify({ khoaSinhVien, heDaoTao })),
                app.model.dmCaHoc.getAll({ maCoSo: config.coSo, kichHoat: 1 }, 'ten,buoi')
            ]);
            let { hocphandaxep: dataCurrent, hocphantheoidnganh: hocPhanTheoLop, rows: dataCanGen,
                // currentstatusroom: currRoom
            } = dataFree;
            let hocPhanDaXep = {};
            dataCurrent.forEach(hocPhan => {
                hocPhanDaXep[hocPhan.id] = hocPhan;
            });

            const listKey = ['tkbSoTietBuoiMin', 'tkbSoTietBuoiMax'];
            let configRangePeriod = await app.model.dtSettings.getValue(...listKey);
            Object.keys(configRangePeriod).forEach(key => {
                configRangePeriod[key] = configRangePeriod[key] ? parseInt(configRangePeriod[key]) : 0;
            });

            // 1.2: Config data thứ, tiết.
            const setAvailable = () => {
                hocPhanTheoLop.forEach(maLop => {
                    maLop.available = timeConfig.thuTietMo;
                });
                // for (const ele of timeConfig) {
                //     if (!(ele.listDonVi && ele.listDonVi.length)) {
                //         hocPhanTheoLop.forEach(maLop => {
                //             maLop.available = ele.thuTietMo;
                //         });
                //     } else {
                //         ele.listDonVi = ele.listDonVi.map(item => parseInt(item));
                //         for (const dataId of hocPhanTheoLop) {
                //             let khoa = dataLop.rows.find(item => item.ma == dataId.maLop)?.khoa;
                //             if (khoa && ele.listDonVi.includes(khoa)) {
                //                 dataId.available = ele.thuTietMo;
                //             } else dataId.available = fullDataTiet;
                //         }
                //     }
                // }
            };
            setAvailable();

            let dataReturn = [];
            dataCanGen = dataCanGen.filter(item => item.isMo && item.soTietBuoi);
            hocPhanLoop: for (let hocPhan of dataCanGen) {
                let { id, loaiMonHoc, soTietBuoi, tietBatDau } = hocPhan, thoiGianPhuHop = true;
                if (!loaiMonHoc) {
                    // Môn bắt buộc
                    let listLop = hocPhanTheoLop.filter(item => item.idThoiKhoaBieu.includes(id));
                    if (!listLop.length) continue;
                    let thoiGianRanhChung = intersectMany(listLop.map(item => item.available)) || [];
                    if (tietBatDau) {
                        if (!isValidPeriod(tietBatDau, soTietBuoi, dataTietHoc)) {
                            dataReturn.push({ ...hocPhan, thu: '', thoiGianPhuHop: false });
                            continue hocPhanLoop;
                        }
                        else {
                            let dataThoiGian = thoiGianRanhChung.filter(item => item.split('_')[1] == tietBatDau);
                            if (dataThoiGian.length == 0) {
                                setAvailable();
                                hocPhan.isDuplicated = true;
                                listLop = hocPhanTheoLop.filter(item => item.idThoiKhoaBieu.includes(id));
                                thoiGianRanhChung = intersectMany(listLop.map(item => item.available)) || [];
                                dataThoiGian = thoiGianRanhChung.filter(item => item.split('_')[1] == tietBatDau);
                            }
                            let thu = '';
                            if (dataThoiGian.length == 0) {
                                thoiGianPhuHop = false;
                            } else {
                                let thuTiet = dataThoiGian.sort(() => Math.random() - 0.5).sample();
                                thu = thuTiet.split('_')[0];

                                let isAvail = thoiGianRanhChung.filter(item => {
                                    let [iThu, iTiet] = item.split('_');
                                    return iThu == thu && parseInt(iTiet) == (parseInt(tietBatDau) + parseInt(soTietBuoi) - 1);
                                });

                                if (!isAvail.length) {
                                    thu = '';
                                    thoiGianPhuHop = false;
                                }
                            }
                            if (hocPhan.isDuplicated) {
                                dataCanGen.forEach(item => listLop.filter(lop => {
                                    if (item.maLop.includes(lop.maLop) && item.maMonHoc != hocPhan.maMonHoc && item.thu == thu && item.tietBatDau == tietBatDau) {
                                        item.isDuplicated = true;
                                    }
                                }));
                            }
                            dataReturn.push({ ...hocPhan, thu, thoiGianPhuHop });
                            let toRemove = new Set(Array.from({ length: soTietBuoi }, (_, i) => i + 1).map(tiet => `${thu}_${tiet}`));
                            for (let lop of listLop) {
                                lop.available = lop.available.filter(tietThu => !toRemove.has(tietThu));
                            }
                        }
                    } else {
                        let checkIndex = 0, thu = '', tietBatDau = '', thoiGianPhuHop = false;
                        thuTietLoop: for (const thuTiet of thoiGianRanhChung.sort(() => Math.random() - 0.5)) {
                            if (!thuTiet) {
                                continue hocPhanLoop;
                            }
                            else {
                                let [thuGen, tietBatDauGen] = thuTiet.split('_');
                                if (isValidPeriod(tietBatDauGen, soTietBuoi, dataTietHoc) == undefined) {
                                    if (checkIndex <= thoiGianRanhChung.length) {
                                        checkIndex++;
                                        continue thuTietLoop;
                                    }
                                }
                                else if (isValidPeriod(tietBatDauGen, soTietBuoi, dataTietHoc) == false) continue thuTietLoop;
                                else {
                                    let isAvail = thoiGianRanhChung.filter(item => {
                                        let [iThu, iTiet] = item.split('_');
                                        return iThu == thuGen && parseInt(iTiet) == (parseInt(tietBatDauGen) + parseInt(soTietBuoi) - 1);
                                    });
                                    if (isAvail.length) {
                                        tietBatDau = parseInt(tietBatDauGen);
                                        thu = parseInt(thuGen);
                                        thoiGianPhuHop = true;
                                    } else {
                                        continue thuTietLoop;
                                    }

                                    break thuTietLoop;
                                }
                            }
                        }

                        dataReturn.push({ ...hocPhan, thu, tietBatDau, thoiGianPhuHop });
                        let toRemove = new Set(Array.from({ length: soTietBuoi }, (_, i) => i + 1).map(tiet => `${thu}_${tiet}`));
                        for (let lop of listLop) {
                            lop.available = lop.available.filter(tietThu => !toRemove.has(tietThu));
                        }
                    }
                } else {
                    let listLop = hocPhanTheoLop.find(item => item.idThoiKhoaBieu.includes(id));
                    if (!listLop?.length) continue;
                    let dataTietThu = listLop.available.sort(() => Math.random() - 0.5).sample();
                    if (hocPhan.tietBatDau) {
                        if (!isValidPeriod(hocPhan.tietBatDau, hocPhan.soTietBuoi, dataTietHoc)) {
                            continue hocPhanLoop;
                        }
                        else {
                            let dataThoiGian = dataTietThu.filter(item => item.split('_')[1] == hocPhan.tietBatDau);
                            let thuTiet = dataThoiGian.sample(),
                                [thu, tietBatDau] = thuTiet.split('_');
                            dataReturn.push({ ...hocPhan, thu, tietBatDau });
                        }
                    } else {
                        whileRandom: while (true) {
                            let thuTiet = dataTietThu.sample(),
                                [thu, tietBatDau] = thuTiet.split('_');
                            if (!isValidPeriod(tietBatDau, hocPhan.soTietBuoi, dataTietHoc)) continue whileRandom;
                            else {
                                dataReturn.push({ ...hocPhan, thu, tietBatDau });
                                break whileRandom;
                            }
                        }
                    }
                }
            }
            res.send({ dataReturn });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    };

    const intersectMany = (arrays) => arrays.reduce((prev, cur) => prev.filter(Set.prototype.has, new Set(cur)), arrays[0]);

    const isValidPeriod = (tietBatDau, soTietBuoi, fullDataTiet) => {
        let buoiHocBatDau = fullDataTiet.find(item => item.ten == tietBatDau)?.buoi;
        let dataKetThuc = fullDataTiet.find(item => parseInt(item.ten) == (parseInt(tietBatDau) + parseInt(soTietBuoi) - 1));
        if (!dataKetThuc) {
            return undefined;
        } else if (buoiHocBatDau != dataKetThuc.buoi) {
            return false;
        }
        return true;
    };


    app.model.dtThoiKhoaBieu.getDataRoomAndEndDate = async (req, res) => {
        try {
            let { config, listData, listRoom, listRoomNotGen } = req.body.data;
            let dataFree = await app.model.dtThoiKhoaBieu.getFree(JSON.stringify({ ...config, now: config.ngayBatDau, listRoom: listRoomNotGen ? listRoomNotGen.map(item => item.ten).toString() : '' }));
            let { currentstatusroom: currRoom } = dataFree;

            const currentYear = new Date().getFullYear();
            let [listNgayLe, dataTietHoc, dataEvent, dataThi] = await Promise.all([
                app.model.dmNgayLe.getAll({
                    statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear AND kichHoat = 1',
                    parameter: {
                        startDateOfYear: new Date(currentYear, 0, 1).setHours(0, 0, 0, 1),
                        endDateOfYear: new Date(currentYear + 1, 11, 31).setHours(23, 59, 59, 999)
                    }
                }, 'ngay', 'ngay'),
                app.model.dmCaHoc.getAll({ maCoSo: config.coSo, kichHoat: 1 }),
                app.model.dtLichEvent.getAll({
                    statement: 'coSo = :coSo AND thoiGianBatDau BETWEEN :ngayBatDau AND :ngayKetThuc',
                    parameter: { coSo: config.coSo, ngayBatDau: new Date(parseInt(config.ngayBatDau)).setHours(0, 0, 0, 0), ngayKetThuc: new Date(parseInt(config.ngayBatDau)).setHours(23, 59, 59, 999) },
                }, 'phong'),
                app.model.dtExam.getAll({
                    statement: 'coSo = :coSo AND batDau BETWEEN :ngayBatDau AND :ngayKetThuc',
                    parameter: { coSo: config.coSo, ngayBatDau: new Date(parseInt(config.ngayBatDau)).setHours(0, 0, 0, 0), ngayKetThuc: new Date(parseInt(config.ngayBatDau)).setHours(23, 59, 59, 999) },
                }, 'phong'),
            ]);

            dataEvent = dataEvent.map(i => i.phong);
            dataThi = dataThi.map(i => i.phong);

            listRoom = listRoom.filter(item => ![...dataThi, ...dataEvent].includes(item.ten));

            let currentStatus = adjustCurrentStatusRoom(currRoom);
            let dataReturn = [], dataNull = [];
            listData = listData.sort((a, b) => a.soLuongDuKien > b.soLuongDuKien ? 1 : 0);
            const dataGroupBy = listData.groupBy('maHocPhan');
            for (let [index, hocPhan] of listData.entries()) {
                let roomResult = bestFit(hocPhan, listRoom, currentStatus);
                let { ngayBatDau, ngayKetThuc, ghiChu } = await calculateStartToEndDate(dataGroupBy[hocPhan.maHocPhan], parseInt(config.ngayBatDau), listNgayLe, dataTietHoc);
                dataReturn.push({ ...hocPhan, ...roomResult, ngayKetThuc, ngayBatDau, ghiChu, isTrung: !!ghiChu });

                app.io.to('GenTKBData').emit('gen-tkb-data', { requester: req.session.user.email, dataReturn, status: index == listData.length - 1 ? 'genDone' : 'genning' });
                if (index == 0) res.send({ dataReturn, dataNull });
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    };

    const range = (start, stop, step = 1) => Array(stop - start).fill(start).map((x, y) => x + y * step);

    const adjustCurrentStatusRoom = (currentStatus) => {
        let data = {};
        currentStatus.forEach(item => {
            data[item.phong] = data[item.phong] || {};
            data[item.phong][item.thu] = data[item.phong][item.thu] || [];
            data[item.phong][item.thu] = [...new Set([...data[item.phong][item.thu], ...range(Number(item.tietBatDau), Number(item.tietBatDau) + Number(item.soTietBuoi))])];
        });
        return data;
    };

    const bestFit = (hocPhan, listRooms, currentStatus) => {
        let { soLuongDuKien, thu, tietBatDau, soTietBuoi } = hocPhan,
            sizeResult = 10000000, roomResult = null;
        thu = parseInt(thu);
        tietBatDau = parseInt(tietBatDau);
        soLuongDuKien = parseInt(soLuongDuKien);
        soTietBuoi = parseInt(soTietBuoi);
        let MAX_DEVIANT = 0;
        while (true) {
            for (let room of listRooms) {
                let { ten, sucChua } = room;
                sucChua = parseInt(sucChua);
                let condition = (sucChua >= soLuongDuKien + MAX_DEVIANT) && (sucChua <= sizeResult) && (!currentStatus[ten] || !currentStatus[ten][thu] || !currentStatus[ten][thu].includes(tietBatDau));
                if (condition) {
                    sizeResult = sucChua;
                    roomResult = { phong: ten, sucChua };
                }
            }
            if (roomResult) {
                let { phong: ten } = roomResult;
                if (!currentStatus[ten]) {
                    currentStatus[ten] = {
                        [thu]: range(tietBatDau, soTietBuoi + tietBatDau)
                    };
                } else if (!currentStatus[ten][thu]) {
                    currentStatus[ten][thu] = range(tietBatDau, soTietBuoi + tietBatDau);
                } else {
                    currentStatus[ten][thu] = [...new Set([...currentStatus[ten][thu], ...range(tietBatDau, soTietBuoi + tietBatDau)])];
                }
                return roomResult;
            } else {
                if (MAX_DEVIANT > 20) return { phong: '', sucChua: '' };
                MAX_DEVIANT += 5;
            }
        }
    };

    app.model.dtThoiKhoaBieu.calStartEndDate = (data, listNgayLe = []) => {
        let { tongTiet, thu, ngayBatDau, soTietBuoi, soBuoiTuan = 1 } = data,
            soTuan = Math.ceil(tongTiet / (soTietBuoi * soBuoiTuan));
        thu = parseInt(thu);
        // Tính lại ngày bắt đầu ứng với thứ của học phần
        let thuBatDau = new Date(ngayBatDau).getDay();

        let deviant = thu - thuBatDau - 1;
        if (deviant < 0) deviant += 7;
        ngayBatDau = ngayBatDau + deviant * DATE_UNIX;
        let ngayKetThuc = ngayBatDau + (soTuan - 1) * 7 * DATE_UNIX;
        if (!isNaN(ngayBatDau)) {
            // Tính ngày kết thúc
            for (let ngayLe of listNgayLe) {
                if (ngayLe > ngayBatDau && ngayLe <= ngayKetThuc && new Date(ngayLe).getDay() == thu - 1) ngayKetThuc += 7 * DATE_UNIX;
            }
        } else {
            ngayBatDau = '';
        }
        if (isNaN(ngayKetThuc)) ngayKetThuc = '';
        return { ngayBatDau, ngayKetThuc };
    };

    const calculateStartToEndDate = async (dataGroupBy, _ngayBatDau, listNgayLe = [], dataTiet = []) => {
        let dataTuan = [], ghiChu = '';
        if (dataGroupBy.every(item => item.thu && item.tietBatDau && item.soTietBuoi)) {
            const fullData = dataGroupBy.map(i => {
                let thoiGianBatDau = dataTiet.find(item => item.ten == i.tietBatDau).thoiGianBatDau;
                let thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(i.tietBatDau) + parseInt(i.soTietBuoi) - 1).thoiGianKetThuc;
                return { ...i, ngayBatDau: _ngayBatDau, thoiGianBatDau, thoiGianKetThuc };
            });
            dataTuan = await app.model.dtThoiKhoaBieu.generateSchedule({
                fullData, listNgayLe, dataTiet, dataTeacher: []
            });
        }

        if (dataTuan.length) {
            for (let tuan of dataTuan.filter(i => i.phong)) {
                let { maHocPhan, phong, ngayBatDau, ngayKetThuc } = tuan;

                let checkFree = await app.model.dtThoiKhoaBieuCustom.checkFreePhong({ phong, ngayBatDau, ngayKetThuc, maHocPhan });
                ghiChu = checkFree.ghiChu;
                if (ghiChu) break;
            }
        }

        return { ngayBatDau: dataTuan.length ? dataTuan[0].ngayHoc : '', ngayKetThuc: dataTuan.length ? dataTuan.slice(-1)[0].ngayHoc : '', ghiChu };
    };


    app.model.dtThoiKhoaBieu.generateSchedule = (item) => {
        let { fullData, dataTiet, listNgayLe, dataTeacher } = item;
        let newData = [];
        if (fullData.length) {
            const ngayBatDauChung = fullData[0].ngayBatDau;
            let thuBatDau = new Date(fullData[0].ngayBatDau).getDay() + 1;
            if (thuBatDau == 1) thuBatDau = 8;
            fullData = fullData.map(item => {
                if (item.thu != thuBatDau) {
                    let deviant = parseInt(item.thu) - thuBatDau;
                    if (deviant < 0) deviant += 7;
                    item.ngayBatDau = ngayBatDauChung + deviant * DATE_UNIX;
                }
                item.tuanBatDau = new Date(item.ngayBatDau).getWeek();
                return item;
            });
            fullData.sort((a, b) => a.ngayBatDau - b.ngayBatDau);
            let sumTiet = 0;
            let currentWeek = fullData[0].tuanBatDau;

            const tongTiet = parseInt(fullData[0].tongTiet);
            const cloneData = [];
            fullData.forEach(item => cloneData.push(Object.assign({}, item)));
            while (sumTiet < tongTiet) {
                for (let i = 0; i < cloneData.length; i++) {
                    const hocPhan = Object.assign({}, cloneData[i]);
                    if (cloneData[i].tuanBatDau == currentWeek) {
                        const checkNgayLe = listNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(hocPhan.ngayBatDau).setHours(0, 0, 0));
                        if (!checkNgayLe) {
                            sumTiet += parseInt(cloneData[i].soTietBuoi);
                        }
                        const [gioBatDau, phutBatDau] = cloneData[i].thoiGianBatDau.split(':'),
                            [gioKetThuc, phutKetThuc] = cloneData[i].thoiGianKetThuc.split(':');

                        hocPhan.ngayBatDau = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                        hocPhan.ngayKetThuc = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
                        hocPhan.giangVien = dataTeacher.filter(item => item.type == 'GV').find(item => item.ngayBatDau == hocPhan.ngayBatDau)?.hoTen || '';
                        hocPhan.troGiang = dataTeacher.filter(item => item.type == 'TG').find(item => item.ngayBatDau == hocPhan.ngayBatDau)?.hoTen || '';
                        hocPhan.ngayHoc = new Date(hocPhan.ngayBatDau).setHours(0, 0, 0);
                        newData = [...newData, { ...hocPhan, isNgayLe: checkNgayLe ? true : '', ngayLe: checkNgayLe ? checkNgayLe.moTa : '' }];

                        cloneData[i].tuanBatDau++;
                        cloneData[i].ngayBatDau += 7 * DATE_UNIX;
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

                            newData.push(lastHocPhan);
                        }
                        break;
                    }
                }
                cloneData.sort((a, b) => parseInt(a.ngayBatDau) - parseInt(b.ngayBatDau));
                currentWeek++;
            }
        }
        return newData;
    };


    app.model.dtThoiKhoaBieu.canEdit = async (hocPhan) => {
        if (!hocPhan.ngayBatDau) return 1;
        const soNgayTruocKhiChotHocPhan = await app.model.dtSettings.getValue('soNgayTruocKhiChotHocPhan');
        return Number((hocPhan.ngayBatDau - soNgayTruocKhiChotHocPhan * DATE_UNIX) > Date.now());
    };

    app.model.dtThoiKhoaBieu.customGenerateSchedule = (item) => {
        let { fullData, dataTiet, listNgayLe, dataTeacher } = item,
            newData = [];

        const calTuanHoc = (hocPhan) => {
            const checkNgayLe = listNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(hocPhan.ngayBatDau).setHours(0, 0, 0));

            const [gioBatDau, phutBatDau] = hocPhan.thoiGianBatDau?.split(':'),
                [gioKetThuc, phutKetThuc] = hocPhan.thoiGianKetThuc?.split(':');

            let ngayBatDau = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioBatDau), parseInt(phutBatDau)),
                ngayKetThuc = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc)),
                giangVien = dataTeacher.filter(item => item.type == 'GV').find(item => item.ngayBatDau == ngayBatDau)?.hoTen || '',
                troGiang = dataTeacher.filter(item => item.type == 'TG').find(item => item.ngayBatDau == ngayBatDau)?.hoTen || '';

            return {
                ...hocPhan, tuanBatDau: new Date(ngayBatDau).getWeek(), ngayHoc: new Date(ngayBatDau).setHours(0, 0, 0), ngayBatDau, ngayKetThuc,
                isNgayLe: checkNgayLe ? true : '', ngayLe: checkNgayLe ? checkNgayLe.moTa : '', giangVien, troGiang,
            };
        };

        if (fullData.length) {
            let cloneData = [], listTuanHoc = [];
            fullData.forEach(item => cloneData.push(Object.assign({}, item)));

            cloneData = cloneData.map(item => {
                let thuBatDau = new Date(item.ngayBatDau).getDay() + 1;
                if (thuBatDau == 1) thuBatDau = 8;
                if (item.thu != thuBatDau) {
                    let deviant = parseInt(item.thu) - thuBatDau;
                    if (deviant < 0) deviant += 7;
                    item.ngayBatDau = item.ngayBatDau + deviant * DATE_UNIX;
                }
                item.tuanBatDau = new Date(item.ngayBatDau).getWeek();
                return item;
            });
            cloneData.sort((a, b) => a.ngayBatDau - b.ngayBatDau);

            for (let i = 0; i < cloneData.length; i++) {
                let hocPhan = Object.assign({}, cloneData[i]);
                if (hocPhan.ngayKetThuc) {
                    while (parseInt(hocPhan.ngayBatDau) <= parseInt(hocPhan.ngayKetThuc)) {
                        let tuanHoc = calTuanHoc(hocPhan);
                        listTuanHoc.push({ ...tuanHoc, index: i });
                        hocPhan.ngayBatDau += 7 * 24 * 60 * 60 * 1000;
                    }
                } else {
                    let sumTiet = 0, tongTiet = parseInt(hocPhan.tongTiet);
                    while (sumTiet < tongTiet) {
                        let tuanHoc = calTuanHoc(hocPhan);
                        listTuanHoc.push({ ...tuanHoc, index: i });
                        if (!tuanHoc.isNgayLe) sumTiet += parseInt(hocPhan.soTietBuoi);
                        hocPhan.ngayBatDau += 7 * 24 * 60 * 60 * 1000;
                    }
                }
            }
            let sumTiet = 0, tongTiet = parseInt(cloneData[0].tongTiet);
            for (let tuan of listTuanHoc.sort((a, b) => a.ngayBatDau - b.ngayBatDau)) {
                if (!tuan.isNgayLe) sumTiet += parseInt(tuan.soTietBuoi);
                if (sumTiet >= tongTiet) {
                    let deviant = sumTiet - tongTiet;
                    const lastHocPhan = Object.assign({}, tuan);
                    lastHocPhan.soTietBuoi = parseInt(lastHocPhan.soTietBuoi) - deviant;
                    const thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(lastHocPhan.soTietBuoi) + parseInt(lastHocPhan.tietBatDau) - 1).thoiGianKetThuc,
                        [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                    lastHocPhan.thoiGianKetThuc = thoiGianKetThuc;
                    lastHocPhan.ngayKetThuc = new Date(lastHocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
                    newData.push(lastHocPhan);
                    break;
                }
                newData.push(tuan);
            }
        }
        return newData;
    };
};