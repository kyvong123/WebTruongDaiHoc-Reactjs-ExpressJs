module.exports = app => {
    const { tmdtUserSanPhamHomePage } = require('../../permission.js')();
    const { getCauHinhSaveUrl, getCauHinhSaveFolder } = require('../../tmdtAdminSanPham/controller/util.js')(app);

    app.permissionHooks.add('staff', 'addRoleYShopUserStaff', (user, staff) => new Promise(resolve => {
        if (staff) {
            app.permissionHooks.pushUserPermission(user, 'tmdtUserSanPhamHomePage:read');
        }
        resolve();
    }));

    app.permissionHooks.add('student', 'addRoleYShopUserStudent', (user) => new Promise(resolve => {
        if (user) {
            app.permissionHooks.pushUserPermission(user, 'tmdtUserSanPhamHomePage:read');
        }
        resolve();
    }));


    app.permission.add(
        { name: tmdtUserSanPhamHomePage },
        { name: 'tmdtUserSanPhamHomePage:readTest' }
    );

    app.get('/user/tmdt/y-shop/user/san-pham/home-page', app.permission.check(tmdtUserSanPhamHomePage), app.templates.admin);

    app.get('/api/tmdt/user/home/page/:pageNumber/:pageSize', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};

            let page = await app.model.tmdtDaiLy.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            for (let daiLy of list) {
                let shopFilter = { 'maDaiLy': daiLy.id.toString() };
                daiLy.itemList = await app.model.tmdtSanPham.searchUserHomePageWithImages(1, 4, app.utils.stringify(shopFilter), searchTerm).then(data => data.rows);
            }
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/user/home/san-pham/page/:pageNumber/:pageSize', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                /**
                 * filter: {
                 * 'maDaiLy': 0,
                 * 'maLoaiSanPham': 1,
                 * 'tagList': [1,2,3,4],
                 * 'tagListFilterMode': 'OR' // hoặc 'AND'
                 * }
                 */
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtSanPham.searchUserHomePageWithImages(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/user/cart/info', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const email = req.session.user.email;
            let gioHang = await app.model.tmdtGioHang.getGioHang(email).then(data => data.rows);
            res.send({ info: { totalItem: gioHang.reduce((cur, item) => cur + item.soLuong, 0) } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/user/cart', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const email = req.session.user.email;
            let gioHang = await app.model.tmdtGioHang.getGioHang(email).then(data => data.rows);
            res.send({ gioHang, totalItem: gioHang.reduce((cur, item) => cur + item.soLuong, 0), totalPrice: gioHang.reduce((cur, item) => cur + item.soLuong * item.gia, 0) });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


    app.post('/api/tmdt/user/add-to-cart', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const email = req.session.user.email;
            const { maSanPham, maConfig, gia, soLuong } = req.body.data;
            const check = await app.model.tmdtGioHang.get({ userEmail: email, maSanPham, maConfig }, 'id,soLuong');
            let item;
            if (check) {
                let newSoLuong = soLuong + check.soLuong;
                item = await app.model.tmdtGioHang.update({ id: check.id }, { gia, soLuong: newSoLuong });
            } else {
                item = await app.model.tmdtGioHang.create({ userEmail: email, maSanPham, maConfig, gia, soLuong });
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/user/update-cart-item', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const { id, gia, soLuong, maConfig } = req.body.data;
            const item = await app.model.tmdtGioHang.update({ id: id }, { gia, soLuong, maConfig });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/user/delete-cart-item', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.tmdtGioHang.delete({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.get('/api/tmdt/user/item-config/:id', app.permission.check(tmdtUserSanPhamHomePage), async (req, res) => {
        try {
            const id = req.params.id;
            let config = await app.model.tmdtCauHinhSanPham.getAll({ maSanPham: id, kichHoat: 1 });
            config.forEach(item => {
                if (app.fs.existsSync(getCauHinhSaveFolder(item.id)) && app.fs.readdirSync(getCauHinhSaveFolder(item.id)).length > 0) item.image = app.path.join(getCauHinhSaveUrl(item.id), app.fs.readdirSync(getCauHinhSaveFolder(item.id))[0]);
            });
            res.send({ config });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


};