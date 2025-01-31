module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4043: { title: 'Loại hợp đồng', link: '/user/category/loai-hop-dong' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiHopDong:read', menu },
        { name: 'dmLoaiHopDong:write' },
        { name: 'dmLoaiHopDong:delete' }
    );
    app.permissionHooks.add('staff', 'addRolesDmLoaiHopDong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'dmLoaiHopDong:read', 'dmLoaiHopDong:write', 'dmLoaiHopDong:delete');
            resolve();
        } else resolve();
    }));
    app.get('/user/category/loai-hop-dong', app.permission.check('dmLoaiHopDong:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-hop-dong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmLoaiHopDong.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-hop-dong/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmLoaiHopDong.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-hop-dong/item/:ma', app.permission.orCheck('dmLoaiHopDong:read', 'staff:login'), async (req, res) => {
        try {
            let item = await app.model.dmLoaiHopDong.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/loai-hop-dong', app.permission.check('dmLoaiHopDong:write'), (req, res) => {
        app.model.dmLoaiHopDong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-hop-dong', app.permission.check('dmLoaiHopDong:write'), (req, res) => {
        app.model.dmLoaiHopDong.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/loai-hop-dong', app.permission.check('dmLoaiHopDong:delete'), (req, res) => {
        app.model.dmLoaiHopDong.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};