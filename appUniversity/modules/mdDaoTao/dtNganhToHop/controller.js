module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            // 7004: {
            //     title: 'Ngành đào tạo theo tổ hợp môn thi',
            //     groupIndex: 0,
            //     icon: 'fa-cubes', backgroundColor: '#738986',
            //     link: '/user/dao-tao/nganh-theo-to-hop-thi'
            // },
        },
    };
    app.permission.add(
        { name: 'dtNganhToHop:read', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtNganhToHop:write' },
        { name: 'dtNganhToHop:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDtNganhToHop', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtNganhToHop:read', 'dtNganhToHop:write', 'dtNganhToHop:delete');
            resolve();
        } else resolve();
    }));

    // app.get('/user/dao-tao/nganh-theo-to-hop-thi', app.permission.orCheck('dtNganhToHop:read', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/nganh-theo-to-hop-thi/page/:pageNumber/:pageSize', app.permission.orCheck('dtNganhToHop:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const user = req.session.user, permissions = user.permissions;
        let donVi = req.query.donViFilter;
        if (!permissions.includes('dtChuongTrinhDaoTao:read')) {
            if (user.staff.maDonVi) donVi = user.staff.maDonVi;
            else return res.send({ error: 'Permission denied!' });
        }
        app.model.dtNganhToHop.searchPage(pageNumber, pageSize, donVi, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = { searchTerm, donViFilter: donVi };
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/dt/nganh-theo-to-hop-thi/item/:id', app.permission.orCheck('dtNganhToHop:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtNganhToHop.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dt/nganh-theo-to-hop-thi', app.permission.check('dtNganhToHop:write'), (req, res) => {
        app.model.dtNganhToHop.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dt/nganh-theo-to-hop-thi', app.permission.check('dtNganhToHop:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dtNganhToHop.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dt/nganh-theo-to-hop-thi', app.permission.check('dtNganhToHop:delete'), (req, res) => {
        app.model.dtNganhToHop.delete({ id: req.body.id }, errors => res.send({ errors }));
    });
};