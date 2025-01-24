module.exports = app => {
    app.post('/api/hcth/cong-tac/bien-ban', app.permission.check('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const { congTacItemId, data } = req.body;
            const congTac = await app.model.hcthCongTacItem.getItem(congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(congTac, req.session.user).isConcludable()) {
                throw 'Bạn không có quyền soạn biên bản kết luận của buổi họp';
            }
            const item = await app.model.hcthBienBanKetLuan.create({ ma: congTacItemId, ...data, nguoiTao: shcc, thoiGian: Date.now() });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/bien-ban', app.permission.check('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const { id, data } = req.body;
            const bienBan = await app.model.hcthBienBanKetLuan.get({ id });

            if (bienBan.nguoiTao != shcc) {
                throw 'Bạn không có quyền chỉnh sửa biên bản kết luận của buổi họp';
            }
            const item = await app.model.hcthBienBanKetLuan.update({ id }, { ...data, capNhat: Date.now() });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/bien-ban/:congTacItemId', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = await app.model.hcthCongTacItem.getItem(req.params.congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isReadable()) {
                throw 'Permission denied';
            }
            const { rows: items } = await app.model.hcthBienBanKetLuan.getList(item.id);
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('hcthBienBanKetLuanNoiDung', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthBienBanKetLuanNoiDung(req, fields, files, params, done), done, 'staff:login'));

    app.fs.createFolder(app.path.join(app.assetPath, 'bienBan'));

    const hcthBienBanKetLuanNoiDung = async (req, fields, files, params, done) => {
        try {
            if (req.query.uploadTo == 'hcthBienBanKetLuanNoiDung') {
                const [file] = files.upload,
                    { path } = file,
                    fileName = path.replace(/^.*[\\\/]/, '');
                //TODO: Long permission check
                const { id, } = req.query; //consists congTacItemId
                app.fs.createFolder(app.path.join(app.assetPath, 'bienBan', `${id}`));
                app.fs.renameSync(path, app.path.join(app.assetPath, 'bienBan', `${id}`, fileName));
                done({ uploaded: true, url: `/api/hcth/cong-tac/bien-ban/${id}/${fileName}`, 'error': { 'message': '' } });
            }
        } catch (error) {
            console.error(error);
            done({ error });
        }
    };

    app.uploadHooks.add('hcthBienBanKetLuanAttachment', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthBienBanKetLuanAttachment(req, fields, files, params, done), done, 'staff:login'));

    const hcthBienBanKetLuanAttachment = async (req, fields, files, params, done) => {
        try {
            if (fields?.userData?.length && fields.userData[0] == 'hcthBienBanKetLuanAttachment') {
                const [file] = files.hcthBienBanKetLuanAttachment,
                    { path } = file,
                    fileName = path.replace(/^.*[\\\/]/, '');
                //TODO: Long permission check
                const { id } = req.query; //consists congTacItemId
                app.fs.createFolder(app.path.join(app.assetPath, 'bienBan', `${id}`));
                app.fs.renameSync(path, app.path.join(app.assetPath, 'bienBan', `${id}`, fileName));
                const item = await app.model.hcthBienBanKetLuan.update({ id }, { fileName: file.originalFilename, filePath: fileName });
                done({ item });
            }
        } catch (error) {
            console.error(error);
            done({ error });
        }
    };

    app.get('/api/hcth/cong-tac/bien-ban/:id/:fileName', app.permission.check('staff:login'), async (req, res) => {
        try {
            //TODO: Long check permission
            const { id, fileName } = req.params;
            const path = app.path.join(app.assetPath, 'bienBan', `${id}`, fileName);
            if (!app.fs.existsSync(path)) {
                res.status(404).send({ error: 'file not exists ' });
            }
            res.sendFile(path);
        } catch (error) {
            res.status(500).send({ error });
        }
    });

};
