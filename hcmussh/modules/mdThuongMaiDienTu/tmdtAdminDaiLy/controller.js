module.exports = app => {
    const quanLyMenu = {
        parentMenu: app.parentMenu.tmdt,
        menus: {
            10001: { title: 'Quản lý Đại lý', link: '/user/tmdt/y-shop/admin/dai-ly-manage', icon: 'fa fa-shopping-bag', groupIndex: 0 },
        },
    };

    const { tmdtAdminDaiLyManageRead, tmdtAdminDaiLyManageWrite, tmdtAdminDaiLyManageDelete, tmdtUserSanPhamHomePage } = require('../permission.js')();

    app.permission.add(
        { name: tmdtAdminDaiLyManageRead, menu: quanLyMenu },
        { name: tmdtAdminDaiLyManageWrite },
        { name: tmdtAdminDaiLyManageDelete },
    );

    app.get('/user/tmdt/y-shop/admin/dai-ly-manage', app.permission.check(tmdtAdminDaiLyManageRead), app.templates.admin);

    /**
     * Dùng cho FormSelect thêm bớt người vào đại lý
     */
    app.get('/api/tmdt/y-shop/admin/get-university-member-list/:pageNumber/:pageSize', app.permission.check(tmdtAdminDaiLyManageWrite), async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(shcc) LIKE :searchText OR lower(lastName || \' \' || firstName) LIKE :searchText OR email LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            const page = await app.model.fwUser.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/admin/dai-ly/page/:pageNumber/:pageSize', app.permission.orCheck(tmdtAdminDaiLyManageRead, tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtDaiLy.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/admin/dai-ly/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            let item = await app.model.tmdtDaiLy.get({ id });
            res.send({ item });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/y-shop/admin/dai-ly', app.permission.check(tmdtAdminDaiLyManageWrite), async (req, res) => {
        try {
            const newItem = req.body.data;
            let item = await app.model.tmdtDaiLy.create(newItem);
            if (newItem.thanhVienEmailList || typeof newItem.thanhVienEmailList == 'string') {
                const newThanhVienEmailList = newItem.thanhVienEmailList ? newItem.thanhVienEmailList.split(',') : [];
                for (const email of newThanhVienEmailList) {
                    await app.model.tmdtThanhVienDaiLy.create({ email, maDaiLy: item.id });
                }
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/dai-ly', app.permission.check(tmdtAdminDaiLyManageWrite), async (req, res) => {
        try {
            const { changes, id } = req.body;
            let item = await app.model.tmdtDaiLy.update({ id }, changes);
            if (changes.thanhVienEmailList || typeof changes.thanhVienEmailList == 'string') {
                const newThanhVienEmailList = changes.thanhVienEmailList ? changes.thanhVienEmailList.split(',') : [];
                const currentThanhVienEmailList = (await app.model.tmdtThanhVienDaiLy.getAll({ maDaiLy: req.body.id }, 'email')).map(object => object.email);
                const deleteList = currentThanhVienEmailList.difference(newThanhVienEmailList);
                const createList = newThanhVienEmailList.difference(currentThanhVienEmailList);
                for (const email of deleteList) {
                    await app.model.tmdtThanhVienDaiLy.delete({ email, maDaiLy: req.body.id });
                }
                for (const email of createList) {
                    await app.model.tmdtThanhVienDaiLy.create({ email, maDaiLy: req.body.id });
                }
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/y-shop/admin/dai-ly', app.permission.check(tmdtAdminDaiLyManageDelete), async (req, res) => {
        try {
            const { id } = req.body;
            let item = await app.model.body.delete({ id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};