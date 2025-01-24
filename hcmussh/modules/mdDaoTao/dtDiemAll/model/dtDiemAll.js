// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtDiemAll.foo = () => { };
    app.model.dtDiemAll.updateDiemTK = async ({ mssv, maHocPhan, maMonHoc, namHoc, hocKy }) => {
        let allDiem = await app.model.dtDiemAll.getAll({ mssv, maHocPhan, maMonHoc, namHoc, hocKy }, 'loaiDiem, phanTramDiem, diem'),
            isTK = allDiem.find(i => i.loaiDiem == 'TK');
        allDiem = allDiem.filter(i => i.loaiDiem != 'TK');

        let sumDiem = '';
        for (const item of allDiem) {
            const diem = item.diem;
            if (diem && isNaN(diem)) {
                sumDiem = diem;
                break;
            } else if (diem != '' && diem != null) {
                if (sumDiem == '') sumDiem = parseFloat(diem) * parseInt(item.phanTramDiem);
                else sumDiem += parseFloat(diem) * parseInt(item.phanTramDiem);
            }
        }
        if (!isNaN(parseFloat(sumDiem))) {
            sumDiem = (Math.round((2 * sumDiem) / 100) / 2).toFixed(1);
        }
        return { isTK, sumDiem: sumDiem.toString() };
    };

    const tongTCHK = (list) => {
        return list.reduce((result, item) => result + parseInt(item.tongTinChi || 0), 0);
    };

    const diemTrungBinhHK = (list, monKhongTinhTB, rotMon) => {
        let tongTC = 0, tongDiem = 0, tinChiDat = 0, tinChiDatTinhTb = 0;
        let tongTcThuc = 0, tongDiemThuc = 0;
        list.filter(i => i.diem).forEach(item => {
            const { configQC, diem, diemDat } = item,
                diemDacBiet = configQC.find(i => i.ma == diem['TK']),
                threshold = parseFloat(diemDat || rotMon || 5);

            let { tinhTinChi } = diemDacBiet || { tinhTinChi: 0 };

            if (Number(diem['TK'] || 0) >= threshold || Number(tinhTinChi)) {
                tinChiDat += Number(item.tongTinChi);
            }

            if (!monKhongTinhTB.includes(item.maMonHoc) && !diemDacBiet) {
                tongDiem += Number(item.diem['TK'] || 0) * Number(item.tongTinChi);
                tongTC += Number(item.tongTinChi);
                if (Number(item.noHocPhi) >= 0) {
                    tongDiemThuc += Number(item.diem['TK'] || 0) * Number(item.tongTinChi);
                    tongTcThuc += Number(item.tongTinChi);
                }
            }

            if (Number(diem['TK'] || 0) >= threshold && !monKhongTinhTB.includes(item.maMonHoc) && !diemDacBiet) {
                tinChiDatTinhTb += Number(item.tongTinChi);
            }
        });
        return {
            diemTrungBinh: tongTC == 0 ? 0 : Math.round((tongDiem / tongTC + 1e-9) * 100) / 100,
            diemTrungBinhThuc: tongTcThuc == 0 ? 0 : Math.round((tongDiemThuc / tongTcThuc + 1e-9) * 100) / 100,
            tinChiTinhDiemTb: tongTC,
            tinChiDat,
            tinChiDatTinhTb,
        };
    };

    const diemTrungBinhTichLuyHK = (list, rotMon, monKhongTinhTB, semester) => {
        const listMonHoc = (list || []).groupBy('maMonHoc');
        let { namHoc, hocKy } = semester,
            soTCTichLuy = 0, diemTB = 0, soTCDky = 0, tinChiTichLuyHocKy = 0;

        Object.keys(listMonHoc).forEach(key => {
            const monHoc = listMonHoc[key].filter(monHoc => monHoc.diem);
            let diemTBMon = 0, TCTLMon = 0, TCTinhTb = 0;

            for (let diemMon of monHoc) {
                const { diem, tongTinChi, configQC, diemDat } = diemMon,
                    threshold = Number(diemDat || rotMon || 5);

                if (tongTinChi) {
                    const diemDacBiet = configQC.find(i => i.ma == diem['TK']);
                    if (diemDacBiet) {
                        let { tinhTinChi } = diemDacBiet;
                        tinhTinChi = Number(tinhTinChi);
                        if (tinhTinChi) TCTLMon = tongTinChi;
                    } else {
                        if (Number(diem['TK']) >= threshold) {
                            TCTLMon = tongTinChi;
                            if (diemTBMon < Number(diem['TK'] || 0)) {
                                TCTinhTb = tongTinChi;
                                diemTBMon = Number(diem['TK'] || 0);
                            }
                        }
                        if (monKhongTinhTB.includes(key)) TCTinhTb = 0;
                    }
                }
            }

            soTCTichLuy += TCTLMon;
            diemTB += diemTBMon * TCTinhTb;
            soTCDky += TCTinhTb;
        });

        list.filter(i => i.diem && i.namHoc == namHoc && i.hocKy == hocKy).forEach(item => {
            const { configQC, diem, diemDat } = item,
                diemDacBiet = configQC.find(i => i.ma == diem['TK']),
                threshold = parseFloat(diemDat || rotMon || 5);

            let { tinhTinChi } = diemDacBiet || { tinhTinChi: 0 };

            if (Number(diem['TK'] || 0) >= threshold || Number(tinhTinChi)) {
                let listMon = listMonHoc[item.maMonHoc].filter(e => !(e.namHoc == namHoc && e.hocKy == hocKy));
                let check = listMon.find(mon => {
                    const { configQC, diem, diemDat } = mon,
                        diemDacBiet = configQC.find(i => i.ma == diem['TK']),
                        threshold = parseFloat(diemDat || rotMon || 5);

                    let { tinhTinChi } = diemDacBiet || { tinhTinChi: 0 };
                    return Number(diem['TK']) >= threshold || Number(tinhTinChi);
                });
                if (!check) tinChiTichLuyHocKy += parseInt(item.tongTinChi);
            }
        });

        return { diemTrungBinhTichLuy: soTCDky == 0 ? 0 : Math.round((diemTB / soTCDky + 1e-9) * 100) / 100, soTCTichLuy, tinChiTichLuyHocKy };
    };

    app.model.dtDiemAll.diemTrungBinh = async ({ mssv, namHoc: namHocSchedule, hocKy: hocKySchedule, isSchedule }) => {
        let [dataDiem, rotMon, monKhongTinhTB] = await Promise.all([
            app.model.dtDiemAll.getDataDiem(app.utils.stringify({ mssv })),
            app.model.dtCauHinhDiem.getValue('rotMon'),
            app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
        ]);

        monKhongTinhTB = monKhongTinhTB.map(monHoc => monHoc.maMonHoc);

        dataDiem = dataDiem.rows.map(i => {
            let diem = i.diem ? JSON.parse(i.diem) : {},
                lockDiem = i.lockDiem ? JSON.parse(i.lockDiem) : {};

            if (Object.keys(lockDiem).length) {
                lockDiem.TK = Object.keys(lockDiem).filter(i => i != 'TK').every(i => Number(lockDiem[i]));
            }

            Object.keys(diem).filter(i => i != 'TK').forEach(i => diem[i] = Number(lockDiem[i]) ? diem[i] : '');
            diem.TK = lockDiem.TK ? diem.TK : '';

            let tpDiem = i.tpHocPhan || i.tpMonHoc || i.configDefault,
                configQC = i.configQC ? JSON.parse(i.configQC) : [];
            tpDiem = tpDiem ? JSON.parse(tpDiem) : [];
            return { ...i, diem, tpDiem, configQC };
        });

        const dataNamHoc = (dataDiem || []).groupBy('namHoc');
        const namHocKeys = Object.keys(dataNamHoc);

        for (const namHoc of namHocKeys) {
            const dataHocKy = dataNamHoc[namHoc].groupBy('hocKy');
            for (const hocKy of Object.keys(dataHocKy).sort((a, b) => a - b ? - 1 : 0)) {
                const tinChiDangKy = tongTCHK(dataHocKy[hocKy]),
                    { diemTrungBinh, tinChiTinhDiemTb, tinChiDat, tinChiDatTinhTb, diemTrungBinhThuc } = diemTrungBinhHK(dataHocKy[hocKy], monKhongTinhTB, rotMon.rotMon),
                    { diemTrungBinhTichLuy, soTCTichLuy: tinChiTichLuy, tinChiTichLuyHocKy } = diemTrungBinhTichLuyHK(dataDiem.filter(i => (i.namHoc == namHoc && i.hocKy <= hocKy) || (i.namHoc < namHoc)), parseFloat(rotMon.rotMon), monKhongTinhTB, { namHoc, hocKy });

                const exist = await app.model.dtDiemTrungBinh.get({ mssv, namHoc, hocKy });
                if (!exist) {
                    // eslint-disable-next-line no-unused-vars
                    const tmp = await app.model.dtDiemTrungBinh.create({ mssv, namHoc, hocKy, diemTrungBinh, diemTrungBinhTichLuy, tinChiDangKy, tinChiTichLuy, tinChiTinhDiemTb, tinChiTichLuyHocKy, tinChiDat, tinChiDatTinhTb, diemTrungBinhThuc, dateModified: Date.now() });
                } else {
                    // eslint-disable-next-line no-unused-vars
                    const tmp = await app.model.dtDiemTrungBinh.update({ mssv, namHoc, hocKy }, { diemTrungBinh, diemTrungBinhTichLuy, tinChiDangKy, tinChiTichLuy, tinChiTinhDiemTb, tinChiTichLuyHocKy, tinChiDat, tinChiDatTinhTb, diemTrungBinhThuc, dateModified: Date.now() });
                }
                if (isSchedule && namHoc == namHocSchedule && hocKy == hocKySchedule) {
                    // eslint-disable-next-line no-unused-vars
                    const log = await app.model.dtDiemTrungBinhHistory.create({ mssv, namHoc, hocKy, diemTrungBinh, diemTrungBinhTichLuy, tinChiDangKy, tinChiTichLuy, diemTrungBinhThuc, dateModified: Date.now() });
                }
            }
        }
    };
};