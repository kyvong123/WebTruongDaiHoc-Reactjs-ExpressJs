module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4104: { title: 'Ngôn ngữ truyền thông', link: '/user/category/ngon-ngu-truyen-thong' }
        }
    };
    app.permission.add(
        { name: 'dmNgonNgu:read', menu },
        { name: 'dmNgonNgu:write' },
        { name: 'dmNgonNgu:delete' }
    );

    app.readyHooks.add('Init dmNgonNguTruyenThong', {
        ready: () => app.database.oracle.connected && app.model.dmNgonNguTruyenThong,
        run: async () => {
            try {
                if (app.primaryWorker) await app.model.dmNgonNguTruyenThong.init();
            } catch (e) {
                console.error('Init dmNgonNguTruyenThong failed!');
            }
        },
    });

    app.get('/user/category/ngon-ngu-truyen-thong', app.permission.check('dmNgonNgu:read'), app.templates.admin);

    app.get('/api/danh-muc/ngon-ngu/all', app.permission.check('user:login'), async (req, res) => {
        try {
            let condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(maCode) LIKE: searchText OR lower(tenNgonNgu) LIKE: searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            const items = await app.model.dmNgonNguTruyenThong.getAll(condition);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/ngon-ngu/item/:maCode', app.permission.check('user:login'), async (req, res) => {
        try {
            const item = await app.model.dmNgonNguTruyenThong.get({ maCode: req.params.maCode });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/ngon-ngu', app.permission.check('dmNgonNgu:write'), async (req, res) => {
        try {
            const item = await app.model.dmNgonNguTruyenThong.create(req.body.item);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/ngon-ngu', app.permission.check('dmNgonNgu:write'), async (req, res) => {
        try {
            const item = await app.model.dmNgonNguTruyenThong.update({ maCode: req.body.maCode }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/ngon-ngu', app.permission.check('dmNgonNgu:delete'), async (req, res) => {
        try {
            await app.model.dmNgonNguTruyenThong.delete({ maCode: req.body.maCode });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    // Hook upload images
    app.fs.createFolder(app.path.join(app.publicPath, '/img/flag'));
    const uploadFlagImage = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('nationFlag:') && files.NationFlag && files.NationFlag.length > 0) {
            console.log('Hook: upload nation flag');
            const maCode = fields.userData[0].substring('nationFlag:'.length);
            const srcPath = files.NationFlag[0].path;
            if (app.path.extname(srcPath) == '.png') {
                app.jimp.read(srcPath).then(image => {
                    app.fs.deleteFile(srcPath);
                    if (image) {
                        image.resize(200, 120);
                        const link = `/img/flag/${maCode}.png`;
                        image.write(app.path.join(app.publicPath, link), error => {
                            done({ error, image: link });
                        });
                    } else {
                        done({ error: 'Upload has errors!' });
                    }
                });
            } else {
                app.fs.deleteFile(srcPath);
                done({ error: 'Yêu cầu định dạng file: .png' });
            }
        }
    };
    app.uploadHooks.add('uploadNationFlag', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadFlagImage(fields, files, done), done, 'dmNgonNgu:write'));
};