module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7025: {
                title: 'Học kỳ', link: '/user/dao-tao/hoc-ky', groupIndex: 2, parentKey: 7027
            }
        }
    };
    app.permission.add(
        { name: 'dtDmHocKy:manage', menu },
        { name: 'dtDmHocKy:write' },
        { name: 'dtDmHocKy:delete' },
        { name: 'sdhHocKy: read' }
    );

    app.get('/user/dao-tao/hoc-ky', app.permission.check('dtDmHocKy:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtDmHocKy', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmHocKy:manage', 'dtDmHocKy:write', 'dtDmHocKy:delete');
            resolve();
        }
        else if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhHocKy:read');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/hoc-ky/page/:pageNumber/:pageSize', app.permission.orCheck('dtDmHocKy:manage', 'sdhHocKy:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
        app.model.dtDmHocKy.searchPage(pageNumber, pageSize, searchTerm, (error, result) => {
            if (error) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/dt/hoc-ky/all', app.permission.orCheck('staff:login', 'dtDmHocKy:manage'), (req, res) => {
        let kichHoat = req.query.kichHoat;
        let condition = kichHoat ? { kichHoat: 1 } : {};
        app.model.dtDmHocKy.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dt/hoc-ky/item/:ma', app.permission.orCheck('staff:teacher', 'dtDmHocKy:manage', 'sdhHocKy:read', 'staff:login'), (req, res) => {
        app.model.dtDmHocKy.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dt/hoc-ky', app.permission.check('dtDmHocKy:write'), (req, res) => {
        app.model.dtDmHocKy.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dt/hoc-ky', app.permission.check('dtDmHocKy:write'), (req, res) => {
        app.model.dtDmHocKy.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/dt/hoc-ky', app.permission.check('dtDmHocKy:delete'), (req, res) => {
        app.model.dtDmHocKy.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};