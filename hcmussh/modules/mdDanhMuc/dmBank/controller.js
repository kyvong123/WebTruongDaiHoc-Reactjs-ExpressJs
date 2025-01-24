module.exports = app => {
    app.permission.add('dmBank:read', 'dmBank:write', 'dmBank:delete', 'dmPhuongThucThanhToan:read', 'dmPhuongThucThanhToan:write', 'dmPhuongThucThanhToan:delete');

    app.permissionHooks.add('staff', 'addRolesTcPhuongThucThanhToan', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'dmBank:read', 'dmBank:write', 'dmBank:delete', 'dmPhuongThucThanhToan:read', 'dmPhuongThucThanhToan:write', 'dmPhuongThucThanhToan:delete');
            resolve();
        } else resolve();
    }));

    app.get('/api/danh-muc/phuong-thuc-thanh-toan/page/:pageNumber/:pageSize', app.permission.check('dmPhuongThucThanhToan:read'), async (req, res) => {
        try {
            const page = await app.model.dmPhuongThucThanhToan.getPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), {
                statement: 'ma like :st OR bank like :st',
                parameter: { st: `%${req.query.condition || ''}%` }
            });
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/bank/page/:pageNumber/:pageSize', app.permission.check('dmBank:read'), async (req, res) => {
        try {
            const page = await app.model.dmBank.getPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), {
                statement: 'ma like :st OR ten like :st',
                parameter: { st: `%${req.query.condition || ''}%` }
            });
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/bank/all', app.permission.check('user:login'), async (req, res) => {
        try {
            const items = await app.model.dmBank.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/bank/item/:ma', app.permission.check('dmBank:read'), async (req, res) => {
        try {
            const item = await app.model.dmBank.get({ ma: req.params.ma });
            if (!item) throw 'Không tìm thấy ngân hàng';
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/phuong-thuc-thanh-toan/item/:ma', app.permission.check('dmBank:read'), async (req, res) => {
        try {
            const item = await app.model.dmPhuongThucThanhToan.get({ ma: req.params.ma });
            if (!item) throw 'Không tìm thấy phương thức thanh toán';
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};

