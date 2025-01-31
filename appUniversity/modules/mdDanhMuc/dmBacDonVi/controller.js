module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4109: { title: 'Bậc đơn vị', link: '/user/category/bac-don-vi' },
        },
    };
    app.permission.add(
        { name: 'dmBacDonVi:read', menu },
        { name: 'dmBacDonVi:write' },
        { name: 'dmBacDonVi:delete' },
    );
    app.get('/user/category/bac-don-vi', app.permission.check('dmDonVi:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/bac-don-vi/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmBacDonVi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/danh-muc/bac-don-vi/page/:pageNumber/:pageSize', app.permission.check('dmBacDonVi:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {};
            filter.ks_kichHoat = req.query.ks_kichHoat || '';
            console.log(filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmBacDonVi.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    }
    );

    app.post('/api/danh-muc/bac-don-vi', app.permission.check('dmBacDonVi:write'), (req, res) => {
        app.model.dmBacDonVi.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/bac-don-vi', app.permission.check('dmBacDonVi:write'), (req, res) => {
        app.model.dmBacDonVi.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });
};
