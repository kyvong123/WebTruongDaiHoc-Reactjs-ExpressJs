module.exports = app => {
    // Trưởng đơn vị
    app.post('/api/tccb/unit/danh-gia-chuyen-vien', app.permission.check('manager:login'), async (req, res) => {
        //Dành cho trưởng đơn vị loaiCongViec = 1
        try {
            const nam = parseInt(req.body.nam), item = req.body.item;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
            const currentDate = new Date().getTime();
            const { shcc, noiDung, moTa, thoiHan, diemLonNhat, idFormChuyenVien, loaiCongViec } = item;
            if (loaiCongViec == 1) {
                const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate <= danhGiaNam.donViBatDauDanhGia;
                if (!isUpdate) {
                    throw 'Đã quá thời gian thêm nội dung công việc!';
                }
                const formChuyenVien = await app.model.tccbDanhGiaFormChuyenVienParent.get({ id: idFormChuyenVien, nam });
                if (!formChuyenVien) {
                    throw 'Form chuyên viên không hợp lệ';
                }
                const allNoiDung = await app.model.tccbDanhGiaChuyenVien.getAll({ shcc, nam, idFormChuyenVien }, '*', 'id ASC');
                const sum = allNoiDung.reduce((prev, cur) => prev + Number(cur.diemLonNhat), 0);
                if (formChuyenVien.diemLonNhat < sum + Number(item.diemLonNhat)) {
                    throw 'Tổng điểm nội dung không được lớn hơn mục chung';
                }
                const newItem = { moTa, thoiHan, noiDung, diemLonNhat, idFormChuyenVien, loaiCongViec };
                const result = await app.model.tccbDanhGiaChuyenVien.create({ shcc, nam, ...newItem });
                res.send({ item: result });
            } else {
                throw 'Loại công việc không hợp lệ!';
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/unit/danh-gia-chuyen-vien', app.permission.check('manager:login'), async (req, res) => {
        //Dành cho trưởng đơn vị loaiCongViec = 1
        try {
            const id = req.body.id, changes = req.body.changes;
            const oldItem = await app.model.tccbDanhGiaChuyenVien.get({ id });
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: oldItem.nam });
            const currentDate = new Date().getTime();
            const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate <= danhGiaNam.donViBatDauDanhGia;
            const { diemLonNhat } = changes;
            if (!oldItem) {
                throw 'Mã đánh giá không hợp lệ';
            }
            //Dành cho việc cập nhật nội dung
            if (!isUpdate) {
                throw 'Thời gian phân công không phù hợp';
            }

            const formChuyenVien = await app.model.tccbDanhGiaFormChuyenVienParent.get({ id: oldItem.idFormChuyenVien, nam: oldItem.nam });
            if (!formChuyenVien) {
                throw 'Lỗi không xác định';
            }
            const allNoiDung = await app.model.tccbDanhGiaChuyenVien.getAll({ shcc: oldItem.shcc, nam: oldItem.nam, idFormChuyenVien: oldItem.idFormChuyenVien }, '*', 'id ASC');
            const sum = allNoiDung.filter(item => item.id != id).reduce((prev, cur) => prev + Number(cur.diemLonNhat), 0);
            if (formChuyenVien.diemLonNhat < sum + Number(changes.diemLonNhat)) {
                throw 'Tổng điểm nội dung không được lớn hơn mục chung';
            }
            if (diemLonNhat != oldItem.diemLonNhat) {
                if (oldItem.diemTuDanhGia > diemLonNhat) changes.diemTuDanhGia = diemLonNhat;
                if (oldItem.diemDonVi > diemLonNhat) changes.diemDonVi = diemLonNhat;
            }
            const result = await app.model.tccbDanhGiaChuyenVien.update({ id }, changes);
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/unit/danh-gia-chuyen-vien', app.permission.check('manager:login'), async (req, res) => {
        //Dành cho trưởng đơn vị xoá công việc của chuyên viên vào đầu năm
        try {
            const id = req.body.id;
            const danhGiaChuyenVien = await app.model.tccbDanhGiaChuyenVien.get({ id });
            if (!danhGiaChuyenVien || danhGiaChuyenVien.loaiCongViec == 0) {
                throw 'Lỗi không xác định';
            }
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: danhGiaChuyenVien.nam });
            const currentDate = new Date().getTime();
            const isDelete = !danhGiaNam.donViBatDauDanhGia || currentDate <= danhGiaNam.donViBatDauDanhGia;
            if (!isDelete) {
                throw 'Đã quá thời gian cập nhật đăng ký công việc!';
            }
            const result = await app.model.tccbDanhGiaChuyenVien.delete({ id });
            res.send({ item: result });
        } catch (error) {
            res.send({ error });
        }
    });

    //API cho hội đồng đơn vị
    app.put('/api/tccb/hoi-dong-don-vi/danh-gia-chuyen-vien', app.permission.check('tccbDanhGia:unitCouncil'), async (req, res) => {
        try {
            const userTccbDonViNam = req.session.user.tccbDonViNam || [];
            const id = req.body.id, changes = req.body.changes;
            let { diemDonVi, yKienDonVi, loaiCongViec, idFormChuyenVien, nam, shcc } = changes;
            nam = parseInt(nam);
            loaiCongViec = parseInt(loaiCongViec);
            if (loaiCongViec == 1) {
                const oldItem = await app.model.tccbDanhGiaChuyenVien.get({ id });
                const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: oldItem.nam });
                if (!danhGiaNam) {
                    throw 'Năm đánh giá không hợp lệ!';
                }
                const currentDate = new Date().getTime();
                const isDanhGia = danhGiaNam.donViBatDauDanhGia && danhGiaNam.donViKetThucDanhGia && currentDate >= danhGiaNam.donViBatDauDanhGia && currentDate <= danhGiaNam.donViKetThucDanhGia;
                if (!oldItem) {
                    throw 'Mã đánh giá không hợp lệ';
                }

                if (!userTccbDonViNam.includes(oldItem.nam)) {
                    throw 'Bạn không có quyền đánh giá trong năm này';
                }

                if (!isDanhGia) {
                    throw 'Thời gian đánh giá không phù hợp';
                }

                if (diemDonVi > oldItem.diemLonNhat) {
                    throw 'Điểm đánh giá không được lớn hơn điểm tối đa!';
                }

                const result = await app.model.tccbDanhGiaChuyenVien.update({ id }, { diemDonVi, yKienDonVi });
                res.send({ item: result });
            } else { // loaiCongViec == 0
                const formChuyenVien = await app.model.tccbDanhGiaFormChuyenVienChild.get({ id: idFormChuyenVien });
                if (!formChuyenVien) {
                    throw 'Mã form đánh giá không hợp lệ!';
                }
                if (id) {
                    const oldItem = await app.model.tccbDanhGiaChuyenVien.get({ id });
                    const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: oldItem.nam });
                    const currentDate = new Date().getTime();
                    const isDanhGia = danhGiaNam.donViBatDauDanhGia && danhGiaNam.donViKetThucDanhGia && currentDate >= danhGiaNam.donViBatDauDanhGia && currentDate <= danhGiaNam.donViKetThucDanhGia;
                    if (!oldItem) {
                        throw 'Mã đánh giá không hợp lệ';
                    }

                    if (!userTccbDonViNam.includes(oldItem.nam)) {
                        throw 'Bạn không có quyền đánh giá trong năm này';
                    }

                    if (!isDanhGia) {
                        throw 'Thời gian đánh giá không phù hợp';
                    }

                    if (diemDonVi > formChuyenVien.diemLonNhat) {
                        throw 'Điểm đánh giá không được lớn hơn điểm tối đa!';
                    }

                    const result = await app.model.tccbDanhGiaChuyenVien.update({ id }, { diemDonVi, yKienDonVi });
                    res.send({ item: result });
                } else {
                    const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
                    if (!danhGiaNam) {
                        throw 'Năm đánh giá không hợp lệ!';
                    }
                    const currentDate = new Date().getTime();
                    const isDanhGia = danhGiaNam.donViBatDauDanhGia && danhGiaNam.donViKetThucDanhGia && currentDate >= danhGiaNam.donViBatDauDanhGia && currentDate <= danhGiaNam.donViKetThucDanhGia;

                    if (!userTccbDonViNam.includes(nam)) {
                        throw 'Bạn không có quyền đánh giá trong năm này';
                    }

                    if (!isDanhGia) {
                        throw 'Thời gian đánh giá không phù hợp';
                    }

                    if (diemDonVi > formChuyenVien.diemLonNhat) {
                        throw 'Điểm đánh giá không được lớn hơn điểm tối đa!';
                    }
                    const data = {
                        shcc,
                        diemLonNhat: formChuyenVien.diemLonNhat,
                        nam,
                        idFormChuyenVien,
                        diemDonVi,
                        yKienDonVi,
                        loaiCongViec: 0
                    };

                    const result = await app.model.tccbDanhGiaChuyenVien.create(data);
                    res.send({ item: result });
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    //Api dành cho User
    app.post('/api/tccb/danh-gia-chuyen-vien-user', app.permission.check('staff:login'), async (req, res) => {
        //Dành cho cá nhân tự đánh giá
        try {
            if (req.session.user.ngach != '01.003') {
                throw 'Bạn không phải là chuyên viên!';
            }
            const nam = parseInt(req.body.nam), shcc = req.session.user.shcc, item = req.body.item;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam });
            const currentDate = new Date().getTime();
            const isDangKy = danhGiaNam.nldBatDauDangKy && danhGiaNam.nldKetThucDangKy && currentDate >= danhGiaNam.nldBatDauDangKy && currentDate <= danhGiaNam.nldKetThucDangKy;
            let isDangKyDotXuat = isDangKy;
            if (!isDangKyDotXuat && danhGiaNam.caNhanBatDauTuDanhGia) {
                isDangKyDotXuat = currentDate < danhGiaNam.caNhanBatDauTuDanhGia;
            }
            const isTuDanhGia = danhGiaNam.caNhanBatDauTuDanhGia && danhGiaNam.caNhanKetThucTuDanhGia && currentDate >= danhGiaNam.caNhanBatDauTuDanhGia && currentDate <= danhGiaNam.caNhanKetThucTuDanhGia;
            const { noiDung, moTa, thoiHan, chatLuong, diemLonNhat, diemTuDanhGia, isDotXuat, idFormChuyenVien, loaiCongViec } = item;
            if (loaiCongViec == 1) {
                if (item.id) {
                    const checkDanhGia = await app.model.tccbDanhGiaChuyenVien.get({ id: item.id, nam, shcc });
                    if (checkDanhGia) {
                        const updateItem = {};
                        if (isDangKy || (isDangKyDotXuat && isDotXuat)) {
                            updateItem.noiDung = noiDung;
                            updateItem.moTa = moTa;
                            updateItem.thoiHan = thoiHan;
                            updateItem.diemLonNhat = diemLonNhat;
                        }
                        if (isTuDanhGia) {
                            updateItem.chatLuong = chatLuong;
                            updateItem.diemTuDanhGia = diemTuDanhGia;
                        }

                        const formChuyenVien = await app.model.tccbDanhGiaFormChuyenVienParent.get({ id: checkDanhGia.idFormChuyenVien, nam: checkDanhGia.nam });
                        if (!formChuyenVien) {
                            throw 'Lỗi không xác định';
                        }

                        const allNoiDung = await app.model.tccbDanhGiaChuyenVien.getAll({ shcc, nam: checkDanhGia.nam, idFormChuyenVien: checkDanhGia.idFormChuyenVien }, '*', 'id ASC');
                        const sum = allNoiDung.filter(_item => _item.id != item.id).reduce((prev, cur) => prev + Number(cur.diemLonNhat), 0);
                        if (formChuyenVien.diemLonNhat < sum + Number(diemLonNhat)) {
                            throw 'Tổng điểm nội dung không được lớn hơn mục chung';
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
                    const createItem = {};
                    if (isDangKy || (isDangKyDotXuat && isDotXuat)) {
                        createItem.shcc = shcc;
                        createItem.noiDung = noiDung;
                        createItem.diemLonNhat = diemLonNhat;
                        createItem.nam = nam;
                        createItem.idFormChuyenVien = idFormChuyenVien;
                        createItem.moTa = moTa;
                        createItem.thoiHan = thoiHan;
                        createItem.loaiCongViec = loaiCongViec;
                        const formChuyenVien = await app.model.tccbDanhGiaFormChuyenVienParent.get({ id: idFormChuyenVien, nam });
                        if (!formChuyenVien) {
                            throw 'Form chuyên viên không hợp lệ';
                        }
                        const allNoiDung = await app.model.tccbDanhGiaChuyenVien.getAll({ shcc, nam, idFormChuyenVien }, '*', 'id ASC');
                        const sum = allNoiDung.reduce((prev, cur) => prev + Number(cur.diemLonNhat), 0);
                        if (formChuyenVien.diemLonNhat < sum + Number(diemLonNhat)) {
                            throw 'Tổng điểm nội dung không được lớn hơn mục chung';
                        }
                    }
                    if (isTuDanhGia) {
                        createItem.chatLuong = chatLuong;
                        createItem.diemTuDanhGia = diemTuDanhGia;
                    }
                    const result = await app.model.tccbDanhGiaChuyenVien.create({ ...createItem });
                    res.send({ item: result });
                }
            } else { // loaiCongViec = 0
                const formChuyenVien = await app.model.tccbDanhGiaFormChuyenVienChild.get({ id: idFormChuyenVien });
                if (!formChuyenVien) {
                    throw 'Mã form đánh giá không hợp lệ!';
                }

                if (item.id) {
                    const checkDanhGia = await app.model.tccbDanhGiaChuyenVien.get({ id: item.id, nam, shcc });
                    if (checkDanhGia) {
                        const updateItem = {};
                        if (isTuDanhGia) {
                            updateItem.diemLonNhat = formChuyenVien.diemLonNhat;
                            updateItem.diemTuDanhGia = diemTuDanhGia;
                        }

                        if (formChuyenVien.diemLonNhat < diemTuDanhGia) {
                            throw 'Điểm đánh giá lớn hơn điểm tối đa';
                        }
                        const result = await app.model.tccbDanhGiaChuyenVien.update({ id: item.id }, updateItem);
                        res.send({ item: result });
                    } else {
                        throw 'Bạn không có quyền chỉnh sửa đánh giá này!';
                    }
                } else {
                    const createItem = {};
                    if (isTuDanhGia) {
                        createItem.shcc = shcc;
                        createItem.diemLonNhat = formChuyenVien.diemLonNhat;
                        createItem.nam = nam;
                        createItem.idFormChuyenVien = idFormChuyenVien;
                        createItem.diemTuDanhGia = diemTuDanhGia;
                        createItem.loaiCongViec = loaiCongViec;
                    }

                    if (formChuyenVien.diemLonNhat < diemTuDanhGia) {
                        throw 'Điểm đánh giá lớn hơn điểm tối đa';
                    }

                    const result = await app.model.tccbDanhGiaChuyenVien.create({ ...createItem });
                    res.send({ item: result });
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-chuyen-vien-user', app.permission.check('staff:login'), async (req, res) => {
        try {
            if (req.session.user.ngach != '01.003') {
                throw 'Bạn không phải là chuyên viên!';
            }
            const nam = parseInt(req.body.nam), shcc = req.session.user.shcc, id = req.body.id, isDotXuat = req.body.isDotXuat;
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
            let isDangKyDotXuat = isDangKy;
            if (!isDangKyDotXuat && danhGiaNam.caNhanBatDauTuDanhGia) {
                isDangKyDotXuat = currentDate < danhGiaNam.caNhanBatDauTuDanhGia;
            }
            if (isDangKy || (isDangKyDotXuat && isDotXuat)) {
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