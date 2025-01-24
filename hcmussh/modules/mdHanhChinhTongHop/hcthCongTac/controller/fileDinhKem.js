module.exports = (app) => {

    const rootFolder = app.path.join(app.assetPath, 'hcth', 'congTacFile');
    app.fs.createFolder(rootFolder);

    app.get('/api/hcth/cong-tac/files/:congTacItemId', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = await app.model.hcthCongTacItem.getItem(req.params.congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isReadable()) {
                throw 'Permission denied';
            }
            const { rows: items } = await app.model.hcthFile.getAllFrom(item.id, 'CONG_TAC_ITEM');
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-tac/files', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, congTacItemId } = req.body;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);
            const file = await app.model.hcthFile.get({ id, loai: 'CONG_TAC_ITEM' });
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không đủ quyền xóa chương trình';
            }

            const path = app.path.join(app.assetPath, 'hcth', 'congTacFile', `${item.id}`, file.tenFile);
            app.fs.deleteFile(path);
            await app.model.hcthFile.delete({ id, loai: 'CONG_TAC_ITEM' });
            app.model.hcthCongTacLog.createLog(item.id, req);
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.uploadHooks.add('hcthCongTacFiles', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthCongTacFiles(req, fields, files, params, done), done, 'staff:login'));

    const hcthCongTacFiles = async (req, fields, files, params, done) => {
        try {
            if (files?.hcthCongTacFiles && files?.hcthCongTacFiles.length) {
                const [file] = files.hcthCongTacFiles,
                    { path } = file,
                    fileName = path.replace(/^.*[\\\/]/, '');

                let data = app.utils.parse(fields?.userData?.[0]);
                const id = data.congTacId;
                const item = await app.model.hcthCongTacItem.getItem(id);
                if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                    throw 'Bạn không đủ quyền thêm tệp tin đính kèm';
                }

                const itemPath = app.path.join(rootFolder, `${item.id}`);
                app.fs.createFolder(itemPath);

                app.fs.renameSync(path, app.path.join(itemPath, fileName));

                const fileItem = await app.model.hcthFile.create({ ten: file.originalFilename, nguoiTao: req.session.user.shcc, tenFile: fileName, loai: 'CONG_TAC_ITEM', ma: item.id, ngayTao: new Date().getTime(), });

                app.model.hcthCongTacLog.createLog(item.id, req);
                done({ item: fileItem });
            }
        } catch (error) {
            console.error(req.originalUrl, error);
            done({ error });
        }
    };

    app.get('/api/hcth/cong-tac/files/download/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id } = req.params;
            const file = await app.model.hcthFile.get({ id, loai: 'CONG_TAC_ITEM' });
            const congTacItem = await app.model.hcthCongTacItem.getItem(file.ma);
            if (!app.model.hcthCongTacItem.getPermissionChecker(congTacItem, req.session.user).isReadable())
                return res.status(401).send({ error: 'Permission denied' });
            const path = app.path.join(rootFolder, `${congTacItem.id}`, file.tenFile);
            if (!app.fs.existsSync(path))
                return res.status(404).send({ error: 'file not found' });
            res.download(path);
        } catch (error) {
            console.error(req.originalUrl, error);
            res.status(500).send({ error });
        }
    });
};