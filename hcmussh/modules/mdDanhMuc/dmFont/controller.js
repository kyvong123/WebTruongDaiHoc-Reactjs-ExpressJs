module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            5011: { title: 'Danh sách font chữ', link: '/user/category/font' },
        },
    };
    app.permission.add(
        { name: 'manager:write', menu }
    );

    app.get('/user/category/font', app.permission.check('manager:write'), app.templates.admin);

    // Upload API  -----------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.assetPath, '/fonts'));

    app.uploadHooks.add('dmFontFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadFontFile(req, fields, files, params, done), done, 'staff:login'));

    const uploadFontFile = async (req, fields, files, params, done) => {
        try {
            const type = fields.userData?.length && fields.userData[0];

            if (type == 'dmFontFile') {
                const
                    file = files.dmFontFile[0],
                    { path, originalFilename } = file,
                    validFileType = ['.ttf'],
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(fileName);
                if (!validFileType.includes(extName)) return done && done({ error: 'Định dạng file không hợp lệ' });

                done && done({
                    fileName,
                    originalFilename,
                    path
                });
            }

        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/font/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            let statement = ['ten']
                .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');

            if (req.query.condition) {
                condition = {
                    statement,
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            const page = await app.model.dmFont.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/font/all', app.permission.check('staff:login'), async (req, res) => {
        try {
            const items = await app.model.dmFont.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/font/item/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = await app.model.dmFont.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/font', app.permission.check('manager:write'), async (req, res) => {
        try {
            let { filePath, ...postData } = req.body.item;
            const item = await app.model.dmFont.create(postData);
            app.fs.renameSync(filePath, app.path.join(app.assetPath, 'fonts', postData.tenFile));
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }

    });

    app.put('/api/danh-muc/font', app.permission.check('manager:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;

            const item = await app.model.dmFont.get({ id });
            app.fs.deleteFile(app.path.join(app.assetPath, 'fonts', item.tenFile));

            const updateItem = await app.model.dmFont.update({ id }, changes);

            if (changes.tenFile) {
                const { filePath, tenFile } = changes;
                app.fs.renameSync(filePath, app.path.join(app.assetPath, 'fonts', tenFile));
            }

            res.send({ item: updateItem });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/font', app.permission.check('manager:write'), async (req, res) => {
        try {
            const item = await app.model.dmFont.get({ id: req.body.id });
            app.fs.deleteFile(app.path.join(app.assetPath, 'fonts', item.tenFile));
            await app.model.dmFont.delete({ id: req.body.id });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });
};