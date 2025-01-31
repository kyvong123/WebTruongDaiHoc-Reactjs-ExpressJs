module.exports = (app) => {
    app.post('/api/ctsv/hoc-bong-khuyen-khich/cau-hinh', app.permission.orCheck('ctsvDotXetHocBongKkht:manage', 'ctsvDotXetHocBongKkht:write'), async (req, res) => {
        try {
            const { dieuKien } = req.body;
            const { ten, idDot, khoaSinhVien, heDaoTao, tongKinhPhi, dsNhom, loaiDieuKien } = dieuKien;
            const itemDieuKien = await app.model.svDieuKienXetHocBong.create({
                ten,
                idDot,
                kinhPhi: tongKinhPhi,
                khoaSinhVien: khoaSinhVien.toString(),
                heDaoTao: heDaoTao.toString(),
                loaiDieuKien,
            });

            if (!itemDieuKien) throw 'Lỗi hệ thống khi tạo cấu hình!';
            if (loaiDieuKien == 0) {
                for (const nhomKhoa of dsNhom) {
                    const { tenNhom, tongKinhPhi, dsKhoa, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomKhoa;
                    const nhom = await app.model.svHocBongNhom.create({
                        tenNhom: tenNhom,
                        kinhPhi: tongKinhPhi,
                        loaiNhom: 0,
                        idDieuKien: itemDieuKien.id,
                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                    });
                    if (!nhom) throw 'Lỗi hệ thống khi tạo nhóm!';
                    // Dùng for để tạo đúng thứ tự
                    for (const khoa of dsKhoa) {
                        await app.model.svHocBongKhoa.create({
                            ...khoa,
                            kinhPhi: khoa.kinhPhiKhoa,
                            idNhom: nhom.id,
                            soLuongSv: khoa.soLuongSinhVienKhoa,
                            hocBongXuatSac, hocBongGioi, hocBongKha
                        });
                    }
                }
            } else {
                for (const nhomNganh of dsNhom) {
                    const { tenNhom, tongKinhPhi, dsNganh, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomNganh;
                    const nhom = await app.model.svHocBongNhom.create({
                        tenNhom: tenNhom,
                        kinhPhi: tongKinhPhi,
                        loaiNhom: 1,
                        idDieuKien: itemDieuKien.id,
                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                    });
                    if (!nhom) throw 'Lỗi hệ thống khi tạo nhóm!';

                    for (const nganh of dsNganh) {
                        await app.model.svHocBongNganh.create({
                            ...nganh,
                            maNganh: nganh.idNganh,
                            kinhPhi: nganh.kinhPhiNganh,
                            idNhom: nhom.id,
                            soLuongSv: nganh.soLuongSinhVienNganh,
                            hocBongXuatSac, hocBongGioi, hocBongKha
                        });
                    }
                }
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/hoc-bong-khuyen-khich/cau-hinh', app.permission.orCheck('ctsvDotXetHocBongKkht:manage', 'ctsvDotXetHocBongKkht:write'), async (req, res) => {
        try {
            const { id, dieuKien } = req.body;
            dieuKien.staffHandle = req.session.user.email;
            dieuKien.timeModified = Date.now();
            const { ten, khoaSinhVien, heDaoTao, tongKinhPhi, dsNhom, loaiDieuKien } = dieuKien;
            const itemDieuKien = await app.model.svDieuKienXetHocBong.update({ id }, {
                ten,
                kinhPhi: tongKinhPhi,
                khoaSinhVien: khoaSinhVien.toString(),
                heDaoTao: heDaoTao.toString(),
                loaiDieuKien,
            });
            if (!itemDieuKien) throw 'Lỗi hệ thống khi tạo cấu hình!';
            await app.model.svDieuKienXetHocBong.deleteDsNhom({ id });
            if (loaiDieuKien == 0) {
                for (const nhomKhoa of dsNhom) {
                    const { tenNhom, tongKinhPhi, dsKhoa, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomKhoa;
                    const nhom = await app.model.svHocBongNhom.create({
                        tenNhom: tenNhom,
                        kinhPhi: tongKinhPhi,
                        loaiNhom: 0,
                        idDieuKien: itemDieuKien.id,
                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                    });
                    if (!nhom) throw 'Lỗi hệ thống khi tạo nhóm!';
                    // Dùng for để tạo đúng thứ tự
                    for (const khoa of (dsKhoa ?? [])) {
                        await app.model.svHocBongKhoa.create({
                            ...khoa,
                            kinhPhi: khoa.kinhPhiKhoa,
                            idNhom: nhom.id,
                            soLuongSv: khoa.soLuongSinhVienKhoa,
                            hocBongXuatSac, hocBongGioi, hocBongKha
                        });
                    }
                }
            } else {
                for (const nhomNganh of dsNhom) {
                    const { tenNhom, tongKinhPhi, dsNganh, hocBongXuatSac, hocBongGioi, hocBongKha, isLock } = nhomNganh;
                    const nhom = await app.model.svHocBongNhom.create({
                        tenNhom: tenNhom,
                        kinhPhi: tongKinhPhi,
                        loaiNhom: 1,
                        idDieuKien: itemDieuKien.id,
                        hocBongXuatSac, hocBongGioi, hocBongKha, isLock
                    });
                    if (!nhom) throw 'Lỗi hệ thống khi tạo nhóm!';

                    for (const nganh of (dsNganh ?? [])) {
                        await app.model.svHocBongNganh.create({
                            ...nganh,
                            maNganh: nganh.idNganh,
                            kinhPhi: nganh.kinhPhiNganh,
                            idNhom: nhom.id,
                            soLuongSv: nganh.soLuongSinhVienNganh,
                            hocBongXuatSac, hocBongGioi, hocBongKha
                        });
                    }
                }
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/hoc-bong-khuyen-khich/cau-hinh', app.permission.orCheck('ctsvDotXetHocBongKkht:manage', 'ctsvDotXetHocBongKkht:delete'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svDieuKienXetHocBong.deleteCascade({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/hoc-bong-khuyen-khich/cau-hinh/download-excel', app.permission.orCheck('ctsvDotXetHocBongKkht:manage', 'ctsvDotXetHocBongKkht:delete'), async (req, res) => {
        try {
            const { idDieuKien } = req.query;
            const dataNhom = await app.model.svDieuKienXetHocBong.downLoadExcel(idDieuKien).then(value => value.rows);
            if (dataNhom.length <= 0) throw 'Không tìm thấy dữ liệu';

            const { loaiDieuKien, ten } = await app.model.svDieuKienXetHocBong.get({ id: idDieuKien });
            const wb = app.excel.create();

            const ws = wb.addWorksheet('DANH SACH NHOM');
            const excludeColumn = loaiDieuKien != 1 ? 'TÊN NGÀNH' : 'TÊN KHOA';

            ws.columns = Object.keys(dataNhom[0]).filter(key => key != excludeColumn)
                .map(key => ({ key, header: key, width: 15 }));
            dataNhom.forEach(item => ws.addRow(item));

            app.excel.attachment(wb, res, `${idDieuKien}_${ten}.xlsx`);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/hoc-bong-khuyen-khich/cau-hinh', app.permission.orCheck('ctsvDotXetHocBongKkht:manage', 'tcHocBong:manage'), async (req, res) => {
        try {
            const { id } = req.query;
            const item = await app.model.svDieuKienXetHocBong.get({ id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/hoc-bong-khuyen-khich/cau-hinh/all', app.permission.orCheck('ctsvDotXetHocBongKkht:manage', 'tcHocBong:manage'), async (req, res) => {
        try {
            const { condition } = req.query;
            const items = await app.model.svDieuKienXetHocBong.getAll(condition, 'id,ten', 'id');
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};