module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5004: { title: 'Loại phí', link: '/user/finance/loai-phi', icon: 'fa fa-filter', backgroundColor: '#00AA00', color: '#000', groupIndex: 0 } },
    };

    app.permission.add(
        { name: 'tcLoaiPhi:read', menu },
        { name: 'tcLoaiPhi:write' },
        { name: 'tcLoaiPhi:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcLoaiPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcLoaiPhi:read', 'tcLoaiPhi:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/finance/loai-phi', app.permission.check('tcLoaiPhi:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/loai-phi/page/:pageNumber/:pageSize', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ten) LIKE: searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            let page = await app.model.tcLoaiPhi.getPage(pageNumber, pageSize, condition, '*', 'ten');
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/loai-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ten) LIKE: searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            let page = await app.model.tcLoaiHocPhi.getPage(pageNumber, pageSize, condition, '*', 'main');
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/loai-phi/all', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            let items = await app.model.tcLoaiPhi.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/loai-phi/item/:id', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            const item = await app.model.tcLoaiPhi.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/loai-hoc-phi/all', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            let items = await app.model.tcLoaiHocPhi.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/loai-hoc-phi/item/:id', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            const item = await app.model.tcLoaiHocPhi.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/khtc/loai-phi', app.permission.check('tcLoaiPhi:write'), async (req, res) => {
        try {
            let item = await app.model.tcLoaiPhi.create(req.body.data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/khtc/loai-phi', app.permission.check('tcLoaiPhi:write'), async (req, res) => {
        try {
            let item = await app.model.tcLoaiPhi.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/khtc/loai-phi', app.permission.check('tcLoaiPhi:delete'), async (req, res) => {
        try {
            await app.model.tcLoaiPhi.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


    app.post('/api/khtc/loai-phi/ap-dung', app.permission.check('tcLoaiPhi:write'), async (req, res) => {
        try {
            const { hocKy, namHoc, loaiPhi, namTuyenSinh, bacDaoTao, loaiDaoTao, soTien } = req.body;
            const data = { hocKy, namHoc, loaiPhi, namTuyenSinh, bacDaoTao, loaiDaoTao, soTien: parseInt(soTien), ngayTao: new Date().getTime() };
            Object.values(data).forEach(item => { if (item == null) throw 'Dữ liệu không hợp lệ'; });
            if (data.soTien < 0) throw 'Số tiền không hợp lệ';
            data.shcc = req.session.user.shcc;
            const result = await app.model.tcHocPhiDetail.bulkCreate(app.utils.stringify(data));
            res.send({ sum: result.outBinds.ret });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};