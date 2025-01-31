module.exports = app => {
    const PERMISSION = 'student:login';
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    const splitGV = (giangVien, troGiang, id) => {
        let listGV = [], listTG = [];
        for (let gv of (giangVien?.split(',') || [])) {
            let gvInfo = gv.split('_');
            if (parseInt(gvInfo[0]) == id) {
                listGV.push(gvInfo[1]);
            }
            if (gvInfo.length == 1) {
                listGV.push(gvInfo[0]);
            }
        }
        for (let tg of (troGiang?.split(',') || [])) {
            let tgInfo = tg.split('_');
            if (parseInt(tgInfo[0]) == id) {
                listTG.push(tgInfo[1]);
            }
            if (tgInfo.length == 1) {
                listTG.push(tgInfo[0]);
            }
        }
        listGV = [...new Set(listGV)];
        listTG = [...new Set(listTG)];
        return [listGV.join(','), listTG.join(',')];
    };

    app.post('/api/dkmh/hoc-phan/get-data', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.mssv, { loaiHinhDaoTao, lop, khoaSV: khoaSinhVien } = user.data, { cauHinh } = req.body;
            let { namHoc, hocKy, theoKeHoach, ngoaiKeHoach, ngoaiCtdt, chuyenLop, ghepLop, ngoaiNgu } = cauHinh;

            theoKeHoach = Number(theoKeHoach);
            ngoaiKeHoach = Number(ngoaiKeHoach);
            ngoaiCtdt = Number(ngoaiCtdt);
            chuyenLop = Number(chuyenLop);
            ghepLop = Number(ghepLop);
            ngoaiNgu = Number(ngoaiNgu);

            let onlyChuyenLop = !theoKeHoach && !ngoaiKeHoach && !ngoaiCtdt && chuyenLop;
            let filter = {
                namHoc, hocKy, mssvFilter: mssv, heFilter: loaiHinhDaoTao,
            };
            if (theoKeHoach && !ngoaiKeHoach && !ngoaiCtdt) filter.lopFilter = lop;
            let [items, hocPhanDangKy, dataDiem, listDataTuanHoc, avrInfo, ngoaiNguInfo] = await Promise.all([
                app.model.dtDangKyHocPhan.searchHocPhan(app.utils.stringify(filter)),
                app.model.dtDangKyHocPhan.getHocPhan(mssv, app.utils.stringify(filter)),
                app.database.dkhpRedis.get(`DIEM:${mssv}`),
                app.database.dkhpRedis.get(`listDataTuanHoc|${namHoc}|${hocKy}`),
                app.model.dtDiemTrungBinh.get({
                    statement: 'mssv = :mssv AND (namHoc < :namHoc OR (namHoc = :namHoc AND hocKy < :hocKy))',
                    parameter: { mssv, namHoc, hocKy }
                }, 'tinChiDangKy, tinChiTichLuy, diemTrungBinhTichLuy', 'namHoc DESC, hocKy DESC'),
                app.database.dkhpRedis.get(`NGOAI_NGU:${mssv}`),
            ]);

            hocPhanDangKy = hocPhanDangKy.rows;
            let listKH = [], monHocKH = [], listNKH = [], monHocNKH = [], listNCTDT = [], monHocNCTDT = [], listCTDT = [], dataMaHocPhan = [],
                fullDataKH = [], fullDataNKH = [], fullDataNCTDT = [], itemsLopGhep = [];
            let redisRef = app.database.dkhpRedis;
            if (ngoaiCtdt || onlyChuyenLop) {
                listNCTDT = await redisRef.get('listMonHoc');
                monHocNCTDT = JSON.parse(listNCTDT);
            }
            [listCTDT, dataMaHocPhan] = await redisRef.multi().get(`CTDT:${mssv}|${cauHinh.id}`).get(`dataMaHocPhan|${cauHinh.id}`).exec();
            items = items.rows.filter(item => JSON.parse(dataMaHocPhan).includes(item.maHocPhan));

            if (ghepLop) {
                itemsLopGhep = await app.model.dtDangKyHocPhan.searchHocPhan(app.utils.stringify({ namHoc, hocKy, mssvFilter: mssv, lopFilter: lop, heGhep: loaiHinhDaoTao }));
                itemsLopGhep = itemsLopGhep.rows.filter(item => JSON.parse(dataMaHocPhan).includes(item.maHocPhan));
                items = [...items, ...itemsLopGhep];
            }

            if (ngoaiNgu) {
                if (!ngoaiNguInfo || ngoaiNguInfo == '') {
                    ngoaiNguInfo = await app.model.dtNgoaiNguKhongChuyen.checkTinhTrang({ mssv, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao, semester: `${namHoc.substring(2, 4)}${hocKy}`, idDot: cauHinh.id });
                    app.database.dkhpRedis.set(`NGOAI_NGU:${mssv}`, JSON.stringify(ngoaiNguInfo));
                } else {
                    ngoaiNguInfo = JSON.parse(ngoaiNguInfo);
                }
            } else {
                ngoaiNguInfo = null;
            }

            if (!listCTDT || listCTDT == '') {
                // Try reinit:
                await app.model.fwStudent.initCtdtRedis(mssv);
                listCTDT = await app.database.dkhpRedis.get(`CTDT:${mssv}|${cauHinh.id}`);
                if (!listCTDT && (theoKeHoach || ngoaiKeHoach)) {
                    return res.send({ warning: 'Vui lòng tải lại trang để load dữ liệu!' });
                }
            }
            if (!dataDiem || dataDiem == '') {
                dataDiem = await app.model.dtDiem.getDataByMonHoc(JSON.stringify({ mssvFilter: mssv }));
                dataDiem = dataDiem.rows;
                app.database.dkhpRedis.set(`DIEM:${mssv}`, JSON.stringify(dataDiem));
            } else {
                dataDiem = JSON.parse(dataDiem);
            }

            listCTDT = JSON.parse(listCTDT);
            listCTDT = listCTDT.map(item => {
                let diem = dataDiem.find(i => i.maMonHoc == item.maMonHoc) || {},
                    monTuongDuong = item.monTuongDuong ? item.monTuongDuong.split(';') : [],
                    monTienQuyet = item.monTienQuyet ? item.monTienQuyet.split(';') : [];

                monTuongDuong = monTuongDuong.map(mon => ({ maMon: mon, diem: dataDiem.find(i => i.maMonHoc == mon) || {} }));
                monTienQuyet = monTienQuyet.map(mon => ({ maMon: mon, diem: dataDiem.find(i => i.maMonHoc == mon) || {} }));

                return { ...item, ...diem, monTuongDuong, monTienQuyet };
            });

            items = items.filter(item => [...listCTDT.map(ctdt => ctdt.maMonHoc), ...monHocNCTDT.map(ctdt => ctdt.maMonHoc)].includes(item.maMonHoc) && !hocPhanDangKy.find(hocPhan => hocPhan.maHocPhan == item.maHocPhan));

            if (theoKeHoach || onlyChuyenLop) {
                monHocKH = listCTDT.filter(ctdt => ctdt.namHocDuKien == namHoc && ctdt.hocKyDuKien == hocKy);
                listKH = monHocKH.map(item => item.maMonHoc);
                fullDataKH = items.filter(item => listKH.includes(item.maMonHoc)).map(item => ({ ...item, type: 'KH' }));
            }
            if (ngoaiKeHoach || onlyChuyenLop) {
                monHocNKH = listCTDT.filter(ctdt => !(ctdt.namHocDuKien == namHoc && ctdt.hocKyDuKien == hocKy));
                listNKH = monHocNKH.map(item => item.maMonHoc);
                fullDataNKH = items.filter(item => listNKH.includes(item.maMonHoc)).map(item => ({ ...item, type: 'NKH' }));
            }
            if (ngoaiCtdt || onlyChuyenLop) {
                listNCTDT = monHocNCTDT.map(item => item.maMonHoc);
                fullDataNCTDT = items.filter(item => {
                    return listNCTDT.includes(item.maMonHoc) && ![...fullDataKH.map(kh => kh.maHocPhan), ...fullDataNKH.map(nkh => nkh.maHocPhan)].includes(item.maHocPhan);
                }).map(item => ({ ...item, type: 'NCTDT', loaiMonHoc: 1 }));
            }
            let fullData = await Promise.all([...fullDataKH, ...fullDataNKH, ...fullDataNCTDT].map(async item => {
                const [info, siSoHienTai] = await app.database.dkhpRedis.multi().get(`infoHocPhan:${item.maHocPhan}|${cauHinh.id}`).get(`SiSo:${item.maHocPhan}|${cauHinh.id}`).exec();
                let { giangVien, troGiang, listMaLop, ngayBatDau, ngayKetThuc } = JSON.parse(info || '{}');
                let [gvInfo, tgInfo] = splitGV(giangVien, troGiang, item.id);
                return {
                    ...item, giangVien: gvInfo, troGiang: tgInfo, siSo: parseInt(siSoHienTai), listMaLop, ngayBatDau, ngayKetThuc
                };
            }));

            hocPhanDangKy = await Promise.all(hocPhanDangKy.map(async item => {
                const info = await app.database.dkhpRedis.get(`infoHocPhan:${item.maHocPhan}|${cauHinh.id}`);
                let { giangVien, troGiang, listMaLop, ngayBatDau, ngayKetThuc } = JSON.parse(info || '{}');
                let [gvInfo, tgInfo] = splitGV(giangVien, troGiang, item.id);
                return { ...item, giangVien: gvInfo, troGiang: tgInfo, listMaLop, ngayBatDau, ngayKetThuc };
            }));

            if (ngoaiNgu) {
                let { status, tongSoTinChi, khoiKienThuc, ctdtDangKy } = ngoaiNguInfo;
                let dataDky = hocPhanDangKy.filter((hp, index, self) => self.findIndex(i => i.maHocPhan == hp.maHocPhan && i.tongSoTinChi == hp.tongSoTinChi) == index);
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
                        ctdtDangKy = ctdtDangKy ? app.utils.parse(ctdtDangKy) : [];
                        if (ctdtDangKy.length) {
                            let dataCheck = {};
                            dataCheck[`${namHoc.substring(2, 4)}${hocKy}`] = dataDky.filter(i => listKH.includes(i.maMonHoc)).reduce((acc, cur) => acc + Number(cur.tongTinChi), 0);
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

            monHocKH = monHocKH.filter(monHoc => !!fullDataKH.find(item => item.maMonHoc == monHoc.maMonHoc));

            monHocNKH = monHocNKH.filter(monHoc => !!fullDataNKH.find(item => item.maMonHoc == monHoc.maMonHoc));

            monHocNCTDT = monHocNCTDT.filter(monHoc => !!fullDataNCTDT.find(item => item.maMonHoc == monHoc.maMonHoc));
            monHocNCTDT = monHocNCTDT.map(item => {
                let diem = dataDiem.find(i => i.maMonHoc == item.maMonHoc) || {};
                let { monTuongDuong, monTienQuyet } = [...monHocKH, ...monHocNKH].find(i => i.maMonHoc == item.maMonHoc) || {};
                return { ...item, ...diem, monTuongDuong, monTienQuyet };
            });

            let dataResponse = {
                items, hocPhanDangKy,
                listKH, monHocKH,
                listNKH, monHocNKH,
                listNCTDT, monHocNCTDT,
                fullDataKH: fullData.filter(item => item.type == 'KH'),
                fullDataNKH: fullData.filter(item => item.type == 'NKH'),
                fullDataNCTDT: fullData.filter(item => item.type == 'NCTDT'),
                listDataTuanHoc: listDataTuanHoc ? JSON.parse(listDataTuanHoc) : [],
                avrInfo, ngoaiNguInfo,
            };
            console.log(`get data dkhp ${mssv} done`);
            res.send(dataResponse);
            app.arrayFunc.clearData(...Object.values(dataResponse));
            dataResponse = {};
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dkmh/hoc-phan/get-ket-qua-dky', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.studentId, { cauHinh } = req.query;
            const { namHoc, hocKy } = cauHinh;
            let filter = {
                namHoc, hocKy
            };

            let hocPhanDangKy = await app.model.dtDangKyHocPhan.getHocPhan(mssv, app.utils.stringify(filter));
            hocPhanDangKy = hocPhanDangKy.rows;

            res.send({ hocPhanDangKy });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dkmh/student/diem', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let { maMonHoc, cauHinhDiem } = req.query, user = req.session.user, mssv = user.studentId;
            let items = await app.model.dtDiem.getAll({ mssv, maMonHoc }, 'diemTk');
            let isCaiThien = false, isHocLai = false;
            if (items.length > 0) {
                if (items.every(diem => diem.diemTk < cauHinhDiem.rotMon)) {
                    isHocLai = true;
                } else {
                    isCaiThien = true;
                }
            }
            res.send({ items, isHocLai, isCaiThien });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dkmh/setting/config', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.studentId;
            if (user.data && user.data.tinhTrang != 1) throw { message: 'Sinh viên không còn học' };

            let { namTuyenSinh } = user.data;

            let dotDangKyAll = await app.model.dtDssvTrongDotDkhp.getData(mssv);

            dotDangKyAll = dotDangKyAll.rows;
            // Lấy thông tin cấu hình từ dtCauHinhDiem và dtSemester
            let [settingDiem, settingTKB, semester] = await app.database.dkhpRedis.multi().get('settingDiem').get('settingTKB').get('semester').exec();

            settingTKB = JSON.parse(settingTKB);
            settingDiem = JSON.parse(settingDiem);
            semester = JSON.parse(semester);

            Object.keys(settingDiem || {}).forEach(key => {
                settingDiem[key] = settingDiem[key] ? parseFloat(settingDiem[key]) : 0;
            });
            console.log(`get user info ${mssv} done`);
            res.send({ items: dotDangKyAll, namTuyenSinh, semester, settingDiem, settingTKB, timeNowServer: Date.now() });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
