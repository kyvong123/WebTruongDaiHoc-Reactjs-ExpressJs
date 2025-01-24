module.exports = app => {
    app.permission.add(
        { name: 'category:read' },
        { name: 'category:write' },
    );
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/category/:type', async (req, res) => {
        try {
            let { condition, maDonVi } = req.query;
            if (maDonVi) {
                condition = { type: req.params.type, maDonVi: '0' };
            } else if (condition) {
                condition = {
                    statement: 'title LIKE :searchText AND type = :type',
                    parameter: { searchText: `%${condition}%`, type: req.params.type }
                };
            } else {
                condition = { type: req.params.type, maDonVi: '0' };
                const user = req.session.user;
                if (user && user.maDonVi && user.permissions.includes('website:read') && !user.permissions.includes('news:write')) {
                    condition.maDonVi = user.maDonVi;
                }
            }
            const items = await app.model.fwCategory.getAll(condition, '*', 'priority DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/category-admin/:type', app.permission.orCheck('news:read', 'website:read'), async (req, res) => {
        try {
            const searchText = req.query.condition,
                condition = {
                    statement: 'type = :type AND maDonVi = :maDonVi AND title LIKE :searchText',
                    parameter: { type: req.params.type, maDonVi: '0', searchText: `%${searchText || ''}%` }
                };
            const user = req.session.user,
                permissions = user.permissions;
            if (user && user.maDonVi && (!permissions.includes('news:write') || !permissions.includes('website:manage'))) {
                condition.parameter.maDonVi = user.maDonVi;
            }
            const items = await app.model.fwCategory.getAll(condition, '*', 'priority DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/category-donvi/:type', app.permission.check(), async (req, res) => {
        try {
            const permissions = req.session.user.permissions || [];
            let condition = req.query.condition, type = req.params.type, maDonVi = req.query.maDonVi;
            let pageCondition = { statement: 'type LIKE:type', parameter: { type } };
            if (condition) {
                pageCondition.statement += ' AND lower(title) LIKE :searchText';
                pageCondition.parameter.searchText = `%${condition.toLowerCase()}%`;
            }

            if (permissions.includes('website:manage')) {
                if (maDonVi) {
                    pageCondition.statement += ' AND maDonVi LIKE :maDonVi';
                    pageCondition.parameter.maDonVi = maDonVi;
                }
            } else {
                pageCondition.statement += ' AND maDonVi LIKE :maDonVi';
                pageCondition.parameter.maDonVi = req.session.user.maDonVi;
            }

            const items = await app.model.fwCategory.getAll(pageCondition, '*', 'priority DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/category', app.permission.check('category:write'), (req, res) => {
        const user = req.session.user, body = req.body.data;
        if (user && user.maDonVi) {
            body.maDonVi = user.maDonVi;
            app.model.fwCategory.create2(body, (error, item) => {
                res.send({ error, item });
            });
        } else {
            res.send({ error: 'You do not have permission' });
        }

    });

    app.put('/api/category', app.permission.check('category:write'), (req, res) =>
        app.model.fwCategory.update({ id: req.body.id }, req.body.changes, (error, item) => {
            res.send({ error, item });
        }));

    app.put('/api/category/swap', app.permission.check('category:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.fwCategory.swapPriority(req.body.id, isMoveUp, error => res.send({ error }));
    });

    app.delete('/api/category', app.permission.check('category:write'), (req, res) => app.model.fwCategory.delete2({ id: req.body.id }, error => res.send({ error })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, '/img/category'));

    const uploadCategoryImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('newsCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => news');
            app.uploadComponentImage(req, 'category', app.model.fwCategory, fields.userData[0].substring(18), files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('eventCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => event');
            app.uploadComponentImage(req, 'category', app.model.fwCategory, fields.userData[0].substring(19), files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('documentCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => document');
            app.uploadComponentImage(req, 'category', app.model.fwCategory, fields.userData[0].substring(22), files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('jobCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => job');
            app.uploadComponentImage(req, 'category', app.model.fwCategory, fields.userData[0].substring(17), files.CategoryImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCategoryImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCategoryImage(req, fields, files, params, done), done, 'category:write'));
};