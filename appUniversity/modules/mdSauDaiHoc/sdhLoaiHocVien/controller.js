module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7517: {
                title: 'Loại học viên',
                link: '/user/sau-dai-hoc/loai-hoc-vien',
                groupIndex: 3,
                icon: 'fa fa-user-circle-o'
            }
        },
    };

    app.permission.add(
        { name: 'sdhLoaiHocVien:manage', menu },
        { name: 'sdhLoaiHocVien:write' },
        { name: 'sdhLoaiHocVien:delete' },
    );
    app.get('/user/sau-dai-hoc/loai-hoc-vien', app.permission.orCheck('sdhLoaiHocVien:write', 'sdhLoaiHocVien:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/loai-hoc-vien/page/:pageNumber/:pageSize', app.permission.check('sdhLoaiHocVien:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.sdhLoaiHocVien.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/sdh/loai-hoc-vien/all', app.permission.check('sdhLoaiHocVien:manage'), (req, res) => {
        app.model.sdhLoaiHocVien.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/loai-hoc-vien/item/:ma', app.permission.orCheck('sdhLoaiHocVien:manage', 'sdhLoaiHocVien:write'), (req, res) => {
        app.model.sdhLoaiHocVien.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sdh/loai-hoc-vien', app.permission.check('sdhLoaiHocVien:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.sdhLoaiHocVien.create(changes, (error, item) => { res.send({ error, item }); });
    });

    app.put('/api/sdh/loai-hoc-vien', app.permission.check('sdhLoaiHocVien:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.sdhLoaiHocVien.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/sdh/loai-hoc-vien', app.permission.check('sdhLoaiHocVien:write'), (req, res) => {
        app.model.sdhLoaiHocVien.delete({ ma: req.body.ma }, error => res.send({ error }));
    });



};