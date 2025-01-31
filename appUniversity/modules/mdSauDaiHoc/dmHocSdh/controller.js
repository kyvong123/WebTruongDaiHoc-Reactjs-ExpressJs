module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7527: {
                title: 'Phân hệ đào tạo',
                link: '/user/sau-dai-hoc/phan-he-dao-tao', parentKey: 7570
            },
            7631: {
                title: 'Phân hệ đào tạo',
                link: '/user/sau-dai-hoc/phan-he-dao-tao', parentKey: 7544, groupIndex: 2
            }
        },
    };
    app.permission.add(
        { name: 'dmHocSdh:read', menu },
        { name: 'dmHocSdh:write' },
        { name: 'dmHocSdh:delete' },
    );
    app.get('/user/sau-dai-hoc/phan-he-dao-tao', app.permission.check('dmHocSdh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/bac-sdh/page/:pageNumber/:pageSize', app.permission.check('dmHocSdh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmHocSdh.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/sdh/bac-sdh/all', app.permission.check('staff:login'), (req, res) => {
        app.model.dmHocSdh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/bac-sdh/item/:ma', app.permission.orCheck('dmHocSdh:read', 'studentSdh:login'), (req, res) => {
        app.model.dmHocSdh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sdh/bac-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.dmHocSdh.create(changes, (error, item) => { res.send({ error, item }); });
    });

    app.put('/api/sdh/bac-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.dmHocSdh.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/sdh/bac-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        app.model.dmHocSdh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};