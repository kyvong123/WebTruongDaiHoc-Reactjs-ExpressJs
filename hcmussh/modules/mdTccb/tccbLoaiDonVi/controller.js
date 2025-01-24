module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3051: { title: 'Loại đơn vị', link: '/user/tccb/loai-don-vi', icon: 'fa-list', backgroundColor: '#4297ff', pin: true },
        },
    };

    app.permission.add(
        { name: 'tccbLoaiDonVi:read', menu },
        { name: 'tccbLoaiDonVi:write' },
        { name: 'tccbLoaiDonVi:delete' },
    );

    app.get('/user/tccb/loai-don-vi', app.permission.check('tccbLoaiDonVi:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleLoaiDonVi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbLoaiDonVi:read', 'tccbLoaiDonVi:write');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // TCCB_LOAI_DON_VI
    //---------------------------
    app.get('/api/tccb/loai-don-vi/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber)
                , _pageSize = parseInt(req.params.pageSize)
                , searchTerm = typeof req.params.condition == 'string' ? req.params.condition : '';
            const filter = app.utils.stringify(req.query.filter || {});
            const { rows: list, pagenumber: pageNumber, pagesize: pageSize, totalitem: totalItem, pagetotal: pageTotal } = await app.model.tccbLoaiDonVi.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            app.tccbSaveCRUD(req.session.user.email, 'R', 'Loại đơn vị');
            res.send({ page: { totalItem, pageTotal, pageSize, pageNumber, list, pageCondition: searchTerm } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/loai-don-vi/all', app.permission.check('user:login'), async (req, res) => {
        try {
            let pageCondition = {};
            if (req.query) {
                const { condition, kichHoat } = req.query;
                pageCondition.statement = 'lower(ten) LIKE :searchTerm';
                pageCondition.parameter = {
                    searchTerm: `%${condition ? condition.toLowerCase() : ''}%`
                };
                if (kichHoat != null) {
                    pageCondition.statement += ' AND kichHoat = :kichHoat';
                    pageCondition.parameter.kichHoat = Number(kichHoat);
                }
            }
            const items = await app.model.tccbLoaiDonVi.getAll(pageCondition, '*', 'id');
            app.tccbSaveCRUD(req.session.user.email, 'R', 'Loại đơn vị');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/loai-don-vi/item/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            const item = await app.model.tccbLoaiDonVi.get({ id: req.params.id });
            app.tccbSaveCRUD(req.session.user.email, 'R', 'Loại đơn vị');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/loai-don-vi', app.permission.check('tccbLoaiDonVi:write'), async (req, res) => {
        try {
            const item = await app.model.tccbLoaiDonVi.create(req.body.item);
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Loại đơn vị');
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/loai-don-vi', app.permission.check('tccbLoaiDonVi:write'), async (req, res) => {
        try {
            const items = await app.model.tccbLoaiDonVi.update({ id: req.body.id }, req.body.changes);
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Loại đơn vị');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/loai-don-vi', app.permission.check('tccbLoaiDonVi:delete'), async (req, res) => {
        try {
            await app.model.tccbLoaiDonVi.delete({ id: req.body.id });
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Loại đơn vị');
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};