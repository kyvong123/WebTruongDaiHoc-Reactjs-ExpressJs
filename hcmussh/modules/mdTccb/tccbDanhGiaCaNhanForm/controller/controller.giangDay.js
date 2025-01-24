module.exports = app => {
    app.post('/api/tccb/danh-gia-giang-day-user', app.permission.check('staff:login'), async (req, res) => {
        //Dành cho giảng viên tham gia giảng dạy tự đánh giá
        try {
            const userNgach = req.session.user.ngach;
            const nam = parseInt(req.body.nam), shcc = req.session.user.shcc, item = req.body.item;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
            const dmCongViec = await app.model.tccbDinhMucCongViecGvVaNcv.searchAll(nam, 0);
            const listNgachNcvKhongGiangDay = (dmCongViec.rows || []).reduce((prev, cur) => {
                prev.push(...(cur.maChucDanh || '').split(','));
                return prev;
            }, []);
            if (userNgach == '01.003' || listNgachNcvKhongGiangDay.includes(userNgach)) {
                throw 'Bạn không phải là giảng viên, nghiên cứu viên tham gia giảng dạy!';
            }

            const currentDate = new Date().getTime();
            const isDangKy = danhGiaNam.nldBatDauDangKy && danhGiaNam.nldKetThucDangKy && currentDate >= danhGiaNam.nldBatDauDangKy && currentDate <= danhGiaNam.nldKetThucDangKy;
            const isTuDanhGia = danhGiaNam.caNhanBatDauTuDanhGia && danhGiaNam.caNhanKetThucTuDanhGia && currentDate >= danhGiaNam.caNhanBatDauTuDanhGia && currentDate <= danhGiaNam.caNhanKetThucTuDanhGia;
            const { noiDung, moTa, thoiHan, chatLuong, diemLonNhat, diemTuDanhGia } = item;
            if (item.id) {
                const checkDanhGia = await app.model.tccbDanhGiaChuyenVien.get({ id: item.id, nam, shcc });
                if (checkDanhGia) {
                    const updateItem = { loaiCongViec: 1 };
                    if (isDangKy) {
                        updateItem.noiDung = noiDung;
                        updateItem.moTa = moTa;
                        updateItem.thoiHan = thoiHan;
                        updateItem.diemLonNhat = diemLonNhat;
                    }
                    if (isTuDanhGia) {
                        updateItem.chatLuong = chatLuong;
                        updateItem.diemTuDanhGia = diemTuDanhGia;
                    }

                    if (checkDanhGia.diemLonNhat < diemTuDanhGia) {
                        throw 'Điểm đánh giá lớn hơn điểm tối đa';
                    }
                    const result = await app.model.tccbDanhGiaChuyenVien.update({ id: item.id }, updateItem);
                    res.send({ item: result });
                } else {
                    throw 'Bạn không có quyền chỉnh sửa đánh giá này!';
                }
            } else {
                const createItem = { loaiCongViec: 1 };
                if (isDangKy) {
                    createItem.shcc = shcc;
                    createItem.noiDung = noiDung;
                    createItem.diemLonNhat = diemLonNhat;
                    createItem.nam = nam;
                    createItem.moTa = moTa;
                    createItem.thoiHan = thoiHan;
                }
                if (isTuDanhGia) {
                    createItem.chatLuong = chatLuong;
                    createItem.diemTuDanhGia = diemTuDanhGia;
                }
                const result = await app.model.tccbDanhGiaChuyenVien.create({ ...createItem });
                res.send({ item: result });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    // Trưởng đơn vị
    app.post('/api/tccb/unit/danh-gia-giang-day', app.permission.check('manager:login'), async (req, res) => {
        //Dành cho giảng viên tham gia giảng dạy
        try {
            const nam = parseInt(req.body.nam), item = req.body.item;
            const { shcc, noiDung, moTa, thoiHan, diemLonNhat } = item;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
            const canBo = await app.model.tchcCanBo.get({ shcc }, 'shcc, ngach');
            if (!canBo) {
                throw 'Mã cán bộ không hợp lệ!';
            }
            const currentDate = new Date().getTime();
            const dmCongViec = await app.model.tccbDinhMucCongViecGvVaNcv.searchAll(nam, 0);
            const listNgachNcvKhongGiangDay = (dmCongViec.rows || []).reduce((prev, cur) => {
                prev.push(...(cur.maChucDanh || '').split(','));
                return prev;
            }, []);
            if (canBo.ngach == '01.003' || listNgachNcvKhongGiangDay.includes(canBo.ngach)) {
                throw 'Người này không phải là giảng viên, nghiên cứu viên tham gia giảng dạy!';
            }

            const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate <= danhGiaNam.donViBatDauDanhGia;
            if (!isUpdate) {
                throw 'Đã quá thời gian thêm nội dung công việc!';
            }

            if (item.id) {
                const checkDanhGia = await app.model.tccbDanhGiaChuyenVien.get({ id: item.id, nam, shcc });
                if (checkDanhGia) {
                    const updateItem = { loaiCongViec: 1, noiDung, moTa, thoiHan, diemLonNhat };
                    const result = await app.model.tccbDanhGiaChuyenVien.update({ id: item.id }, updateItem);
                    res.send({ item: result });
                } else {
                    throw 'Bạn không có quyền chỉnh sửa đánh giá này!';
                }
            } else {
                const createItem = { loaiCongViec: 1, shcc, noiDung, diemLonNhat, nam, moTa, thoiHan };
                const result = await app.model.tccbDanhGiaChuyenVien.create({ ...createItem });
                res.send({ item: result });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-giang-day-user', app.permission.check('staff:login'), async (req, res) => {
        try {
            const userNgach = req.session.user.ngach;
            const nam = parseInt(req.body.nam), shcc = req.session.user.shcc, id = req.body.id;
            const dmCongViec = await app.model.tccbDinhMucCongViecGvVaNcv.searchAll(nam, 0);
            const listNgachNcvKhongGiangDay = (dmCongViec.rows || []).reduce((prev, cur) => {
                prev.push(...(cur.maChucDanh || '').split(','));
                return prev;
            }, []);
            if (userNgach == '01.003' || listNgachNcvKhongGiangDay.includes(userNgach)) {
                throw 'Bạn không phải là giảng viên, nghiên cứu viên tham gia giảng dạy!';
            }

            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
            if (!danhGiaNam) {
                throw 'Thông tin không hợp lệ';
            }
            const checkDanhGia = await app.model.tccbDanhGiaChuyenVien.get({ id, shcc, nam });
            if (!checkDanhGia) {
                throw 'Thông tin không hợp lệ';
            }
            const currentDate = new Date().getTime();
            const isDangKy = danhGiaNam.nldBatDauDangKy && danhGiaNam.nldKetThucDangKy && currentDate >= danhGiaNam.nldBatDauDangKy && currentDate <= danhGiaNam.nldKetThucDangKy;
            if (isDangKy) {
                await app.model.tccbDanhGiaChuyenVien.delete({ id });
                res.end();
            } else {
                throw 'Đã quá thời gian cập nhật đăng ký';
            }
        } catch (error) {
            res.send({ error });
        }
    });
};