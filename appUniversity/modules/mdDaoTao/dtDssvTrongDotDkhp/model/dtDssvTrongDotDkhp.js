// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtDssvTrongDotDkhp.foo = () => { };

    //hàm let check = await app.model.dtCauHinhDotDkhp.checkAndUpdateStudent('1956030212')
    const getTongCongNoSinhVien = async (mssv) => {
        try {
            const tongCongNo = await app.model.tcHocPhi.getAll({ mssv });
            return parseInt(tongCongNo.reduce((total, cur) => total + parseInt(cur.congNo), 0));
        } catch (error) {
            console.error(error);
            return 0;
        }
    };

    app.model.dtCauHinhDotDkhp.checkAndUpdateStudent = async (mssv, modifier = `${mssv}@hcmussh.edu.vn`) => {
        try {
            let { lop, tinhTrang } = await app.model.fwStudent.get({ mssv }, 'mssv,lop,tinhTrang') || {}, now = Date.now();
            const congNo = await getTongCongNoSinhVien(mssv);
            if (!lop) throw { error: 'Không tìm thấy lớp của sinh viên' };

            const dataLop = await app.model.dtLop.get({ maLop: lop });
            if (!dataLop) throw { error: 'Lớp của sinh viên không tồn tại' };
            const khoaLop = await app.model.dtNganhDaoTao.get({ maNganh: dataLop.maNganh });

            let listDot = await app.model.dtCauHinhDotDkhp.getAll({
                statement: 'ngayKetThuc > :now',
                parameter: { now }
            }, '');
            if (listDot.length) {
                for (let dot of listDot) {
                    let [itemLHDT, itemKhoa, itemKhoaSV] = await Promise.all([
                        app.model.dtChdkhpLhdt.get({ idDot: dot.id, loaiHinhDaoTao: dataLop.heDaoTao }),
                        app.model.dtChdkhpKhoa.get({ idDot: dot.id, khoa: khoaLop.khoa }),
                        app.model.dtChdkhpKhoaSv.get({ idDot: dot.id, khoaSinhVien: dataLop.khoaSinhVien }),
                    ]);
                    const item = await app.model.dtDssvTrongDotDkhp.get({ idDot: dot.id, mssv });
                    if (item) { //SV đã tồn tại trong đợt đkhp
                        let changes = {
                            kichHoat: 1,
                            modifier: modifier,
                            timeModified: Date.now(),
                            ghiChu: ''
                        };
                        if (!(itemLHDT && itemKhoa && itemKhoaSV)) { //Đợt đkhp không được mở cho lớp của SV
                            if (item.kichHoat == 1) {
                                changes.kichHoat = 0;
                                changes.ghiChu = 'Đợt ĐKHP không được mở cho lớp của sinh viên.';
                                await app.model.dtDssvTrongDotDkhp.update({ id: item.id }, changes);
                            }
                        } else if (item.kichHoat == 0 && tinhTrang == 1 //Tình trạng bt
                            && ((dot.congNo == 1 && congNo <= 0) || dot.congNo == 0) //(Đợt đk có xét hp và Sv không nợ hp) hoặc đợt ko xét hp
                        ) {
                            await app.model.dtDssvTrongDotDkhp.update({ id: item.id }, changes);
                        } else if (item.kichHoat == 1 && (tinhTrang != 1 //tinh trang khac
                            || (dot.congNo == 1 && congNo > 0) // Đợt đk có xét hp và sv bị nợ Hp
                        )) {
                            changes.kichHoat = 0;
                            changes.ghiChu = 'Sinh viên nợ học phí.';
                            await app.model.dtDssvTrongDotDkhp.update({ id: item.id }, changes);
                        }

                    } else { //SV không tồn tại trong đợt đkhp
                        if (itemLHDT && itemKhoa && itemKhoaSV) { //Đợt đkhp được mở cho lớp của SV
                            let data = {
                                idDot: dot.id,
                                mssv: mssv,
                                kichHoat: 1,
                                modifier: modifier,
                                timeModified: Date.now(),
                                ghiChu: ''
                            };
                            if (tinhTrang == 1 //Tình trạng bt
                                && ((dot.congNo == 1 && congNo <= 0) || dot.congNo == 0) //(Đợt đk có xét hp và Sv không nợ hp) hoặc đợt ko xét hp
                            ) {
                                await app.model.dtDssvTrongDotDkhp.create(data);
                            } else if ((tinhTrang != 1 //tinh trang khac
                                || (dot.congNo == 1 && congNo > 0) // Đợt đk có xét hp và sv bị nợ Hp
                            )) {
                                data.kichHoat = 0;
                                data.ghiChu = 'Sinh viên nợ học phí.';
                                await app.model.dtDssvTrongDotDkhp.create(data);
                            }
                        }
                    }
                }
            }
            return {};
        } catch (error) {
            return error;
        }
    };

    app.model.dtCauHinhDotDkhp.checkSinhVienDangKy = async ({ listLoaiHinhDaoTao, listKhoa, listKhoaSV, namHoc, hocKy, congNo, ngoaiNgu, idDot, modifier, timeModified, listMienNN = [] }) => {
        let listSv = await app.model.dtCauHinhDotDkhp.getListStudents(app.utils.stringify({
            listLoaiHinhDaoTao: listLoaiHinhDaoTao.toString(),
            listKhoa: listKhoa.toString(),
            listKhoaSV: listKhoaSV.toString(),
            namHoc: namHoc.split(' - ')[0], hocKy
        }));
        let listNgoaiNgu = [], listCondition = [];

        if (ngoaiNgu) {
            [listNgoaiNgu, listCondition] = await Promise.all([
                app.model.dtNgoaiNguKhongChuyen.getAll({
                    statement: 'khoaSinhVien IN (:khoaSinhVien) AND loaiHinhDaoTao IN (:loaiHinhDaoTao)',
                    parameter: { loaiHinhDaoTao: listLoaiHinhDaoTao, khoaSinhVien: listKhoaSV },
                }),
                app.model.dtNgoaiNguKhongChuyenCondition.getAll({
                    statement: 'khoaSinhVien IN (:khoaSinhVien) AND loaiHinhDaoTao IN (:loaiHinhDaoTao) AND ((semesterEnd IS NULL AND semesterFrom <= :semester) OR (:semester BETWEEN semesterFrom AND semesterEnd))',
                    parameter: { semester: `${namHoc.substring(2, 4)}${hocKy}`, khoaSinhVien: listKhoaSV, loaiHinhDaoTao: listLoaiHinhDaoTao }
                }),
            ]);
        }

        let namHocBefore = namHoc, hocKyBefore = hocKy;
        if (hocKy == 1) {
            const tmp = Number(namHocBefore.substring(0, 4));
            namHocBefore = `${tmp - 1} - ${tmp}`;
            hocKyBefore = 3;
        } else hocKyBefore = hocKyBefore - 1;

        let listTinhTrang = [];
        if (ngoaiNgu) listTinhTrang = await app.model.dtNgoaiNguKhongChuyen.tinhTrang(app.utils.stringify({
            namHoc, hocKy, listLoaiHinhDaoTao: listLoaiHinhDaoTao.toString(),
            listKhoaSV: listKhoaSV.toString(), namHocBefore, hocKyBefore
        })).then(item => item.rows);

        await Promise.all(listSv.rows.map(async sinhVien => {
            const { mssv, tinhTrang, tinhPhi, loaiHinhDaoTao, khoaSinhVien } = sinhVien;
            let kichHoat = 1, ghiChu = '';

            if (tinhTrang != 1) {
                ghiChu = 'Sinh viên không còn học';
                kichHoat = 0;
            }
            if (congNo == 1 && tinhPhi == 0) {
                ghiChu = ghiChu ? ghiChu + ', còn nợ học phí' : 'Sinh viên nợ học phí';
                kichHoat = 0;
            }
            if (kichHoat && ngoaiNgu && loaiHinhDaoTao && khoaSinhVien) {
                let condition = listCondition.find(con => con.loaiHinhDaoTao == loaiHinhDaoTao && con.khoaSinhVien == khoaSinhVien);

                let status = 0;
                if (condition) {
                    const { isDangKy, nhomNgoaiNgu, diemDat, tongSoTinChi, isChungChi, isJuniorStudent, diemMien, nhomNgoaiNguMien } = condition;
                    let itemTinhTrangNN = listTinhTrang.find(i => i.mssv == mssv);

                    if (itemTinhTrangNN) {
                        const listDiem = itemTinhTrangNN.listDiem ? app.utils.parse(itemTinhTrangNN.listDiem) : [],
                            monHocDangKy = itemTinhTrangNN.monHocDangKy ? itemTinhTrangNN.monHocDangKy.split(',') : [];
                        if (itemTinhTrangNN.isMien) status = 1;
                        if (listMienNN.includes(mssv)) status = 1;

                        if (!status) {
                            if (isChungChi && (itemTinhTrangNN.isDangKy || itemTinhTrangNN.isChungChi || itemTinhTrangNN.isJuniorStudent)) status = 1;
                            else if (isJuniorStudent && itemTinhTrangNN.isJuniorStudent) status = 1;
                        }

                        // CHECK DANG KY NGOAI NGU KHONG CHUYEN MIEN
                        if (!status && nhomNgoaiNguMien) {
                            const listMonHoc = listDiem.filter(diem => listNgoaiNgu.filter(nn => nn.semester >= nhomNgoaiNguMien && nn.loaiHinhDaoTao == loaiHinhDaoTao && nn.khoaSinhVien == khoaSinhVien).map(nn => nn.maMonHoc).includes(diem.maMonHoc));
                            status = diemMien ? (listMonHoc && listMonHoc.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemMien)) ? 1 : 0) : (listMonHoc.length ? 1 : 0);
                        }

                        if (isDangKy && !status) {
                            if (nhomNgoaiNgu) {
                                const isPass = listDiem.filter(diem => listNgoaiNgu.filter(nn => nn.semester >= nhomNgoaiNgu && nn.loaiHinhDaoTao == loaiHinhDaoTao && nn.khoaSinhVien == khoaSinhVien).map(nn => nn.maMonHoc).includes(diem.maMonHoc));
                                status = diemDat ? (isPass && isPass.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemDat)) ? 1 : 0) : (isPass.length ? 1 : 0);
                            } else {
                                const listMon = listNgoaiNgu.filter(nn => nn.loaiHinhDaoTao == loaiHinhDaoTao && nn.khoaSinhVien == khoaSinhVien).map(nn => nn.maMonHoc),
                                    isPass = listDiem.filter(diem => listMon.includes(diem.maMonHoc)),
                                    hasDky = monHocDangKy.find(mh => listMon.includes(mh));
                                status = hasDky ? (diemDat ? (isPass && isPass.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemDat)) ? 1 : 0) : 1) : 0;
                            }
                        }

                        if (!status && (tongSoTinChi == null || tongSoTinChi == '')) ghiChu = ghiChu ? ghiChu + ', không đủ điều kiện ngoại ngữ không chuyên' : 'Sinh viên không đủ điều kiện ngoại ngữ không chuyên';
                        else if (!status && !(tongSoTinChi == null || tongSoTinChi == '')) ghiChu = ghiChu ? ghiChu + `, không đủ điều kiện ngoại ngữ không chuyên, giới hạn ${tongSoTinChi} tín chỉ` : `Sinh viên không đủ điều kiện ngoại ngữ không chuyên, giới hạn ${tongSoTinChi} tín chỉ`;
                    }
                }
            }

            return app.model.dtDssvTrongDotDkhp.create({ kichHoat, ghiChu, mssv, timeModified, modifier, idDot, isMienNgoaiNgu: Number(ngoaiNgu && !!listMienNN.includes(mssv)) });
        }));
    };

    app.model.dtCauHinhDotDkhp.checkListSinhVien = async ({ listStudent, idDot, modifier, isUpdate, isCreate }) => {
        const dot = await app.model.dtCauHinhDotDkhp.get({ id: idDot });
        let listSV = await app.model.dtCauHinhDotDkhp.getListStudents(app.utils.stringify({ listSv: listStudent.toString(), namHoc: dot.namHoc.split(' - ')[0], hocKy: dot.hocKy })).then(item => item.rows);

        await Promise.all(listSV.map(async sinhVien => {
            const { mssv, tinhTrang, tinhPhi, loaiHinhDaoTao, khoaSinhVien } = sinhVien;
            let kichHoat = 1, ghiChu = '';

            if (tinhTrang != 1) {
                ghiChu = 'Sinh viên không còn học';
                kichHoat = 0;
            }
            if (dot.congNo == 1 && tinhPhi == 0) {
                ghiChu = ghiChu ? ghiChu + ', còn nợ học phí' : 'Sinh viên nợ học phí';
                kichHoat = 0;
            }
            if (kichHoat && dot.ngoaiNgu && loaiHinhDaoTao && khoaSinhVien) {
                const { status, tongSoTinChi } = await app.model.dtNgoaiNguKhongChuyen.checkTinhTrang({ mssv, namHoc: dot.namHoc, hocKy: dot.hocKy, khoaSinhVien, loaiHinhDaoTao, semester: `${dot.namHoc.substring(2, 4)}${dot.hocKy}`, idDot });
                if (!status && (tongSoTinChi == null || tongSoTinChi == '')) ghiChu = ghiChu ? ghiChu + ', không đủ điều kiện ngoại ngữ không chuyên' : 'Sinh viên không đủ điều kiện ngoại ngữ không chuyên';
                else if (!status && !(tongSoTinChi == null || tongSoTinChi == '')) ghiChu = ghiChu ? ghiChu + `, không đủ điều kiện ngoại ngữ không chuyên, giới hạn ${tongSoTinChi} tín chỉ` : `Sinh viên không đủ điều kiện ngoại ngữ không chuyên, giới hạn ${tongSoTinChi} tín chỉ`;
            }
            if (isUpdate) return app.model.dtDssvTrongDotDkhp.update({ mssv, idDot }, { modifier, timeModified: Date.now(), kichHoat, ghiChu });
            if (isCreate) return app.model.dtDssvTrongDotDkhp.create({ modifier, timeModified: Date.now(), mssv, kichHoat, ghiChu, idDot });
        }));
    };
};