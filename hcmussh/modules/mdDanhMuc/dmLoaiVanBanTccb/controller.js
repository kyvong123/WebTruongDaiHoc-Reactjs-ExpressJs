module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4110: { title: 'Loại văn bản tổ chức cán bộ', link: '/user/category/loai-van-ban-tccb' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiVanBanTccb:read', menu },
        { name: 'dmLoaiVanBanTccb:write' },
        { name: 'dmLoaiVanBanTccb:delete' },
        { name: 'staff:login' },
    );
    app.get('/user/category/loai-van-ban-tccb', app.permission.check('dmLoaiVanBanTccb:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-van-ban-tccb/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.tccbDmLoaiVanBan.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/danh-muc/loai-van-ban-tccb/page/:pageNumber/:pageSize', app.permission.check('dmLoaiVanBanTccb:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {};
            filter.ks_kichHoat = req.query.ks_kichHoat || '';
            console.log(filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbDmLoaiVanBan.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    }
    );

    app.post('/api/danh-muc/loai-van-ban-tccb', app.permission.check('dmLoaiVanBanTccb:write'), (req, res) => {
        app.model.tccbDmLoaiVanBan.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-van-ban-tccb', app.permission.check('dmLoaiVanBanTccb:write'), (req, res) => {
        app.model.tccbDmLoaiVanBan.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });
};