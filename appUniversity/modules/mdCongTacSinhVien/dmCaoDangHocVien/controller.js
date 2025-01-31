module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6115: { title: 'Danh mục trường cao đẳng', icon: 'fa-university', link: '/user/ctsv/dm-cao-dang', groupIndex: 3, parentKey: 6150 }
        }
    };

    app.permission.add(
        { name: 'ctsvCaoDang:manage', menu: menuCtsv },
        'ctsvCaoDang:write',
        'ctsvCaoDang:delete'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvCaoDang', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvCaoDang:manage', 'ctsvCaoDang:write', 'ctsvCaoDang:delete');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/dm-cao-dang', app.permission.check('ctsvCaoDang:manage'), app.templates.admin);

    // API ========================================================================================

    app.get('/api/ctsv/dm-cao-dang/active/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const { searchTerm = '' } = req.query,
                condition = {
                    statement: 'kichHoat = 1 AND (lower(TEN_TRUONG) LIKE :searchTerm)',
                    parameter: {
                        searchTerm: `%${searchTerm.toLowerCase().trim()}%`
                    }
                },
                items = await app.model.dmCaoDangHocVien.getAll(condition);
            // console.log(items);
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-cao-dang/page', app.permission.check('ctsvCaoDang:manage'), async (req, res) => {
        try {
            const { pageNumber, pageSize, pageCondition } = req.query;
            const page = await app.model.dmCaoDangHocVien.getPage(parseInt(pageNumber), parseInt(pageSize), pageCondition);
            res.send({ page });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-cao-dang/item', app.permission.check('user:login'), async (req, res) => {
        try {
            const { ma } = req.query,
                item = await app.model.dmCaoDangHocVien.get({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dm-cao-dang', app.permission.check('ctsvCaoDang:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.dmCaoDangHocVien.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dm-cao-dang', app.permission.check('ctsvCaoDang:manage'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const item = await app.model.dmCaoDangHocVien.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dm-cao-dang', app.permission.check('ctsvCaoDang:manage'), async (req, res) => {
        try {
            const { ma } = req.body;
            await app.model.dmCaoDangHocVien.delete({ ma });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};