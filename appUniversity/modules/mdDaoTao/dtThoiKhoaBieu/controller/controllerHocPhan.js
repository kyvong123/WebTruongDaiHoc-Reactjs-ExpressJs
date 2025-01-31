module.exports = app => {
    app.get('/api/dt/hoc-phan/get-by-ctdt', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let filter = req.query.filter;
            filter = { khoaSinhVien: 2022, nganh: '7310614', hocKyDuKien: 1, loaiHinhDaoTao: 'CQ', namHocDuKien: '2022 - 2023' };
            filter = app.utils.stringify(filter);
            let items = await app.model.dtChuongTrinhDaoTao.getByFilter(filter);
            res.send({ items: items.rows });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/hoc-phan/create-multiple', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        // Mở lớp học phần.
        try {
            let { data, settings } = req.body,
                { email: userModified } = req.session.user,
                lastModified = new Date().getTime(),
                listHocPhan = [];
            let semester = await app.model.dtSemester.get({ namHoc: settings.namHoc, hocKy: settings.hocKy });

            let startIndex = parseInt(settings.startIndex);
            for (let index = startIndex; index - startIndex < data.length; index++) {
                let item = data[index - startIndex],
                    { maMonHoc, namHoc, hocKy, soBuoiTuan, maLopHeDaoTao, coSo, soLuongDuKien, tenMonHoc, tyLeDiem } = settings,
                    { maLop, maLopGhep } = item;
                const maHocPhan = `${namHoc.split(' - ')[0].substring(2, 4)}${hocKy}${maLopHeDaoTao}${maMonHoc}L${('0' + (index + 1).toString()).slice(-2)}`;
                let checkHocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan });
                if (!checkHocPhan) {
                    for (let buoi = 1; buoi <= parseInt(soBuoiTuan || 1); buoi++) {
                        const tkbItem = await app.model.dtThoiKhoaBieu.create(app.clone(item, settings, { nhom: index + 1, buoi, maHocPhan, userModified, lastModified, tinhTrang: 1 }));
                        if (maLop && maLop.length) {
                            for (const lop of maLop) {
                                await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: tkbItem.id, idNganh: lop, lopChinh: 1 });
                            }
                        }
                        if (maLopGhep && maLopGhep.length) {
                            for (const lop of maLopGhep) {
                                await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: tkbItem.id, idNganh: lop, lopChinh: 0 });
                            }
                        }
                        app.dkhpRedis.initInfoHocPhan(maHocPhan);
                        app.dkhpRedis.initSiSoHocPhan(maHocPhan);
                    }
                    if (tyLeDiem && tyLeDiem.length && tyLeDiem.reduce((acc, cur) => acc + Number(cur.phanTram), 0) == 100) {
                        await Promise.all(tyLeDiem.map(tyle => app.model.dtDiemConfigHocPhan.create({ maHocPhan, maMonHoc, loaiThanhPhan: tyle.loaiThanhPhan, phanTram: tyle.phanTram, modifier: userModified, lastModified, loaiLamTron: tyle.loaiLamTron })));
                    }
                    let data = { coSo: parseInt(coSo), idSemester: semester.ma, maHocPhan, maMonHoc, siSo: 0, soLuongDuKien: parseInt(soLuongDuKien), tenMonHoc };
                    listHocPhan.push(data);
                } else {
                    throw `Trùng học phần ${maHocPhan}`;
                }
            }
            res.send({ listHocPhan });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/hoc-phan/check-if-exist', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const { maMonHoc, bacDaoTao, loaiHinhDaoTao, namHoc, hocKy, khoaSinhVien } = data;
            let checkItems = await app.model.dtThoiKhoaBieu.getAll({ maMonHoc, bacDaoTao, loaiHinhDaoTao, namHoc, hocKy }, 'maMonHoc,nhom');
            if (checkItems.length) {
                checkItems = checkItems.map(item => parseInt(item.nhom));
                let maxNhomCurrent = Math.max(...checkItems);
                res.send({ warning: `Môn học ${maMonHoc} đã có ${maxNhomCurrent} lớp cho hệ ${loaiHinhDaoTao}, khoá ${khoaSinhVien}`, maxNhomCurrent });
            }
            else res.end();
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/dt/hoc-phan/get-data', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtDiemAll:read', 'dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let maHocPhan = req.query.maHocPhan, namHoc = new Date(Date.now()).getFullYear();
            let [data, listTuanHoc] = await Promise.all([
                app.model.dtThoiKhoaBieu.getData(maHocPhan),
                app.model.dtThoiKhoaBieuCustom.getData(maHocPhan, app.utils.stringify({}))
            ]);

            let listWeeksOfYear = {};
            data.rows.forEach((_, index) => {
                const tuanBatDau = data.rows[index].tuanBatDau;
                const year = Number(tuanBatDau ? tuanBatDau.toString().substring(tuanBatDau.toString().length - 4) : namHoc);
                listWeeksOfYear[index] = Date.prototype.getListWeeksOfYear(year);
            });

            listTuanHoc = listTuanHoc.rows.map(tuan => {
                let giangVien = data.datateacher.filter(item => item.type == 'GV' && item.idTuan == tuan.idTuan).map(item => item.hoTen);
                let troGiang = data.datateacher.filter(item => item.type == 'TG' && item.idTuan == tuan.idTuan).map(item => item.hoTen);

                let shccGiangVien = data.datateacher.filter(item => item.type == 'GV' && item.idTuan == tuan.idTuan).map(item => item.shcc);
                let shccTroGiang = data.datateacher.filter(item => item.type == 'TG' && item.idTuan == tuan.idTuan).map(item => item.shcc);

                return { ...tuan, giangVien, troGiang, shccGiangVien, shccTroGiang };
            });

            const tuanBatDau = data.rows[0].tuanBatDau;
            const year = Number(tuanBatDau ? tuanBatDau.toString().substring(tuanBatDau.toString().length - 4) : namHoc);

            res.send({
                fullData: data.rows, isAdjust: listTuanHoc.length, listWeeksOfYear,
                dataTiet: data.datacahoc, listNgayLe: data.datangayle, dataTeacher: data.datateacher,
                dataNgayNghi: data.datangaynghi, dataNgayBu: data.datangaybu, listTuanHoc,
                dataNamBatDau: [year - 1, year, year + 1],
            });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/hoc-phan/cau-hinh-thanh-phan-diem', app.permission.orCheck('dtThoiKhoaBieu:write', 'dtDiemAll:write'), async (req, res) => {
        try {
            let { dataHocPhan, dataThanhPhan } = req.body, { maHocPhan, maMonHoc, namHoc, hocKy } = dataHocPhan;
            let modifier = req.session.user.email,
                lastModified = Date.now();

            let dataTP = await app.model.dtDiemConfigHocPhan.getAll({ maHocPhan, maMonHoc });

            await app.model.dtDiemConfigHocPhan.delete({ maHocPhan, maMonHoc });
            for (let thanhPhan of dataThanhPhan) {
                let { loaiThanhPhan, phanTram, loaiLamTron = '0.5' } = thanhPhan;
                let thi = dataTP.find(i => i.loaiThanhPhan == loaiThanhPhan);
                await app.model.dtDiemConfigHocPhan.create({ maHocPhan, maMonHoc, loaiThanhPhan, phanTram, modifier, lastModified, loaiLamTron, hinhThucThi: thi?.hinhThucThi || '' });
            }

            let listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv');

            await Promise.all(listStudent.map(async stu => {
                let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv: stu.mssv };

                const allDiem = await app.model.dtDiemAll.getAll(condition);
                if (allDiem.length) {
                    await app.model.dtDiemAll.delete(condition);

                    for (let tp of dataThanhPhan) {
                        let { loaiThanhPhan, phanTram } = tp;
                        const exist = allDiem.find(i => i.loaiDiem == loaiThanhPhan && i.diem != null);
                        if (exist) {
                            await app.model.dtDiemAll.create({ ...condition, loaiDiem: loaiThanhPhan, phanTramDiem: phanTram, diem: exist.diem ?? '', diemDacBiet: exist.diemDacBiet ?? '', isLock: exist.isLock, timeLock: exist.isLock ? lastModified : '' });
                            await app.model.dtDiemHistory.create({ ...condition, loaiDiem: loaiThanhPhan, oldDiem: exist?.diem ?? '', newDiem: exist?.diem ?? '', diemDacBiet: exist.diemDacBiet ?? '', phanTramDiem: phanTram, hinhThucGhi: 5, userModified: modifier, timeModified: lastModified });
                        }
                    }

                    if (allDiem.filter(i => i.diem != null && i.loaiDiem != 'TK').length) {
                        const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK(condition);

                        if (isTK) {
                            await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
                        } else {
                            await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
                        }
                        app.dkhpRedis.initDiemStudent(stu.mssv);
                    }
                }
            }));

            await app.model.dtAssignRoleNhapDiem.updateThanhPhan({ maHocPhan, maMonHoc, namHoc, hocKy, modifier, lastModified });
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/hoc-phan/diem-sinh-vien', app.permission.orCheck('dtThoiKhoaBieu:write', 'dtDiemAll:write'), async (req, res) => {
        try {
            let { changes } = req.body,
                { dataStudent, dataThanhPhanDiem, dataHocPhan } = JSON.parse(changes),
                userModified = req.session.user.email,
                timeModified = Date.now();

            for (let stu of dataStudent) {
                let { mssv, diem, diemDacBiet, ghiChu, khongTinhPhi } = stu,
                    { maHocPhan, namHoc, hocKy } = dataHocPhan,
                    isLock = 1,
                    timeLock = timeModified;

                khongTinhPhi = Number(khongTinhPhi);

                for (let tp of dataThanhPhanDiem) {
                    let isExist = await app.model.dtDiemAll.get({ mssv, ...dataHocPhan, loaiDiem: tp.loaiThanhPhan }),
                        diemSv = diem && diem[tp.loaiThanhPhan] != null ? diem[tp.loaiThanhPhan] : '',
                        diemDb = diemDacBiet && diemDacBiet[tp.loaiThanhPhan] ? diemDacBiet[tp.loaiThanhPhan] : '';
                    if (isExist || !(diemSv == '' || diemSv == null)) {
                        if (isExist) {
                            await app.model.dtDiemAll.update({ mssv, ...dataHocPhan, loaiDiem: tp.loaiThanhPhan }, { diem: diemSv, diemDacBiet: diemDb, isLock, timeLock });
                        } else {
                            await app.model.dtDiemAll.create({ mssv, ...dataHocPhan, loaiDiem: tp.loaiThanhPhan, phanTramDiem: tp.phanTram, diem: diemSv, diemDacBiet: diemDb, isLock, timeLock });
                        }

                        if (((isExist?.diemDacBiet || isExist?.diem) ?? '') != (diemDb || diemSv)) {
                            await app.model.dtDiemHistory.create({ userModified, timeModified, mssv, ...dataHocPhan, phanTramDiem: tp.phanTram, oldDiem: isExist?.diem ?? '', newDiem: diemSv, loaiDiem: tp.loaiThanhPhan, diemDacBiet: diemDb, hinhThucGhi: 2 });
                        }
                    }
                }
                if (diem) {
                    let isTK = await app.model.dtDiemAll.get({ mssv, ...dataHocPhan, loaiDiem: 'TK' });
                    if (isTK || !(diem['TK'] == '' || diem['TK'] == null)) {
                        if (isTK) {
                            await app.model.dtDiemAll.update({ mssv, ...dataHocPhan, loaiDiem: 'TK' }, { diem: diem['TK'] ?? '' });
                        } else {
                            await app.model.dtDiemAll.create({ mssv, ...dataHocPhan, loaiDiem: 'TK', diem: diem['TK'] ?? '' });
                        }
                    }
                }
                if (khongTinhPhi) {
                    await app.model.dtDangKyHocPhan.update({ mssv, maHocPhan }, { tinhPhi: 0 });
                    await app.model.tcDotDong.dongBoHocPhi(parseInt(namHoc), hocKy, mssv, null, null, 1);
                }
                await app.model.dtDiemGhiChu.delete({ mssv, maHocPhan });
                await app.model.dtDiemGhiChu.create({ mssv, maHocPhan, ghiChu, userModified, timeModified });
                app.dkhpRedis.initDiemStudent(mssv);
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/hoc-phan/diem-sinh-vien/ghi-chu', app.permission.orCheck('dtThoiKhoaBieu:write', 'dtDiemAll:write'), async (req, res) => {
        try {
            let { ghiChu, mssv, maHocPhan } = req.body.changes;
            let userModified = req.session.user.email,
                timeModified = Date.now();
            await app.model.dtDiemGhiChu.delete({ mssv, maHocPhan });
            await app.model.dtDiemGhiChu.create({ mssv, maHocPhan, ghiChu, userModified, timeModified });
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/hoc-phan/diem-sinh-vien/nhap-diem', app.permission.orCheck('dtThoiKhoaBieu:write', 'dtDiemAll:write'), async (req, res) => {
        try {
            let { diemTK, phanTram, loaiThanhPhan, value = '', mssv, dataHocPhan, diemDacBiet = '' } = req.body.changes;
            let userModified = req.session.user.email,
                timeModified = Date.now();

            let isExist = await app.model.dtDiemAll.get({ mssv, ...dataHocPhan, loaiDiem: loaiThanhPhan }), oldDiem = '';
            if (isExist) {
                oldDiem = isExist.diem;
                await app.model.dtDiemAll.update({ mssv, ...dataHocPhan, loaiDiem: loaiThanhPhan }, { diem: value, diemDacBiet });
            } else {
                await app.model.dtDiemAll.create({ mssv, ...dataHocPhan, loaiDiem: loaiThanhPhan, phanTramDiem: phanTram, diem: value, diemDacBiet });
            }

            if (oldDiem != value || (isExist && isExist.diemDacBiet != diemDacBiet)) {
                await app.model.dtDiemHistory.create({ userModified, timeModified, mssv, ...dataHocPhan, phanTramDiem: phanTram, oldDiem, newDiem: value, loaiDiem: loaiThanhPhan, diemDacBiet, hinhThucGhi: 2 });
            }

            if (!isNaN(parseFloat(diemTK))) {
                let isTK = await app.model.dtDiemAll.get({ mssv, ...dataHocPhan, loaiDiem: 'TK' });
                if (isTK) {
                    await app.model.dtDiemAll.update({ mssv, ...dataHocPhan, loaiDiem: 'TK' }, { diem: diemTK });
                } else {
                    await app.model.dtDiemAll.create({ mssv, ...dataHocPhan, loaiDiem: 'TK', diem: diemTK });
                }
            }
            app.dkhpRedis.initDiemStudent(mssv);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/staff/get-giang-vien/filter', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { filter } = req.query,
                statement = '', parameter = {};
            let index = 0;
            while (filter[index]) {
                let item = filter[index];
                statement += `(NOT ((:ngayBatDau${index} > ngayKetThuc) OR (:ngayKetThuc${index} < ngayBatDau) OR idThoiKhoaBieu = :id${index}) AND idNgayNghi IS NULL) `;
                if (filter[index + 1]) statement += 'OR ';
                parameter[`ngayBatDau${index}`] = item.ngayBatDau;
                parameter[`ngayKetThuc${index}`] = item.ngayKetThuc;
                parameter[`id${index}`] = item.id;
                index++;
            }

            let tkbGVAll = await app.model.dtThoiKhoaBieuGiangVien.getAll({
                statement, parameter
            });
            tkbGVAll = tkbGVAll.map(i => i.giangVien);
            let listGiangVien = (await app.model.tchcCanBo.getGiangVien('', '')).rows;
            listGiangVien = listGiangVien.filter(giangVien => !tkbGVAll.includes(giangVien.shcc));
            res.send({ items: listGiangVien });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/hot-init-redis-hoc-phan/:listMaHocPhan', app.permission.check('developer:login'), async (req, res) => {
        try {
            let listMaHocPhan = req.params.listMaHocPhan;
            if (listMaHocPhan) {
                for (let maHocPhan of listMaHocPhan.split(',')) {
                    await Promise.all([
                        app.dkhpRedis.initInfoHocPhan(maHocPhan),
                        app.dkhpRedis.initSiSoHocPhan(maHocPhan),
                    ]);
                }
            } else {
                await Promise.all([
                    app.dkhpRedis.initInfoHocPhan(),
                    app.dkhpRedis.initSiSoHocPhan(),
                ]);
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/hoc-phan/get-data-multiple', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { listMaHocPhan } = req.query, namHoc = new Date(Date.now()).getFullYear();
            let dataHocPhan = {};
            let dataCaHoc = await app.model.dmCaHoc.getAll({ kichHoat: 1 });

            for (let maHocPhan of listMaHocPhan) {
                let dataReturn = [];
                let data = (await app.model.dtThoiKhoaBieu.getData(maHocPhan)).rows;
                namHoc = parseInt(data[0].namHoc);

                let dataFirst = data.filter(i => {
                    let valid = false;
                    if (i.ngayBatDau && i.thu) {
                        let thuBatDau = new Date(i.ngayBatDau).getDay() + 1;
                        if (thuBatDau == 1) thuBatDau = 8;
                        if (i.thu == thuBatDau) valid = true;
                    }
                    return valid;
                });

                if (dataFirst.length) {
                    // lấy học phần còn lại
                    let dataRest = data.filter(i => i.id != dataFirst[0].id);
                    dataReturn = [dataFirst[0], ...dataRest];
                } else {
                    dataReturn = data;
                }

                dataHocPhan[maHocPhan] = dataReturn;
            }

            let listWeeksOfYear = Date.prototype.getListWeeksOfYear(namHoc);

            let dataNgayLe = await app.model.dmNgayLe.getAll({
                statement: 'ngay >= :startDateOfYear',
                parameter: {
                    startDateOfYear: new Date(namHoc, 0, 1).setHours(0, 0, 0, 0),
                }
            });

            res.send({
                dataHocPhan, dataNgayLe, dataCaHoc, listWeeksOfYear
            });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/hoc-phan/save-gen-data', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { data } = req.body, modifier = req.session.user.email,
                lastModified = Date.now();
            data = JSON.parse(data);

            for (let eachData of data) {
                const { id, isNew } = eachData;
                delete eachData.id;

                if (isNew) {
                    await app.model.dtThoiKhoaBieu.create({ ...eachData, modifier, lastModified, soBuoiTuan: data.length });
                } else {
                    await app.model.dtThoiKhoaBieu.update({ id }, { ...eachData, soBuoiTuan: data.length, modifier, lastModified });
                }
            }

            let items = (await app.model.dtThoiKhoaBieu.getData(data[0].maHocPhan)).rows, dataReturn = [];
            let dataFirst = items.filter(i => {
                let valid = false;
                if (i.ngayBatDau && i.thu) {
                    let thuBatDau = new Date(i.ngayBatDau).getDay() + 1;
                    if (thuBatDau == 1) thuBatDau = 8;
                    if (i.thu == thuBatDau) valid = true;
                }
                return valid;
            });

            if (dataFirst.length) {
                // lấy học phần còn lại
                let dataRest = items.filter(i => i.id != dataFirst[0].id);
                dataReturn = [dataFirst[0], ...dataRest];
            } else {
                dataReturn = items;
            }
            res.send({ items: dataReturn });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};