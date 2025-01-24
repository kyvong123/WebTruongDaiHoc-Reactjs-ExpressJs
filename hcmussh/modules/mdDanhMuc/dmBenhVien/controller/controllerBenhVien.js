module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4003: { title: 'Bệnh viện', link: '/user/category/benh-vien' } },
    };
    app.permission.add(
        { name: 'dmBenhVien:read', menu },
        { name: 'dmBenhVien:write' },
        { name: 'dmBenhVien:delete' },
        { name: 'dmBenhVien:upload' },
    );

    app.permissionHooks.add('staff', 'addRolesDmBenhVien', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'dmBenhVien:read', 'dmBenhVien:write', 'dmBenhVien:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/category/benh-vien', app.permission.check('dmBenhVien:read'), app.templates.admin);
    app.get('/user/category/benh-vien/upload', app.permission.check('dmBenhVien:upload'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/benh-vien/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText OR lower(diaChi) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmBenhVien.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));

    });

    app.get('/api/danh-muc/benh-vien/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmBenhVien.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/benh-vien/item/:ma', app.permission.orCheck('dmBenhVien:read', 'staff:login'), async (req, res) => {
        try {
            let item = await app.model.dmBenhVien.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/benh-vien', app.permission.check('dmBenhVien:write'), (req, res) => {
        const newItem = req.body.dmBenhVien;
        app.model.dmBenhVien.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Bệnh viện ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmBenhVien.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.post('/api/danh-muc/benh-vien/multiple', app.permission.check('dmBenhVien:upload'), (req, res) => {
        const data = req.body.dmBenhVien;
        const dataImported = [];
        const handleCreate = index => {
            if (index >= data.length) res.send({ items: dataImported });
            else
                app.model.dmBenhVien.get({ ma: data[index].ma }, (error, item) => {
                    let currentDate = data[index];
                    if (error) res.send({ error });
                    else if (item) {
                        app.model.dmBenhVien.update({ ma: data[index].ma }, currentDate, (error, item) => {
                            if (error) res.send({ error });
                            else {
                                dataImported.push(item);
                            }
                        });
                        handleCreate(index + 1);
                    }
                    else {
                        app.model.dmBenhVien.create(currentDate, (error, item) => {
                            if (error) res.send({ error });
                            else {
                                dataImported.push(item);
                                handleCreate(index + 1);
                            }
                        });
                    }
                });
        };
        handleCreate(0);
    });

    app.put('/api/danh-muc/benh-vien', app.permission.check('dmBenhVien:write'), (req, res) => {
        app.model.dmBenhVien.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/benh-vien', app.permission.check('dmBenhVien:delete'), (req, res) => {
        app.model.dmBenhVien.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};