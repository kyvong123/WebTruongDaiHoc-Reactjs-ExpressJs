module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7620: {
                title: 'Mẫu hồ sơ đăng ký',
                link: '/user/sau-dai-hoc/tuyen-sinh/hsdk',
                parentKey: 7544,
                backgroundColor: '#32a852',
                groupIndex: 1
            }
        },
    };
    app.permission.add(
        { name: 'sdhTsHsdk:read', menu },
        { name: 'sdhTsHsdk:write' },
        { name: 'sdhTsHsdk:delete' },
        { name: 'sdhTsHsdk:export' },
    );
    app.get('/user/sau-dai-hoc/tuyen-sinh/hsdk', app.permission.check('sdhTsHsdk:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------


    app.get('/api/sdh/ts/hsdk/item/:id', app.permission.check('sdhTsHsdk:read'), async (req, res) => {
        try {
            const { id } = req.params;
            if (id != null) {
                let item = await app.model.sdhTsHsdk.get({ id });
                res.send({ item });
            } else {
                throw 'Invalid id';
            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.uploadHooks.add('sdhTsHsdkFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => sdhTsHsdkFile(req, fields, files, params, done), done, 'sdhTsHsdk:write'));

    const sdhTsHsdkFile = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('sdhTsHsdkFile') && files.sdhTsHsdkFile && files.sdhTsHsdkFile.length > 0) {
            const
                srcPath = files.sdhTsHsdkFile[0].path,
                body = app.utils.parse(fields.data),
                id = fields.userData[0].split(':')[1],
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg', '.zip', '.rar'],
                baseNamePath = app.path.extname(srcPath);
            app.fs.createFolder(app.path.join(app.assetPath, 'sdh'), app.path.join(app.assetPath, 'sdh'));
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.fs.deleteFile(srcPath);
            } else {
                const { nameDisplay, note, category, active } = body ? body : { nameDisplay: '', note: '', category: '' };
                const newData = {
                    nameDisplay,
                    note,
                    active: Number(active),
                    userUpload: req.session.user.lastName + ' ' + req.session.user.firstName,
                    category,
                };
                if (id == 'new') {
                    app.model.sdhTsHsdk.create(newData, (error, item) => {
                        if (error || !item) {
                            done && done({ error });
                            app.fs.deleteFile(srcPath);
                        } else {
                            const fname = files.sdhTsHsdkFile[0].originalFilename;
                            app.fs.rename(srcPath, app.path.join(app.assetPath, 'sdh', fname), error => {
                                if (error) {
                                    done && done({ error });
                                } else {
                                    app.model.sdhTsHsdk.update({ id: item.id }, { ...newData, path: fname }, (error, item) => {
                                        done && done({ error, item });
                                    });
                                }
                            });
                        }
                    });
                } else {
                    app.model.sdhTsHsdk.get({ id }, (error, item) => {
                        if (item) {
                            app.fs.deleteFile(app.path.join(app.assetPath, 'sdh', item.path));
                            const fname = files.sdhTsHsdkFile[0].originalFilename;
                            app.fs.rename(srcPath, app.path.join(app.assetPath, 'sdh', fname), error => {
                                if (error) {
                                    console.error({ error });
                                    done && done({ error });
                                } else {
                                    app.model.sdhTsHsdk.update({ id: id }, { ...newData, path: fname }, (error, item) => {
                                        console.error({ error });
                                        done && done({ error, item });
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    };

    app.get('/api/sdh/ts/hsdk/download/:fileName', app.permission.check('sdhTsHsdk:export'), async (req, res) => {
        try {
            const { fileName } = req.params, path = app.path.join(app.assetPath, 'sdh', fileName);
            let item = await app.model.sdhTsHsdk.get({ path: fileName });
            if (app.fs.existsSync(path) && item) {
                res.download(path, fileName);
            } else if (!item) {
                console.error(req.url, req.method, { error: 'Not found - db' });
                res.sendStatus(404);
            } else {
                console.error(req.url, req.method, { error: 'Not found - asset/sdh' });
                res.sendStatus(404);
            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/hsdk/all', app.permission.check('sdhTsHsdk:read'), async (req, res) => {
        try {
            let [items, categories] = await Promise.all([
                app.model.sdhTsHsdk.getAll({}, '*', 'nameDisplay asc'),
                app.model.dmHocSdh.getAll()]);
            items = items.map(item => {
                let phanLoai = categories.find(_item => _item.ma == item.category);
                if (phanLoai && phanLoai.ten) {
                    item.category = { id: phanLoai.ma, text: phanLoai.ten };
                }
                return { ...item };
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/hsdk', app.permission.check('sdhTsHsdk:write'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            await app.model.sdhTsHsdk.update({ id }, changes);
            res.end();
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/ts/hsdk', app.permission.check('sdhTsHsdk:delete'), async (req, res) => {
        try {
            let { id, path } = req.body,
                pathDeleteFile = app.path.join(app.assetPath, 'sdh', path);
            if (app.fs.existsSync(pathDeleteFile)) app.fs.deleteFile(pathDeleteFile);
            await app.model.sdhTsHsdk.delete({ id });
            res.end();
        }
        catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
};