module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1016: { title: 'Thông tin sinh viên', link: '/user/profile-student', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', pin: true }
        }
    };

    app.permission.add(
        { name: 'student:login', menu },
    );

    app.get('/user/profile-student', app.permission.check('student:login'), app.templates.admin);

    app.get('/api/sv/profile/edit/item', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let mssv = req.session.user?.studentId || '';
            let item = await app.model.fwStudent.get({ mssv });

            if (!item.image) {
                let user = await app.model.fwUser.get({ email: item.emailTruong });
                item.image = user?.image;
            }
            const { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');

            let dataHocPhi = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy }, 'congNo');
            if (dataHocPhi?.congNo) item.chuaDongHocPhi = true;
            else item.chuaDongHocPhi = false;
            const dataLop = await app.model.dtLop.get({ maLop: item.lop }, '*');
            if (dataLop) {
                item = app.clone({}, item, dataLop);
            }
            const dataTamTru = (await app.model.svThongTinTamTru.get({ id: item.maTamTru })) || {},
                dataNoiTru = (await app.model.svThongTinNoiTru.get({ id: item.maNoiTru })) || {};
            item = app.clone({}, item, { dataTamTru }, { dataNoiTru });

            const dataTotNghiep = await app.model.svThongTinTotNghiep.getAll({ mssv });
            item.dataTotNghiep = dataTotNghiep ? dataTotNghiep.groupBy('trinhDo') : {};
            const dotChinhSuaInfo = await app.model.svDotEditStudentInfo.getAll({
                statement: 'timeStart <= :now AND :now <= timeEnd AND (khoaSinhVien like :khoaSinhVien AND heDaoTao like :heDaoTao) AND isDeleted = 0',
                parameter: {
                    khoaSinhVien: `%${item.khoaSinhVien}%`,
                    heDaoTao: `%${item.loaiHinhDaoTao}%`,
                    now: Number(new Date().getTime())
                },
            }, '*', 'id DESC');
            if (dotChinhSuaInfo.length) {
                item.sectionEdit = dotChinhSuaInfo.reduce((init, item) => [...init, ...item.sectionEdit.split(', ')], []);
            } else {
                item.sectionEdit = null;
            }
            item.tenNganHangInfo = await app.model.dmNganHang.get({ ma: item.tenNganHang }).then(data => data?.ten || '');
            res.send({ item });
        } catch (error) {
            app.consoleError(error);
            res.send({ error });
        }
    });

    app.get('/api/sv/profile', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let mssv = req.session.user?.studentId || '';
            let item = await app.model.fwStudent.getData(mssv).then(value => value.rows[0]);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.fs.createFolder(app.path.join(app.assetPath, 'image-card'));

    app.uploadHooks.add('uploadAnhThe', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadAnhThe(req, fields, files, params, done), done, 'student:login'));

    const uploadAnhThe = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('CardImage') && files.CardImage && files.CardImage.length) {
            try {
                let srcPath = files.CardImage[0].path;
                if (files.CardImage[0].size > 1000 * 1000) {
                    app.fs.unlinkSync(srcPath);
                    done && done({ error: 'Vui lòng upload ảnh kích thước nhỏ hơn 1MB!' });
                } else {
                    let srcPath = files.CardImage[0].path;
                    let image = await app.jimp.read(srcPath);
                    let extPath = app.path.extname(srcPath);
                    await image.resize(113.386 * 3, 151.181 * 3).quality(100); // ảnh 3 x 4

                    app.fs.unlinkSync(srcPath);
                    let user = req.session.user;
                    const folderPath = app.path.join(app.assetPath, 'image-card', user.data.namTuyenSinh.toString());
                    app.fs.createFolder(folderPath);
                    let filePath = app.path.join(folderPath, `${user.studentId}${extPath}`);
                    app.fs.deleteFile(filePath);
                    await image.writeAsync(filePath);
                    // await app.fs.rename(srcPath, filePath);
                    await app.model.fwStudent.update({ mssv: user.studentId }, { anhThe: `${user.studentId}${extPath}` });
                    done && done({ image: '/api/sv/image-card' });
                }
            } catch (error) {
                done && done({ error });
            }
        }
    };

    app.put('/api/sv/profile', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            if (req.body.changes && req.session.user) {
                const changes = req.body.changes,
                    mssv = req.session.user.studentId,
                    noiTru = changes.noiTru ? Number(changes.noiTru) : null,
                    sinhVien = await app.model.fwStudent.get({ mssv: req.session.user.studentId });
                if (noiTru != null) {
                    Object.assign(changes, { maNoiTru: '', maTamTru: '' }); // Reset thong tin noi/tam tru
                    const [table, ma, cols] = noiTru == 1 ?
                        ['svThongTinNoiTru', 'maNoiTru', 'ktxTen,ktxToaNha,ktxSoPhong'] :
                        ['svThongTinTamTru', 'maTamTru', 'tamTruMaTinh,tamTruMaHuyen,tamTruMaXa,tamTruSoNha']
                        ;
                    const data = (await app.model[table].get({ id: sinhVien[ma] }, cols)) || Object.assign({}, ...cols.split(',').map(key => ({ [key]: '' }))),
                        isDiff = cols.split(',').some(key => data[key] != changes[key]);
                    ({ id: changes[ma] } = isDiff ? await app.model[table].create({ ...changes, dateModified: Date.now(), mssv }) : { id: sinhVien[ma] });
                }

                if (changes.isSubmit) {
                    const mssv = req.session.user.studentId;
                    const { dataTotNghiep } = changes;
                    await app.model.svThongTinTotNghiep.delete({ mssv });
                    await Promise.all([
                        ...(dataTotNghiep || []).map(item => app.model.svThongTinTotNghiep.create({ mssv, ...item }))
                    ]);
                }
                if (!sinhVien) {
                    changes.mssv = req.session.user.studentId;
                    const item = await app.model.fwStudent.create({ changes });
                    res.send({ item });
                } else {
                    const item = await app.model.fwStudent.update({ mssv: req.session.user.studentId }, changes);
                    res.send({ item });
                }
            } else {
                res.send({ error: 'Invalid parameter!' });
            }
        } catch (error) {
            app.consoleError(error);
            res.send({ error });
        }
    });


    app.put('/api/sv/ngan-hang-sinh-vien', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            if (req.body.changes && req.session.user) {
                const changes = req.body.changes,
                    mssv = req.session.user.studentId;
                const sinhVien = await app.model.fwStudent.get({ mssv });
                if (!changes.tenNganHang || !changes.soTkNh) {
                    throw ('Thông tin cập nhật tài khoản ngân hàng chưa đầy đủ!');
                }
                else {
                    await app.model.tcTaiKhoanNganHangUpdateLog.create({ mssv, tenNganHang: changes.tenNganHang, soTkNh: changes.soTkNh, handleTime: Date.now() });
                }

                if (!sinhVien) {
                    throw ('Không tồn tại thông tin sinh viên!');
                } else {
                    let item = await app.model.fwStudent.update({ mssv }, changes);
                    item.tenNganHangInfo = await app.model.dmNganHang.get({ ma: item.tenNganHang }).then(data => data.ten);
                    res.send({ item });
                }
            } else {
                throw ('Invalid parameter!');
            }
        } catch (error) {
            app.consoleError(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sv/profile/syll', app.permission.check('student:login'), async (req, res) => {
        try {
            await initSyll(req, res, (data, filePdfPath) => {
                res.sendFile(filePdfPath);
            });
        } catch (error) {
            app.consoleError(error);
        }
    });

    const bwipjs = require('bwip-js');
    const initSyll = async (req, res, next) => {
        try {
            const source = app.path.join(app.publicPath, 'sample', 'syll2022.docx');
            const user = req.session.user;
            const now = new Date().yyyymmdd();
            let data = await app.model.fwStudent.getData(user.studentId);
            data = data.rows[0];
            data.ngaySinh = app.date.viDateFormat(new Date(data.ngaySinh));
            data.noiSinh = data.noiSinh ? data.noiSinh : data.noiSinhQuocGia;
            data.cmndNgayCap = app.date.viDateFormat(new Date(data.cmndNgayCap));
            if (data.ngayVaoDang) {
                data.dav = 'X';
                data.ngayVaoDang = app.date.viDateFormat(new Date(data.ngayVaoDang));
            } else {
                data.ngayVaoDang = '';
                data.dav = '';
            }
            if (data.ngayVaoDoan) {
                data.dov = 'X';
                data.ngayVaoDoan = app.date.viDateFormat(new Date(data.ngayVaoDoan));
            } else {
                data.dov = '';
                data.ngayVaoDoan = '';
            }
            data.diemThi = Number(data.diemThi).toFixed(2);
            data.ngaySinhCha = data.ngaySinhCha ? new Date(data.ngaySinhCha).getFullYear() : '';
            data.tenCha = data.tenCha || '';
            data.ngheNghiepCha = data.ngheNghiepCha || '';
            data.sdtCha = data.sdtCha || '';
            data.ngaySinhMe = data.ngaySinhMe ? new Date(data.ngaySinhMe).getFullYear() : '';
            data.tenMe = data.tenMe || '';
            data.ngheNghiepMe = data.ngheNghiepMe || '';
            data.sdtMe = data.sdtMe || '';
            data.thuongTru = (data.soNhaThuongTru ? data.soNhaThuongTru + ', ' : '')
                + (data.xaThuongTru ? data.xaThuongTru + ', ' : '')
                + (data.huyenThuongTru ? data.huyenThuongTru + ', ' : '')
                + (data.tinhThuongTru ? data.tinhThuongTru : '');

            data.thuongTruCha = (data.soNhaThuongTruCha ? data.soNhaThuongTruCha + ', ' : '')
                + (data.xaThuongTruCha ? data.xaThuongTruCha + ', ' : '')
                + (data.huyenThuongTruCha ? data.huyenThuongTruCha + ', ' : '')
                + (data.tinhThuongTruCha ? data.tinhThuongTruCha : '');

            data.thuongTruMe = (data.soNhaThuongTruMe ? data.soNhaThuongTruMe + ', ' : '')
                + (data.xaThuongTruMe ? data.xaThuongTruMe + ', ' : '')
                + (data.huyenThuongTruMe ? data.huyenThuongTruMe + ', ' : '')
                + (data.tinhThuongTruMe ? data.tinhThuongTruMe : '');

            data.lienLac = (data.soNhaLienLac ? data.soNhaLienLac + ', ' : '')
                + (data.xaLienLac ? data.xaLienLac + ', ' : '')
                + (data.huyenLienLac ? data.huyenLienLac + ', ' : '')
                + (data.tinhLienLac ? data.tinhLienLac : '');
            data.yyyy = now.substring(0, 4);
            data.mm = now.substring(4, 6);
            data.dd = now.substring(6, 8);
            data.image = '';
            data.timeModified = new Date().toTimeString().split(' ')[0];

            Object.keys(data).forEach(key => {
                if (data[key] == null || data[key] == undefined) data[key] = '';
            });

            let barCodeImage = app.path.join(app.assetPath, '/qr-syll', data.mssv + '.png');
            app.fs.createFolder(app.path.join(app.assetPath, '/qr-syll'));
            const png = await bwipjs.toBuffer({
                bcid: 'code128',
                text: data.mssv.toString(),
                textxalign: 'center',
                includetext: true
            });
            app.fs.writeFileSync(barCodeImage, png);

            data.qrCode = barCodeImage;
            let buffer = await app.docx.generateFileHasImage(source, data, [80, 82]);
            app.fs.createFolder(app.path.join(app.assetPath, 'so-yeu-ly-lich'));
            app.fs.createFolder(app.path.join(app.assetPath, 'so-yeu-ly-lich', data.namTuyenSinh?.toString() || new Date().getFullYear().toString()));
            const filePdfPath = app.path.join(app.assetPath, 'so-yeu-ly-lich', data.namTuyenSinh?.toString() || new Date().getFullYear().toString(), data.mssv + '.pdf');
            const pdfBuffer = await app.docx.toPdfBuffer(buffer);
            app.fs.writeFileSync(filePdfPath, pdfBuffer);
            app.fs.deleteFile(barCodeImage);
            next(data, filePdfPath, pdfBuffer);
        } catch (error) {
            res.send({ error });
        }
    };

    app.get('/api/sv/download-syll', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user,
                { studentId, data } = user;

            const filePath = app.path.join(app.assetPath, 'so-yeu-ly-lich', data.namTuyenSinh?.toString() || new Date().getFullYear().toString(), studentId + '.pdf');
            initSyll(req, res, () => res.download(filePath, `SYLL_${studentId}.pdf`));
            // if (app.fs.existsSync(filePath)) res.download(filePath, `SYLL_${studentId}.pdf`);
            // else initSyll(req, res, () => res.download(filePath, `SYLL_${studentId}.pdf`));
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/sv/image-card', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user;
            let item = await app.model.fwStudent.get({ mssv: req.query.mssv ?? user.studentId }, 'namTuyenSinh,anhThe');
            if (!item) throw 'No valid student id';
            const path = app.path.join(app.assetPath, 'image-card', item.namTuyenSinh?.toString() ?? '', item.anhThe?.toString() ?? '');
            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                res.send({ error: 'No valid file' });
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.fs.createFolder(app.path.join(app.publicPath, '/img/sinhVien'));

    app.uploadHooks.add('uploadSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSinhVienImage(req, fields, files, params, done), done, 'student:login'));

    const uploadSinhVienImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('SinhVienImage:') && files.SinhVienImage && files.SinhVienImage.length) {
            app.uploadComponentImage(req, 'sinhVien', app.model.fwStudent, { mssv: fields.userData[0].substring('SinhVienImage:'.length) }, files.SinhVienImage[0].path, done);
        }
    };
};