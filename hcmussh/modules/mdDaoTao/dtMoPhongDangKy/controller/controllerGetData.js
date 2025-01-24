module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7120: {
                title: 'Mô phỏng sinh viên', link: '/user/dao-tao/edu-schedule/mo-phong-sinh-vien',
                groupIndex: 2, parentKey: 7029, icon: 'fa-bug', backgroundColor: '#E96479'
            },
        }
    };

    app.permission.add(
        { name: 'dtMoPhongDangKy:manage', menu },
        'dtMoPhongDangKy:delete',
        'dtMoPhongDangKy:write',
        'dtMoPhongDangKy:read'
    );

    app.permissionHooks.add('staff', 'addRolesDtMoPhongDangKy', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtMoPhongDangKy:manage', 'dtMoPhongDangKy:delete', 'dtMoPhongDangKy:write', 'dtMoPhongDangKy:read');
            resolve();
        } else resolve();
    }));

    const folderUploadCert = app.path.join(app.assetPath, 'cert-uploaded-file');
    app.fs.createFolder(folderUploadCert);

    app.get('/user/dao-tao/edu-schedule/mo-phong-sinh-vien', app.permission.check('dtMoPhongDangKy:manage'), app.templates.admin);

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

    app.post('/api/dt/hoc-phan/get-data/mo-phong', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { userData, hocPhanDangKy = [], cauHinh } = req.body.filter;
            let { namHoc, hocKy, theoKeHoach, ngoaiKeHoach, ngoaiCtdt, chuyenLop, ngoaiNgu } = cauHinh,
                { mssv, lop, loaiHinhDaoTao, khoaSinhVien } = userData;

            theoKeHoach = Number(theoKeHoach);
            ngoaiKeHoach = Number(ngoaiKeHoach);
            ngoaiCtdt = Number(ngoaiCtdt);
            chuyenLop = Number(chuyenLop);
            ngoaiNgu = Number(ngoaiNgu);

            let onlyChuyenLop = !theoKeHoach && !ngoaiKeHoach && !ngoaiCtdt && chuyenLop;
            let filter = {
                namHoc, hocKy, mssvFilter: mssv, tinhTrang: 2, heFilter: loaiHinhDaoTao,
            };
            if (theoKeHoach && !ngoaiKeHoach && !ngoaiCtdt) filter.lopFilter = lop;
            let [items, dataDiem, avrInfo, ngoaiNguInfo] = await Promise.all([
                app.model.dtDangKyHocPhan.searchHocPhan(app.utils.stringify(filter)),
                app.database.dkhpRedis.get(`DIEM:${mssv}`),
                app.model.dtDiemTrungBinh.get({
                    statement: 'mssv = :mssv AND (namHoc < :namHoc OR (namHoc = :namHoc AND hocKy < :hocKy))',
                    parameter: { mssv, namHoc, hocKy }
                }, 'tinChiDangKy, tinChiTichLuy, diemTrungBinhTichLuy', 'namHoc DESC, hocKy DESC'),
                app.database.dkhpRedis.get(`NGOAI_NGU:${mssv}`),
            ]);
            let listKH = [], monHocKH = [], listNKH = [], monHocNKH = [], listNCTDT = [], monHocNCTDT = [], listCTDT = [], dataMaHocPhan = [],
                fullDataKH = [], fullDataNKH = [], fullDataNCTDT = [];
            let redisRef = app.database.dkhpRedis;
            if (ngoaiCtdt || onlyChuyenLop) {
                listNCTDT = await redisRef.get('listMonHoc');
                monHocNCTDT = JSON.parse(listNCTDT);
            }
            [listCTDT, dataMaHocPhan] = await redisRef.multi().get(`CTDT:${mssv}|${cauHinh.id}`).get(`dataMaHocPhan|${cauHinh.id}`).exec();
            items = items.rows.filter(item => JSON.parse(dataMaHocPhan).includes(item.maHocPhan));

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
                let { giangVien, troGiang, listMaLop } = JSON.parse(info || '{}');
                let [gvInfo, tgInfo] = splitGV(giangVien, troGiang, item.id);
                return {
                    ...item, giangVien: gvInfo, troGiang: tgInfo, siSo: parseInt(siSoHienTai), listMaLop
                };
            }));

            hocPhanDangKy = await Promise.all(hocPhanDangKy.map(async item => {
                const info = await app.database.dkhpRedis.get(`infoHocPhan:${item.maHocPhan}|${cauHinh.id}`);
                let { giangVien, troGiang, listMaLop } = JSON.parse(info || '{}');
                let [gvInfo, tgInfo] = splitGV(giangVien, troGiang, item.id);
                return { ...item, giangVien: gvInfo, troGiang: tgInfo, listMaLop };
            }));

            if (ngoaiNgu) {
                let { status, tongSoTinChi, khoiKienThuc, ctdtDangKy } = ngoaiNguInfo;
                if (!status) {
                    if (tongSoTinChi) {
                        const curSoTinChi = hocPhanDangKy.reduce((acc, cur) => acc + Number(cur.tongTinChi), 0);
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
                            dataCheck[`${namHoc.substring(2, 4)}${hocKy}`] = hocPhanDangKy.filter(i => listKH.includes(i.maMonHoc)).reduce((acc, cur) => acc + Number(cur.tongTinChi), 0);
                            Object.keys(monHocNKH.filter(i => i.idSemester).groupBy('idSemester')).forEach(semester => {
                                dataCheck[semester] = hocPhanDangKy.filter(i => monHocNKH.filter(i => i.idSemester == semester).map(i => i.maMonHoc).includes(i.maMonHoc)).reduce((acc, cur) => acc + Number(cur.tongTinChi), 0);
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
            monHocKH = monHocKH.map(item => {
                let diem = dataDiem.find(i => i.maMonHoc == item.maMonHoc) || {};
                return { ...item, ...diem };
            });

            monHocNKH = monHocNKH.filter(monHoc => !!fullDataNKH.find(item => item.maMonHoc == monHoc.maMonHoc));
            monHocNKH = monHocNKH.map(item => {
                let diem = dataDiem.find(i => i.maMonHoc == item.maMonHoc) || {};
                return { ...item, ...diem };
            });

            monHocNCTDT = monHocNCTDT.filter(monHoc => !!fullDataNCTDT.find(item => item.maMonHoc == monHoc.maMonHoc));
            monHocNCTDT = monHocNCTDT.map(item => {
                let diem = dataDiem.find(i => i.maMonHoc == item.maMonHoc) || {};
                let { monTuongDuong, monTienQuyet } = [...monHocKH, ...monHocNKH].find(i => i.maMonHoc == item.maMonHoc) || {};
                return { ...item, ...diem, monTuongDuong, monTienQuyet };
            });

            let dataResponse = {
                items,
                listKH, monHocKH,
                listNKH, monHocNKH,
                listNCTDT, monHocNCTDT,
                fullDataKH: fullData.filter(item => item.type == 'KH'),
                fullDataNKH: fullData.filter(item => item.type == 'NKH'),
                fullDataNCTDT: fullData.filter(item => item.type == 'NCTDT'),
                avrInfo
            };
            res.send(dataResponse);
            app.arrayFunc.clearData(...Object.values(dataResponse));
            dataResponse = {};
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/hoc-phan/get-ket-qua-dky/mo-phong', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { mssv, cauHinh } = req.query;
            const { namHoc, hocKy } = cauHinh;
            let filter = {
                namHoc, hocKy
            };

            let hocPhanDangKy = await app.model.dtDangKyHocPhan.getHocPhan(mssv, app.utils.stringify(filter));

            res.send({ hocPhanDangKy: hocPhanDangKy.rows });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.get('/api/dt/setting/config/mo-phong', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { mssv } = req.query;

            let dotDangKyAll = await app.model.dtDssvTrongDotDkhp.getAll({ mssv }, 'idDot, ghiChu, kichHoat');
            dotDangKyAll = await Promise.all(dotDangKyAll.map(async dot => {
                const cauHinh = await app.model.dtCauHinhDotDkhp.get({ id: dot.idDot }) || {};
                return { ...dot, ...cauHinh };
            }));
            dotDangKyAll = dotDangKyAll.filter(i => i.ngayBatDau).sort((a, b) => (a.ngayBatDau > b.ngayBatDau) ? -1 : 1);

            // Lấy thông tin cấu hình từ dtCauHinhDiem và dtSemester
            let [settingDiem, settingTKB, semester] = await app.database.dkhpRedis.multi().get('settingDiem').get('settingTKB').get('semester').exec();

            settingTKB = JSON.parse(settingTKB);
            settingDiem = JSON.parse(settingDiem);
            semester = JSON.parse(semester);

            Object.keys(settingDiem || {}).forEach(key => {
                settingDiem[key] = settingDiem[key] ? parseFloat(settingDiem[key]) : 0;
            });
            res.send({ items: dotDangKyAll, semester, settingDiem, settingTKB, timeNowServer: Date.now() });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/hoc-phi-page/all', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let filter = {
                mssv: req.query.mssv
            };
            const tongHocPhiSinhVien = await app.model.tcHocPhi.getAll(filter, 'mssv,hocPhi, congNo,namHoc,hocKy');
            let { rows: listMonHoc } = await app.model.tcHocPhi.getDetailHocPhi(req.query.mssv);
            if (tongHocPhiSinhVien.length > 0) {
                const mienGiam = await app.model.tcMienGiam.getAll(filter);
                filter = app.utils.stringify(filter);
                const data = await app.model.tcHocPhi.sinhVienGetHocPhi(filter);
                const sinhVien = await app.model.fwStudent.get({ mssv: req.query.mssv });
                const mapGioiHan = await objectGioiHan(tongHocPhiSinhVien[0].namHoc, tongHocPhiSinhVien[0].hocKy, sinhVien.namTuyenSinh);
                let soTienGioiHan = mapGioiHan[sinhVien.loaiHinhDaoTao] ? mapGioiHan[sinhVien.loaiHinhDaoTao] : mapGioiHan[sinhVien.maNganh];
                const { noiDungLuuYEditorHtml: noiDungLuuY } = await app.model.tcSetting.getValue('noiDungLuuYEditorHtml');
                res.send({ hocPhiDetail: data.rows, hocPhiTong: tongHocPhiSinhVien, namTuyenSinh: sinhVien.namTuyenSinh, gioiHan: soTienGioiHan, mienGiam: mienGiam || 0, listMonHoc, noiDungLuuY: `${noiDungLuuY}` || '' });
            }
            else {
                res.send({});
            }

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/hoc-phi-sub-detail/all', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            // TODO - namHoc - hocKy
            // const settings = await getSettings();
            const idDotDong = req.query?.idDotDong || '';
            if (!idDotDong) {
                throw ('Không thể truy cập học phí, vui lòng thử lại sau');
            }
            const filter = {
                idDotDong,
                mssv: req.session.user.studentId
            };

            let sinhVien = await app.model.fwStudent.get({ mssv: (filter.mssv || '') });
            // let lopSinhVien = await app.model.dtLop.get({ maLop: sinhVien.lop });

            // if ((!lopSinhVien || !lopSinhVien.khoaSinhVien) && sinhVien.namTuyenSinh == 2022) {
            //     sinhVien.namTuyenSinh = 2022;
            // }
            // else {
            //     sinhVien.namTuyenSinh = lopSinhVien.khoaSinhVien;
            // }
            const subDetail = await app.model.tcHocPhiSubDetail.getAll(filter);
            res.send({ subDetail, khoaSinhVien: sinhVien.namTuyenSinh });
        } catch (error) {
            res.send({ error });
        }
    });

    const objectGioiHan = async (namHoc, hocKy, namTuyenSinh) => {
        const { rows: listDinhMucNhom } = await app.model.tcDinhMuc.getHocPhiNhomAll(namHoc, hocKy, namTuyenSinh);
        const { rows: listDinhMucNganh } = await app.model.tcDinhMuc.getHocPhiNganhAll(namHoc, hocKy, namTuyenSinh);
        let objectDinhPhiTheoNhom = {};
        for (let item of listDinhMucNhom) {
            if (item.listNganhCon) {
                let listNganhCon = item.listNganhCon.split(',');
                for (let nganhCon of listNganhCon) {
                    objectDinhPhiTheoNhom[nganhCon] = item.gioiHan;
                }
            }
            else {
                objectDinhPhiTheoNhom[item.loaiHinhDaoTao] = item.gioiHan;
            }
        }
        for (let item of listDinhMucNganh) {
            objectDinhPhiTheoNhom[item.maNganh] = item.gioiHan;
        }
        return objectDinhPhiTheoNhom;
    };

    app.get('/api/dt/mo-phong/profile', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let mssv = req.query?.mssv || '';
            let item = await app.model.fwStudent.get({ mssv });

            if (!item.image) {
                let user = await app.model.fwUser.get({ email: item.emailTruong });
                item.image = user?.image;
            }
            const { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');

            let dataHocPhi = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy }, 'congNo');
            if (dataHocPhi?.congNo) item.chuaDongHocPhi = true;
            else item.chuaDongHocPhi = false;
            const dataLop = await app.model.dtLop.get({ maLop: item.lop }, '*');
            if (dataLop) {
                item = app.clone({}, item, dataLop);
            }
            const dataTamTru = !item.maTamTru ? {} : await app.model.svThongTinTamTru.get({ id: item.maTamTru }),
                dataNoiTru = !item.maNoiTru ? {} : await app.model.svThongTinNoiTru.get({ id: item.maNoiTru });
            item = app.clone({}, item, dataTamTru || {}, dataNoiTru || {});

            const dataTotNghiep = await app.model.svThongTinTotNghiep.getAll({ mssv });
            item.dataTotNghiep = dataTotNghiep ? dataTotNghiep.groupBy('trinhDo') : {};
            const dotChinhSuaInfo = await app.model.svDotEditStudentInfo.get({
                statement: 'timeStart <= :now AND :now <= timeEnd AND (khoaSinhVien like :khoaSinhVien AND heDaoTao like :heDaoTao) AND isDeleted = 0',
                parameter: {
                    khoaSinhVien: `%${item.khoaSinhVien}%`,
                    heDaoTao: `%${item.loaiHinhDaoTao}%`,
                    now: Number(new Date().getTime())
                },
            }, '*', 'id DESC');
            item.sectionEdit = dotChinhSuaInfo ? dotChinhSuaInfo.sectionEdit.split(', ') : null;
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const DATE_UNIX = 24 * 60 * 60 * 1000;
    app.get('/api/dt/mo-phong/thoi-khoa-bieu', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { mssv, filter } = req.query,
                user = await app.model.fwStudent.get({ mssv }), dataTuan = [];
            let [items, listNgayLe] = await Promise.all([
                app.model.dtDangKyHocPhan.getKetQuaDangKy(mssv, app.utils.stringify(filter)),
                app.model.dmNgayLe.getAll({}, 'ngay,moTa'),
            ]);
            items = items.rows;
            const data = items.groupBy('maHocPhan');
            await Promise.all(Object.keys(data).map(async maHocPhan => {
                const tkb = await app.model.dtThoiKhoaBieuCustom.getData(maHocPhan, app.utils.stringify({}));
                dataTuan.push(...tkb.rows);
            }));

            if (filter.lichHoc) {
                dataTuan = dataTuan.filter(i => !i.isNgayLe).map(i => ({ ...i, ngayKetThuc: i.ngayKetThuc + DATE_UNIX * 7 }));
            }
            res.send({ items, listNgayLe, dataTuan, namTuyenSinh: user.namTuyenSinh });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/mo-phong/lich-nghi-bu', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { mssv, filter } = req.query, semester = {};

            if (!filter) {
                semester = await app.model.dtSemester.getCurrent();
                filter = { namHoc: semester.namHoc, hocKy: semester.hocKy };
            }
            let items = await app.model.dtThoiKhoaBieu.getLichNghiBuSV(mssv, app.utils.stringify(filter));
            res.send({ itemsBu: items.rows, itemsNghi: items.datangaynghi, semester });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/mo-phong/lich-thi', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            let { mssv } = req.query;
            let [items, semester] = await Promise.all([
                app.model.dtExam.getExamSinhVien(mssv),
                app.model.dtSemester.getCurrent(),
            ]);
            res.send({ items: items.rows, semester });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/mo-phong/bang-diem', app.permission.orCheck('dtMoPhongDangKy:manage', 'dtQuanLyHocPhan:manage', 'dtQuanLyHocPhan:manage', 'student:manage'), async (req, res) => {
        try {
            let { mssv, isShowDiem } = req.query;
            let [dataDiem, dataThangDiem, dmHeDiem, dataThanhPhan] = await Promise.all([
                app.model.dtDiemAll.getDataDiem(app.utils.stringify({ mssv })),
                app.model.dtDiemThangDiemKhoaSv.getData(mssv),
                app.model.dtDiemDmHeDiem.getAll({ kichHoat: 1 }),
                app.model.dtDiemConfigThanhPhan.getFullDataConfig(),
            ]);

            dataDiem = dataDiem.rows.map(i => {
                let diem = i.diem ? JSON.parse(i.diem) : {},
                    lockDiem = i.lockDiem ? JSON.parse(i.lockDiem) : {};
                if (!isShowDiem && i.R != 1 && i.tinhPhi && i.noHocPhi < 0 && i.isAnDiem) {
                    diem = {};
                }

                // TODO: Trong thời gian nhập thì LOCK điểm hiển, hết thời gian nhập hiển thị điểm
                if (Object.keys(lockDiem).length) {
                    lockDiem.TK = Object.keys(lockDiem).filter(i => i != 'TK').every(i => Number(lockDiem[i]));
                }

                Object.keys(diem).filter(i => i != 'TK').forEach(i => diem[i] = Number(lockDiem[i]) ? diem[i] : '');
                diem.TK = lockDiem.TK ? diem.TK : '';

                let tpDiem = i.tpHocPhan || i.tpMonHoc || i.configDefault,
                    configQC = i.configQC ? JSON.parse(i.configQC) : [];
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];
                return { ...i, diem, tpDiem, configQC, lockDiem };
            });

            dataThangDiem = dataThangDiem.rows.map(i => ({ ...i, loaiHe: JSON.parse(i.loaiHe) }));
            res.send({ dataDiem, dataThangDiem, dmHeDiem, dataThanhPhan });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/mo-phong/bang-diem/info', app.permission.orCheck('dtMoPhongDangKy:manage', 'dtQuanLyHocPhan:manage', 'student:manage'), async (req, res) => {
        try {
            const key = 'rotMon';
            let { mssv } = req.query,
                [items, diemRotMon, monKhongTinhTB, studentInfo] = await Promise.all([
                    app.model.dtSemester.get({ active: 1 }, 'namHoc, hocKy'),
                    app.model.dtCauHinhDiem.getValue(key),
                    app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
                    app.model.fwStudent.getData(mssv),
                ]);

            monKhongTinhTB = monKhongTinhTB.map(monHoc => monHoc.maMonHoc);

            res.send({ items, studentInfo: studentInfo.rows[0], diemRotMon, monKhongTinhTB });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/mo-phong/lich-su-dang-ky/page/:pageNumber/:pageSize', app.permission.orCheck('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1], isStu: '1' }));
            let page = await app.model.dtLichSuDkhp.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/mo-phong/ket-qua-tot-nghiep', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            const { mssv } = req.query;

            const [{ rows: list }, { rows: stuInfo }] = await Promise.all([
                app.model.dtKetQuaTotNghiep.searchPage(1, 50, app.utils.stringify({ mssv })),
                app.model.fwStudent.getData(mssv),
            ]);
            res.send({ list, stuInfo });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/mo-phong/chung-chi', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            const { mssv } = req.query;

            const [{ rows, datacert }, { rows: stuInfo }] = await Promise.all([
                app.model.dtChungChiSinhVien.getChungChi(app.utils.stringify({ mssv })),
                app.model.fwStudent.getData(mssv),
            ]);
            res.send({ dataChungChi: { certNgoaiNgu: rows, otherCert: datacert }, stuInfo });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/mo-phong/chung-chi', app.permission.check('dtMoPhongDangKy:manage'), async (req, res) => {
        try {
            const { data } = req.body, { mssv } = req.session.user,
                { loaiChungChi, chungChi, ngayCap, noiCap, ngoaiNgu, fileName, cccd, soHieuVanBang } = data;

            let item = { status: 0, timeCreated: Date.now(), fileName, ngayCap, mssv, cccd, soHieuVanBang, noiCap, chungChiKhac: loaiChungChi == 'NN' ? 0 : 1, chungChiNgoaiNgu: loaiChungChi == 'NN' ? 1 : 0 };
            if (loaiChungChi == 'NN') {
                const [dmNn, dmCc] = await Promise.all([
                    app.model.dtDmNgoaiNgu.get({ ma: ngoaiNgu }),
                    app.model.dtDmChungChiNgoaiNgu.get({ id: chungChi }),
                ]);
                item.ngoaiNgu = dmNn.ten;
                item.chungChi = dmCc.ten;
                item.idCc = Date.now();
            } else {
                const [dmCc, dmLoai] = await Promise.all([
                    app.model.dtDmChungChiTinHoc.get({ ma: chungChi }),
                    app.model.dtDmLoaiChungChi.get({ ma: loaiChungChi }),
                ]);
                item.chungChi = dmCc.ten;
                item.loaiChungChi = dmLoai.ten;
                item.idCc = Date.now();
            }

            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // UPLOAD HOOKS =================================
    app.uploadHooks.add('moPhongUploadCertificateFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCertificateFile(req, fields, files, done), done, 'dtMoPhongDangKy:manage'));

    const uploadCertificateFile = async (req, fields, files, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'MoPhongCertFile' && files.MoPhongCertFile && files.MoPhongCertFile.length) {
            try {
                let { path, size, originalFilename } = files.MoPhongCertFile[0],
                    time = Date.now(),
                    { loaiChungChi, mssv } = req.query,
                    type = originalFilename.substring(originalFilename.lastIndexOf('.') + 1, originalFilename.length);

                if ((size / 1024 / 1024) > 1) {
                    app.fs.deleteFile(path);
                    throw { message: 'Vui lòng chọn ảnh có kích thước < 1 MB' };
                }

                if (!files.MoPhongCertFile[0].headers['content-type'].includes('image/')) {
                    app.fs.deleteFile(path);
                    throw { message: 'Vui lòng chọn file ảnh' };
                }

                const imagePath = app.path.join(folderUploadCert, `moPhong${mssv}_${loaiChungChi}_${time}.${type}`);
                await app.fs.rename(path, imagePath);
                done && done({ fileName: `moPhong${mssv}_${loaiChungChi}_${time}.${type}` });
            } catch (error) {
                done && done(error);
            }
        }
    };
};
