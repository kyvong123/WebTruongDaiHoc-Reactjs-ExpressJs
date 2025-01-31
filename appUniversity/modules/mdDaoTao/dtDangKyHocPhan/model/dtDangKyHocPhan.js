// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtDangKyHocPhan.foo = () => { };

    app.model.dtDangKyHocPhan.dataDkhp = {};

    app.model.dtDangKyHocPhan.linkSoTienDinhPhi = async (listThaoTac) => {
        let listUnique = [];
        for (let thaoTac of listThaoTac) {
            const { mssv, maHocPhan, maMonHoc, tinChi: soTinChi, namHoc, hocKy, status, user, loaiDangKy } = thaoTac;
            const time = Date.now();
            const detailMonHoc = await app.model.dmMonHoc.get({ ma: maMonHoc });
            app.model.tcHocPhiSubDetailLog.create({
                mssv, maHocPhan, maMonHoc, namHoc, hocKy,
                tenMonHoc: detailMonHoc?.ten, tongSoTiet: detailMonHoc?.tongTiet,
                soTinChi, timeModified: time, thaoTac: status, loaiDangKy, modifier: user
            });
            if (!listUnique.find(ele => ele.namHoc == namHoc && ele.hocKy == hocKy && ele.mssv == mssv)) {
                listUnique.push({ mssv, namHoc, hocKy });
                app.model.tcDotDong.dongBoHocPhi(parseInt(namHoc), hocKy, mssv, null, null, 1).catch(error => console.error({ error }));
            }
        }
    };

    app.model.dtDangKyHocPhan.initDataDkhp = async () => {
        let data = JSON.parse(app.fs.readFileSync(app.path.join(app.assetPath, 'data-dkmh', 'data_dkmh.json')));
        app.model.dtDangKyHocPhan.dataDkhp = data;
    };

    app.model.dtDangKyHocPhan.notify = async (data) => {
        let { maHocPhan, mssv, thaoTac } = data,
            sinhVien = await app.model.fwStudent.get({ mssv }, 'emailTruong'),
            message = {
                toEmail: sinhVien?.emailTruong,
                title: 'Học phần của bạn đã được cập nhật',
                link: '/user/lich-su-dang-ky'
            };
        if (sinhVien) {
            if (thaoTac == 'A') {
                message.subTitle = `PHÒNG ĐÀO TẠO đã đăng ký mới cho bạn học phần ${maHocPhan}`;
                message.icon = 'fa-check';
                message.iconColor = 'success';
            } else if (thaoTac == 'D') {
                message.subTitle = `PHÒNG ĐÀO TẠO đã hủy học phần ${maHocPhan} của bạn`;
                message.icon = 'fa-times';
                message.iconColor = 'danger';
            } else if (thaoTac == 'H') {
                message.subTitle = `PHÒNG ĐÀO TẠO hoàn tác lịch sử đăng ký học phần ${maHocPhan} của bạn`;
                message.icon = 'fa-undo';
                message.iconColor = 'warning';
            } else {
                message.subTitle = `PHÒNG ĐÀO TẠO đã chuyển bạn đến học phần ${maHocPhan}`;
                message.icon = 'fa-repeat';
                message.iconColor = 'primary';
            }
            app.notification.send(message);
        }
    };

    // app.model.dtDangKyHocPhan.initDataDkhp = async () => {
    //     let data = JSON.parse(app.fs.readFileSync(app.path.join(app.assetPath, 'data-dkmh', 'data_dkmh.json')));
    //     app.model.dtDangKyHocPhan.dataDkhp = data;
    // };

    app.model.dtDangKyHocPhan.checkDangKy = async (mssv, maHocPhan, siSo, currHocPhan) => {
        let sinhVien = await app.model.fwStudent.get({ mssv }, 'mssv, ho, ten, khoa, loaiHinhDaoTao, namTuyenSinh, lop, tinhTrang'),
            hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan }, 'id, maHocPhan, maMonHoc, namHoc, hocKy, soLuongDuKien, loaiHinhDaoTao'),
            monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc }, 'ten, tongTinChi'),
            message = {
                maHocPhan: maHocPhan,
                mssv: mssv,
                hoTen: sinhVien.ho + ' ' + sinhVien.ten,
                maMonHoc: hocPhan.maMonHoc,
                tenMonHoc: monHoc?.ten,
                tinChi: monHoc?.tongTinChi,
                isDangKy: true,            //isDangKy (đk thành công : đk thất bại)
                isCheck: false,             //dùng để checkbox trong modal dự kiến
                ghiChu: null,
                maLoaiDKy: null,
                loaiMonHoc: null,
            };

        let hasDangKy = await app.model.dtDangKyHocPhan.get({ mssv, maMonHoc: hocPhan.maMonHoc, namHoc: hocPhan.namHoc, hocKy: hocPhan.hocKy });

        if (currHocPhan && hasDangKy && hasDangKy.maHocPhan == currHocPhan) hasDangKy = null;
        if (hasDangKy) {
            message.isDangKy = false;
            message.ghiChu = hasDangKy.isMienDiem ? 'Môn học đã được miễn trong năm học, học kỳ' : `Môn học đã được đăng ký ở học phần ${hasDangKy.maHocPhan}`;
        }

        if (message.isDangKy == true) {
            message.isCheck = true;
            if (sinhVien.tinhTrang != 1) {
                message.isCheck = false;
                let tinhTrang = await app.model.dmTinhTrangSinhVien.get({ ma: sinhVien.tinhTrang });
                if (!tinhTrang) message.ghiChu = message.ghiChu ? message.ghiChu + '; Chưa nhập tình trạng sinh viên' : 'Chưa nhập tình trạng sinh viên';
                else message.ghiChu = message.ghiChu ? message.ghiChu + `; Sinh viên ${tinhTrang?.ten}` : `Sinh viên ${tinhTrang?.ten}`;
            }
            if (siSo >= parseInt(hocPhan.soLuongDuKien)) message.ghiChu = message.ghiChu ? message.ghiChu + '; Lớp đã đầy sĩ số' : 'Lớp đã đầy sĩ số';

            let chDiem = await app.model.dtCauHinhDiem.getAll(),
                chDiemRot = parseFloat((chDiem.filter(e => e.key == 'rotMon'))[0].value),
                chDiemCtMin = parseFloat((chDiem.filter(e => e.key == 'caiThienMin'))[0].value),
                chDiemCtMax = parseFloat((chDiem.filter(e => e.key == 'caiThienMax'))[0].value),
                caiThienHK = parseFloat((chDiem.filter(e => e.key == 'caiThienHK'))[0].value);

            let [listCTDT, listDiem] = await Promise.all([
                app.model.dtDangKyHocPhan.getListCtdt(app.utils.stringify({ mssvFilter: mssv })),
                app.model.dtDangKyHocPhan.checkDiem(app.utils.stringify({ mssv, namHoc: hocPhan.namHoc, hocKy: hocPhan.hocKy })),
            ]);
            listCTDT = listCTDT.rows;
            listDiem = listDiem.rows;

            //Check NCTDT, KH, NKH, HV
            if (listCTDT.length) {
                listCTDT = listCTDT.filter(ctdt => ctdt.maMonHoc == hocPhan.maMonHoc);//check môn học có trong ctdt không
                if (listCTDT.length == 1) {
                    let monCTDT = listCTDT[0];
                    message.loaiMonHoc = monCTDT.loaiMonHoc;

                    //check trong-ngoai KH
                    if (monCTDT.namHocDuKien == hocPhan.namHoc && monCTDT.hocKyDuKien == hocPhan.hocKy) {//check học phần có theo kế hoạch không
                        message.maLoaiDKy = 'KH';
                    } else if ((parseInt(monCTDT.namHocDuKien) == parseInt(hocPhan.namHoc) && monCTDT.hocKyDuKien > hocPhan.hocKy)
                        || (parseInt(monCTDT.namHocDuKien) > parseInt(hocPhan.namHoc))) {
                        message.maLoaiDKy = 'HV';
                    } else message.maLoaiDKy = 'NKH';

                    //checkTienQuyet
                    let monTienQuyet = monCTDT.monTienQuyet ? monCTDT.monTienQuyet.split(';') : [];
                    if (monTienQuyet && monTienQuyet.length) {
                        let flag = 0;
                        for (let mon of monTienQuyet) {
                            const { maxDiemTK } = listDiem.find(i => i.maMonHoc == mon) || { maxDiemTK: null };
                            if (!maxDiemTK || parseFloat(maxDiemTK) < chDiemRot) {
                                if (flag != 0) message.ghiChu = message.ghiChu + ', ' + mon;
                                else {
                                    message.ghiChu = message.ghiChu ? message.ghiChu + '; Thiếu môn tiên quyết ' + mon : 'Thiếu môn tiên quyết ' + mon;
                                    message.isCheck = false;
                                    flag = 1;
                                }
                            }
                        }
                    }

                    //check tin chi toi thieu, diem trung binh toi thieu
                    let avr = await app.model.dtDiemTrungBinh.get({
                        statement: 'mssv = :mssv AND (namHoc < :namHoc OR (namHoc = :namHoc AND hocKy < :hocKy))',
                        parameter: { mssv, namHoc: hocPhan.namHoc, hocKy: hocPhan.hocKy }
                    }, '*', 'namHoc DESC, hocKy DESC');
                    if (avr) {
                        let { tcDkMin, tcTlMin, avrMin } = monCTDT;

                        if (tcDkMin != null && avr.tinChiDangKy < tcDkMin) {
                            message.ghiChu = message.ghiChu
                                ? message.ghiChu + '; Sinh viên chưa đủ tín chỉ đăng ký tối thiểu'
                                : 'Sinh viên chưa đủ tín chỉ đăng ký tối thiểu';
                            message.isCheck = false;
                        }
                        if (tcTlMin != null && avr.tinChiTichLuy < tcTlMin) {
                            message.ghiChu = message.ghiChu
                                ? message.ghiChu + '; Sinh viên chưa đủ tín chỉ tích lũy tối thiểu'
                                : 'Sinh viên chưa đủ tín chỉ tích lũy tối thiểu';
                            message.isCheck = false;
                        }
                        if (avrMin != null && parseFloat(avr.diemTrungBinhTichLuy) < parseFloat(avrMin)) {
                            message.ghiChu = message.ghiChu
                                ? message.ghiChu + '; Sinh viên chưa đạt điểm trung bình tích lũy tối thiểu'
                                : 'Sinh viên chưa đạt điểm trung bình tích lũy tối thiểu';
                            message.isCheck = false;
                        }
                    }
                } else message.maLoaiDKy = 'NCTDT';
            } else message.maLoaiDKy = 'NCTDT';



            if (message.maLoaiDKy == null || message.maLoaiDKy == 'NCTDT') {
                message.maLoaiDKy = 'NCTDT';
                message.loaiMonHoc = 1;
            }

            //check HL, CT
            const diemMon = listDiem.find(i => i.maMonHoc == hocPhan.maMonHoc);
            if (diemMon) {
                let { maxDiemTK, latestDiem, soonestNamHoc, soonestHocKy, isMienDiem, isDangKy, tinhTrangDiem } = diemMon,
                    isCaiThien = false,
                    isNotHasDiem = tinhTrangDiem == 1 || (isDangKy && (maxDiemTK == null || (latestDiem && isNaN(parseFloat(latestDiem)))));

                isMienDiem = Number(isMienDiem);

                if (isMienDiem) {
                    message.maLoaiDKy = 'CT';
                    message.isCheck = false;
                    message.ghiChu = message.ghiChu ?
                        message.ghiChu + '; Sinh viên được miễn học môn này'
                        : 'Sinh viên được miễn học môn này';
                } else if (isNotHasDiem) {
                    message.maLoaiDKy = 'HL';
                    message.isCheck = false;
                    message.ghiChu = message.ghiChu ? message.ghiChu + '; Học phần trước chưa có điểm tổng kết'
                        : 'Học phần trước chưa có điểm tổng kết';
                } else {
                    if (maxDiemTK && latestDiem && parseFloat(latestDiem) >= chDiemRot) {
                        maxDiemTK = parseFloat(maxDiemTK);
                        if (maxDiemTK >= chDiemRot && (maxDiemTK >= chDiemCtMax || maxDiemTK < chDiemCtMin)) {
                            isCaiThien = true;
                        } else if (maxDiemTK >= chDiemRot) {
                            let soHK = (parseInt(hocPhan.namHoc) - parseInt(soonestNamHoc)) * 2 + parseInt(hocPhan.hocKy) - parseInt(soonestHocKy);

                            if (soonestHocKy == 3) {
                                soHK = soHK + 1;
                            }

                            if (hocPhan.hocKy == 3 && soonestHocKy == 3) {
                                soHK = soHK - 1;
                            }

                            if (soHK > caiThienHK) {
                                isCaiThien = true;
                            }
                        }
                    }

                    if (isCaiThien) {
                        message.maLoaiDKy = 'CT';
                        message.isCheck = false;
                        message.ghiChu = message.ghiChu ?
                            message.ghiChu + '; Không đủ điều kiện học cải thiện'
                            : 'Không đủ điều kiện học cải thiện';
                    } else {
                        if (parseFloat(latestDiem) >= chDiemRot) {
                            message.maLoaiDKy = 'CT';
                        } else {
                            message.maLoaiDKy = 'HL';
                        }
                    }
                }
            }
        }
        return message;
    };

    app.model.dtDangKyHocPhan.generatePdfDkhpFile = async (mssv, namHoc, hocKy) => {
        const source = app.path.join(app.assetPath, 'dtResource', 'dkhp-template.docx');
        const [dkhp, stuData, dotDong] = await Promise.all([
            app.model.dtDangKyHocPhan.exportKetQuaDky(mssv, app.utils.stringify({ namHoc, hocKy, sortKey: 'maHocPhanKQ', sortMode: 'ASC' })),
            app.model.fwStudent.getData(mssv),
            app.model.tcDotDong.get({ namHoc: parseInt(namHoc), hocKy }, 'id')
        ]);

        let { hoTen, tenKhoa, lop } = stuData.rows[0];
        let dd = new Date().getDate(), mm = new Date().getMonth() + 1, yyyy = new Date().getFullYear(),
            hocPhi = dotDong ? await app.model.tcHocPhiSubDetail.getAll({ mssv, idDotDong: dotDong.id, active: 1 }) : [],
            sumHocPhi = hocPhi.reduce((total, cur) => total + parseInt(cur.soTienCanDong || 0), 0);

        let dataGroupBy = dkhp.rows.groupBy('maHocPhan'),
            sumST = Object.keys(dataGroupBy).reduce((total, cur) => total + parseInt(dataGroupBy[cur][0].tongTiet), 0),
            sumTC = Object.keys(dataGroupBy).reduce((total, cur) => total + parseInt(dataGroupBy[cur][0].tongTinChi || 0), 0);

        let dataExport = {
            mssv, hoTen, tenKhoa, lop, namHoc, hocKy: hocKy, dd, mm, yyyy,
            dkhp: dkhp.rows.map((i, index) => ({
                maHocPhan: i.maHocPhan, tenHocPhan: JSON.parse(i.tenMonHoc || '{"vi":""}')?.vi,
                tongTinChi: i.tongTinChi, tongTiet: i.tongTiet, maLoaiDky: i.maLoaiDky || '',
                ngayBatDau: i.ngayBatDau ? app.date.viDateFormat(new Date(i.ngayBatDau)) : '',
                ngayKetThuc: i.ngayKetThuc ? app.date.viDateFormat(new Date(i.ngayKetThuc)) : '',
                giangVien: i.giangVien || '', index: index + 1,
            })),
            sumHocPhi: sumHocPhi.toString().numberDisplay(','), sumTC, sumST,
        };

        const buffer = await app.docx.generateFile(source, dataExport);
        app.fs.createFolder(app.path.join(app.assetPath, 'ket-qua-dkhp'));
        const filePdfPath = app.path.join(app.assetPath, 'ket-qua-dkhp', mssv + '.pdf');
        const pdfBuffer = await app.docx.toPdfBuffer(buffer);
        app.fs.writeFileSync(filePdfPath, pdfBuffer);
        return ({ filePdfPath, pdfBuffer });
    };
};