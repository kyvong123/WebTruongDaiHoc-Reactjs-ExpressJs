// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtDanhSachXetTotNghiep.foo = async () => { };

    const checkDiem = (listDiem, rotMon) => {
        return listDiem.map(i => {
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
    };

    // tính toán điểm theo danh sách môn học và trả về tổng số tín chỉ 
    const checkMonHoc = (listMonBatBuoc, dataDiem, svMonHoc, rotMon, listTuongDuong) => {
        let soTinChi = 0;
        for (let mon of listMonBatBuoc) {
            let listDiem = dataDiem.filter(i => i.maMonHoc == mon.maMonHoc),
                listTD = listTuongDuong.filter(i => i.maMonHoc == mon.maMonHoc),
                { maMonHoc, loaiMonHoc, maKhoiKienThuc, maKhoiKienThucCon, tongTinChi, idKhungTinChi } = mon,
                isDat = 0,
                diem = '',
                isDacBiet = 0;

            listDiem = checkDiem(listDiem, rotMon);

            listTD = listTD.map(td => {
                let listDiemTD = dataDiem.filter(i => i.maMonHoc == td.maMonPhuThuoc);
                listDiemTD = checkDiem(listDiemTD, rotMon);

                let list = listDiemTD.filter(i => !i.isDiemDacBiet && i.isPass && i.diem).map(i => i.diem),
                    diemTD = list.length ? Math.max.apply(null, list) : '';
                return {
                    ...td, isPass: !!listDiemTD.find(i => i.isPass),
                    diem: listDiemTD.find(i => i.isDiemDacBiet)?.diem || diemTD,
                    isDacBiet: Number(!!listDiemTD.find(i => i.isDiemDacBiet)),
                };
            });

            if ((listDiem.length && listDiem.find(i => i.isPass)) || (listTD.length && listTD.every(i => i.isPass))) {
                soTinChi += Number(tongTinChi);
                let list = listDiem.filter(i => !i.isDiemDacBiet && i.isPass).map(i => i.diem);
                diem = listDiem.find(i => i.isDiemDacBiet)?.diem || (list.length ? Math.max.apply(null, list) : '');
                isDat = 1;
                isDacBiet = Number(!!listDiem.find(i => i.isDiemDacBiet));
            }

            listTD.forEach(td => {
                if (!svMonHoc.find(i => i.maMonHoc == td.maMonHoc && i.monTuongDuong == td.maMonPhuThuoc)) {
                    svMonHoc.push({ maMonHoc, loaiMonHoc, maKhoiKienThuc, maKhoiKienThucCon, diem: td.diem, isDat: Number(td.isPass), monTuongDuong: td.maMonPhuThuoc, tongTinChi: td.tongTinChiPhuThuoc, tinChiTrungBinh: td.tongTinChiPhuThuoc, idKhungTinChi, isDacBiet: td.isDacBiet });
                }
            });

            svMonHoc.push({ maMonHoc, loaiMonHoc, maKhoiKienThuc, maKhoiKienThucCon, diem, isDat, tongTinChi, tinChiTrungBinh: tongTinChi, idKhungTinChi, isDacBiet });
        }
        return soTinChi;
    };

    app.model.dtDanhSachXetTotNghiep.setUpTotNghiep = async (listStudent, idDot, email) => {
        for (let stu of listStudent) {
            let detail = '', listSvMonHoc = [], diemTotNghiep = '', tinChiTotNghiep = '',
                { mssv } = stu;

            let isExist = await app.model.dtDanhSachXetTotNghiep.get({ mssv, idDot });
            if (isExist) continue;

            let stuInfo = await app.model.fwStudent.get({ mssv }, 'mssv, lop'),
                lop = await app.model.dtLop.get({ maLop: stuInfo.lop }, 'maLop, maCtdt, khoaSinhVien');

            if (!lop) {
                detail = 'Sinh viên chưa có lớp.';
                await app.model.dtDanhSachXetTotNghiep.create({ mssv, isTotNghiep: 0, detail, modifier: email, timeModified: Date.now(), idDot, maCtdt: stu.maCtdt });
                continue;
            }

            const ngoaiNgu = await app.model.dtChungChiSinhVien.get({ mssv, isTotNghiep: 1 });
            if (!ngoaiNgu) {
                await app.model.dtDanhSachXetTotNghiep.create({ mssv, isTotNghiep: 0, detail: 'Sinh viên chưa đủ điều kiện chứng chỉ ngoại ngữ xét tốt nghiệp', modifier: email, timeModified: Date.now(), idDot, isChungChi: 0, maCtdt: stu.maCtdt });
                continue;
            }

            const loaiChungChi = await app.model.dtDmLoaiChungChi.getAll({ isXetTotNghiep: 1 }, 'ma, ten'),
                dataChungChi = await Promise.all(loaiChungChi.map(async cc => ({ ...cc, isTotNghiep: await app.model.dtChungChiTinHocSinhVien.get({ mssv, isTotNghiep: 1, loaiChungChi: cc.ma }) })));

            const checkChungChi = dataChungChi.find(i => !i.isTotNghiep);
            if (checkChungChi) {
                await app.model.dtDanhSachXetTotNghiep.create({ mssv, isTotNghiep: 0, detail: `Sinh viên chưa đủ điều kiện chứng chỉ ${checkChungChi.ten?.toLowerCase()} xét tốt nghiệp`, modifier: email, timeModified: Date.now(), idDot, isChungChi: 0, maCtdt: stu.maCtdt });
                continue;
            }

            // Kiểm tra CTDT
            let [dataDiem, khungDaoTao] = await Promise.all([
                app.model.dtDiemAll.getDataDiem(app.utils.stringify({ mssv })),
                app.model.dtKhungDaoTao.get({ maCtdt: stu.maCtdt }),
            ]);

            dataDiem = dataDiem.rows.map(i => {
                let diem = i.diem ? JSON.parse(i.diem) : {};
                let tpDiem = i.tpHocPhan || i.tpMonHoc || i.configDefault,
                    configQC = i.configQC ? JSON.parse(i.configQC) : [];
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];
                return { ...i, diem, tpDiem, configQC };
            });

            if (!khungDaoTao) {
                detail = 'Chương trình đào tạo chưa có khung đào tạo.';
                await app.model.dtDanhSachXetTotNghiep.create({ mssv, isTotNghiep: 0, detail, modifier: email, timeModified: Date.now(), idDot, maCtdt: stu.maCtdt });
                continue;
            }

            let [dataChuongTrinhDaoTao, rotMon, monKhongTinhTB, khungTinChi] = await Promise.all([
                app.model.dtChuongTrinhDaoTao.getData(app.utils.stringify({ maKhungDaoTao: khungDaoTao.id, maKhung: khungDaoTao.maKhung })),
                app.model.dtCauHinhDiem.getValue('rotMon'),
                app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
                app.model.dtKhungTinChiDaoTao.getAll({ maKhungDaoTao: khungDaoTao.id }),
            ]);

            if (!khungTinChi.length) {
                detail = 'Chương trình đào tạo chưa có cấu trúc tín chỉ.';
                await app.model.dtDanhSachXetTotNghiep.create({ mssv, isTotNghiep: 0, detail, modifier: email, timeModified: Date.now(), idDot, maCtdt: stu.maCtdt });
                continue;
            }

            let { rows: ctdt, datacautruckhung: cauTrucKhung, datakehoachdaotao: listTuongDuong } = dataChuongTrinhDaoTao;

            rotMon = rotMon.rotMon;
            monKhongTinhTB = monKhongTinhTB.map(monHoc => monHoc.maMonHoc);

            let mucCha = app.utils.parse(cauTrucKhung[0].mucCha, { chuongTrinhDaoTao: {} }).chuongTrinhDaoTao,
                mucCon = app.utils.parse(cauTrucKhung[0].mucCon, { chuongTrinhDaoTao: {} }).chuongTrinhDaoTao,
                khoiCha = khungTinChi.filter(e => e.maKhoiKienThucCon == null),
                khoiCon = khungTinChi.filter(e => e.maKhoiKienThucCon != null);

            Object.keys(mucCha).forEach(key => {
                let { id } = mucCha[key];
                let children = mucCon[key];
                if (children && children.length) {
                    // handle when co muc con
                    for (let child of children) {
                        let dataTinChi = khoiCon.filter(i => i.maKhoiKienThuc == id && i.maKhoiKienThucCon == child.id && i.parentId == null);
                        if (dataTinChi.length) {
                            let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                            if (nhomBatBuoc) {
                                let listMon = ctdt.filter(i => i.idKhungTinChi == nhomBatBuoc.id && i.loaiMonHoc == 0),
                                    soTinChiBatBuoc = checkMonHoc(listMon, dataDiem, listSvMonHoc, rotMon, listTuongDuong);
                                khungTinChi = khungTinChi.map(i => i.id == nhomBatBuoc.id ? { ...i, soTinChiDat: soTinChiBatBuoc, isCal: 1 } : { ...i });
                            }

                            let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                            if (nhomTuChon) {
                                if (nhomTuChon.isDinhHuong || nhomTuChon.isNhom) {
                                    let childTuChon = khungTinChi.filter(i => i.parentId == nhomTuChon.id);
                                    childTuChon.forEach(tuChon => {
                                        let listMon = ctdt.filter(i => i.idKhungTinChi == tuChon.id && i.loaiMonHoc == 1),
                                            soTinChiTc = checkMonHoc(listMon, dataDiem, listSvMonHoc, rotMon, listTuongDuong);
                                        khungTinChi = khungTinChi.map(i => i.id == tuChon.id ? { ...i, soTinChiDat: soTinChiTc, isCal: 1 } : { ...i });
                                    });
                                    if (nhomTuChon.isDinhHuong) {
                                        let soTc = khungTinChi.filter(i => i.parentId == nhomTuChon.id).reduce((acc, cur) => acc > cur.soTinChiDat ? cur.soTinChiDat : acc, 0);
                                        khungTinChi = khungTinChi.map(i => i.id == nhomTuChon.id ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                    }
                                    if (nhomTuChon.isNhom) {
                                        let soTc = khungTinChi.filter(i => i.parentId == nhomTuChon.id).reduce((acc, cur) => acc + cur.soTinChiDat, 0);
                                        khungTinChi = khungTinChi.map(i => i.id == nhomTuChon.id ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                    }
                                } else {
                                    let listMon = ctdt.filter(i => i.idKhungTinChi == nhomTuChon.id && i.loaiMonHoc == 1),
                                        soTinChiTc = checkMonHoc(listMon, dataDiem, listSvMonHoc, rotMon, listTuongDuong);
                                    khungTinChi = khungTinChi.map(i => i.id == nhomTuChon.id ? { ...i, soTinChiDat: soTinChiTc, isCal: 1 } : { ...i });
                                }
                            }
                        }
                    }
                } else {
                    let dataTinChi = khoiCha.filter(i => i.maKhoiKienThuc == id && i.parentId == null);

                    if (dataTinChi.length) {
                        let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                        if (nhomBatBuoc) {
                            let listMon = ctdt.filter(i => i.idKhungTinChi == nhomBatBuoc.id && i.loaiMonHoc == 0),
                                soTinChiBatBuoc = checkMonHoc(listMon, dataDiem, listSvMonHoc, rotMon, listTuongDuong);
                            khungTinChi = khungTinChi.map(i => i.id == nhomBatBuoc.id ? { ...i, soTinChiDat: soTinChiBatBuoc, isCal: 1 } : { ...i });
                        }

                        let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                        if (nhomTuChon) {
                            if (nhomTuChon.isDinhHuong || nhomTuChon.isNhom) {
                                let childTuChon = khungTinChi.filter(i => i.parentId == nhomTuChon.id);
                                childTuChon.forEach(tuChon => {
                                    let listMon = ctdt.filter(i => i.idKhungTinChi == tuChon.id && i.loaiMonHoc == 1),
                                        soTinChiTc = checkMonHoc(listMon, dataDiem, listSvMonHoc, rotMon, listTuongDuong);
                                    khungTinChi = khungTinChi.map(i => i.id == tuChon.id ? { ...i, soTinChiDat: soTinChiTc, isCal: 1 } : { ...i });
                                });
                                if (nhomTuChon.isDinhHuong) {
                                    let soTc = khungTinChi.filter(i => i.parentId == nhomTuChon.id).reduce((acc, cur) => acc < cur.soTinChiDat ? cur.soTinChiDat : acc, 0);
                                    khungTinChi = khungTinChi.map(i => i.id == nhomTuChon.id ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                }
                                if (nhomTuChon.isNhom) {
                                    let soTc = khungTinChi.filter(i => i.parentId == nhomTuChon.id).reduce((acc, cur) => acc + cur.soTinChiDat, 0);
                                    khungTinChi = khungTinChi.map(i => i.id == nhomTuChon.id ? { ...i, soTinChiDat: soTc, isCal: 1 } : { ...i });
                                }
                            } else {
                                let listMon = ctdt.filter(i => i.idKhungTinChi == nhomTuChon.id && i.loaiMonHoc == 1),
                                    soTinChiTc = checkMonHoc(listMon, dataDiem, listSvMonHoc, rotMon, listTuongDuong);
                                khungTinChi = khungTinChi.map(i => i.id == nhomTuChon.id ? { ...i, soTinChiDat: soTinChiTc, isCal: 1 } : { ...i });
                            }
                        }
                    }
                }
            });

            // kiểm tra điều kiện tín chỉ
            let listCheckTinChi = [...khungTinChi.map(i => Object.assign({}, i))],
                khoiTuongDuong = listCheckTinChi.find(i => i.khoiKienThucTuongDuong);
            if (khoiTuongDuong && khoiTuongDuong.isCal && khoiTuongDuong.tongSoTinChi <= khoiTuongDuong.soTinChiDat) {
                khoiTuongDuong.khoiKienThucTuongDuong.split(';').forEach(i => {
                    const [idKhoi, tinChi] = i.split(':');

                    listCheckTinChi = listCheckTinChi.map(tc => tc.id == idKhoi ? { ...tc, tongSoTinChi: Number(tc.tongSoTinChi || 0) - Number(tinChi || 0) } : { ...tc });
                });
            }

            // Kiểm tra trường hợp tương đương với tự chọn nhóm và tự chọn định hướng
            const listCheckDinhHuong = listCheckTinChi.filter(i => i.isDinhHuong && !i.khoiKienThucTuongDuong && !i.parentId);
            if (listCheckTinChi.filter(i => !i.isDinhHuong && !i.khoiKienThucTuongDuong).find(i => i.isCal && i.tongSoTinChi > i.soTinChiDat)) detail = 'Sinh viên không học đủ số tín chỉ.';
            if (listCheckDinhHuong.find(i => i.isCal && i.tongSoTinChi > i.soTinChiDat)) detail = 'Sinh viên không học đủ số tín chỉ.';
            if (listCheckDinhHuong.find(i => i.isCal && listCheckTinChi.filter(lst => lst.parentId == i.id).every(lst => lst.isCal && lst.tongSoTinChi > lst.soTinChiDat))) detail = 'Sinh viên không học đủ số tín chỉ.';

            const listMonNCT = dataDiem.filter(i => !listSvMonHoc.find(svmh => svmh.maMonHoc == i.maMonHoc));
            Object.keys(listMonNCT.groupBy('maMonHoc')).map(mon => {
                let listDiem = listMonNCT.filter(i => i.maMonHoc == mon),
                    { maMonHoc, tongTinChi } = listDiem[0] || {},
                    isDat = 0,
                    diem = '';

                listDiem = checkDiem(listDiem, rotMon);

                if ((listDiem.length && listDiem.find(i => i.isPass))) {
                    let list = listDiem.filter(i => !i.isDiemDacBiet && i.isPass).map(i => i.diem);
                    diem = listDiem.find(i => i.isDiemDacBiet)?.diem || (list.length ? Math.max.apply(null, list) : '');
                    isDat = 1;
                }

                listSvMonHoc.push({ maMonHoc, loaiMonHoc: 1, diem, isDat, tongTinChi, tinChiTrungBinh: tongTinChi });
            });


            let listDiemMon = listSvMonHoc.filter(i => !i.monTuongDuong).filter((i, idx, self) => {
                let distinct = self.findIndex(mh => mh.maMonHoc == i.maMonHoc) == idx;
                return i.isDat && distinct;
            });

            let listTinhDiem = listDiemMon.filter(i => !monKhongTinhTB.includes(i.maMonHoc) && i.isDat && !isNaN(parseFloat(i.diem)));

            let listTinhTinChi = listDiemMon.filter(i => i.isDat && (!isNaN(parseFloat(i.diem)) || i.isDacBiet));

            diemTotNghiep = ((listTinhDiem.reduce((total, cur) => total + Number(cur.diem) * Number(cur.tongTinChi), 0)) / (listTinhDiem.reduce((total, cur) => total + Number(cur.tongTinChi), 0) || 1)).toFixed(2);
            tinChiTotNghiep = listTinhTinChi.reduce((sum, cur) => sum + cur.tongTinChi, 0);

            const thangDiem = await app.model.dtDiemThangDiemKhoaSv.get({ khoaSinhVien: lop.khoaSinhVien });
            let xepLoai = '';
            if (thangDiem) {
                xepLoai = await app.model.dtDiemConfigXepLoai.get({
                    statement: `maThangDiem = :maThangDiem AND min <= TO_NUMBER(:diem) AND ${Number(diemTotNghiep) == 10 ? 'max = \'10\'' : 'max > TO_NUMBER(:diem)'}`,
                    parameter: { maThangDiem: thangDiem.maThangDiem, diem: diemTotNghiep }
                }).then(i => i ? i.idXepLoai : '');
            }

            await Promise.all([
                ...listSvMonHoc.map(i => app.model.dtSvMonHocXetTotNghiep.create({ ...i, mssv, userModified: email, timeModified: Date.now(), idDot })),
                ...khungTinChi.map(i => app.model.dtSvCauTrucTinChi.create({ mssv, idDot, tongSoTinChi: i.tongSoTinChi, maKhoiKienThuc: i.maKhoiKienThuc, maKhoiKienThucCon: i.maKhoiKienThucCon, loaiKhung: i.loaiKhung, tenNhomDinhHuong: i.tenNhomDinhHuong, isDinhHuong: i.isDinhHuong, isNhom: i.isNhom, parentId: i.parentId, khoiKienThucTuongDuong: i.khoiKienThucTuongDuong, idKhung: i.id })),
                app.model.dtDanhSachXetTotNghiep.create({ mssv, isTotNghiep: detail ? 0 : 1, detail, modifier: email, timeModified: Date.now(), idDot, diemTotNghiep, tinChiTotNghiep, isChungChi: 1, xepLoai, maKhung: khungDaoTao.maKhung, maCtdt: stu.maCtdt }),
            ]);
        }
    };
};