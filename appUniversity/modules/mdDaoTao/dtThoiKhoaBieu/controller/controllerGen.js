module.exports = app => {
    const DATE_UNIX = 24 * 60 * 60 * 1000;

    app.get('/api/dt/thoi-khoa-bieu/generate/get-by-config', app.permission.check('dtThoiKhoaBieu:read'), async (req, res) => {
        try {
            const { config } = req.query;
            let { rows: dataCanGen } = await app.model.dtThoiKhoaBieu.getListGen(JSON.stringify({ ...config }));
            dataCanGen = dataCanGen.slice(0, 201);
            dataCanGen = dataCanGen.map(item => {
                item.isMo = !item.soTietBuoi || !item.maLop ? 0 : 1;
                return item;
            });
            res.send({ dataCanGen });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }

    });

    app.put('/api/dt/thoi-khoa-bieu/generate/save-config', app.permission.check('dtThoiKhoaBieu:read'), async (req, res) => {
        try {
            let { idThoiKhoaBieu, changes } = req.body;

            let item = await app.model.dtThoiKhoaBieu.update({ id: idThoiKhoaBieu }, changes);

            if (changes.maLop) {
                await app.model.dtThoiKhoaBieuNganh.delete({ idThoiKhoaBieu });
                for (let idNganh of changes.maLop) {
                    await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu, idNganh });
                }
            }
            const dataLop = await app.model.dtThoiKhoaBieuNganh.getAll({ idThoiKhoaBieu: item.id });
            res.send({ item: { ...item, maLop: dataLop.map(item => item.idNganh).toString() } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu/generate/save', app.permission.check('dtThoiKhoaBieu:read'), async (req, res) => {
        try {
            const { listHocPhan } = req.body,
                modifier = req.session.user.email,
                timeModified = Date.now();

            for (let hocPhan of listHocPhan) {
                await app.model.dtThoiKhoaBieu.update({ id: hocPhan.id }, {
                    ngayBatDau: hocPhan.ngayBatDau, ngayKetThuc: hocPhan.ngayKetThuc, tuanBatDau: hocPhan.tuanBatDau, soTuan: hocPhan.soTuan || '',
                    phong: hocPhan.phong, thu: hocPhan.thu, tietBatDau: hocPhan.tietBatDau, userModified: modifier, lastModified: timeModified,
                });
                await app.model.dtThoiKhoaBieuCustom.delete({ idThoiKhoaBieu: hocPhan.id });

                if (hocPhan.listTuanHoc && hocPhan.listTuanHoc.length) {
                    for (let tuan of hocPhan.listTuanHoc) {
                        await app.model.dtThoiKhoaBieuCustom.create({
                            ...tuan, maMonHoc: hocPhan.maMonHoc, maHocPhan: hocPhan.maHocPhan, hocKy: hocPhan.hocKy, namHoc: hocPhan.namHoc,
                            coSo: hocPhan.coSo, modifier, timeModified,
                        });
                    }
                }
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const genListTime = async (tuanBatDau) => {
        const year = Number(tuanBatDau.substring(tuanBatDau.length - 4));
        let currTime = Date.prototype.getListWeeksOfYear(year),
            nextTime = Date.prototype.getListWeeksOfYear(year + 1);

        currTime = currTime.filter(i => Number(i.weekNumber) >= Number(tuanBatDau));
        currTime = [...currTime, ...nextTime];
        currTime = currTime.slice(0, 26);

        return currTime.flatMap(i => {
            return Array.from({ length: (i.weekEnd - i.weekStart) / DATE_UNIX }, (_, w) => {
                let ngayHoc = w * DATE_UNIX + i.weekStart,
                    thu = new Date(ngayHoc).getDay() + 1;
                if (thu == 1) thu = 8;
                return { ngayHoc, thu, week: i.week, year: i.year };
            });
        });
    };

    const getRoomStatus = async ({ namHoc, hocKy, coSo, khoaDangKy, loaiHinhDaoTao, khoaSinhVien }) => {
        let [listRoom, { rows: listCurrent, lichtuan, lichsukien }] = await Promise.all([
            app.model.dmPhong.getAll({
                statement: 'kichHoat = 1 AND coSo = :coSo AND sucChua != 0',
                parameter: { coSo }
            }, 'ten,sucChua', 'sucChua'),
            app.model.dtThoiKhoaBieu.getStatusGen(app.utils.stringify({ namHoc, hocKy, coSo, khoaDangKy, loaiHinhDaoTao, khoaSinhVien })),
        ]);
        listCurrent = listCurrent.map(i => ({ ...i, maLop: i.maLop ? i.maLop.split(',') : [] }));

        return { listRoom, listCurrent, lichTuan: lichtuan, lichSuKien: lichsukien };
    };

    const generateDateTime = ({ listAvailable, soTietBuoi, thu, tietBatDau }) => {
        let list = checkListAvailable(listAvailable, soTietBuoi),
            itemChosen = {};
        if (thu) {
            if (list.find(i => i.thu == thu)) itemChosen = list.find(i => i.thu == thu);
            else itemChosen = list[Math.floor(Math.random() * list.length)];
        } else if (tietBatDau) {
            const listCaHoc = Array.from({ length: soTietBuoi }, (_, i) => i + tietBatDau),
                listCheck = list.filter(i => listCaHoc.every(ch => i.time.includes(ch)));

            if (listCheck.length) itemChosen = listCheck[Math.floor(Math.random() * listCheck.length)];
            else itemChosen = list[Math.floor(Math.random() * list.length)];
        } else itemChosen = list[Math.floor(Math.random() * list.length)];

        if (itemChosen) {
            let group = itemChosen.time.groupBy('buoi'),
                buoi = Object.keys(group).filter(key => group[key].length >= soTietBuoi).sample();

            return {
                newThu: itemChosen.thu,
                newTietBatDau: itemChosen.time.filter(i => i.buoi == buoi)[0].tiet,
                thoiGianPhuHop: true,
            };
        }
        return { thoiGianPhuHop: false, newThu: '', newTietBatDau: '' };
    };

    const generateTuan = async ({ list, listTime }) => {
        let cloneData = list.map(i => ({ ...i }));
        let listTuanHoc = [];

        cloneData = cloneData.map(item => {
            let thuBatDau = new Date(parseInt(item.weekStart)).getDay() + 1;
            if (thuBatDau == 1) thuBatDau = 8;
            let deviant = parseInt(item.thu) - thuBatDau;
            if (deviant < 0) deviant += 7;
            item.ngayHoc = parseInt(item.weekStart) + deviant * DATE_UNIX;
            return item;
        });

        const calTuanHoc = ({ ngayHoc, thu, tietBatDau, soTietBuoi, idThoiKhoaBieu }) => {
            const timeByNgay = listTime.filter(time => time.ngayHoc == ngayHoc),
                tietKetThuc = Number(tietBatDau) + Number(soTietBuoi) - 1;

            if (!timeByNgay.length) return { isNotGen: 1 };
            let batDau = timeByNgay.find(i => i.ten == tietBatDau),
                ketThuc = timeByNgay.find(i => i.ten == tietKetThuc);

            return {
                ngayHoc, thoiGianBatDau: batDau.batDau, thoiGianKetThuc: ketThuc.ketThuc, tuanBatDau: timeByNgay[0].week, isNgayLe: timeByNgay[0].isNgayLe,
                thu, tietBatDau: Number(tietBatDau), soTietBuoi: Number(soTietBuoi), gioBatDau: batDau.thoiGianBatDau, gioKetThuc: ketThuc.thoiGianKetThuc, idThoiKhoaBieu,
            };
        };

        for (let i = 0; i < cloneData.length; i++) {
            let hocPhan = Object.assign({}, cloneData[i]);
            if (hocPhan.soTuan) {
                let currentWeek = 1, lastWeek = currentWeek + hocPhan.soTuan;
                while (currentWeek < lastWeek) {
                    let tuanHoc = calTuanHoc({
                        ngayHoc: hocPhan.ngayHoc, thu: hocPhan.thu, tietBatDau: hocPhan.tietBatDau,
                        soTietBuoi: hocPhan.soTietBuoi, idThoiKhoaBieu: hocPhan.id,
                    });
                    if (tuanHoc.isNotGen) break;
                    if (!tuanHoc.isNgayLe) listTuanHoc.push({ ...tuanHoc });
                    hocPhan.ngayHoc += 7 * DATE_UNIX;
                }
            } else {
                let sumTiet = 0;
                while (sumTiet < Number(hocPhan.tongTiet)) {
                    let tuanHoc = calTuanHoc({
                        ngayHoc: hocPhan.ngayHoc, thu: hocPhan.thu, tietBatDau: hocPhan.tietBatDau,
                        soTietBuoi: hocPhan.soTietBuoi, idThoiKhoaBieu: hocPhan.id,
                    });
                    if (tuanHoc.isNotGen) break;
                    if (!tuanHoc.isNgayLe) {
                        sumTiet += parseInt(hocPhan.soTietBuoi);
                        listTuanHoc.push({ ...tuanHoc });
                    }
                    hocPhan.ngayHoc += 7 * DATE_UNIX;
                }
            }
        }

        let newData = [], sumTiet = 0, tongTiet = Number(cloneData[0].tongTiet);
        for (let tuan of listTuanHoc.sort((a, b) => a.thoiGianBatDau - b.thoiGianBatDau)) {
            sumTiet += parseInt(tuan.soTietBuoi);
            if (sumTiet >= tongTiet) {
                let deviant = sumTiet - tongTiet;

                let tietKetThuc = tuan.tietBatDau + tuan.soTietBuoi - deviant - 1;
                const timeByNgay = listTime.find(time => time.ngayHoc == tuan.ngayHoc && time.ten == tietKetThuc);
                if (!timeByNgay) break;
                newData.push({ ...tuan, soTietBuoi: tuan.soTietBuoi - deviant, thoiGianKetThuc: timeByNgay.ketThuc, gioKetThuc: timeByNgay.thoiGianKetThuc });
                break;
            }
            newData.push(tuan);
        }
        return newData;
    };

    const generateDateAvailable = async (list, tiet) => {
        return [2, 3, 4, 5, 6, 7].map(thu => {
            const listTime = list.filter(i => i.thu == thu).flatMap(i => Array.from({ length: Number(i.soTietBuoi) }, (_, t) => t + Number(i.tietBatDau)));
            return { thu, time: tiet.filter(i => !listTime.includes(Number(i.tiet))) };
        });
    };

    const checkListAvailable = (list, soTietBuoi) => {
        return list.map(item => {
            const { thu, time } = item;
            let tmp = [], check = [];
            if (time.length < soTietBuoi) tmp = [];
            let count = 1;
            for (let i = 0; i < time.length - 1; i++) {
                if (time[i].buoi == time[i + 1].buoi && time[i].tiet + 1 == time[i + 1].tiet) {
                    count += 1;
                    check.push(time[i]);

                    if (count >= soTietBuoi) {
                        check.push(time[i + 1]);
                        tmp = [...tmp, ...check.map(i => ({ ...i }))];
                    }
                } else {
                    count = 1;
                    check = [];
                }
            }

            tmp = tmp.filter((item, index, self) => {
                return index === self.findIndex((i) => (
                    i.tiet === item.tiet && i.buoi === item.buoi
                ));
            });
            return { thu, time: tmp };
        }).filter(i => i.time.length);
    };

    const generateRoom = ({ listTuan, listTime, listRoom, soLuongDuKien }) => {
        let listRoomUsed = listTime.filter(time => listTuan.find(tuan => !(time.batDau > tuan.thoiGianKetThuc || time.ketThuc < tuan.thoiGianBatDau))).flatMap(time => time.listRoomUsed),
            room = listRoom.filter(i => i.sucChua >= soLuongDuKien && !listRoomUsed.includes(i.ten))[0],
            phong = '', sucChua = 0;

        if (room) {
            phong = room.ten;
            sucChua = room.sucChua;
            listTime.forEach(time => {
                if (listTuan.find(tuan => tuan.thoiGianBatDau <= time.batDau && tuan.thoiGianKetThuc >= time.ketThuc)) {
                    time.listRoomUsed = [...new Set([...time.listRoomUsed, phong])];
                    // time.listIdThoiKhoaBieu = [...new Set([...time.listIdThoiKhoaBieu, idThoiKhoaBieu])];
                    // time.listMaHocPhan = [...new Set([...time.listMaHocPhan, maHocPhan])];
                }
            });
        }
        return { phong, sucChua };
    };

    app.post('/api/dt/thoi-khoa-bieu/generate/', app.permission.check('dtThoiKhoaBieu:read'), async (req, res) => {
        try {
            const { config, listHocPhan } = req.body,
                { namHoc, hocKy, coSo, khoaDangKy, loaiHinhDaoTao, khoaSinhVien, tuanBatDau } = config;

            let [dataTiet, listNgayLe, { listRoom, listCurrent, lichTuan, lichSuKien }, listTime] = await Promise.all([
                app.model.dmCaHoc.getAll({ maCoSo: config.coSo, kichHoat: 1 }, 'ten,buoi,thoiGianBatDau,thoiGianKetThuc', 'TO_NUMBER(ten)'),
                app.model.dmNgayLe.getAll({
                    statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear and kichHoat = 1',
                    parameter: {
                        startDateOfYear: new Date(parseInt(config.namHoc) - 1, 0, 1).setHours(0, 0, 0, 0),
                        endDateOfYear: new Date(parseInt(config.namHoc) + 1, 11, 31).setHours(23, 59, 59, 999)
                    }
                }, 'ngay'),
                getRoomStatus({ namHoc, hocKy, coSo, khoaDangKy, loaiHinhDaoTao, khoaSinhVien }),
                genListTime(tuanBatDau),
            ]);

            listTime = listTime.flatMap(time => {
                return dataTiet.map(tiet => {
                    tiet.ten = Number(tiet.ten);
                    const [gioBatDau, phutBatDau] = tiet.thoiGianBatDau.split(':'),
                        [gioKetThuc, phutKetThuc] = tiet.thoiGianKetThuc.split(':');

                    const batDau = new Date(time.ngayHoc).setHours(parseInt(gioBatDau), parseInt(phutBatDau)),
                        ketThuc = new Date(time.ngayHoc).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

                    const hpTrung = lichTuan.filter(tuan => !(batDau > tuan.thoiGianKetThuc || ketThuc < tuan.thoiGianBatDau)),
                        skTrung = lichSuKien.filter(sk => !(batDau > sk.thoiGianKetThuc || ketThuc < sk.thoiGianBatDau));

                    const listRoomUsed = [...hpTrung.map(i => i.phong), ...skTrung.map(i => i.phong)].filter(i => i);

                    const isNgayLe = listNgayLe.find(nl => nl.ngay == time.ngayHoc);

                    return { ...time, ...tiet, batDau, ketThuc, listRoomUsed: [...new Set(listRoomUsed)], isNgayLe: Number(!!isNgayLe) };
                });
            });
            res.send({});

            let index = 0, size = listHocPhan.length;
            for (const maLop of [...new Set(listHocPhan.flatMap(hp => hp.maLop.split(',')))]) {
                const listDaXep = listCurrent.map(i => i.maHocPhan),
                    danhSachXep = listHocPhan.filter(hp => hp.maLop.split(',').includes(maLop) && !listDaXep.includes(hp.maHocPhan)),
                    danhSachGroup = danhSachXep.groupBy('maHocPhan');

                for (const danhSachHP of Object.values(danhSachGroup)) {
                    for (const hocPhan of danhSachHP) {
                        // Chọn tiết, thứ và thời gian của học phần
                        let { thu, tietBatDau, soTietBuoi, tongTiet, weekStart, maMonHoc } = hocPhan;
                        soTietBuoi = Number(soTietBuoi);
                        tongTiet = Number(tongTiet);
                        weekStart = Number(weekStart);
                        const listHpTrungLop = listCurrent.filter(cur => cur.maLop.includes(maLop) && cur.maMonHoc != maMonHoc && cur.ngayKetThuc > weekStart + 7 * DATE_UNIX),
                            listBuoiHocPhan = danhSachHP.filter(i => i.thu && i.tietBatDau && i.soTietBuoi && i.thoiGianPhuHop).map(i => ({ ...i, tietKetThuc: Number(i.tietBatDau) + Number(i.soTietBuoi) - 1 }));

                        let listAvailable = await generateDateAvailable([...listHpTrungLop, ...listBuoiHocPhan], dataTiet.map(i => ({ tiet: i.ten, buoi: i.buoi })));
                        let thoiGianPhuHop = false, newThu = thu, newTietBatDau = tietBatDau;
                        if (thu && tietBatDau) {
                            // Kiểm tra trùng học phần với học phần cùng lớp
                            const tietKetThuc = Number(tietBatDau) + soTietBuoi - 1;
                            if ([...listHpTrungLop, ...listBuoiHocPhan].find(hp => !(tietBatDau > hp.tietKetThuc || tietKetThuc < hp.tietBatDau))) {
                                // Trung thi gen lai lich moi
                                const result = generateDateTime({ listAvailable, soTietBuoi });

                                newThu = result.newThu;
                                newTietBatDau = result.newTietBatDau;
                                thoiGianPhuHop = result.thoiGianPhuHop;
                            } else thoiGianPhuHop = true;
                        } else if (thu) {
                            const result = generateDateTime({ listAvailable, soTietBuoi, thu });
                            newThu = result.newThu;
                            newTietBatDau = result.newTietBatDau;
                            thoiGianPhuHop = result.thoiGianPhuHop;
                        } else if (tietBatDau) {
                            const result = generateDateTime({ listAvailable, soTietBuoi, tietBatDau });
                            newThu = result.newThu;
                            newTietBatDau = result.newTietBatDau;
                            thoiGianPhuHop = result.thoiGianPhuHop;
                        } else {
                            const result = generateDateTime({ listAvailable, soTietBuoi });
                            newThu = result.newThu;
                            newTietBatDau = result.newTietBatDau;
                            thoiGianPhuHop = result.thoiGianPhuHop;
                        }
                        hocPhan.thu = newThu;
                        hocPhan.tietBatDau = newTietBatDau;
                        hocPhan.thoiGianPhuHop = thoiGianPhuHop;
                    }

                    // Chọn phòng học
                    // => chọn danh sách phòng available 
                    if (danhSachHP.find(hp => hp.thoiGianPhuHop)) {
                        const listPhuHop = danhSachHP.filter(i => i.thoiGianPhuHop);
                        let listTuan = await generateTuan({ listTime, list: listPhuHop });

                        for (const hocPhan of listPhuHop) {
                            let listTuanByHP = listTuan.filter(i => i.idThoiKhoaBieu == hocPhan.id);
                            let { phong, sucChua } = generateRoom({ listTuan: listTuanByHP, listTime, listRoom, soLuongDuKien: hocPhan.soLuongDuKien });

                            if (listTuanByHP.length) {
                                hocPhan.sucChua = sucChua;
                                hocPhan.phong = phong;
                                hocPhan.ngayBatDau = listTuanByHP[0].ngayHoc;
                                hocPhan.ngayKetThuc = listTuanByHP[listTuanByHP.length - 1].ngayHoc;
                                hocPhan.listTuanHoc = listTuanByHP.map(i => ({ ...i, phong }));

                                listCurrent.push({ ...hocPhan, maLop: hocPhan.maLop.split(',') });
                            }
                        }
                    }
                    (index % Math.ceil(size / 50) == 0) && app.io.to(req.session.user.email).emit('genTKB', { listHocPhan, listTime, status: 'gen' });
                    index++;
                }
            }
            app.io.to(req.session.user.email).emit('genTKB', { listHocPhan, listTime, status: 'done' });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};