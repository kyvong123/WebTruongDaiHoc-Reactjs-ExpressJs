module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7532: {
                title: 'Tình trạng đề tài',
                link: '/user/sau-dai-hoc/tinh-trang-de-tai',
                parentKey: 7543
            }
        },
    };
    app.permission.add(
        { name: 'sdhDmTinhTrangDeTai:manage', menu },
        { name: 'sdhDmTinhTrangDeTai:write' },
        { name: 'sdhDmTinhTrangDeTai:delete' },
    );
    app.get('/user/sau-dai-hoc/tinh-trang-de-tai', app.permission.orCheck('sdhDmTinhTrangDeTai:write', 'sdhDmTinhTrangDeTai:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesTinhTrangDeTai', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmTinhTrangDeTai:write', 'sdhDmTinhTrangDeTai:delete', 'sdhDmTinhTrangDeTai:manage');
            resolve();
        } else resolve();
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/tinh-trang-de-tai/page/:pageNumber/:pageSize', app.permission.check('sdhDmTinhTrangDeTai:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.sdhDmTinhTrangDeTai.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/sdh/tinh-trang-de-tai/all', app.permission.check('sdhDmTinhTrangDeTai:manage'), (req, res) => {
        app.model.sdhDmTinhTrangDeTai.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/tinh-trang-de-tai/item/:ma', app.permission.orCheck('sdhDmTinhTrangDeTai:manage', 'sdhDmTinhTrangDeTai:write'), (req, res) => {
        app.model.sdhDmTinhTrangDeTai.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sdh/tinh-trang-de-tai', app.permission.check('sdhDmTinhTrangDeTai:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.sdhDmTinhTrangDeTai.create(changes, (error, item) => { res.send({ error, item }); });
    });

    app.put('/api/sdh/tinh-trang-de-tai', app.permission.check('sdhDmTinhTrangDeTai:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.sdhDmTinhTrangDeTai.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/sdh/tinh-trang-de-tai', app.permission.check('sdhDmTinhTrangDeTai:write'), (req, res) => {
        app.model.sdhDmTinhTrangDeTai.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};