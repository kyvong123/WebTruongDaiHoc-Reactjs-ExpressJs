module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4041: { title: 'Loại đơn vị', link: '/user/category/loai-don-vi' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiDonVi:read', menu },
        { name: 'dmLoaiDonVi:write' },
        { name: 'dmLoaiDonVi:delete' },
    );

    app.get('/division/item/:_id', app.templates.home);
    app.get('/user/category/loai-don-vi', app.permission.check('dmLoaiDonVi:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-don-vi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmLoaiDonVi.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-don-vi/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiDonVi.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-don-vi/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiDonVi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-don-vi', app.permission.check('dmLoaiDonVi:write'), (req, res) => {
        app.model.dmLoaiDonVi.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-don-vi', app.permission.check('dmLoaiDonVi:write'), (req, res) => {
        app.model.dmLoaiDonVi.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/loai-don-vi', app.permission.check('dmLoaiDonVi:delete'), (req, res) => {
        app.model.dmLoaiDonVi.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};