module.exports = app => {
    app.get('/user/dao-tao/stu-graduation', app.permission.check('dtDanhSachXetTotNghiep:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/xet-tot-nghiep/all', app.permission.check('dtDanhSachXetTotNghiep:manage'), async (req, res) => {
        try {
            const data = await app.model.dtDanhSachXetTotNghiep.getAll({});
            res.send({ data });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/xet-tot-nghiep/page/:pageNumber/:pageSize', app.permission.check('dtDanhSachXetTotNghiep:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;

            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtDanhSachXetTotNghiep.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            let { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;

            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/xet-tot-nghiep/detail', app.permission.check('dtDanhSachXetTotNghiep:manage'), async (req, res) => {
        try {
            let { mssv, idDot } = req.query.filter;
            let [dataDiem, { rows: totNghiepDetail, datamontotnghiep: dataMonTotNghiep }, rotMon] = await Promise.all([
                app.model.dtDiemAll.getDataDiem(app.utils.stringify({ mssv })),
                app.model.dtDanhSachXetTotNghiep.getDetail(app.utils.stringify({ mssv, idDot })),
                app.model.dtCauHinhDiem.getValue('rotMon'),
            ]);
            rotMon = rotMon.rotMon;

            dataDiem = dataDiem.rows.map(i => {
                let diem = i.diem ? JSON.parse(i.diem) : {};
                let tpDiem = i.tpHocPhan || i.tpMonHoc || i.configDefault,
                    configQC = i.configQC ? JSON.parse(i.configQC) : [];
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];
                return { ...i, diem, tpDiem, configQC };
            });

            dataDiem = Object.keys(dataDiem.groupBy('maMonHoc')).map(mon => {
                let listDiem = dataDiem.filter(i => i.maMonHoc == mon),
                    { maMonHoc, tenMonHoc, tongTinChi } = listDiem[0],
                    isPass = 0, diem = '';
                listDiem = listDiem.map(i => {
                    const { diem, configQC, diemDat } = i,
                        threshold = Number(diemDat || rotMon || 5),
                        diemDacBiet = configQC.find(i => i.ma == diem['TK']);
                    let isPass = 0, isDiemDacBiet = 0;
                    if (diemDacBiet) {
                        let { tinhTinChi } = diemDacBiet;
                        tinhTinChi = Number(tinhTinChi);
                        if (tinhTinChi) {
                            isPass = 1;
                        }
                        isDiemDacBiet = 1;
                    } else {
                        if (parseFloat(diem['TK']) >= threshold) {
                            isPass = 1;
                        }
                    }
                    return { diem: diem['TK'] || '', isPass, isDiemDacBiet };
                });

                let list = listDiem.filter(i => !i.isDiemDacBiet && i.isPass).map(i => i.diem);
                diem = listDiem.find(i => i.isDiemDacBiet)?.diem || (list.length ? Math.max.apply(null, list) : '');
                if (listDiem.find(i => i.isDiemDacBiet || i.isPass)) isPass = 1;
                return { maMonHoc, tenMonHoc, tongTinChi, diem, isPass };
            });

            totNghiepDetail = totNghiepDetail.map(i => {
                let cauTrucTinChi = i.cauTrucTinChi ? JSON.parse(i.cauTrucTinChi) : [],
                    mucCha = i.mucCha ? JSON.parse(i.mucCha) : { chuongTrinhDaoTao: {} },
                    mucCon = i.mucCon ? JSON.parse(i.mucCon) : { chuongTrinhDaoTao: {} };
                cauTrucTinChi.sort((a, b) => Number(a.idKhung) - Number(b.idKhung));
                return { ...i, cauTrucTinChi, mucCha: mucCha.chuongTrinhDaoTao, mucCon: mucCon.chuongTrinhDaoTao };
            });
            res.send({ totNghiepDetail: totNghiepDetail[0], dataMonTotNghiep, dataDiem });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/xet-tot-nghiep/change', app.permission.check('dtDanhSachXetTotNghiep:manage'), async (req, res) => {
        try {
            let { idDot, mssv, dsMon = [], dsMonThayThe = [], khoaSinhVien } = req.body.data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtSvMonHocXetTotNghiep.delete({ mssv, idDot });

            await Promise.all([
                ...dsMon.map(mon => app.model.dtSvMonHocXetTotNghiep.create({
                    idDot, mssv, userModified, timeModified, maKhoiKienThuc: mon.maKhoiKienThuc, maKhoiKienThucCon: mon.maKhoiKienThucCon, idKhungTinChi: mon.idKhungTinChi,
                    maMonHoc: mon.maMonHoc, loaiMonHoc: Number(mon.loaiMonHoc || 0), monTuongDuong: mon.monTuongDuong, diem: mon.diem, tongTinChi: mon.tongTinChi,
                    isDat: Number(mon.isDat || 0), isDacBiet: Number(mon.isDacBiet || 0), monThayThe: mon.monThayThe, tinChiTrungBinh: mon.tinChiTrungBinh,
                })),
                ...dsMonThayThe.map(mon => app.model.dtSvMonHocXetTotNghiep.create({
                    idDot, mssv, userModified, timeModified, maKhoiKienThuc: mon.maKhoiKienThuc, maKhoiKienThucCon: mon.maKhoiKienThucCon, idKhungTinChi: mon.idKhungTinChi,
                    maMonHoc: mon.maMonHoc, loaiMonHoc: Number(mon.loaiMonHoc || 0), monTuongDuong: mon.monTuongDuong, diem: mon.diem, tongTinChi: mon.tongTinChi,
                    monThayThe: mon.monThayThe, isDat: Number(mon.isDat || 0), isDacBiet: Number(mon.isDacBiet || 0), tinChiTrungBinh: mon.tinChiTrungBinh,
                })),
            ]);

            let [{ rows: totNghiepDetail, datamontotnghiep: dataMonTotNghiep }, monKhongTinhTB, thangDiem] = await Promise.all([
                app.model.dtDanhSachXetTotNghiep.getDetail(app.utils.stringify({ mssv, idDot })),
                app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
                app.model.dtDiemThangDiemKhoaSv.get({ khoaSinhVien })
            ]), detail = '', diemTotNghiep = '', tinChiTotNghiep = '', xepLoai = '';

            monKhongTinhTB = monKhongTinhTB.map(monHoc => monHoc.maMonHoc);

            let { cauTrucTinChi, mucCha, mucCon } = totNghiepDetail[0];
            cauTrucTinChi = cauTrucTinChi ? JSON.parse(cauTrucTinChi) : [];
            mucCha = mucCha ? JSON.parse(mucCha).chuongTrinhDaoTao : {};
            mucCon = mucCon ? JSON.parse(mucCon).chuongTrinhDaoTao : {};

            Object.keys(mucCha).forEach((key) => {
                const childs = mucCon[key];
                const { id } = mucCha[key];
                if (childs && childs.length) {
                    childs.forEach(child => {
                        let dataTinChi = cauTrucTinChi.filter(i => i.maKhoiKienThuc == id && i.maKhoiKienThucCon == child.id && i.parentId == null);
                        if (dataTinChi.length) {
                            let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                            if (nhomBatBuoc) {
                                const soTinChiDat = dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomBatBuoc.idKhung && i.loaiMonHoc == 0 && !i.monTuongDuong).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                                cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomBatBuoc.idKhung ? { ...i, soTinChiDat, isCal: 1 } : { ...i });
                            }

                            let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                            if (nhomTuChon) {
                                if (Number(nhomTuChon.isDinhHuong) || Number(nhomTuChon.isNhom)) {
                                    let childTuChon = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung);
                                    childTuChon.forEach(tuChon => {
                                        const soTinChiDat = dataMonTotNghiep.filter(i => i.idKhungTinChi == tuChon.idKhung && i.loaiMonHoc == 1 && !i.monTuongDuong).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                                        cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == tuChon.idKhung ? { ...i, soTinChiDat, isCal: 1 } : { ...i });
                                    });
                                    if (Number(nhomTuChon.isDinhHuong)) {
                                        let soTc = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung).reduce((acc, cur) => acc < cur.soTinChiDat ? cur.soTinChiDat : acc, 0);
                                        cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomTuChon.idKhung ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                    }
                                    if (Number(nhomTuChon.isNhom)) {
                                        let soTc = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung).reduce((acc, cur) => acc + cur.soTinChiDat, 0);
                                        cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomTuChon.idKhung ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                    }
                                } else {
                                    const soTinChiDat = dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomTuChon.idKhung && i.loaiMonHoc == 1 && !i.monTuongDuong).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                                    cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomTuChon.idKhung ? { ...i, soTinChiDat, isCal: 1 } : { ...i });
                                }
                            }
                        }
                    });
                } else {
                    let dataTinChi = cauTrucTinChi.filter(i => i.maKhoiKienThuc == id && i.maKhoiKienThucCon == null && i.parentId == null);
                    if (dataTinChi.length) {
                        let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                        if (nhomBatBuoc) {
                            const soTinChiDat = dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomBatBuoc.idKhung && i.loaiMonHoc == 0 && !i.monTuongDuong).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                            cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomBatBuoc.idKhung ? { ...i, soTinChiDat, isCal: 1 } : { ...i });
                        }

                        let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                        if (nhomTuChon) {
                            if (Number(nhomTuChon.isDinhHuong) || Number(nhomTuChon.isNhom)) {
                                let childTuChon = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung);
                                childTuChon.forEach(tuChon => {
                                    const soTinChiDat = dataMonTotNghiep.filter(i => i.idKhungTinChi == tuChon.idKhung && i.loaiMonHoc == 1 && !i.monTuongDuong).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                                    cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == tuChon.idKhung ? { ...i, soTinChiDat, isCal: 1 } : { ...i });
                                });
                                if (Number(nhomTuChon.isDinhHuong)) {
                                    let soTc = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung).reduce((acc, cur) => acc < cur.soTinChiDat ? cur.soTinChiDat : acc, 0);
                                    cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomTuChon.idKhung ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                }
                                if (Number(nhomTuChon.isNhom)) {
                                    let soTc = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung).reduce((acc, cur) => acc + cur.soTinChiDat, 0);
                                    cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomTuChon.idKhung ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                }
                            } else {
                                const soTinChiDat = dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomTuChon.idKhung && i.loaiMonHoc == 1 && !i.monTuongDuong).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                                cauTrucTinChi = cauTrucTinChi.map(i => i.idKhung == nhomTuChon.idKhung ? { ...i, soTinChiDat, isCal: 1 } : { ...i });
                            }
                        }
                    }
                }
            });

            // check tin chi
            let listCheckTinChi = [...cauTrucTinChi.map(i => Object.assign({}, i))],
                khoiTuongDuong = listCheckTinChi.find(i => i.khoiKienThucTuongDuong);
            if (khoiTuongDuong && khoiTuongDuong.isCal && khoiTuongDuong.tongSoTinChi <= khoiTuongDuong.soTinChiDat) {
                khoiTuongDuong.khoiKienThucTuongDuong.split(';').forEach(i => {
                    const [idKhoi, tinChi] = i.split(':');

                    listCheckTinChi = listCheckTinChi.map(tc => tc.id == idKhoi ? { ...tc, tongSoTinChi: Number(tc.tongSoTinChi || 0) - Number(tinChi || 0) } : { ...tc });
                });
            }

            // Kiểm tra trường hợp tương đương với tự chọn nhóm và tự chọn định hướng
            const listCheckDinhHuong = listCheckTinChi.filter(i => Number(i.isDinhHuong) && !i.khoiKienThucTuongDuong && !i.parentId);
            if (listCheckTinChi.filter(i => !Number(i.isDinhHuong) && !i.khoiKienThucTuongDuong).find(i => i.isCal && i.tongSoTinChi > i.soTinChiDat)) detail = 'Sinh viên không học đủ số tín chỉ.';

            if (listCheckDinhHuong.find(i => i.isCal && i.tongSoTinChi > i.soTinChiDat)) detail = 'Sinh viên không học đủ số tín chỉ.';

            if (listCheckDinhHuong.find(i => i.isCal && listCheckTinChi.filter(lst => lst.parentId == i.id).every(lst => lst.isCal && lst.tongSoTinChi > lst.soTinChiDat))) detail = 'Sinh viên không học đủ số tín chỉ.';

            let listDiemMon = dataMonTotNghiep.filter(i => !i.monTuongDuong).filter((i, idx, self) => {
                let distinct = self.findIndex(mh => mh.maMonHoc == i.maMonHoc) == idx;
                return i.isDat && distinct;
            });

            let listTinhDiem = listDiemMon.filter(i => !monKhongTinhTB.includes(i.maMonHoc) && i.isDat && !isNaN(parseFloat(i.diem)));

            let listTinhTinChi = listDiemMon.filter(i => i.isDat && (!isNaN(parseFloat(i.diem)) || i.isDacBiet));

            diemTotNghiep = ((listTinhDiem.reduce((total, cur) => total + Number(cur.diem) * Number(cur.tinChiTrungBinh), 0)) / (listTinhDiem.reduce((total, cur) => total + Number(cur.tinChiTrungBinh), 0) || 1)).toFixed(2);
            tinChiTotNghiep = listTinhTinChi.reduce((sum, cur) => sum + cur.tinChiTrungBinh, 0);

            if (thangDiem) {
                xepLoai = await app.model.dtDiemConfigXepLoai.get({
                    statement: `maThangDiem = :maThangDiem AND min <= TO_NUMBER(:diem) AND ${Number(diemTotNghiep) == 10 ? 'max = \'10\'' : 'max > TO_NUMBER(:diem)'}`,
                    parameter: { maThangDiem: thangDiem.maThangDiem, diem: diemTotNghiep }
                }).then(i => i ? i.idXepLoai : '');
            }

            await app.model.dtDanhSachXetTotNghiep.update({ mssv, idDot }, { userModified, timeModified, isTotNghiep: detail ? 0 : 1, detail, diemTotNghiep, tinChiTotNghiep, xepLoai });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/xet-tot-nghiep/check-condition', app.permission.check('dtDanhSachXetTotNghiep:manage'), async (req, res) => {
        try {
            let { idDot, mssv, maCtdt } = req.body.data;
            const stuInfo = await app.model.fwStudent.get({ mssv, tinhTrang: 1 });
            if (!stuInfo) {
                throw { message: 'Sinh viên không còn học!' };
            }
            await Promise.all([
                app.model.dtDanhSachXetTotNghiep.delete({ mssv, idDot }),
                app.model.dtSvMonHocXetTotNghiep.delete({ mssv, idDot }),
                app.model.dtSvCauTrucTinChi.delete({ mssv, idDot }),
            ]);
            await app.model.dtDanhSachXetTotNghiep.setUpTotNghiep([{ mssv, maCtdt }], idDot, req.session.user.email);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};