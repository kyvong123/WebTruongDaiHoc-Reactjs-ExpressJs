module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7604: {
                title: 'Danh mục biểu mẫu', parentKey: 7544, link: '/user/sau-dai-hoc/tuyen-sinh/dm-bieu-mau', groupIndex: 2
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsDmBieuMau:read', menu },
        { name: 'sdhTsDmBieuMau:write' },
        { name: 'sdhTsDmBieuMau:delete' },
        { name: 'sdhTsDmBieuMau:download' },
        { name: 'sdhTsDmBieuMau:upload' }
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/dm-bieu-mau', app.templates.admin);

    // API --------------------------------------------------------------------------------------------------------

    app.uploadHooks.add('sdhTsDmBm', (req, fields, files, params, done) =>
        app.permission.has(req, () => sdhTsDmBm(req, fields, files, params, done), done, 'sdhTsDmBieuMau:write'));

    const sdhTsDmBm = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('sdhTsDmBm') && files.sdhTsDmBm && files.sdhTsDmBm.length > 0) {
            const
                srcPath = files.sdhTsDmBm[0].path,
                body = app.utils.parse(fields.data),
                id = fields.userData[0].split(':')[1],
                validUploadFileType = ['.xlsx', '.doc', '.docx'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.fs.deleteFile(srcPath);
            } else {
                const { ten, ghiChu, src } = body ? body : { ten, ghiChu, src };
                const newData = {
                    ghiChu,
                    ten,
                };
                app.model.sdhTsDmBieuMau.get({ id }, (error, item) => {
                    if (item) {
                        app.fs.rename(srcPath, app.path.join(app.assetPath, item.src), error => {
                            if (error) {
                                done && done({ error });
                            } else {
                                app.model.sdhTsDmBieuMau.update({ id: id }, { ...newData }, (error, item) => {
                                    done && done({ error, item });
                                });
                            }
                        });
                    }
                });

            }
        }
    };
    app.get('/api/sdh/ts/dm-bieu-mau/download-export', app.permission.check('sdhTsDmBieuMau:download'), async (req, res) => {
        try {
            let { outputPath } = req.query;
            const path = app.path.join(app.assetPath, outputPath);
            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else throw 'Không tồn tại file download';
        } catch (error) {
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/dm-bieu-mau', app.permission.check('sdhTsDmBieuMau:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.sdhTsDmBieuMau.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/dm-bieu-mau', app.permission.check('sdhTsDmBieuMau:read'), async (req, res) => {
        try {
            const items = await app.model.sdhTsDmBieuMau.getAll({});
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });
};