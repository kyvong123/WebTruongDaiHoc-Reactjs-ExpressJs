module.exports = app => {
    const daiLyMenu = {
        parentMenu: app.parentMenu.tmdt,
        menus: {
            10008: { title: 'Đại lý của Tôi', link: '/user/tmdt/y-shop/seller/my-dai-ly', icon: 'fa fa-shopping-bag', groupIndex: 1 },
        },
    };

    const { tmdtSellerSanPhamDraftRead } = require('../../permission.js')();

    app.permission.add(
        { name: tmdtSellerSanPhamDraftRead, menu: daiLyMenu },
    );

    app.get('/user/tmdt/y-shop/seller/my-dai-ly', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);
    app.get('/user/tmdt/y-shop/seller/my-dai-ly/:id', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);
    app.get('/user/tmdt/y-shop/seller/my-dai-ly/:id/info', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);

    app.get('/api/tmdt/y-shop/seller/get-my-dai-ly/all', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '', filter = req.query.filter ?? {};
            const user = req.session.user;
            let page = await app.model.tmdtDaiLy.searchPageByEmail(1, 1000, app.utils.stringify(filter), searchTerm, user.email);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/my-dai-ly/info/:id', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            if (!req.params.id) throw 'Không tìm thấy đại lý';
            const user = req.session.user;
            const thanhVienDaiLyItem = await app.model.tmdtThanhVienDaiLy.get({ maDaiLy: req.params.id, email: user.email });
            if (!thanhVienDaiLyItem) throw 'Bạn không thuộc đại lý này';
            let item = await app.model.tmdtDaiLy.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/seller/my-dai-ly/info', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const user = req.session.user;
            const thanhVienDaiLyItem = await app.model.tmdtThanhVienDaiLy.get({ maDaiLy: req.body.maDaiLy, email: user.email });
            if (!thanhVienDaiLyItem) throw 'Bạn không thuộc đại lý này';
            let item = await app.model.tmdtDaiLy.update({ id: req.body.maDaiLy }, req.body.changes);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};