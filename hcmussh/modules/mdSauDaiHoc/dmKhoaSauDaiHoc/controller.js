module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7503: {
                title: 'Khoa đào tạo, giảng dạy',
                parentKey: 7540,
                link: '/user/sau-dai-hoc/khoa-sau-dai-hoc',
            },
        },
    };
    app.permission.add(
        { name: 'dmKhoaSdh:manage', menu },
        'dmKhoaSdh:delete', 'dmKhoaSdh:read', 'dmKhoaSdh:write'
    );
    app.get('/user/sau-dai-hoc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:manage'), app.templates.admin);
    app.permissionHooks.add('staff', 'addRoleKhoaDaoTaoSdh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'dmKhoaSdh:read', 'dmKhoaSdh:write', 'dmKhoaSdh:delete', 'dmKhoaSdh:manage');
            resolve();
        } else resolve();
    }));


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/khoa-sau-dai-hoc/page/:pageNumber/:pageSize', app.permission.check('dmKhoaSdh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
            if (req.query.kichHoat) {
                condition.statement += ' AND kichHoat = :kichHoat';
                condition.parameter.kichHoat = req.query.kichHoat;
            }
        } else if (req.query.kichHoat) {
            condition = {
                statement: 'kichHoat = :kichHoat',
                parameter: { kichHoat: req.query.kichHoat }
            };
        }

        app.model.dmKhoaSauDaiHoc.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));
    });

    app.get('/api/sdh/khoa-sau-dai-hoc/all', app.permission.check('dmKhoaSdh:read'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/khoa-sau-dai-hoc/item/:ma', app.permission.check('dmKhoaSdh:read'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/sdh/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:write'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/sdh/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:write'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/sdh/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:delete'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};