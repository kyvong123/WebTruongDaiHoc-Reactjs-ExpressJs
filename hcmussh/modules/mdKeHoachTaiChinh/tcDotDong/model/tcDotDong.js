// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcDotDong.foo = () => { };
    const objectDinhMuc = async (namHoc, hocKy, namTuyenSinh) => {
        const { rows: listDinhMucNhom } = await app.model.tcDinhMuc.getHocPhiNhomAll(namHoc, hocKy, namTuyenSinh);
        const { rows: listDinhMucNganh } = await app.model.tcDinhMuc.getHocPhiNganhAll(namHoc, hocKy, namTuyenSinh);
        let objectDinhPhiTheoNhom = {};
        for (let item of listDinhMucNhom) {
            if (item.listNganhCon) {
                let listNganhCon = item.listNganhCon.split(',');
                for (let nganhCon of listNganhCon) {
                    objectDinhPhiTheoNhom[nganhCon] = { soTien: item.soTien, hocPhiHocKy: item.hocPhiHocKy, thuHocPhiHocKy: item.thuHocPhiHocKy };
                }
            }
            else {
                objectDinhPhiTheoNhom[item.loaiHinhDaoTao] = { soTien: item.soTien, hocPhiHocKy: item.hocPhiHocKy, thuHocPhiHocKy: item.thuHocPhiHocKy };
            }
        }
        for (let item of listDinhMucNganh) {
            objectDinhPhiTheoNhom[item.maNganh] = { soTien: item.soTien, hocPhiHocKy: item.hocPhiHocKy, thuHocPhiHocKy: item.thuHocPhiHocKy };
        }
        return objectDinhPhiTheoNhom;
    };

    let capNhatHocPhiMienGiam = async (mssv) => {
        let detail = await app.model.tcHocPhiDetail.getAll({ mssv });

        let tcHocPhi = await app.model.tcHocPhi.getAll({ mssv }).then(data => data.map(item => [item.namHoc, item.hocKy]));
        let tcMienGiam = await app.model.tcMienGiam.getAll({ mssv }).then(data => data.map(item => [item.namHoc, item.hocKy]));

        for (let item of detail) {
            const { namHoc, hocKy, loaiPhi, dotDong } = item;

            tcHocPhi.popByValue([namHoc, hocKy]);
            tcMienGiam.popByValue([namHoc, hocKy]);

            let getAllHocPhiDetail = await app.model.tcHocPhiDetail.getAll({ mssv, namHoc, hocKy, active: 1 });
            let checkMienGiam = await app.model.tcMienGiam.get({ mssv, namHoc, hocKy });

            let hocPhi = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });
            if (!hocPhi) {
                hocPhi = await app.model.tcHocPhi.create({
                    mssv, namHoc, hocKy,
                    hocPhi: 0, congNo: 0,
                    ngayTao: Date.now(),
                    hoanTra: 0, trangThai: 'MO'
                });
            }

            await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, {
                congNo: getAllHocPhiDetail.map(item => (item?.soTienCanDong - item?.soTienDaDong) || 0).sum(),
                hocPhi: getAllHocPhiDetail.map(item => item?.soTien || 0).sum(),
            });

            checkMienGiam && await app.model.tcMienGiam.update({ mssv, namHoc, hocKy }, {
                soTienMienGiam: getAllHocPhiDetail.map(item => (item?.soTien - item.soTienCanDong) || 0).sum(),
            });

            let checkSubDetail = await app.model.tcHocPhiSubDetail.getAll({ mssv, idDotDong: dotDong, loaiPhi });
            if (checkSubDetail && checkSubDetail.length && (item?.soTienDaDong || 0) >= (item?.soTienCanDong || 0)) {
                await Promise.all(checkSubDetail.map(hocPhan => app.model.tcHocPhiSubDetail.update({ id: hocPhan.id }, { soTienDaDong: hocPhan.soTienCanDong })));
            }
            else {
                await Promise.all(checkSubDetail.map(hocPhan => app.model.tcHocPhiSubDetail.update({ id: hocPhan.id }, { soTienDaDong: 0 })));
            }
        }

        await Promise.all(tcHocPhi.map(item => app.model.tcHocPhi.delete({ mssv, namHoc: item[0], hocKy: item[1] })));
        await Promise.all(tcMienGiam.map(item => app.model.tcMienGiam.update({ mssv, namHoc: item[0], hocKy: item[1] }, { soTienMienGiam: 0 })));
    };

    let capNhatDongTien = async (mssv) => {
        let { rows: detail } = await app.model.tcHocPhiTransaction.getHocPhiCanTru(mssv);
        let soDuHocPhi = await app.model.tcSoDuHocPhi.get({ mssv });
        if (!soDuHocPhi) soDuHocPhi = await app.model.tcSoDuHocPhi.create({ mssv, soTien: 0 });
        let sumSoTienDu = detail.map(item => (item.soTienDaDong > item.soTien ? item.soTienDaDong - item.soTien : 0) || 0).sum() + parseInt(soDuHocPhi.soTien);
        for (let item of detail) {
            if (item.soTienDaDong >= item.soTien) {
                item.soTienDaDong = item.soTien;
            }
            else {
                if (sumSoTienDu >= item.soTien - item.soTienDaDong) {
                    sumSoTienDu -= (item.soTien - item.soTienDaDong);
                    item.soTienDaDong = item.soTien;
                }
                else {
                    item.soTienDaDong += sumSoTienDu;
                    sumSoTienDu = 0;
                }
            }
            await app.model.tcHocPhiDetail.update({ mssv, loaiPhi: item.loaiPhi, dotDong: item.dotDong }, { soTienDaDong: item.soTienDaDong });
        }
        await app.model.tcSoDuHocPhi.update({ mssv }, { soTien: sumSoTienDu });
        await app.model.tcDotDong.capNhatHocPhiMienGiam(mssv);
    };

    let apDungLoaiPhiPreview = async (idDotDong, loaiPhi, mssv, apDung, taiApDung, sync = null, bacDaoTao, heDaoTao, khoaSinhVien) => {
        const { namHoc, hocKy } = await app.model.tcDotDong.get({ id: idDotDong });
        // const ngayTao = new Date().getTime();
        // console.log({ idDotDong, loaiPhi, mssv, apDung, taiApDung, sync, bacDaoTao, heDaoTao, khoaSinhVien });
        let listDinhPhiMonHoc = await app.model.tcDinhMucMonHoc.getAll({ namHoc, hocKy });

        let { rows: listSV, ishocphi: isHocPhi, hocphichinh: hocPhiChinh, listsinhvienmonhoc: listSinhVienMonHoc } = await app.model.tcDotDong.danhSachApDungPreview(idDotDong, loaiPhi, bacDaoTao, heDaoTao, khoaSinhVien, mssv, apDung, taiApDung, sync);
        let listErrorSv = [];
        if (isHocPhi) {
            listSinhVienMonHoc = listSinhVienMonHoc.filter(item => !item.baoLuu);
            let mapDinhMuc = {};
            for (let item of listSinhVienMonHoc) {
                if (!mapDinhMuc[item.khoaSinhVien]) {
                    mapDinhMuc[item.khoaSinhVien] = await objectDinhMuc(namHoc, hocKy, item.khoaSinhVien);
                }
                let dinhPhiMonHoc = listDinhPhiMonHoc?.find(monHoc => item.maMonHoc == monHoc.maMonHoc) || '';
                let loaiDangKy = item.loaiDangKy ? item.loaiDangKy : 'KH';

                if (mapDinhMuc[item.khoaSinhVien][item.heDaoTao] == null && mapDinhMuc[item.khoaSinhVien][item.maNganh] == null && !dinhPhiMonHoc) {
                    listErrorSv.push(item.mssv);
                    continue;
                }

                let soTienDinhPhi = mapDinhMuc[item.khoaSinhVien]?.[item.heDaoTao] ? mapDinhMuc[item.khoaSinhVien][item.heDaoTao].soTien : (mapDinhMuc[item.khoaSinhVien]?.[item.maNganh] ? mapDinhMuc[item.khoaSinhVien][item.maNganh].soTien : 0);
                const thuHocPhiHocKy = mapDinhMuc[item.khoaSinhVien]?.[item.heDaoTao] ? mapDinhMuc[item.khoaSinhVien][item.heDaoTao].thuHocPhiHocKy : (mapDinhMuc[item.khoaSinhVien]?.[item.maNganh] ? mapDinhMuc[item.khoaSinhVien][item.maNganh].thuHocPhiHocKy : 0);
                // const hocPhiHocKy = mapDinhMuc[item.khoaSinhVien]?.[item.heDaoTao] ? mapDinhMuc[item.khoaSinhVien][item.heDaoTao].hocPhiHocKy : (mapDinhMuc[item.khoaSinhVien]?.[item.maNganh]?.hocPhiHocKy || 0);

                if (['HL', 'CT'].includes(loaiDangKy) || (loaiDangKy == 'NCTDT' && (namHoc > 2023 || (namHoc == 2023 && hocKy > 1))) || item.heDaoTao == 'CLC') {
                    item.mucTinhPhi = 100;
                }
                if (thuHocPhiHocKy && !['HL', 'CT'].includes(loaiDangKy) && !(loaiDangKy == 'NCTDT' && (namHoc > 2023 || (namHoc == 2023 && hocKy > 1)))) {
                    soTienDinhPhi = 0;
                }
                if (item.heDaoTao == 'CQ' && item.khoaSinhVien <= 2021 && item.loaiSinhVien == 'L2') {
                    soTienDinhPhi = 1200000;
                }
                // if (item.maHocPhan && item.maHocPhan.substring(0, 3) == 'VNH') {
                //     soTienDinhPhi = 1200000;
                // }
                item.tongTinChi = item.khoaSinhVien > 2021 ? (item.tongTinChi || 0) : (parseInt(item.tongTietHoc) / 15 || 0);
                item['soTien'] = !item.tinhPhi ? 0 : (dinhPhiMonHoc ? parseInt(dinhPhiMonHoc.soTien) : soTienDinhPhi * item.tongTinChi);
                item['soTienCanDong'] = item.soTien * item.mucTinhPhi / 100;
            }

            listSV = listSV.filter(item => !listErrorSv.find(cur => item.mssv == cur));
            for (let item of listSV) {
                if (!mapDinhMuc[item.khoaSinhVien]) {
                    mapDinhMuc[item.khoaSinhVien] = await objectDinhMuc(namHoc, hocKy, item.khoaSinhVien);
                }
                if (item.heDaoTao == 'CLC') {
                    item.mucTinhPhi = 100;
                }
                if (item.baoLuu) {
                    item['soTien'] = 0;
                    item['soTienCanDong'] = 0;
                    continue;
                }

                item['soTien'] = listSinhVienMonHoc.filter(new_item => new_item.mssv == item.mssv)
                    .map(new_item => new_item.soTien).sum();
                item['soTienCanDong'] = listSinhVienMonHoc.filter(new_item => new_item.mssv == item.mssv)
                    .map(new_item => new_item.soTienCanDong).sum();

                const hocPhiHocKy = mapDinhMuc[item.khoaSinhVien]?.[item.heDaoTao] ? mapDinhMuc[item.khoaSinhVien][item.heDaoTao].hocPhiHocKy : (mapDinhMuc[item.khoaSinhVien]?.[item.maNganh]?.hocPhiHocKy || 0);
                if (hocPhiHocKy && hocPhiChinh) {
                    item['soTien'] += hocPhiHocKy;
                    item['soTienCanDong'] += hocPhiHocKy * item.mucTinhPhi / 100;
                    item.hocPhiHocKy = hocPhiHocKy;
                }
            }
        }
        listSV = listSV.filter(item => item.daApDung || item.soTien);
        return { listSV, listSinhVienMonHoc, isHocPhi };
    };

    let apDungLoaiPhi = async (listSinhVienAll, listAddSinhVienMonHoc, hienThi, user, sync = null) => {
        const ngayTao = new Date().getTime();
        let apDungLength = Object.keys(listSinhVienAll.groupBy('mssv')).length;

        for (let sinhVien of listSinhVienAll) {
            let { mssv, idDotDong, loaiPhi, namHoc, hocKy } = sinhVien;
            let infoSinhVien = await app.model.fwStudent.get({ mssv });

            if (!sinhVien.daApDung && !sinhVien.soTien) {
                continue;
            }

            let checkHocPhiDetail = await app.model.tcHocPhiDetail.get({ mssv, loaiPhi, dotDong: idDotDong, namHoc, hocKy });
            let checkHocPhi = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });

            if (!checkHocPhi) {
                checkHocPhi = await app.model.tcHocPhi.create({ mssv, namHoc, hocKy, hocPhi: 0, congNo: 0, ngayTao, hoanTra: 0, trangThai: 'MO' });
            }
            await app.model.tcHocPhiDetail.delete({ mssv, loaiPhi, dotDong: idDotDong, namHoc, hocKy });

            let newDetail = await app.model.tcHocPhiDetail.create({
                mssv, namHoc, hocKy, loaiPhi, dotDong: idDotDong, ngayTao,
                active: hienThi,
                mucTinhPhi: sinhVien.mucTinhPhi,
                soTien: sinhVien.soTien,
                soTienDaDong: checkHocPhiDetail?.soTienDaDong || sinhVien.soTienTamThuDaDong,
                soTienCanDong: sinhVien.soTienCanDong,
            });

            let soDuHocPhi = await app.model.tcSoDuHocPhi.get({ mssv });
            if (!soDuHocPhi) soDuHocPhi = await app.model.tcSoDuHocPhi.create({ mssv, soTien: 0 });

            if (!newDetail.active && newDetail.soTienDaDong > 0) {
                await Promise.all([
                    app.model.tcHocPhiDetail.update({ mssv, loaiPhi, dotDong: idDotDong, namHoc, hocKy }, { soTienDaDong: 0 }),
                    app.model.tcSoDuHocPhi.update({ mssv }, { soTien: soDuHocPhi.soTien + newDetail.soTienDaDong })
                ]);
            }
            sinhVien.loaiPhiTamThu && await app.model.tcHocPhiDetail.update({ mssv, loaiPhi: sinhVien.loaiPhiTamThu }, { active: 0 });

            await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, {
                bacDaoTao: checkHocPhi.bacDaoTao || infoSinhVien.bacDaoTao,
                heDaoTao: checkHocPhi.heDaoTao || infoSinhVien.loaiHinhDaoTao,
                nganhDaoTao: checkHocPhi.nganhDaoTao || infoSinhVien.maNganh,
                khoaSinhVien: checkHocPhi.khoaSinhVien || infoSinhVien.khoaSinhVien
            });

            await capNhatDongTien(mssv);

            if (Object.keys(sinhVien).includes('listHocPhan')) {
                let getSubDetail = await app.model.tcHocPhiSubDetail.getAll({ mssv, idDotDong, loaiPhi });
                let apDungDetail = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, loaiPhi, dotDong: idDotDong });

                await app.model.tcHocPhiSubDetail.delete({ mssv, idDotDong, loaiPhi });

                if (sinhVien.hocPhiHocKy) {
                    await app.model.tcHocPhiSubDetail.create({
                        mssv, idDotDong, loaiPhi, maMonHoc: null, maHocPhan: null, tenMonHoc: '{"vi":"Học phí niên khóa","en":""}', soTinChi: null,
                        soTien: sinhVien.hocPhiHocKy,
                        mucTinhPhi: sinhVien.mucTinhPhi,
                        soTienCanDong: sinhVien.hocPhiHocKy * sinhVien.mucTinhPhi / 100,
                        soTienDaDong: apDungDetail.soTienDaDong >= apDungDetail.soTienCanDong ? sinhVien.hocPhiHocKy * sinhVien.mucTinhPhi / 100 :
                            (getSubDetail.find(item => item.maMonHoc == null)?.soTienDaDong || 0),
                        active: 1, hocPhiNienKhoa: 1
                    });
                }

                await Promise.all(listAddSinhVienMonHoc.filter(item => item.mssv == mssv && item.idDotDong == idDotDong && item.loaiPhi == loaiPhi).map(svMonHoc => {
                    let soTienDaDongSub = getSubDetail.find(item => item.maMonHoc == svMonHoc.maMonHoc)?.soTienDaDong || 0;
                    (soTienDaDongSub > svMonHoc.soTienCanDong) && (soTienDaDongSub = svMonHoc.soTienCanDong);

                    return app.model.tcHocPhiSubDetail.create({
                        mssv: svMonHoc.mssv,
                        idDotDong,
                        loaiPhi,
                        maMonHoc: svMonHoc.maMonHoc,
                        maHocPhan: svMonHoc.maHocPhan,
                        tenMonHoc: svMonHoc.tenMonHoc,
                        soTinChi: svMonHoc.tongTinChi,
                        soTien: svMonHoc.soTien,
                        mucTinhPhi: svMonHoc.mucTinhPhi,
                        soTienCanDong: svMonHoc.soTienCanDong,
                        soTienDaDong: apDungDetail.soTienDaDong >= apDungDetail.soTienCanDong ? svMonHoc.soTienCanDong : soTienDaDongSub,
                        active: 1,
                        hocPhiChinh: svMonHoc.hocPhiChinh ? 1 : 0,
                    });
                }));
            }
        }

        sync && await Promise.all(listSinhVienAll.filter(item => (item.daApDung || item.soTien)).map(item => item.mssv).map(async item => {
            const checkSubDetailLog = await app.model.tcHocPhiSubDetailLog.getAll({ mssv: item.mssv, sync: 0 });
            if (checkSubDetailLog && checkSubDetailLog.length)
                return await app.model.tcHocPhiSubDetailLog.update({ mssv: item.mssv, sync: 0 }, { sync: 1, timeSync: ngayTao, userSync: user });
        }));

        // if (sync) {
        //     for (let mssv of listSinhVienAll.filter(item => (item.daApDung || item.soTien)).map(item => item.mssv)) {
        //         console.log({ mssv });
        //         const checkSubDetailLog = await app.model.tcHocPhiSubDetailLog.getAll({ mssv, sync: 0 });
        //         console.log({ checkSubDetailLog });
        //         if (checkSubDetailLog && checkSubDetailLog.length) {
        //             await app.model.tcHocPhiSubDetailLog.update({ mssv, sync: 0 }, { sync: 1, timeSync: ngayTao, userSync: user });
        //         }
        //     }
        // }

        return apDungLength;
    };

    let dongBoHocPhi = async (namHoc, hocKy, mssv, user, sync = null, apDung = null) => {
        try {
            if (!mssv && !sync) throw 'Yêu cầu nhập thông tin sinh viên';
            let { bacDaoTao, loaiHinhDaoTao, khoaSinhVien } = await app.model.fwStudent.get({ mssv });
            let { rows: listHocPhi } = await app.model.tcDotDong.getAllDotDongHocPhi(mssv);
            namHoc && hocKy && (listHocPhi = listHocPhi.filter(item => (item.namHoc == namHoc && item.hocKy == hocKy)));

            const listSinhVienPreview = {};
            let listAddSinhVienMonHoc = [];
            let listSinhVienAll = [];

            for (let dotDong of listHocPhi) {
                // if (!dotDong.namHoc || !dotDong.hocKy) {
                //     continue;
                // }
                let { listSV, listSinhVienMonHoc, isHocPhi } = await apDungLoaiPhiPreview(dotDong.idDotDong, dotDong.loaiPhi, mssv, 1, 1, sync, bacDaoTao, loaiHinhDaoTao, khoaSinhVien);
                listSV = listSV.filter(item => item.daApDung || item.soTien);
                const daApDung = listSV.filter(item => item.daApDung == 1).length;
                listSinhVienPreview[dotDong.loaiPhi] = { data: listSV, length: listSV.length, daApDungLength: daApDung, chuaApDungLength: listSV.length - daApDung, isHocPhi };
                listSinhVienAll = listSinhVienAll.concat(listSV);
                listAddSinhVienMonHoc = listAddSinhVienMonHoc.concat(listSinhVienMonHoc);
            }

            if (apDung) {
                let apDungLength = await apDungLoaiPhi(listSinhVienAll, listAddSinhVienMonHoc, 1, user, sync);
                return { apDungLength };
            }
            else return { listSinhVienPreview, listHocPhi };
        }
        catch (error) {
            console.error({ error });
        }
    };

    app.model.tcDotDong.capNhatDongTien = capNhatDongTien;
    app.model.tcDotDong.capNhatHocPhiMienGiam = capNhatHocPhiMienGiam;
    app.model.tcDotDong.apDungLoaiPhiPreview = apDungLoaiPhiPreview;
    app.model.tcDotDong.apDungLoaiPhi = apDungLoaiPhi;
    app.model.tcDotDong.dongBoHocPhi = dongBoHocPhi;
};