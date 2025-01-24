module.exports = (app) => {
    app.post('/api/hcth/cong-tac/chuong-trinh', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const { congTacItemId, canBo, moTa, batDau } = req.body.data;
            const congTacItem = await app.model.hcthCongTacItem.getItem(congTacItemId);
            const item = await app.model.hcthChuongTrinhHop.create({ congTacItemId, canBo, moTa, batDau });
            app.model.hcthCongTacLog.createLog(congTacItem.id, req);

            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/chuong-trinh', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            const id = req.body.id;
            const chuongTrinh = await app.model.hcthChuongTrinhHop.get({ id });
            const item = await app.model.hcthCongTacItem.getItem(chuongTrinh.congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không có đủ quyền để cập nhật chương trình';
            }
            await app.model.hcthChuongTrinhHop.update({ id }, changes);
            app.model.hcthCongTacLog.createLog(item.id, req);

            res.send({ item: chuongTrinh });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/chuong-trinh/:congTacItemId', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = await app.model.hcthCongTacItem.getItem(req.params.congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isReadable()) {
                throw 'Permission denied';
            }
            const { rows: items } = await app.model.hcthChuongTrinhHop.getList(item.id);
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-tac/chuong-trinh', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, congTacItemId } = req.body;
            const item = await app.model.hcthCongTacItem.getItem(congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không đủ quyền xóa chương trình';
            }

            await app.model.hcthChuongTrinhHop.delete({ id, ma: item.id });
            app.model.hcthCongTacLog.createLog(item.id, req);
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.fs.createFolder(app.path.join(app.assetPath, 'hcthChuongTrinh'));

    app.uploadHooks.add('hcthChuongTrinhFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthChuongTrinhFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthChuongTrinhFile = async (req, fields, files, params, done) => {
        try {
            if (files?.hcthChuongTrinhFile && files?.hcthChuongTrinhFile.length) {
                const [file] = files.hcthChuongTrinhFile,
                    { path } = file,
                    fileName = path.replace(/^.*[\\\/]/, '');
                //TODO: Long permission check
                let data = app.utils.parse(fields?.data?.[0]);
                const id = data.chuongTrinhId;
                const chuongTrinh = await app.model.hcthChuongTrinhHop.get({ id });
                if (!chuongTrinh) throw 'Chương trình không tồn tại';
                let item = await app.model.hcthCongTacItem.getItem(chuongTrinh.congTacItemId);
                if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) throw 'Bạn không có quyền cập nhật';

                app.fs.createFolder(app.path.join(app.assetPath, 'hcthChuongTrinh', `${id}`));
                app.fs.renameSync(path, app.path.join(app.assetPath, 'hcthChuongTrinh', `${id}`, fileName));
                item = await app.model.hcthChuongTrinhHop.update({ id }, { fileName: file.originalFilename, filePath: fileName });
                done({});
            }
        } catch (error) {
            console.error(req.originalUrl, error);
            done({ error });
        }
    };

    app.get('/api/hcth/cong-tac/chuong-trinh/file/:id/:filePath', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, filePath } = req.params;
            const chuongTrinh = await app.model.hcthChuongTrinhHop.get({ id });
            const congTacItem = await app.model.hcthCongTacItem.getItem(chuongTrinh.congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(congTacItem, req.session.user).isReadable())
                return res.status(401).send({ error: 'Permission denied' });
            const path = app.path.join(app.assetPath, 'hcthChuongTrinh', id, filePath);
            if (!app.fs.existsSync(path))
                return res.status(404).send({ error: 'file not found' });
            res.download(path);
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });
};