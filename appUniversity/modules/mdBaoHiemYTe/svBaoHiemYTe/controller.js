module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.baoHiemYTe,
        menus: {
            7910: {
                title: 'Quản lý thông tin bảo hiểm y tế',
                link: '/user/bao-hiem-y-te/quan-ly', icon: 'fa-medkit', backgroundColor: '#ac2d34'
            }
        }
    };

    app.permission.add({ name: 'bhyt:read', menu }, 'bhyt:write', 'bhyt:delete', 'bhyt:export');

    app.permissionHooks.add('staff', 'addRolesCtsvBhytQuanLy', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'bhyt:read', 'bhyt:write', 'bhyt:delete', 'bhyt:export');
            resolve();
        } else resolve();
    }));

    app.get('/user/bao-hiem-y-te/quan-ly', app.permission.check('bhyt:read'), app.templates.admin);
    app.get('/user/bao-hiem-y-te/quan-ly/:maDot', app.permission.check('bhyt:read'), app.templates.admin);

    // APIs --------------------------------------------------------------------------------------

    app.get('/api/bhyt/all', app.permission.check('bhyt:read'), async (req, res) => {
        try {
            let { filter, pageNumber, pageSize, condition } = req.query || {};
            filter = filter || {};
            if (filter.maDot) {
                const dataDot = await app.model.svDotDangKyBhyt.get({ ma: filter.maDot });
                if (!dataDot) throw `Mã đợt ${filter.maDot} không tồn tại!`;
                filter.namHoc = dataDot.namDangKy;
                filter.thoiGianBatDau = dataDot.thoiGianBatDau;
                filter.thoiGianKetThuc = dataDot.thoiGianKetThuc;
            } else filter.namHoc = new Date().getFullYear();
            const searchTerm = condition ? condition : '';
            let { rows: list, pagenumber, pagesize, pagetotal, totalitem } = await app.model.svBaoHiemYTe.searchPage(Number(pageNumber), Number(pageSize), searchTerm, app.utils.stringify(filter));
            res.send({ page: { list, pageNumber: pagenumber, pageSize: pagesize, pageTotal: pagetotal, totalItem: totalitem } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/bhyt/data/chu-ho', app.permission.check('bhyt:read'), async (req, res) => {
        try {
            const { mssv } = req.query;
            const { datathanhvien: dataThanhVien, datachuho: [dataChuHo] } = await app.model.svBaoHiemYTe.getData(mssv);
            res.send({ dataThanhVien, dataChuHo });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/bhyt/admin', app.permission.orCheck('developer:login', 'bhyt:write'), async (req, res) => {
        try {
            let user = req.session.user,
                thoiGian = Date.now();
            const data = req.body.data;
            const mssv = data.mssv,
                emailTruong = user.email;

            const mapperDienDong = { 9: 461, 12: 23, 15: 41 },
                mapperSoTien = { 15: 704025, 12: 563220, 9: 510300, 0: 0 };

            let item = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');

            //chỉ cập nhật cho sinh viên đã đăng ký bảo hiểm y tế
            if (!item || new Date(item.thoiGian).getFullYear() != new Date().getFullYear()) {
                throw 'Sinh viên chưa tham gia bảo hiểm y tế';
            }

            let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
            if (data.dienDong != null && item.dienDong != data.dienDong) {
                // nếu người dùng được miến trước đó thì không có loại phí
                let loaiPhi = { soTien: 0 };
                if (mapperDienDong[item.dienDong])
                    loaiPhi = await app.model.tcHocPhiDetail.get({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[item.dienDong] });

                const diff = mapperSoTien[data.dienDong] - loaiPhi.soTien;

                //Tạm không cho sinh viên thay đổi gói bhyt nếu đã đóng tiền
                let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                if (!currentFee || (currentFee.hocPhi != currentFee.congNo)) throw 'Sinh viên không đủ điều kiện để thay đổi Bảo hiểm y tế!';
                const { hocPhi, congNo } = currentFee;
                // Cập nhật khoản thu tổng quan tcHocPhi
                await app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                    hocPhi: parseInt(hocPhi) + diff,
                    congNo: parseInt(congNo) + diff,
                    ngayTao: thoiGian
                });
                // Xóa khoản thu chi tiết của BHYT nếu miễn BHYT
                if (loaiPhi && loaiPhi.soTien != 0)
                    await app.model.tcHocPhiDetail.delete({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[item.dienDong] });
                // Tạo khoản thu chi tiết nếu diện đóng là 12 hoặc 15 tháng
                if (mapperDienDong[data.dienDong])
                    await app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[data.dienDong], soTien: mapperSoTien[data.dienDong], ngayTao: thoiGian });
                await app.model.svBaoHiemYTe.update({ id: item.id }, { dienDong: data.dienDong, userModified: emailTruong, thoiGian });
            }
            res.send({});

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/bhyt', app.permission.orCheck('student:login', 'tcHocPhi:write'), async (req, res) => {
        try {
            let user = req.session.user,
                { mssv, emailTruong } = user.data || {},
                thoiGian = Date.now();
            const data = req.body.data;
            if (req.session.user.permissions.includes('tcHocPhi:write')) {
                mssv = data.mssv;
                emailTruong = req.session.user.email;
            }

            // temp
            const mapperDienDong = {
                9: 461,
                12: 23,
                15: 41
            }, mapperSoTien = {
                15: 704025,
                12: 563220,
                9: 510300,
                0: 0
            };

            let currentBhyt = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');
            if (currentBhyt) {
                if (new Date(currentBhyt.thoiGian).getFullYear() != new Date().getFullYear()) {
                    let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong, namDangKy: new Date().getFullYear() }));
                    if (!item) res.send({ error: 'Lỗi hệ thống' });
                    else {
                        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
                        if (mapperDienDong[data.dienDong]) {
                            app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[data.dienDong], soTien: mapperSoTien[data.dienDong], ngayTao: thoiGian });
                            let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                            const { hocPhi, congNo } = currentFee;
                            app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                                hocPhi: parseInt(hocPhi) + mapperSoTien[data.dienDong],
                                congNo: parseInt(congNo) + mapperSoTien[data.dienDong],
                                ngayTao: thoiGian
                            });
                        }
                        res.end();
                    }
                } else res.send({ warning: 'Sinh viên đã đăng ký BHYT cho năm nay!' });
            } else {
                let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong, namDangKy: new Date().getFullYear() }));
                if (!item) res.send({ error: 'Lỗi hệ thống' });
                else {
                    let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
                    if (mapperDienDong[data.dienDong]) {
                        app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[data.dienDong], soTien: mapperSoTien[data.dienDong] });
                        let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                        const { hocPhi, congNo } = currentFee;
                        app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                            hocPhi: parseInt(hocPhi) + mapperSoTien[data.dienDong],
                            congNo: parseInt(congNo) + mapperSoTien[data.dienDong],
                            ngayTao: thoiGian
                        });
                    }
                    res.end();
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user, curYear = new Date().getFullYear(), changes = req.body.changes;
            delete changes.id;
            const item = await app.model.svBaoHiemYTe.get({ mssv: user.studentId, namDangKy: curYear });
            switch (parseInt(item.dienDong)) {
                case 0: {
                    let maBhxhHienTai = changes.maBhxhHienTai.toString();
                    let thoiGianHoanThanh = changes.isComplete ? new Date().getTime() : '';
                    if (maBhxhHienTai.length > 10) return res.send({ error: 'Invalid parameter!' });
                    else {
                        let { id, matTruocThe } = item;
                        if (id && matTruocThe) {
                            await app.model.svBaoHiemYTe.update({ id: item.id }, { maBhxhHienTai, thoiGianHoanThanh });
                            return res.end();
                        } else return res.send({ error: 'Vui lòng bổ sung hình ảnh thẻ BHYT' });
                    }
                }
                case 9:
                case 12:
                case 15: {
                    let coBhxh = changes.coBhxh;
                    if (coBhxh == 1) {
                        let { maBhxhHienTai, benhVienDangKy, giaHan } = changes;
                        let thoiGianHoanThanh = changes.isComplete ? new Date().getTime() : '';
                        if (maBhxhHienTai.length > 10) return res.send({ error: 'Invalid parameter!' });
                        else {
                            let { id, matTruocThe } = item;
                            if (giaHan == 0) {
                                if (matTruocThe) {
                                    let destFolder = app.path.join(app.assetPath, '/bhyt/front', curYear, user.studentId);
                                    app.fs.deleteFolder(destFolder);
                                }
                                await app.model.svBaoHiemYTe.update({ id }, { maBhxhHienTai, thoiGianHoanThanh, benhVienDangKy, matTruocThe: '', giaHan });
                                return res.end();
                            }
                            else if (giaHan == 1 && matTruocThe) {
                                await app.model.svBaoHiemYTe.update({ id }, { maBhxhHienTai, thoiGianHoanThanh, benhVienDangKy, giaHan });
                                return res.end();
                            } else return res.send({ error: 'Vui lòng bổ sung thông tin chính xác!' });
                        }
                    } else if (coBhxh == 0) {
                        let { data, dataChuHo, dataThanhVien } = changes;
                        const { idDangKi, benhVienDangKy, isComplete } = data;
                        let thoiGianHoanThanh = isComplete ? new Date().getTime() : '';
                        const sinhVien = await app.model.svBaoHiemYTe.get({ id: idDangKi }),
                            currentThanhVien = await app.model.svBhytPhuLucThanhVien.getAll({ mssv: sinhVien.mssv });
                        await Promise.all([
                            app.model.svBaoHiemYTe.update({ id: item.id }, {
                                maBhxhHienTai: '', matTruocThe: '', benhVienDangKy, userModified: user.email, thoiGianHoanThanh
                            }),
                            app.model.svBhytPhuLucChuHo.update({ idDangKy: item.id }, dataChuHo),
                            ...currentThanhVien.filter(item => !dataThanhVien.some(i => i.id == item.id)).map(item => app.model.svBhytPhuLucThanhVien.delete({ id: item.id })),
                            ...dataThanhVien.map(item => {
                                // Update existing thanh vien
                                if (item.id && currentThanhVien.some(i => i.mssv == item.mssv)) {
                                    const { id, ...addedData } = item;
                                    return app.model.svBhytPhuLucThanhVien.update({ id }, { ...addedData });
                                }
                                // Create new thanh vien
                                else {
                                    return app.model.svBhytPhuLucThanhVien.create({ ...item, idDangKy: idDangKi, mssv: sinhVien.mssv, });
                                }
                            })
                        ]);
                        res.end();
                    }
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/bhyt/admin', app.permission.check('bhyt:write'), async (req, res) => {
        try {
            let user = req.session.user, changes = req.body.changes;
            let idDangKi = changes.data == null ? changes.idDangKi : changes.data.idDangKi;
            const item = await app.model.svBaoHiemYTe.get({ id: idDangKi });

            switch (parseInt(item.dienDong)) {
                case 0: {
                    let maBhxhHienTai = changes.maBhxhHienTai.toString();
                    if (maBhxhHienTai.length > 10) return res.send({ error: 'Invalid parameter!' });
                    else {
                        if (changes.matTruocThe && changes.matTruocThe != item.matTruocThe) {
                            const { idDot, mssv, matTruocThe } = changes;
                            const srcPath = app.path.join(app.assetPath, 'bhyt/front', idDot, mssv, 'temp', matTruocThe),
                                destPath = app.path.join(app.assetPath, 'bhyt/front', idDot, mssv, matTruocThe);
                            await app.fs.rename(srcPath, destPath);
                            if (changes.matTruocThe && item.matTruocThe) {
                                const curPath = app.path.join(app.assetPath, 'bhyt/front', idDot, mssv, item.matTruocThe);
                                await app.fs.deleteFile(curPath);
                            }
                        }
                        await app.model.svBaoHiemYTe.update({ id: item.id }, { ...changes, maBhxhHienTai, thoiGianHoanThanh: new Date().getTime(), userModified: user.email });
                        return res.end();
                    }
                }
                case 9:
                case 12:
                case 15: {
                    let coBhxh = changes.coBhxh;
                    if (coBhxh == 1) {
                        let { maBhxhHienTai, benhVienDangKy, giaHan } = changes;
                        if (maBhxhHienTai.length > 10) return res.send({ error: 'Invalid parameter!' });
                        else {
                            let { id, matTruocThe } = item;
                            if (giaHan == 0) {
                                if (matTruocThe) {
                                    let destFolder = app.path.join(app.assetPath, '/bhyt/front', item.idDot.toString(), item.mssv);
                                    app.fs.deleteFolder(destFolder);
                                }
                                await app.model.svBaoHiemYTe.update({ id }, { maBhxhHienTai, thoiGianHoanThanh: new Date().getTime(), userModified: user.email, benhVienDangKy, matTruocThe: '', giaHan });
                                return res.end();
                            }
                            else if (giaHan == 1) {
                                if (changes.matTruocThe && changes.matTruocThe != item.matTruocThe) {
                                    let { idDot, mssv, matTruocThe: newImage } = changes;
                                    const srcPath = app.path.join(app.assetPath, 'bhyt/front', idDot, mssv, 'temp', newImage),
                                        destPath = app.path.join(app.assetPath, 'bhyt/front', idDot, mssv, newImage);
                                    await app.fs.rename(srcPath, destPath);
                                    if (item.matTruocThe) {
                                        const curPath = app.path.join(app.assetPath, 'bhyt/front', idDot, mssv, matTruocThe);
                                        await app.fs.deleteFile(curPath);
                                    }
                                }
                                await app.model.svBaoHiemYTe.update({ id }, { ...changes, thoiGianHoanThanh: new Date().getTime(), userModified: user.email, benhVienDangKy, giaHan });
                                return res.end();
                            } else return res.send({ error: 'Vui lòng bổ sung thông tin chính xác!' });
                        }
                    } else if (coBhxh == 0) {
                        let { data, dataChuHo, dataThanhVien } = changes;
                        const { idDangKi, benhVienDangKy } = data;
                        const sinhVien = await app.model.svBaoHiemYTe.get({ id: idDangKi });
                        const curChuHo = await app.model.svBhytPhuLucChuHo.get({ mssv: sinhVien.mssv });
                        await app.model.svBhytPhuLucThanhVien.delete({ mssv: sinhVien.mssv });
                        await Promise.all([
                            app.model.svBaoHiemYTe.update({ id: item.id }, {
                                maBhxhHienTai: '', matTruocThe: '', benhVienDangKy, userModified: user.email, thoiGianHoanThanh: new Date().getTime()
                            }),
                            (curChuHo ? app.model.svBhytPhuLucChuHo.update({ mssv: sinhVien.mssv }, dataChuHo) : app.model.svBhytPhuLucChuHo.create({ ...dataChuHo, idDangKi: item.id, mssv: sinhVien.mssv })),
                            ...dataThanhVien.map(item => (delete item.id) && app.model.svBhytPhuLucThanhVien.create({ ...item, idDangKy: idDangKi, mssv: sinhVien.mssv, }))
                        ]);
                        res.end();
                    }
                }
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt'));
    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt/front'));

    app.uploadHooks.add('uploadBhytSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadImage(req, fields, files, params, done), done, 'student:pending'));

    app.uploadHooks.add('uploadBhytSinhVienImageSv', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadImage(req, fields, files, params, done), done, 'student:login'));

    const uploadImage = async (req, fields, files, params, done) => {
        try {
            if (fields.userData && fields.userData.length && fields.userData[0].startsWith('BHYTSV_FRONT:') && files.BHYTSV_FRONT && files.BHYTSV_FRONT.length) {
                if (files.BHYTSV_FRONT[0].size > 1000 * 1000) {
                    app.fs.deleteImage(files.BHYTSV_FRONT[0].path);
                    done && done({ error: 'Vui lòng upload ảnh kích thước nhỏ hơn 1MB!' });
                } else {
                    let user = req.session.user,
                        maDot = fields.userData[0].split(':')[1];
                    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt/front', maDot));
                    let destFolder = app.path.join(app.assetPath, '/bhyt/front', maDot.toString(), user.studentId.toString());
                    app.fs.deleteFolder(destFolder);
                    app.fs.createFolder(destFolder);
                    let srcPath = files.BHYTSV_FRONT[0].path,
                        fileName = app.path.basename(srcPath),
                        destPath = app.path.join(destFolder, fileName);
                    await app.fs.rename(srcPath, destPath);
                    done && done({ image: `/${maDot}/${user.studentId}/${fileName}` });
                }
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            done && done({ error });
        }
    };

    app.uploadHooks.add('ctsvUploadBhytSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => ctsvUploadImage(req, fields, files, params, done), done, 'bhyt:write'));

    const ctsvUploadImage = async (req, fields, files, params, done) => {
        try {
            if (fields.userData && fields.userData.length && fields.userData[0].startsWith('BHYTSV_FRONT:') && files.BHYTSV_FRONT && files.BHYTSV_FRONT.length) {
                if (files.BHYTSV_FRONT[0].size > 1000 * 1000) {
                    app.fs.deleteImage(files.BHYTSV_FRONT[0].path);
                    done && done({ error: 'Vui lòng upload ảnh kích thước nhỏ hơn 1MB!' });
                } else {
                    let userData = fields.userData[0].split(':')[1],
                        [maDot, mssv] = userData.split('_');
                    let destFolder = app.path.join(app.assetPath, '/bhyt/front', maDot, mssv, 'temp');
                    app.fs.createFolder(
                        app.path.join(app.assetPath, '/bhyt/front', maDot),
                        app.path.join(app.assetPath, '/bhyt/front', maDot, mssv),
                        destFolder
                    );
                    app.fs.deleteFolder(destFolder);
                    app.fs.createFolder(destFolder);
                    // app.fs.createFolder(destFolder);
                    let srcPath = files.BHYTSV_FRONT[0].path,
                        fileName = app.path.basename(srcPath),
                        destPath = app.path.join(destFolder, fileName);
                    await app.fs.rename(srcPath, destPath);
                    done && done({ image: `${maDot}/${mssv}/${fileName}` });
                }
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            done && done({ error });
        }
    };

    app.uploadHooks.add('svBhytUploadCmndFront', (req, fields, files, params, done) =>
        app.permission.has(req, () => svBhytUploadCmndFront(req, fields, files, params, done), done, 'student:login'));

    app.uploadHooks.add('svBhytUploadCmndBack', (req, fields, files, params, done) =>
        app.permission.has(req, () => svBhytUploadCmndBack(req, fields, files, params, done), done, 'student:login'));

    const svBhytUploadCmndFront = async (req, fields, files, params, done) => {
        if (files.svBhytUploadCmndFront?.length) {
            try {
                await storeTempImage(req, fields, files.svBhytUploadCmndFront[0], 'front', done);
            } catch (error) {
                app.consoleError(req, error);
                done && done({ error });
            }
        }
    };
    const svBhytUploadCmndBack = async (req, fields, files, params, done) => {
        if (files.svBhytUploadCmndBack?.length) {
            try {
                await storeTempImage(req, fields, files.svBhytUploadCmndBack[0], 'back', done);
            } catch (error) {
                app.consoleError(req, error);
                done && done({ error });
            }
        }
    };

    const storeTempImage = async (req, fields, uploadData, side, done) => {
        if (uploadData.size > 1000 * 1000) {
            app.fs.deleteImage(uploadData.path);
            throw 'Vui lòng upload ảnh kích thước nhỏ hơn 1MB!';
        }
        const mssv = req.session.user.studentId,
            maDot = fields.userData[0].split(':')[1];
        const startPoint = app.path.join(app.assetPath, `/bhyt/${side}Cmnd`);
        let destFolder = app.path.join(startPoint, maDot, mssv);
        app.fs.createFolder(
            app.path.join(startPoint),
            app.path.join(startPoint, maDot),
            destFolder
        );
        app.fs.deleteFolder(destFolder);
        app.fs.createFolder(destFolder);

        let srcPath = uploadData.path,
            fileName = app.path.basename(srcPath),
            destPath = app.path.join(destFolder, fileName);
        await app.fs.rename(srcPath, destPath);
        done && done({ image: `${maDot}/${fileName}` });
    };

    app.get('/api/bhyt/front', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user, curYear = new Date().getFullYear();
            const item = await app.model.svBaoHiemYTe.get({ mssv: user.studentId, namDangKy: curYear });
            if (!item || (item && !item.matTruocThe)) res.send({ error: 'No value returned' });
            else {
                let matTruocThe = item.matTruocThe,
                    path = app.path.join(app.assetPath, '/bhyt/front', item.idDot.toString(), user.studentId, matTruocThe);
                if (app.fs.existsSync(path)) res.sendFile(path);
                else res.send({ error: 'No value returned' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/bhyt/admin/temp/:maDot/:mssv/:fileName', app.permission.check('bhyt:read'), async (req, res) => {
        try {
            let { maDot, mssv, fileName } = req.params;
            let path = app.path.join(app.assetPath, '/bhyt/front', maDot, mssv, 'temp', fileName);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/admin/:maDot/:mssv/:fileName', app.permission.check('bhyt:read'), async (req, res) => {
        try {
            let { maDot, mssv, fileName } = req.params;
            let path = app.path.join(app.assetPath, '/bhyt/front', maDot, mssv, fileName);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/admin/cmnd/front/:maDot/:mssv/:fileName', app.permission.check('bhyt:read'), async (req, res) => {
        try {
            let { maDot, mssv, fileName } = req.params;
            let path = app.path.join(app.assetPath, '/bhyt/frontCmnd', maDot, mssv, fileName);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/admin/cmnd/back/:maDot/:mssv/:fileName', app.permission.check('bhyt:read'), async (req, res) => {
        try {
            let { maDot, mssv, fileName } = req.params;
            let path = app.path.join(app.assetPath, '/bhyt/backCmnd', maDot, mssv, fileName);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/download', app.permission.check('student:export'), async (req, res) => {
        try {
            let { search, dotDangKy, img } = req.query;
            const dataDot = await app.model.svDotDangKyBhyt.get({ ma: dotDangKy });
            const filter = dataDot ? {
                thoiGianBatDau: dataDot.thoiGianBatDau,
                thoiGianKetThuc: dataDot.thoiGianKetThuc,
            } : {};
            const [data, dataChuHo, dataThanhVien] = await Promise.all([
                app.model.svBaoHiemYTe.downloadExcel(search, app.utils.stringify(filter)),
                app.model.svBhytPhuLucChuHo.downloadExcel(search, app.utils.stringify(filter)),
                app.model.svBhytPhuLucThanhVien.downloadExcel(search, app.utils.stringify(filter)),
            ]),
                list = data.rows, listChuHo = dataChuHo.rows, listThanhVien = dataThanhVien.rows;
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Đăng ký BHYT'),
                wsChuHo = workBook.addWorksheet('Phụ lục chủ hộ'),
                wsThanhVien = workBook.addWorksheet('Phụ lục thành viên');

            ws.columns = [];
            if (list && list.length) {
                // eslint-disable-next-line no-unused-vars
                const { ['Mặt trước BHYT']: anhThe, idDot, ...rest } = list[0];
                ws.columns = Object.keys(rest).map(key => ({ header: key.toString(), key, width: 20 }));
            }
            wsChuHo.columns = listChuHo && listChuHo.length ? [{ header: 'STT', key: 'stt', width: 5 }, ...Object.keys(listChuHo[0]).map(key => ({ header: key.toString(), key, width: 20 }))] : [];
            wsThanhVien.columns = listThanhVien && listThanhVien.length ? [{ header: 'STT', key: 'stt', width: 5 }, ...Object.keys(listThanhVien[0]).map(key => ({ header: key.toString(), key, width: 20 }))] : [];

            ws.lastColumn.width = 25;
            !img && ws.spliceColumns(ws.columnCount, 1);
            list.forEach((item, index) => {
                const { ['Mặt trước BHYT']: anhThe, idDot, ...rest } = item;
                const newRow = ws.addRow({ stt: index + 1, ...rest }, 'n');
                // Chèn ảnh thẻ nếu có
                if (!img || !idDot || !anhThe) return;
                const imgPath = app.path.join(app.assetPath, 'bhyt/front', idDot, item['MSSV'], anhThe);
                if (app.fs.existsSync(imgPath)) {
                    newRow.height = 90;
                    newRow.alignment = { vertical: 'middle' };
                    const ext = app.path.extname(imgPath).replace('.', '');
                    const imageId = workBook.addImage({
                        filename: imgPath,
                        extension: ext
                    });
                    ws.addImage(imageId, {
                        tl: { col: ws.columnCount - 1, row: index + 1 },
                        br: { col: ws.columnCount, row: index + 2 },
                        editAs: 'oneCell'
                    });
                }
            });

            // Phu luc chu ho sheet
            listChuHo.forEach((item, index) => {
                wsChuHo.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });

            // Phu luc thanh vien sheet
            listThanhVien.forEach((item, index) => {
                wsThanhVien.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            let fileName = 'BHYT_DATA.xlsx';
            app.excel.attachment(workBook, res, fileName);

        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/download-word', app.permission.check('student:export'), async (req, res) => {
        try {
            const { id } = req.query,
                bhyt = await app.model.svBaoHiemYTe.get({ id });
            if (!bhyt) throw 'Không tìm thấy mã đăng ký';
            const { mssv } = bhyt,
                { rows: [dataSinhVien] } = await app.model.fwStudent.getData(mssv);
            const {
                listthanhvien: thanhVien,
                rows: [dataBhyt] } = await app.model.svBaoHiemYTe.getParams(id);
            const data = app.clone({}, dataSinhVien, dataBhyt, { thanhVien });
            data.ngaySinh = app.date.dateTimeFormat(new Date(Number(data.ngaySinh)), 'dd/mm/yyyy');
            data.I = bhyt.maBhxhHienTai == null ? true : false;
            data.II = bhyt.maBhxhHienTai == null ? false : true;
            const docPath = app.path.join(app.publicPath, 'sample', 'TK_BHYT.docx');
            const now = new Date();
            data.dd = now.getDate();
            data.mm = now.getMonth() + 1;
            data.yyyy = now.getFullYear();

            const buffer = await app.docx.generateFile(docPath, data);
            res.send({ buffer, fileName: 'TK_BHYT_' + mssv.toString() + '.docx' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/bhyt/admin', app.permission.check('bhyt:delete'), async (req, res) => {
        try {
            const { idDangKy } = req.body;
            await Promise.all([
                app.model.svBhytPhuLucChuHo.delete({ idDangKy }),
                app.model.svBhytPhuLucThanhVien.delete({ idDangKy }),
                app.model.svBaoHiemYTe.delete({ id: idDangKy }),
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/ho-gia-dinh/download', app.permission.check('student:export'), async (req, res) => {
        try {
            let { searchTerm, dotDangKy } = req.query;
            // tạo sheet
            const workBook = await app.excel.readFile(app.path.join(__dirname, 'resource/BHYT_HGD_TEMPLATE.xlsx')),
                workDanhSach = workBook.getWorksheet('Danhsach'),
                workHoGiaDinh = workBook.getWorksheet('Hogiadinh'),
                workDanToc = workBook.getWorksheet('MA_DT'),
                workBv = workBook.getWorksheet('MA_BV');
            // lấy dữ liệu từ db
            const dataDotDangKy = dotDangKy ? await app.model.svDotDangKyBhyt.get({ ma: dotDangKy }) : null;
            const filter = {};
            if (dataDotDangKy) {
                filter.thoiGianBatDau = dataDotDangKy.thoiGianBatDau;
                filter.thoiGianKetThuc = dataDotDangKy.thoiGianKetThuc;
            }

            const [{ rows: list, hogiadinh: hoGiaDinh }, danToc, benhVien] = await Promise.all([
                app.model.svBaoHiemYTe.downloadHoGiaDinh(searchTerm, app.utils.stringify(filter)),
                app.model.dmDanToc.getAll({ kichHoat: 1 }, 'ma,ten', 'ma'),
                app.model.dmCoSoKcbBhyt.getAll({ kichHoat: 1 }, 'ma,ten')
            ]);

            workDanhSach.columns = [{ key: 'STT' }].concat(Object.keys(list[0] || {}).map((key, index) => (index == 0 ? { key, width: 30 } : { key })));
            list.forEach((item, index) => { workDanhSach.insertRow(3 + index, { ...item, STT: index + 1 }, 'o+'); });

            workHoGiaDinh.columns = [{ key: 'STT' }].concat(Object.keys(hoGiaDinh[0] || {}).map((key, index) => (index == 0 ? { key, width: 30 } : key == 'Thời gian' ? '' : { key })));
            hoGiaDinh.forEach((item, index) => { workHoGiaDinh.insertRow(3 + index, { ...item, STT: index + 1 }, 'o+'); });
            //thêm dân tộc
            workDanToc.columns = Object.keys(danToc[0] || {}).map(key => ({ key, width: 15 }));
            danToc.forEach((item) => { workDanToc.addRow(item); });
            //thêm bệnh viện
            workBv.columns = Object.keys(benhVien[0] || {}).map(key => ({ key, width: 15 }));
            benhVien.forEach((item) => { workBv.addRow(item); });
            // export 
            let fileName = 'BHYT_HOGIADINH.xlsx';
            app.excel.attachment(workBook, res, fileName);

        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};

