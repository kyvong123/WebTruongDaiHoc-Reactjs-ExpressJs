module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7002: {
                title: 'Khoá đào tạo', groupIndex: 1, parentKey: 7027,
                link: '/user/dao-tao/data-dictionary/khoa-dao-tao'
            }
        }
    };

    app.permission.add(
        { name: 'dtKhoaDaoTao:read', menu }, 'dtKhoaDaoTao:write', 'dtKhoaDaoTao:delete'
    );

    app.permissionHooks.add('staff', 'addRoleKhoaDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtKhoaDaoTao:read', 'dtKhoaDaoTao:write');
            resolve();
        } else resolve();
    }));
    app.get('/user/dao-tao/data-dictionary/khoa-dao-tao', app.permission.check('dtKhoaDaoTao:read'), app.templates.admin);

    // API ----------------------------------------------------------------------------------------------------
    app.get('/api/dt/khoa-dao-tao/page/:pageNumber/:pageSize', app.permission.check('dtKhoaDaoTao:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtKhoaDaoTao.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/khoa-dao-tao/all', app.permission.orCheck('dtKhoaDaoTao:read', 'staff:login'), async (req, res) => {
        try {
            let items = await app.model.dtKhoaDaoTao.getAll(req.query || {}, '*', 'namTuyenSinh DESC, he ASC, dotTuyenSinh DESC');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/khoa-sinh-vien/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const { shcc, permissions } = req.session.user;
            let items = [];
            const roles = await app.model.dtAssignRole.getAll({
                statement: 'shcc = :shcc AND role LIKE :role',
                parameter: { shcc, role: `%${req.query.role}%` }
            });
            if (roles.length && !permissions.includes('quanLyDaoTao:DaiHoc')) {
                items = roles.flatMap(i => i.khoaSinhVien.split(','));
                items = [...new Set(items)];
            } else {
                items = await app.model.dtKhoaDaoTao.getKhoaSinhVien(req.query.searchTerm || '');
                items = items.rows.map(item => item.namTuyenSinh);
            }
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/khoa-sinh-vien/get-list', app.permission.check('user:login'), async (req, res) => {
        try {
            let items = await app.model.dtKhoaDaoTao.getKhoaSinhVien(req.query.searchTerm || '');
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/khoa-sinh-vien/get-khoa-sinh-vien', app.permission.check('user:login'), async (req, res) => {
        try {
            let items = await app.model.dtKhoaDaoTao.getKhoaSinhVien(req.query.searchTerm || '');
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/khoa-sinh-vien/item/:khoaSinhVien', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.dtKhoaDaoTao.get({ namTuyenSinh: req.params.khoaSinhVien });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/khoa-dao-tao/item/:maKhoa', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.dtKhoaDaoTao.get({ maKhoa: req.params.maKhoa });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/khoa-dao-tao', app.permission.check('dtKhoaDaoTao:write'), async (req, res) => {
        try {
            let { data } = req.body;
            if (!data.dotTuyenSinh) data.dotTuyenSinh = '1';
            let khoa = await app.model.dtKhoaDaoTao.get({ dotTuyenSinh: data.dotTuyenSinh, he: data.he, namTuyenSinh: data.namTuyenSinh });
            if (khoa) throw 'Khóa đào tạo đã tồn tại';
            await app.model.dtKhoaDaoTao.create(req.body.data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};