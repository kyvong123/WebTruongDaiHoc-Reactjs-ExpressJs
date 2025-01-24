module.exports = app => {
    app.executeTask.importDkhp = async ({ listData, falseItem, items }) => {
        let index = 2;
        for (let item of listData) {
            const { mssv, maHocPhan, tinhPhi, note, stt } = item,
                row = { maHocPhan, mssv, note, hoTen: null, isDangKy: false, isCheck: false, ghiChu: null, tenTinhTrangSV: null, maTinhTrang: null, tenMonHoc: null, stt, tinhPhi, hocPhi: null, tinChi: null };

            let [student, hocPhan] = await Promise.all([
                app.model.fwStudent.get({ mssv }),
                app.model.dtThoiKhoaBieu.get({ maHocPhan }),
            ]);

            if (!student && !hocPhan) {
                row.ghiChu = 'Không tìm thấy sinh viên và học phần';
                row.tinhPhi = false;
                falseItem.push(row);
            } else {
                if (!student) {
                    row.ghiChu = mssv ? 'Không tìm thấy sinh viên' : 'Vui lòng nhập mã số sinh viên';
                    row.tinhPhi = false;
                    falseItem.push(row);
                } else if (!hocPhan) {
                    let maTinhTrang = student.tinhTrang;
                    let tinhTrang = await app.model.dmTinhTrangSinhVien.get({ ma: maTinhTrang });
                    let tenTinhTrangSV = tinhTrang?.ten;

                    row.hoTen = `${student.ho} ${student.ten}`;
                    row.tenTinhTrangSV = tenTinhTrangSV;
                    row.maTinhTrang = maTinhTrang;

                    row.ghiChu = maHocPhan ? 'Không tìm thấy học phần' : 'Vui lòng nhập mã học phần';
                    row.tinhPhi = false;
                    falseItem.push(row);
                } else {
                    const { namHoc, hocKy } = hocPhan;
                    let monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc });
                    row.tenMonHoc = monHoc?.ten;
                    row.tinChi = monHoc?.tongTinChi;

                    let maTinhTrang = student.tinhTrang;
                    let tinhTrang = await app.model.dmTinhTrangSinhVien.get({ ma: maTinhTrang });
                    let tenTinhTrangSV = tinhTrang?.ten;
                    row.hoTen = `${student.ho} ${student.ten}`;
                    row.tenTinhTrangSV = tenTinhTrangSV;
                    row.maTinhTrang = maTinhTrang;


                    if (hocPhan.tinhTrang == 4) {
                        row.ghiChu = 'Học phần đã bị hủy';
                        row.tinhPhi = false;
                        falseItem.push(row);
                    } else {
                        let duplicate = false,
                            duplicateMH = false,
                            viTri = 0;
                        if (items.length > 0) {
                            for (let i = 0; i < items.length; i++) {
                                if (mssv == items[i].mssv && maHocPhan == items[i].maHocPhan) {
                                    duplicate = true;
                                    viTri = items[i].stt;
                                    break;
                                } else if (mssv == items[i].mssv) {
                                    let itemHocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan: items[i].maHocPhan });
                                    if (hocPhan.maMonHoc == itemHocPhan.maMonHoc && hocPhan.namHoc == itemHocPhan.namHoc && hocPhan.hocKy == itemHocPhan.hocKy && hocPhan.loaiHinhDaoTao == itemHocPhan.loaiHinhDaoTao) {
                                        duplicateMH = true;
                                        items[i].ghiChu = 'Môn học trùng ở hàng ' + index;
                                        items[i].isCheck = false;
                                        items[i].isDangKy = false;
                                        viTri = items[i].stt;
                                        falseItem.push(items[i]);
                                        items.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                        if (duplicate == true || duplicateMH == true) {
                            if (duplicate == true) row.ghiChu = 'Trùng dữ liệu nhập với hàng ' + viTri;
                            else if (duplicateMH == true) row.ghiChu = 'Môn học trùng ở hàng ' + viTri;
                            row.tinhPhi = false;
                            falseItem.push(row);
                        } else if (maTinhTrang != 1) {
                            row.ghiChu = 'Tình trạng sinh viên không phù hợp';
                            row.tinhPhi = false;
                            falseItem.push(row);
                        } else {
                            const message = await app.model.dtDangKyHocPhan.checkDangKy(mssv, maHocPhan, 0);
                            let tmpRow = { ...message, tenTinhTrangSV, maTinhTrang, tenMonHoc: monHoc?.ten, stt, note, namHoc, hocKy };
                            if (message.isDangKy == false) {
                                tmpRow.tinhPhi = false;
                                falseItem.push(tmpRow);
                            }
                            else {
                                let dataCongNo = await app.model.dtDangKyHocPhan.getHocPhi(mssv);
                                let monHocKhongTinhPhi = await app.model.dtDmMonHocKhongTinhPhi.get({ maMonHoc: hocPhan.maMonHoc });
                                if (tinhPhi == '0' || monHocKhongTinhPhi) {
                                    tmpRow.tinhPhi = false;
                                } else tmpRow.tinhPhi = true;
                                dataCongNo = dataCongNo.rows[0];
                                let hocPhi = dataCongNo.tinhPhi;
                                tmpRow.hocPhi = hocPhi;
                                items.push(tmpRow);
                            }
                        }
                    }
                }
            }
            index++;
        }
        return ({ items, falseItem });
    };
};