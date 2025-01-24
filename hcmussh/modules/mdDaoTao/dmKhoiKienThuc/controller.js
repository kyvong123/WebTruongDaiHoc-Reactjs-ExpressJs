module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7013: {
                title: 'Khối kiến thức', link: '/user/dao-tao/khoi-kien-thuc', groupIndex: '2', parentKey: 7027
            }
        }
    };

    app.permission.add(
        { name: 'dmKhoiKienThuc:read', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dmKhoiKienThuc:write' },
        { name: 'dmKhoiKienThuc:delete' }
    );

    app.get('/user/dao-tao/khoi-kien-thuc', app.permission.orCheck('dmKhoiKienThuc:read', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtKhoiKienThuc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dmKhoiKienThuc:read', 'dmKhoiKienThuc:write', 'dmKhoiKienThuc:delete');
            resolve();
        } else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/khoi-kien-thuc/page/:pageNumber/:pageSize', app.permission.orCheck('dmKhoiKienThuc:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
        app.model.dmKhoiKienThuc.searchPage(pageNumber, pageSize, searchTerm, (error, result) => {
            if (error) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/dt/khoi-kien-thuc/all', app.permission.check('dmKhoiKienThuc:read'), (req, res) => {
        let searchTerm = `%${req.query.condition || ''}%`,
            khoiCha = req.query.khoiCha;
        app.model.dmKhoiKienThuc.getAll({
            statement: '(:khoiCha = 0 OR khoiCha = :khoiCha) AND lower(ten) LIKE :searchTerm',
            parameter: {
                searchTerm, khoiCha: khoiCha ? parseInt(khoiCha) : 0
            }
        }, (error, items) => res.send({ error, items }));
    });

    app.get('/api/dt/khoi-kien-thuc/item/:ma', app.permission.orCheck('dmKhoiKienThuc:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dmKhoiKienThuc.get({ ma: req.params.ma }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/dt/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:write'), (req, res) =>
        app.model.dmKhoiKienThuc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/dt/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:write'), (req, res) =>
        app.model.dmKhoiKienThuc.update({ ma: req.body.ma }, req.body.changes || {}, (error, item) => res.send({ error, item })));

    app.delete('/api/dt/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:delete'), (req, res) =>
        app.model.dmKhoiKienThuc.delete({ ma: req.body.ma }, error => res.send({ error })));
};