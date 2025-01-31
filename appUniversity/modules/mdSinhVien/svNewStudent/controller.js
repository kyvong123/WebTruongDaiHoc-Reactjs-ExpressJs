module.exports = app => {
    app.permission.add({
        name: 'student:pending'
    });

    app.get('/user/student-enroll', app.permission.check('student:pending'), app.templates.admin);

    const socketIoEmit = (email, key, error) => !error && app.io.to(email).emit(key);
    // const socketIoEmit = (email, key, error) => {
    //     console.log({ email, key });
    //     if (!error) {
    //         if (email) app.io.to(email).emit(key);
    //         else {
    //             app.io.emit(key);
    //         }
    //     }
    // };

    const daThanhToanHocPhi = async (mssv) => {
        try {
            let hocPhi = await app.model.tcHocPhi.get({
                statement: 'congNo <= 0 AND mssv = :mssv',
                parameter: { mssv }
            });
            let hoanDong = await app.model.tcHoanDongHocPhi.get({
                statement: 'mssv = :mssv AND thoi_han_thanh_toan >= :dateNow AND da_thanh_toan >= so_tien_thu_truoc AND xac_nhan = 1',
                parameter: { mssv, dateNow: Date.now() }
            });

            if (hocPhi?.hocPhi) return 1;
            if (hoanDong) return 2;
            return 0;
        }
        catch (error) {
            console.error(error);
        }
    };

    app.get('/api/sv/student-enroll/check/current-step', app.permission.check('student:pending'), async (req, res) => {
        try {
            const mssv = req.session.user.studentId;
            let isCompleteInfo = false, isCompleteBhyt = false, isCompleteBhytInfo = false, isCompleteHocPhi = false;
            const result = {};

            //todo: check hoàn thành syll
            const { rows: [dataSyll] } = await app.model.svNhapHoc.getData(mssv);
            isCompleteInfo = dataSyll.isUpToDate == 1;

            //check đăng ký bhyt
            const currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC');
            // const lichSuDangKy = await app.model.svBaoHiemYTe.get({ mssv, namDangKy: currentDotDangKy ? currentDotDangKy.namDangKy : new Date().getFullYear() }, '*');
            const { rows: [lichSuDangKy] } = await app.model.svBaoHiemYTe.getData(mssv, null, currentDotDangKy ? currentDotDangKy.namDangKy : new Date().getFullYear() + 1);
            if (lichSuDangKy) {
                lichSuDangKy.isCompleteBhyt = lichSuDangKy.daKeKhaiThongTin;
                // isCompleteBhyt = 1;
                // const { dienDong, maBhxhHienTai, benhVienDangKy, matTruocThe, giaHan, id } = lichSuDangKy;
                // switch (parseInt(dienDong)) {
                //     case 0: {
                //         if (maBhxhHienTai && matTruocThe && app.fs.existsSync(app.path.join(app.assetPath, 'bhyt', 'front', matTruocThe)))
                //             isCompleteBhytInfo = 1;
                //         break;
                //     }
                //     case 12:
                //     case 15: {
                //         if (giaHan == 1) {
                //             if (maBhxhHienTai && benhVienDangKy)
                //                 isCompleteBhytInfo = 1;
                //         } else {
                //             const dataChuHo = await app.model.svBhytPhuLucChuHo.get({ idDangKy: id }, '*');
                //             if (dataChuHo && benhVienDangKy)
                //                 isCompleteBhytInfo = 1;
                //         }
                //     }
                // }
            }

            //todo: check hoàn thành học phí
            isCompleteHocPhi = await daThanhToanHocPhi(mssv);

            result.isCompleteInfo = isCompleteInfo;
            result.isCompleteBhyt = isCompleteBhyt;
            result.isCompleteBhytInfo = isCompleteBhytInfo;
            result.isCompleteHocPhi = isCompleteHocPhi;
            res.send({ result });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/student-enroll/last-step', app.permission.check('student:pending'), async (req, res) => {
        try {
            const mssv = req.session.user.studentId;
            const [phongThuTuc, { ngayNhapHoc, coSoNhapHoc }] = await Promise.all([
                app.model.fwStudent.get({ mssv }).then(value => value.phongThuTuc),
                app.model.svSetting.getValue('ngayNhapHoc', 'coSoNhapHoc'),
            ]);
            res.send({ phongThuTuc, thoiGian: ngayNhapHoc, coSoNhapHoc });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/student-enroll/thanh-toan/get-detail', app.permission.check('student:pending'), async (req, res) => {
        try {
            const mssv = req.session.user.studentId;
            const { rows: listDetailHocPhi } = await app.model.tcHocPhi.getDetail(mssv);
            const isCompleteHocPhi = await daThanhToanHocPhi(mssv);

            res.send({ data: listDetailHocPhi, isCompleteHocPhi });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // API ===================================================================

    app.uploadHooks.add('uploadAnhTheTanSv', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadAnhThe(req, fields, files, params, done), done, 'student:pending'));

    const uploadAnhThe = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('NewCardImage') && files.NewCardImage && files.NewCardImage.length) {
            try {
                let srcPath = files.NewCardImage[0].path;
                if (files.NewCardImage[0].size > 1000 * 1000) {
                    app.fs.unlinkSync(srcPath);
                    console.log(`Sinh viên ${req.session.user.email}: `, 'Vui lòng upload ảnh kích thước nhỏ hơn 1MB!');
                    done && done({ error: 'Vui lòng upload ảnh kích thước nhỏ hơn 1MB!' });
                } else {
                    let srcPath = files.NewCardImage[0].path;
                    let image = await app.jimp.read(srcPath);
                    let extPath = app.path.extname(srcPath);
                    await image.resize(113.386 * 3, 151.181 * 3).quality(100); // ảnh 3 x 4

                    app.fs.deleteFile(srcPath);
                    let user = req.session.user;
                    const folderPath = app.path.join(app.assetPath, 'image-card', user.data.namTuyenSinh.toString());
                    app.fs.createFolder(folderPath);
                    let filePath = app.path.join(folderPath, `${user.studentId}${extPath}`);

                    // app.fs.deleteFile(filePath);
                    await image.writeAsync(filePath);
                    // await app.fs.rename(srcPath, filePath);
                    await app.model.fwStudent.update({ mssv: user.studentId }, { anhThe: `${user.studentId}${extPath}` });
                    done && done({ image: '/api/sv/image-card', anhThe: `${user.studentId}${extPath}` });
                }
            }
            catch (error) {
                console.error(req.method, req.url, error);
                done && done({ error });
            }
        }
    };

    app.get('/api/sv/student-enroll/download-syll', app.permission.check('student:pending'), async (req, res) => {
        try {
            let user = req.session.user,
                { studentId } = user;
            const { filePdfPath } = await app.model.fwStudent.initSyll(req);
            res.download(filePdfPath, `SYLL_${studentId}.pdf`);
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.readyHooks.add('consumeThanhToanNhapHoc', {
        ready: () => app.model && app.model.fwStudent,
        run: () => {
            if (app.primaryWorker && app.appName == 'hcmussh') {
                app.messageQueue.consume('thanhToanNhapHoc:send', async (message) => {
                    try {
                        const { mssv } = app.utils.parse(message);
                        const { emailTruong } = await app.model.fwStudent.get({ mssv });
                        console.info(`SOCKET TO ${emailTruong}`);
                        socketIoEmit(emailTruong, 'updated-tinhTrang');
                        socketIoEmit('tcManageHoanDong', 'updatedHoanDong');
                    }
                    catch (error) {
                        console.error('thanhToanNhapHoc:send:', error);
                    }
                });
            }
        }
    });
};