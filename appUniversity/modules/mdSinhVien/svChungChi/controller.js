module.exports = app => {
    const PERMISSION = app.isDebug ? 'student:login' : 'student:test';

    const menu = {
        parentMenu: app.parentMenu.hocTap,
        menus: {
            7730: { title: 'Chứng chỉ', link: '/user/dang-ky-chung-chi' },
        }
    };

    const folderUploadCert = app.path.join(app.assetPath, 'cert-uploaded-file');
    app.fs.createFolder(folderUploadCert);

    app.permission.add(
        { name: PERMISSION, menu },
    );

    app.get('/user/dang-ky-chung-chi', app.permission.check(PERMISSION), app.templates.admin);

    // APIS ==========================================
    app.post('/api/sv/chung-chi', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const { data } = req.body, { mssv } = req.session.user,
                { loaiChungChi, chungChi, ngayCap, noiCap, ngoaiNgu, fileName, cccd, soHieuVanBang } = data;
            if (loaiChungChi == 'NN') await app.model.dtChungChiSinhVien.create({ mssv, ngayCap, noiCap, status: 0, fileName, ngoaiNgu, chungChi, timeCreated: Date.now(), cccd, soHieuVanBang });
            else await app.model.dtChungChiTinHocSinhVien.create({ mssv, ngayCap, noiCap, status: 0, fileName, maChungChi: chungChi, timeCreated: Date.now(), loaiChungChi, cccd, soHieuVanBang });

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/sv/chung-chi', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const { data } = req.body,
                { idCc, fileName, chungChiNgoaiNgu, chungChiKhac } = data;

            if (chungChiNgoaiNgu) await app.model.dtChungChiSinhVien.delete({ id: idCc });
            else if (chungChiKhac) await app.model.dtChungChiTinHocSinhVien.delete({ id: idCc });

            app.fs.deleteFile(app.path.join(folderUploadCert, fileName));

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/chung-chi', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const { mssv } = req.session.user;

            const { rows, datacert } = await app.model.dtChungChiSinhVien.getChungChi(app.utils.stringify({ mssv }));
            res.send({ dataChungChi: { certNgoaiNgu: rows, otherCert: datacert } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/chung-chi/cert-image', app.permission.check('user:login'), async (req, res) => {
        try {
            const { fileName } = req.query,
                path = app.path.join(folderUploadCert, fileName);
            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                res.end();
            }
        } catch (error) {
            res.send({ error });
        }
    });

    // UPLOAD HOOKS =================================
    app.uploadHooks.add('uploadCertificateFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCertificateFile(req, fields, files, done), done, PERMISSION));

    const uploadCertificateFile = async (req, fields, files, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'CertFile' && files.CertFile && files.CertFile.length) {
            try {
                let { path, size, originalFilename } = files.CertFile[0],
                    time = Date.now(),
                    { loaiChungChi } = req.query,
                    type = originalFilename.substring(originalFilename.lastIndexOf('.') + 1, originalFilename.length);

                if ((size / 1024 / 1024) > 1) {
                    app.fs.deleteFile(path);
                    throw { message: 'Vui lòng chọn ảnh có kích thước < 1 MB' };
                }

                if (!files.CertFile[0].headers['content-type'].includes('image/')) {
                    app.fs.deleteFile(path);
                    throw { message: 'Vui lòng chọn file ảnh' };
                }

                const imagePath = app.path.join(folderUploadCert, `${req.session.user.mssv}_${loaiChungChi}_${time}.${type}`);
                await app.fs.rename(path, imagePath);

                done && done({ fileName: `${req.session.user.mssv}_${loaiChungChi}_${time}.${type}` });
            } catch (error) {
                done && done(error);
            }
        }
    };
};