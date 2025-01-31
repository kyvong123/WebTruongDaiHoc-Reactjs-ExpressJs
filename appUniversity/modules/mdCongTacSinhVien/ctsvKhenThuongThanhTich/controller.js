module.exports = app => {

    const MA_CTSV = '32';

    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6144: { title: 'Danh mục thành tích', link: '/user/ctsv/dm-thanh-tich', groupIndex: 3 }
        }
    };

    app.permission.add(
        { name: 'ctsvThanhTich:read', menu: menuCtsv },
        'ctsvThanhTich:write',
        'ctsvThanhTich:delete'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvThanhTich', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_CTSV) {
            app.permissionHooks.pushUserPermission(user, 'ctsvThanhTich:read', 'ctsvThanhTich:write');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/dm-thanh-tich', app.permission.check('ctsvThanhTich:read'), app.templates.admin);

    // API
    app.get('/api/ctsv/dm-thanh-tich/all', app.permission.check('ctsvThanhTich:read'), async (req, res) => {
        try {
            const items = await app.model.svKhenThuongThanhTich.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-thanh-tich/active', app.permission.check('ctsvThanhTich:read'), async (req, res) => {
        try {
            const items = await app.model.svKhenThuongThanhTich.getAll({ kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dm-thanh-tich/item', app.permission.check('ctsvThanhTich:read'), async (req, res) => {
        try {
            const { id } = req.query;
            const item = await app.model.svKhenThuongThanhTich.get({ id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dm-thanh-tich', app.permission.check('ctsvKhenThuong:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.svKhenThuongThanhTich.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dm-thanh-tich', app.permission.check('ctsvKhenThuong:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.svKhenThuongThanhTich.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            console.log({ error });
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dm-thanh-tich', app.permission.check('ctsvThanhTich:write'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svKhenThuongThanhTich.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};