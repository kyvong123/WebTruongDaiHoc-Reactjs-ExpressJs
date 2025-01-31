module.exports = app => {
    app.get('/api/feature/all', app.permission.check('component:read'), (req, res) => {
        let user = req.session.user,
            condition = {
                maDonVi: user.permissions.includes('website:manage') ? '0' : user.maDonVi
            };
        app.model.fwHomeFeature.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/feature/item/:featureId', app.permission.check('component:read'), (req, res) =>
        app.model.fwHomeFeature.get({ id: req.params.featureId }, (error, item) => res.send({ error, item })));

    app.post('/api/feature', app.permission.check('website:write'), (req, res) => {
        let body = { title: req.body.title }, user = req.session.user;
        body.maDonVi = user.permissions.includes('website:manage') ? '0' : (user.maDonVi ? user.maDonVi : -1);
        app.model.fwHomeFeature.create(body, (error, item) => res.send({ error, item }));
    });

    app.put('/api/feature', app.permission.check('website:write'), (req, res) =>
        app.model.fwHomeFeature.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/feature', app.permission.check('website:write'), (req, res) => {
        const item = req.body.item;
        app.fs.deleteImage(item.image);
        app.model.fwHomeFeature.delete({ id: item.id }, error => res.send({ error }));
    });


    app.get('/api/featureItem/all/:featureId', app.permission.check('website:write'), (req, res) =>
        app.model.fwHomeFeatureItem.getAll({ featureId: req.params.featureId }, (error, items) => res.send({ error, items })));

    app.get('/api/featureItem/:featureItemId', app.permission.check('website:write'), (req, res) =>
        app.model.fwHomeFeatureItem.get({ id: req.params.featureItemId }, (error, item) => res.send({ error, item })));

    app.post('/api/featureItem', app.permission.check('website:write'), (req, res) => {
        let body = req.body;
        app.model.fwHomeFeatureItem.create(body, (error, item) => res.send({ error, item }));
    });

    app.put('/api/featureItem', app.permission.check('website:write'), (req, res) =>
        app.model.fwHomeFeatureItem.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/featureItem', app.permission.check('website:write'), (req, res) => {
        const item = req.body.item;
        app.fs.deleteImage(item.image);
        app.model.fwHomeFeatureItem.delete({ id: item.id }, error => res.send({ error }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/home/feature/:id', (req, res) =>
        app.model.fwHomeFeature.get(req.params.id, (error, item) =>
            res.send({ error, item })));

    app.get('/api/home/featureItem/:featureId', (req, res) =>
        app.model.fwHomeFeatureItem.getAll({ featureId: req.params.featureId }, (error, items) =>
            res.send({ error, items })));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.fs.createFolder(app.path.join(app.publicPath, '/img/feature'));

    const uploadFeature = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('feature:') && files.FeatureImage && files.FeatureImage.length > 0) {
            console.log('Hook: uploadFeature => feature image upload');
            app.uploadComponentImage(req, 'feature', app.model.fwHomeFeatureItem, fields.userData[0].substring(8), files.FeatureImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadFeature', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadFeature(req, fields, files, params, done), done, 'website:write'));
};