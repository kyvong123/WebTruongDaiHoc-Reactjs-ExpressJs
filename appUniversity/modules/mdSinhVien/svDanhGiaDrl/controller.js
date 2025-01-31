module.exports = app => {

    // const PERMISSION = app.isDebug ? 'student:login' : 'student:test';
    const PERMISSION = 'student:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.user,
            menus: {
                4507: { title: 'Điểm rèn luyện', link: '/user/danh-gia-drl', pin: true, icon: 'fa-calculator', backgroundColor: '#ac2d34' },
            }
        },
    }, {
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.congTacSinhVien,
            menus: {
                7815: { title: 'Điểm rèn luyện', link: '/user/danh-gia-drl', pin: true, icon: 'fa-calculator', backgroundColor: '#ac2d34' },
            }
        },
    },);

    app.get('/user/danh-gia-drl', app.permission.check(PERMISSION), app.templates.admin);

    app.get('/api/sv/danh-gia-drl/tieu-chi', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const { mssv, data } = req.session.user;
            let { namHoc, hocKy } = req.query, now = new Date();
            let { svDot, svInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);

            if (svDot) {
                svDot = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(svDot, data.khoa).then(value => value.svDot);
                svDot = await app.model.svDotDanhGiaDrl.patchGiaHanInfo(svDot, mssv).then(value => value.svDot);
            }
            let { dsTieuChi, lsDiemDanhGia, listSuKien, lsMinhChung, bhytData } = await app.model.svDrlDanhGia.initDiemTable(svDot, mssv, namHoc, hocKy);

            const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};

            tongKetInfo.kyLuat = await app.model.svQtKyLuat.getDrlMapKyLuat(mssv, namHoc, hocKy);
            if (tongKetInfo.tkSubmit) { //Đã tổng kết
                tongKetInfo.tkSubmitChu = app.utils.numberToVnText(tongKetInfo.tkSubmit);
            }

            let canEdit = false, canGiaHan = false, isInGiaHan = false;
            // const sinhVienGiaHan = await app.model.svDrlDanhGia.get({ mssv, namHoc, hocKy }, '*', 'MA DESC');
            if (svInfo && svInfo.kichHoat == 1 && svDot && svDot.active == 1) {
                const { timeEndSv } = svDot;
                if (!tongKetInfo.svSubmit) {
                    if (svDot && svDot.timeStartSv && svDot.timeEndSv && (new Date(svDot.timeStartSv) <= now && new Date(svDot.timeEndSv) >= now)) {
                        canEdit = true;
                    }
                    if (svDot.timeGiaHanEnd && (now < new Date(svDot.timeGiaHanEnd))) {
                        canEdit = true;
                        isInGiaHan = true;
                    }
                }
                if (svDot && (new Date(timeEndSv || 0) < now)) { //Sinh viên được kiến nghị gia hạn khi đã quá hạn đánh giá sv
                    canGiaHan = true;
                }
            }
            // Lấy điểm TB của sinh viên 
            let diemTrungBinh;
            if (tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0))
                diemTrungBinh = tongKetInfo.diemTb;
            else
                ({ diemTrungBinh } = (await app.model.dtDiemTrungBinh.get({ mssv, namHoc, hocKy })) || {});

            const items = {
                listSuKien, lsMinhChung, bhytData,
                lsBoTieuChi: dsTieuChi,
                lsDiemDanhGia,
                tongKetInfo,
                canEdit,
                canGiaHan,
                isInGiaHan,
                idBo: svDot ? svDot.maBoTc : null,
                diemTrungBinh,
                timeStart: svDot?.timeStartSv,
                timeEnd: svDot ? Math.max(0, svDot.timeEndSv, svDot.timeGiaHanEnd) : null,
                canPhucKhao: ((svInfo && svInfo.kichHoat == 1) && (svDot && svDot.timePkStart && svDot.timeEndFaculty && (new Date(svDot.timeEndFaculty) >= now && new Date(svDot.timePkStart) < now))),
            };
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/sv/danh-gia-drl', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const { mssv } = req.session.user,
                { khoa } = req.session.user.data;
            const now = new Date();
            const { bangDanhGia } = req.body;
            const { namHoc, hocKy } = bangDanhGia;
            let { svDot: dotDanhGiaInfo, svInfo: studentInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);
            if (dotDanhGiaInfo) {
                // dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(dotDanhGiaInfo, khoa).then(value => value.svDot);
                dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.patchGiaHanInfo(dotDanhGiaInfo, mssv).then(value => value.svDot);
            }

            const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};
            let canEdit = false;
            if (studentInfo && studentInfo.kichHoat == 1) {
                if (dotDanhGiaInfo && dotDanhGiaInfo.active == 1 && dotDanhGiaInfo.timeStartSv && dotDanhGiaInfo.timeEndSv && (new Date(dotDanhGiaInfo.timeStartSv) <= now && new Date(dotDanhGiaInfo.timeEndSv) >= now)) {
                    canEdit = true;
                }
                if (!tongKetInfo.svSubmit && dotDanhGiaInfo && dotDanhGiaInfo.active == 1 && dotDanhGiaInfo.timeGiaHanEnd && (now < new Date(dotDanhGiaInfo.timeGiaHanEnd))) {
                    canEdit = true;
                }
            }
            if (canEdit == true) {
                let currentData = (await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, 'ma, maTieuChi')).reduce((cur, item) => {
                    cur[item.maTieuChi] = item;
                    return cur;
                }, {});
                // await app.model.svDrlDanhGia.delete({ mssv, namHoc, hocKy });
                await Promise.all([
                    ...bangDanhGia.arrDiemDanhGia.map(async (item) => {
                        // const isExist = await app.model.svDrlDanhGia.get({ mssv, namHoc, hocKy, maTieuChi: item.maTieuChi });
                        const isExist = currentData[item.maTieuChi] != null;
                        if (isExist) {
                            return app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi: item.maTieuChi }, { diemSv: item.diemSv, svModifier: req.session.user.email, svModifiedTime: now.getTime() });
                        } else {
                            return app.model.svDrlDanhGia.create({ ...item, mssv, namHoc, hocKy, maDot: dotDanhGiaInfo.ma, khoa, svModifier: req.session.user.email, svModifiedTime: now.getTime() });
                        }
                    }),
                ]);
                try { await app.model.svDiemRenLuyen.update({ mssv, namHoc, hocKy }, { svSubmit: bangDanhGia.svSubmit ? Math.min(bangDanhGia.svSubmit, 90) : null, timeModifiedSv: now.getTime() }); }
                catch { await app.model.svDiemRenLuyen.create({ mssv, namHoc, hocKy, svSubmit: bangDanhGia.svSubmit ? Math.min(bangDanhGia.svSubmit, 90) : null, timeModifiedSv: now.getTime() }); }
                console.log(` + Sinh viên ${mssv} chấm điểm rèn luyện cá nhân vào lúc ${app.date.dateTimeFormat(new Date(), 'HH:MM:ss dd/mm/yyyy')}`);
                res.end();
            } else {
                res.send({ error: { message: 'Bạn không thể đánh giá điểm rèn luyện lúc này' } });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.fs.createFolder(app.path.join(app.assetPath, '/svMinhChungDrl'));

    app.uploadHooks.add('svMinhChungDrl', (req, fields, files, params, done) =>
        app.permission.has(req, () => svMinhChungDrl(req, fields, files, params, done), done, 'student:login'));

    const svMinhChungDrl = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('svMinhChungDrl') && files.svMinhChungDrl && files.svMinhChungDrl.length > 0) {
            if (files.svMinhChungDrl[0].size > 5 * 1000 * 1000) {
                app.fs.deleteFile(files.svMinhChungDrl[0].path);
                done && done({ error: 'Vui lòng upload ảnh kích thước nhỏ hơn 5MB!' });
            } else {
                const now = Date.now(),
                    srcPath = files.svMinhChungDrl[0].path,
                    userData = fields.userData[0],
                    dataMinhChung = userData.substring(userData.indexOf(':') + 1).split('_'),
                    //dataMinhChung: ['mssv', 'nam hoc', 'hoc ky', 'ma tieu chi']
                    originalFilename = files.svMinhChungDrl[0].originalFilename,
                    newFileName = dataMinhChung.slice(1, -1).join('_') + `_${now}` + '.' + originalFilename.split('.').slice(-1),
                    filePath = '/' + dataMinhChung[0] + '/' + newFileName,
                    destPath = app.assetPath + '/svMinhChungDrl' + filePath,
                    validUploadFileType = ['.png', '.jpg', '.jpeg', '.heic'],
                    baseNamePath = app.path.extname(srcPath);
                if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                    done({ error: 'Định dạng tập tin không hợp lệ!' });
                    app.fs.deleteFile(srcPath);
                } else {
                    app.fs.createFolder(
                        app.path.join(app.assetPath, '/svMinhChungDrl/' + dataMinhChung[0])
                    );
                    app.fs.deleteFile(destPath);
                    try {
                        await app.fs.renameSync(srcPath, destPath);
                        let [mssv, namHoc, hocKy, maTieuChi, isSuKien] = dataMinhChung;
                        const { tenHoatDong, thoiGian, ghiChu, diemSv, oldPath, id } = app.utils.parse(fields.data[0]) || {};

                        if (oldPath) {
                            let oldFilePath = app.path.join(app.assetPath, '/svMinhChungDrl', oldPath);
                            if (app.fs.existsSync(oldFilePath))
                                app.fs.deleteFile(oldFilePath);
                        }
                        hocKy = hocKy.replaceAll('HK', '');
                        if (isSuKien.toLowerCase() == 'true') {
                            const item = await app.model.svDrlMinhChung.get({ mssv, namHoc, hocKy, maTieuChi, id });
                            // let minhChung = [{ filePath, tenHoatDong, thoiGian, ghiChu, timeAdded: now, }];
                            if (item) {
                                // minhChung = [...(app.utils.parse(item.minhChung) || []).filter(item => item.filePath != oldPath), ...minhChung];
                                await app.model.svDrlMinhChung.update({ mssv, namHoc, hocKy, maTieuChi, id }, { filePath, tenHoatDong, thoiGian, diemSv: diemSv, diemLt: diemSv, diemF: diemSv, ghiChu });
                            } else {
                                await app.model.svDrlMinhChung.create({ mssv, namHoc, hocKy, maTieuChi, filePath, tenHoatDong, thoiGian, diemSv: diemSv, diemLt: diemSv, diemF: diemSv, ghiChu, timeAdded: now });
                            }
                        } else {
                            const item = await app.model.svDrlDanhGia.get({ mssv, namHoc, hocKy, maTieuChi });
                            let minhChung = [{ filePath, tenHoatDong, thoiGian, ghiChu, timeAdded: now, }];
                            if (item) {
                                minhChung = [...(app.utils.parse(item.minhChung) || []).filter(item => item.filePath != oldPath), ...minhChung];
                                await app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi }, { minhChung: app.utils.stringify(minhChung), userModifier: req.session.user.email, modifiedTime: now });
                            } else {
                                await app.model.svDrlDanhGia.create({ mssv, namHoc, hocKy, maTieuChi, minhChung: app.utils.stringify(minhChung), userModifier: req.session.user.email, modifiedTime: now });
                            }
                        }
                        done({ data: filePath });
                    } catch (error) {
                        app.consoleError(req, error);
                        done({ error: 'Upload hình ảnh bị lỗi' });
                    }
                }
            }
        }
    };

    app.get('/api/sv/danh-gia-drl/minh-chung', app.permission.orCheck('student:login', 'staff:drl-manage', 'ctsvDanhGiaDrl:manage'), async (req, res) => {
        try {
            let { filePath, mssv } = req.query;
            let path = app.path.join(app.assetPath, '/svMinhChungDrl', mssv, filePath);
            if (app.fs.existsSync(path)) res.sendFile(path);
            else res.send({ error: 'No value returned' });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/sv/danh-gia-drl/minh-chung', app.permission.check('student:login'), async (req, res) => {
        try {
            let { condition, filePath } = req.body,
                path = app.path.join(app.assetPath, '/svMinhChungDrl', filePath);
            if (app.fs.existsSync(path)) {
                app.fs.deleteFile(path);
            }
            let item = await app.model.svDrlDanhGia.get(condition);
            if (item) {
                let minhChung = app.utils.parse(item.minhChung)?.filter(item => item.filePath != filePath);
                await app.model.svDrlDanhGia.update(condition, { minhChung: app.utils.stringify(minhChung), svModifier: req.session.user.email, svModifiedTime: Date.now() });
            } else {
                app.consoleError(req, `Không tìm thấy đánh giá ${app.utils.stringify(condition)}`);
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            console.error(req.method, req.url, error);
        }
    });

    app.get('/api/sv/danh-gia-drl/phuc-khao', app.permission.check('student:login'), async (req, res) => {
        try {
            let mssv = req.session.user.mssv;
            const { namHoc, hocKy } = req.query;
            let items = await app.model.svDrlPhucKhao.getAll({ mssv, namHoc, hocKy }, '*');
            const svBoTieuChi = await app.model.svBoTieuChi.getAll({
                statement: 'ma in (:listMa)',
                parameter: { listMa: items.length ? items.map(item => item.maTieuChi) : ['-1'] }
            }, '*');
            if (items.length) {
                items = items.map(item => {
                    const tieuChiMap = svBoTieuChi.find(tieuChi => tieuChi.ma == item.maTieuChi);
                    return {
                        ...item,
                        diemMax: tieuChiMap.diemMax,
                        loaiTc: tieuChiMap.loaiTc,
                        tenTieuChi: tieuChiMap.ten,
                    };
                });
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sv/danh-gia-drl/phuc-khao', app.permission.check('student:login'), async (req, res) => {
        try {
            let { mssv, data } = req.session.user;
            const { changes } = req.body,
                now = new Date();
            const { namHoc, hocKy } = changes;
            // const studentInfo = await app.model.svDssvDotDanhGiaDrl.get({ mssv, kichHoat: 1 }, '*', 'id DESC'),
            //     dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.get({ id: studentInfo ? studentInfo.idDot : null, namHoc, hocKy }, '*');
            let { svDot: dotDanhGiaInfo, svInfo: studentInfo } = await app.model.svDotDanhGiaDrl.getInitData(mssv, namHoc, hocKy);
            if (dotDanhGiaInfo) {
                dotDanhGiaInfo = await app.model.svDotDanhGiaDrl.patchPhucKhaoInfo(dotDanhGiaInfo, data.khoa).then(value => console.log(value) || value.svDot);
                const giaHanInfo = await app.model.svDrlGiaHanKhoa.get({ idDot: dotDanhGiaInfo.id, maKhoa: data.khoa }, 'timeEnd', 'ID DESC');
                dotDanhGiaInfo.timeGiaHanEnd = giaHanInfo ? giaHanInfo.timeEnd : null;
            }
            if (studentInfo && dotDanhGiaInfo && dotDanhGiaInfo.timePkStart && dotDanhGiaInfo.timeEndFaculty && (new Date(dotDanhGiaInfo.timeEndFaculty) >= now && now > new Date(dotDanhGiaInfo.timePkStart))) {
                await app.model.svDrlPhucKhao.create({ ...changes, mssv, timeDangKy: now.getTime() });
                await app.model.svDrlDanhGia.update({ mssv, namHoc, hocKy, maTieuChi: changes.maTieuChi }, { minhChung: changes.minhChung, svModifier: req.session.user.email, svModifiedTime: now.getTime() });
                console.log(` + Sinh viên ${mssv} đăng ký phúc khảo vào lúc ${app.date.dateTimeFormat(new Date(), 'HH:MM:ss dd/mm/yyyy')}: ${app.utils.stringify(changes)}`);
                res.end();
            } else {
                console.error(` + Sinh viên ${mssv} không thể đăng ký phúc khảo ${app.date.dateTimeFormat(new Date(), 'HH:MM:ss dd/mm/yyyy')}: ${app.utils.stringify(changes)}`);
                res.send({ error: { message: 'Bạn không thể đăng ký phúc khảo lúc này' } });
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sv/danh-gia-drl/phuc-khao', app.permission.check('student:login'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svDrlPhucKhao.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/danh-gia-drl/kien-nghi', app.permission.check('student:login'), async (req, res) => {
        try {
            const user = req.session.user,
                { namHoc, hocKy } = req.query;
            const dotInfo = await app.model.svDotDanhGiaDrl.get({ namHoc, hocKy });
            const { rows: items } = dotInfo ? (await app.model.svDrlKienNghiGiaHan.getData(dotInfo.id, app.utils.stringify({ mssv: user.mssv }))) : { rows: [] };
            res.send({ items: items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/sv/danh-gia-drl/kien-nghi', app.permission.check('student:login'), async (req, res) => {
        try {
            const dotInfo = await app.model.svDotDanhGiaDrl.get({ active: 1 }),
                now = Date.now();
            const { timeEndSv } = dotInfo;
            if (timeEndSv < now) { //Cho phép khi đã quá hạn đánh giá
                const data = req.body.data,
                    { mssv } = req.session.user,
                    { rows: [kienNghi] } = await app.model.svDrlKienNghiGiaHan.getData(dotInfo.id, app.utils.stringify({ mssv }));
                if (!kienNghi || kienNghi.status == 'R' || (kienNghi.timeEnd && Date.now() > kienNghi.timeEnd)) {
                    data.mssv = mssv;
                    data.idDot = dotInfo.id;
                    data.timeSubmit = Date.now();
                    const item = await app.model.svDrlKienNghiGiaHan.create(data);
                    app.model.svDrlKienNghiGiaHan.notifyCanBoQuanLy(req.session.user);
                    res.send({ item });
                } else {
                    res.send({ failed: 'Bạn không thể gửi thêm kiến nghị!' });
                }
            } else {
                res.send({ failed: 'Chưa đến kỳ gia hạn đánh giá!' });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/sv/danh-gia-drl/kien-nghi', app.permission.check('student:login'), async (req, res) => {
        try {
            const { id, data } = req.body;
            const item = await app.model.svDrlKienNghiGiaHan.update({ id }, { ...data, timeSubmit: Date.now() });
            res.send(item);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/sv/danh-gia-drl/kien-nghi', app.permission.check('student:login'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svDrlKienNghiGiaHan.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/sv/danh-gia-drl/hoat-dong', app.permission.check('student:login'), async (req, res) => {
        try {
            const { condition, data } = req.body;
            let item = await app.model.svDrlMinhChung.get(condition);
            if (item) {
                // let minhChung = app.utils.parse(item.minhChung)?.filter(item => item.filePath != filePath);
                await app.model.svDrlMinhChung.update(condition, data);
            } else {
                app.consoleError(req, `Không tìm thấy đánh giá ${app.utils.stringify(condition)}`);
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            console.error(req.method, req.url, error);
        }
    });

    app.delete('/api/sv/danh-gia-drl/hoat-dong', app.permission.check('student:login'), async (req, res) => {
        try {
            let { condition, filePath } = req.body,
                path = app.path.join(app.assetPath, '/svMinhChungDrl', filePath);
            if (app.fs.existsSync(path)) {
                app.fs.deleteFile(path);
            }
            let item = await app.model.svDrlMinhChung.get(condition);
            if (item) {
                // let minhChung = app.utils.parse(item.minhChung)?.filter(item => item.filePath != filePath);
                await app.model.svDrlMinhChung.delete(condition);
            } else {
                app.consoleError(req, `Không tìm thấy đánh giá ${app.utils.stringify(condition)}`);
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            console.error(req.method, req.url, error);
        }
    });
};