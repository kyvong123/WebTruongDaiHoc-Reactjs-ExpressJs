module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7059: {
                title: 'Lịch sử nhập điểm', link: '/user/dao-tao/grade-manage/lich-su', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-history',
                parentKey: 7047
            },
        }
    };
    app.permission.add(
        { name: 'dtDiemHistory:read', menu }, 'dtDiemHistory:write', 'dtDiemHistory:delete', 'dtDiemHistory:export'
    );

    app.permissionHooks.add('staff', 'addRoleDtDiemHistory', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemHistory:read', 'dtDiemHistory:write', 'dtDiemHistory:delete', 'dtDiemHistory:export');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/grade-manage/lich-su', app.permission.check('dtDiemHistory:read'), app.templates.admin);


    // API---------------------------------
    app.get('/api/dt/diem-history/page/:pageNumber/:pageSize', app.permission.orCheck('dtDiemHistory:read', 'dtDiemAll:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtDiemHistory.searchPage(_pageNumber, _pageSize, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-history/modal/:pageNumber/:pageSize', app.permission.orCheck('dtDiemHistory:read', 'dtDiemAll:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtDiemHistory.searchPage(_pageNumber, _pageSize, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-history/export', app.permission.check('dtDiemHistory:read'), async (req, res) => {
        try {
            const { filter } = req.query;

            app.service.executeService.run({
                email: req.session.user.email,
                param: { filter },
                task: 'exportHistoryDiem',
                path: '/user/dao-tao/grade-manage/lich-su',
                isExport: 1,
                taskName: 'Export dữ liệu lịch sử điểm',
            });

            res.send({});
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};