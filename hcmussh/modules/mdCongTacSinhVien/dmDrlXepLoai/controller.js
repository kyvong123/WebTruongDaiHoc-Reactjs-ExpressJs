module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6122: { title: 'Xếp loại điểm rèn luyện', parentKey: 6129, icon: 'fa-university', link: '/user/ctsv/drl-xep-loai', backgroundColor: '#fcba03', groupIndex: 2 }
        }
    };

    app.permission.add(
        { name: 'ctsvDrlXepLoai:manage', menu: menuCtsv },
        'ctsvDrlXepLoai:write',
        'ctsvDrlXepLoai:delete'
    );

    app.permissionHooks.add('staff', 'addRolectsvDrlXepLoai', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvDrlXepLoai:manage', 'ctsvDrlXepLoai:write', 'ctsvDrlXepLoai:delete');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/drl-xep-loai', app.permission.check('ctsvDrlXepLoai:manage'), app.templates.admin);

    // API ========================================================================================


    app.get('/api/ctsv/drl-xep-loai/active/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const { searchTerm = '' } = req.query,
                condition = {
                    statement: 'kichHoat = 1 AND (lower(TEN) LIKE :searchTerm)',
                    parameter: {
                        searchTerm: `%${searchTerm.toLowerCase().trim()}%`
                    }
                },
                items = await app.model.dmDrlXepLoai.getAll(condition);
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/drl-xep-loai/all', app.permission.check('ctsvDrlXepLoai:manage'), async (req, res) => {
        try {
            const items = await app.model.dmDrlXepLoai.getAll();
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/drl-xep-loai/page', app.permission.check('ctsvDrlXepLoai:manage'), async (req, res) => {
        try {
            const { pageNumber, pageSize, pageCondition } = req.query;
            const page = await app.model.dmDrlXepLoai.getPage(parseInt(pageNumber), parseInt(pageSize), pageCondition);
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/drl-xep-loai/item', app.permission.check('user:login'), async (req, res) => {
        try {
            const { ma } = req.query,
                item = await app.model.dmDrlXepLoai.get({ ma });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/drl-xep-loai', app.permission.check('ctsvDrlXepLoai:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.dmDrlXepLoai.create(data);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/drl-xep-loai', app.permission.check('ctsvDrlXepLoai:manage'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const item = await app.model.dmDrlXepLoai.update({ ma }, changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/drl-xep-loai', app.permission.check('ctsvDrlXepLoai:manage'), async (req, res) => {
        try {
            const { ma } = req.body;
            await app.model.dmDrlXepLoai.delete({ ma });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};