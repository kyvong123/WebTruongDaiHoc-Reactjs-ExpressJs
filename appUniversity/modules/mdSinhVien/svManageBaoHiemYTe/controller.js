module.exports = app => {
    const PERMISSION = app.isDebug ? 'student:login' : 'student:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.user,
            menus: {
                1350: { title: 'Bảo hiểm y tế', link: '/user/quan-ly-bhyt', pin: true, icon: 'fa-medkit', backgroundColor: '#ac2d34' },
            },
        }
    });

    app.permission.add({
        name: PERMISSION, menu: { parentMenu: app.parentMenu.svBaoHiemYte }
    });

    app.get('/user/quan-ly-bhyt', app.permission.check(PERMISSION), app.templates.admin);

    app.get('/api/sv/bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.studentId;
            let { rows: items, datachuho: dataChuHo, datathanhvien: dataThanhVien } = await app.model.svBaoHiemYTe.getData(mssv, null, new Date().getFullYear());
            res.send({ item: { ...items[0], dataChuHo: dataChuHo[0], dataThanhVien }, });
        } catch (error) {
            res.send({ error });
        }
    });

    const daThanhToanBhyt = async (mssv) => {
        try {
            let loaiPhi = await app.model.tcLoaiPhi.getAll({ namPhatSinh: 2023, hocKyPhatSinh: 1 });

            let mapBhyt = await app.model.tcLoaiPhiBhyt.getAll({});

            let loaiPhiBhyt = loaiPhi.map(item => Object({ ...item, ...mapBhyt.find(subItem => subItem.loaiPhi == item.id) })).filter(item => item.dienDong);

            for (let bhyt of loaiPhiBhyt) {
                let item = await app.model.tcHocPhiDetail.get({ mssv, loaiPhi: bhyt.id });
                if (item) {
                    if (item.soTienDaDong - item.soTienCanDong >= 0) {
                        return true;
                    }
                }
            }
            return false;
        }
        catch (error) {
            console.error(error);
        }
    };

    app.get('/api/sv/bhyt/thong-tin-ca-nhan', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.studentId;
            const dataSinhVien = await app.model.fwStudent.get({ mssv }, 'ho, ten, mssv, ngaySinh, thuongTruMaXa, thuongTruMaHuyen, thuongTruMaTinh, thuongTruSoNha, noiSinhMaTinh, cmnd, canEdit, dienThoaiCaNhan');
            const { rows: items, datachuho: dataChuHo, datathanhvien: dataThanhVien } = await app.model.svBaoHiemYTe.getData(mssv);
            const [currentBhyt, previousBhyt] = items;
            const currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC');
            const lichSuDangKy = await app.model.svBaoHiemYTe.get({ mssv, namDangKy: currentDotDangKy ? currentDotDangKy.namDangKy : (new Date().getFullYear()) + 1 });
            if (lichSuDangKy) {
                if (lichSuDangKy.dienDong != 0) {
                    lichSuDangKy.dataChuHo = dataChuHo[0];
                    lichSuDangKy.dataThanhVien = dataThanhVien;
                }
                lichSuDangKy.isThanhToan = !!lichSuDangKy.idGiaoDich ?? await daThanhToanBhyt(mssv);
            }
            dataSinhVien.benhVienDangKy = currentBhyt?.benhVienDangKy ?? previousBhyt?.benhVienDangKy;
            dataSinhVien.maBhxhHienTai = currentBhyt?.maBhxhHienTai ?? previousBhyt?.maBhxhHienTai;
            dataSinhVien.dienDong = currentBhyt?.dienDong ?? previousBhyt?.dienDong;
            dataSinhVien.matTruocThe = currentBhyt?.matTruocThe;
            dataSinhVien.currentDotDangKy = currentDotDangKy || null;
            dataSinhVien.lichSuDangKy = lichSuDangKy || null;
            dataSinhVien.cccd = lichSuDangKy?.cccd;
            dataSinhVien.isValidKhoaHe = (currentDotDangKy ? (currentDotDangKy.heDaoTao.split(',').includes(user.data.loaiHinhDaoTao) && currentDotDangKy.khoaSinhVien.split(',').includes(user.data.khoaSV.toString())) : false);
            res.send({ dataSinhVien, items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/bhyt/item-info', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.studentId;
            const dataSinhVien = await app.model.fwStudent.get({ mssv }, 'ho, ten, mssv, ngaySinh, thuongTruMaXa, thuongTruMaHuyen, thuongTruMaTinh, thuongTruSoNha, noiSinhMaTinh, cmnd, canEdit');
            const lichSuDangKy = await app.model.svBaoHiemYTe.get({ id: req.query.id });
            const currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC');
            if (lichSuDangKy) {
                if (lichSuDangKy.dienDong != 0) {
                    let { datachuho: dataChuHo, datathanhvien: dataThanhVien } = await app.model.svBaoHiemYTe.getData(mssv);
                    lichSuDangKy.dataChuHo = dataChuHo[0];
                    lichSuDangKy.dataThanhVien = dataThanhVien;
                }
                lichSuDangKy.isThanhToan = !!lichSuDangKy.idGiaoDich ?? await daThanhToanBhyt(mssv);
            }
            dataSinhVien.lichSuDangKy = lichSuDangKy || null;
            dataSinhVien.currentDotDangKy = currentDotDangKy || null;
            res.send({ dataSinhVien });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sv/bhyt/tan-sinh-vien', app.permission.orCheck('student:pending', 'student:login'), async (req, res) => {
        try {
            let user = req.session.user,
                thoiGian = Date.now();
            const data = req.body.data;
            let mssv = data?.mssv || user.data?.mssv || '';
            let emailTruong = user.data?.emailTruong || user?.email || '';
            const currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC'),
                currentTime = new Date(),
                start = new Date(currentDotDangKy.thoiGianBatDau),
                end = new Date(currentDotDangKy.thoiGianKetThuc);
            if (!currentDotDangKy || currentTime < start || currentTime >= end) return res.send({ error: 'Không thể đăng ký bhyt lúc này!' });

            let currentBhyt = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');
            if (currentBhyt && currentBhyt.namDangKy == currentDotDangKy?.namDangKy) return res.send({ error: 'Sinh viên đã đăng ký BHYT cho năm nay!' });

            let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong, namDangKy: currentDotDangKy.namDangKy, idDot: currentDotDangKy.ma }));
            if (!item) return res.send({ error: 'Lỗi hệ thống' });

            // await app.model.svBaoHiemYTe.themTaiChinhBhyt(mssv, parseInt(currentDotDangKy.namDangKy) - 1, 1, item.dienDong);
            console.info(`+ Sinh vien ${user.mssv} tham gia BHYT: ${app.utils.stringify(data)} (${item.id})`);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/sv/bhyt/sinh-vien', app.permission.orCheck('student:pending', 'student:login'), async (req, res) => {
        try {
            let user = req.session.user,
                thoiGian = Date.now();
            const data = req.body.data;
            let mssv = data?.mssv || user.data?.mssv || '';
            let emailTruong = user.data?.emailTruong || user?.email || '';
            const currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC'),
                currentTime = new Date(),
                start = new Date(currentDotDangKy.thoiGianBatDau),
                end = new Date(currentDotDangKy.thoiGianKetThuc);
            if (currentTime >= start && currentTime <= end && currentDotDangKy && (currentDotDangKy.heDaoTao.split(',').includes(user.data.loaiHinhDaoTao) && currentDotDangKy.khoaSinhVien.split(',').includes(user.data.khoaSV.toString()))) {
                let currentBhyt = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');
                if (!currentBhyt || currentBhyt.namDangKy != currentDotDangKy.namDangKy) {
                    let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong, namDangKy: currentDotDangKy.namDangKy, idDot: currentDotDangKy.ma }));
                    if (!item) res.send({ error: 'Lỗi hệ thống' });
                    else {
                        if (data.coBhxh == 0) {
                            await Promise.all([
                                app.model.svBhytPhuLucThanhVien.delete({ mssv }),
                                app.model.svBhytPhuLucChuHo.delete({ mssv }),
                            ]);
                            await Promise.all([
                                app.model.svBhytPhuLucChuHo.create(app.clone(data.dataChuHo, { idDangKy: item.id, mssv })),
                                data.dataThanhVien.map(thanhVien => app.model.svBhytPhuLucThanhVien.create(app.clone(thanhVien, { idDangKy: item.id, mssv })))
                            ]);
                        }
                        // await app.model.svBaoHiemYTe.themTaiChinhBhyt(mssv, parseInt(currentDotDangKy.namDangKy) - 1, 1, item.dienDong);
                        res.send({ item });
                    }
                } else res.send({ error: 'Sinh viên đã đăng ký BHYT cho năm nay!' });
            } else {
                res.send({ error: 'Không thể đăng ký bhyt lúc này!' });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/sv/bhyt', app.permission.orCheck('student:pending', 'student:login'), async (req, res) => {
        try {
            let user = req.session.user, { changes, id } = req.body;
            const item = await app.model.svBaoHiemYTe.get({ id });
            switch (parseInt(item.dienDong)) {
                case 0: {
                    let maBhxhHienTai = changes.maBhxhHienTai.toString();
                    // let thoiGianHoanThanh = changes.isComplete ? new Date().getTime() : '';
                    if (maBhxhHienTai.length > 10) return res.send({ error: 'Mã BHYT quá 10 chữ số!' });
                    else {
                        await app.model.svBaoHiemYTe.update({ id: item.id }, { cccd: changes.cccd, matTruocCmnd: '', matSauCmnd: '', maBhxhHienTai, userModified: user.email, giaHan: 1 });
                    }
                    break;
                }
                case 9:
                case 12:
                case 15: {
                    let coBhxh = changes.coBhxh;
                    if (coBhxh == 1) {
                        let { maBhxhHienTai, benhVienDangKy } = changes;
                        if (maBhxhHienTai.length > 10) return res.send({ error: 'Mã BHYT quá 10 chữ số!' });
                        else {
                            await Promise.all([
                                app.model.svBaoHiemYTe.update({ id: item.id }, { cccd: changes.cccd, matTruocCmnd: '', matSauCmnd: '', maBhxhHienTai, benhVienDangKy, giaHan: 1 }),
                                // app.model.svBhytPhuLucChuHo.delete({ mssv: user.mssv }),
                                // app.model.svBhytPhuLucThanhVien.delete({ mssv: user.mssv }),
                            ]);
                        }
                        res.end();
                    } else if (coBhxh == 0) {
                        let { benhVienDangKy, matTruocCmnd, matSauCmnd, dataChuHo, dataThanhVien } = changes;
                        const sinhVien = await app.model.svBaoHiemYTe.get({ id: item.id });
                        if (!sinhVien) throw 'Không tìm thấy đăng ký BHYT!';
                        await Promise.all([
                            app.model.svBaoHiemYTe.update({ id: item.id }, {
                                cccd: changes.cccd, maBhxhHienTai: '', matTruocThe: '', matTruocCmnd, matSauCmnd, benhVienDangKy, userModified: user.email, giaHan: 0
                            }),
                            app.model.svBhytPhuLucChuHo.delete({ mssv: sinhVien.mssv }),
                            app.model.svBhytPhuLucThanhVien.delete({ mssv: sinhVien.mssv }),
                            app.model.svBhytPhuLucChuHo.create({ ...dataChuHo, idDangKy: item.id, mssv: sinhVien.mssv }),
                            ...(dataThanhVien || []).map(thanhVien => {
                                delete thanhVien.id;
                                return app.model.svBhytPhuLucThanhVien.create({ ...thanhVien, idDangKy: item.id, mssv: sinhVien.mssv });
                            })
                        ]);
                        break;
                    }
                }
            }
            const studentUpdate = {
                cmnd: changes.cccd,
                dienThoaiCaNhan: changes.dienThoaiCaNhan,
            };
            await app.model.fwStudent.update({ mssv: user.mssv }, studentUpdate);
            console.info(`+ Sinh vien ${user.mssv} tham gia BHYT: !${id}`);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/bhyt/front', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user.mssv,
                filePath = req.query.filePath,
                maDot = req.query.maDot,
                path = app.path.join(app.assetPath, '/bhyt/front', maDot, user, filePath);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/bhyt/cmnd/front', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user.mssv,
                fileName = req.query.fileName,
                maDot = req.query.maDot,
                path = app.path.join(app.assetPath, '/bhyt/frontCmnd', maDot, user, fileName);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/bhyt/cmnd/back', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user.mssv,
                fileName = req.query.fileName,
                maDot = req.query.maDot,
                path = app.path.join(app.assetPath, '/bhyt/backCmnd', maDot, user, fileName);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sv/bhyt/huy-dang-ky/:maDangKy', app.permission.orCheck('student:pending', 'student:login'), async (req, res) => {
        try {
            const maDangKy = req.params.maDangKy,
                user = req.session.user,
                currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC'),
                currentTime = new Date(),
                start = new Date(currentDotDangKy.thoiGianBatDau),
                end = new Date(currentDotDangKy.thoiGianKetThuc);
            const isThanhToan = await daThanhToanBhyt(req.session.mssv, currentDotDangKy.namDangKy, 1);
            if (currentTime >= start && currentTime <= end && !isThanhToan && currentDotDangKy && (currentDotDangKy.heDaoTao.split(',').includes(user.data.loaiHinhDaoTao) && currentDotDangKy.khoaSinhVien.split(',').includes(user.data.khoaSV.toString()))) {
                await Promise.all([
                    app.model.svBaoHiemYTe.delete({ id: maDangKy }),
                    // app.model.svBhytPhuLucChuHo.delete({ mssv: req.session.user.mssv }),
                    // app.model.svBhytPhuLucThanhVien.delete({ mssv: req.session.user.mssv })
                ]);
                //Hủy đăng ký BHYT
                await app.model.svBaoHiemYTe.themTaiChinhBhyt(req.session.user.mssv, 2023, 2, 0);
                console.info(`+ Sinh vien ${user.mssv} huy BHYT: !${maDangKy}`);
                res.end();
            } else {
                res.send({ error: 'Không thể hủy đăng ký lúc này !' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.readyHooks.add('consumeThanhToanBhyt', {
        ready: () => app.model && app.model.fwStudent,
        run: () => {
            if (app.primaryWorker && app.appName == 'hcmussh') {
                app.messageQueue.consume('thanhToanBhyt:send', async (message) => {
                    try {
                        const { mssv } = app.utils.parse(message);
                        const { emailTruong } = await app.model.fwStudent.get({ mssv });
                        console.info(`SOCKET TO ${emailTruong}`);
                        app.io.to(emailTruong).emit('updateThanhToanBhyt');
                    }
                    catch (error) {
                        console.error('thanhToanBhyt:send:', error);
                    }
                });
            }
        }
    });
};