module.exports = app => {
    const quanLyMenu = {
        parentMenu: app.parentMenu.tmdt,
        menus: {
            10002: { title: 'Quản lý Sản phẩm', link: '/user/tmdt/y-shop/admin/san-pham-manage', icon: 'fa fa-shopping-bag', groupIndex: 0 },
        },
    };

    const { tmdtAdminSanPhamManageRead, tmdtAdminSanPhamManageWrite, tmdtAdminSanPhamManageDelete } = require('../../permission.js')();

    app.permission.add(
        { name: tmdtAdminSanPhamManageRead, menu: quanLyMenu },
        { name: tmdtAdminSanPhamManageWrite },
        { name: tmdtAdminSanPhamManageDelete },
    );

    app.get('/user/tmdt/y-shop/admin/san-pham/:id', app.permission.check(tmdtAdminSanPhamManageRead), app.templates.admin);
    app.get('/user/tmdt/y-shop/admin/san-pham-manage', app.permission.check(tmdtAdminSanPhamManageRead), app.templates.admin);
    const { getSanPhamUploadFolder, getSanPhamSaveFolder, getSanPhamSaveUrl } = require('./util.js')(app);

    app.get('/api/tmdt/y-shop/admin/san-pham/page/:pageNumber/:pageSize', app.permission.check(tmdtAdminSanPhamManageRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtSanPham.searchPageWithImages(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/admin/san-pham/:id', app.permission.check(tmdtAdminSanPhamManageRead), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = await app.model.tmdtSanPham.getItemDetail(id);
            const images = app.fs.existsSync(getSanPhamSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamSaveFolder(item.id));
            if (images) {
                item.imagesUrl = images.map(url => app.path.join(getSanPhamSaveUrl(item.id), url));
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/y-shop/admin/san-pham', app.permission.check(tmdtAdminSanPhamManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const newItem = req.body.data;
            const item = await app.model.tmdtSanPham.create(newItem);
            // Save tags
            if (newItem.tagList || typeof newItem.tagList == 'string') {
                const newTagList = newItem.tagList ? newItem.tagList.split(',') : [];
                Promise.all(newTagList.map(async (tag) => { await app.model.tmdtSanPhamTagMap.create({ maSanPham: item.id, maTag: tag }); })).catch((error) => app.consoleError(req, error));
            }
            await saveSanPhamImagesWithAdminPermission(req, user, item);
            modifySanPhamLogging(item.id, 'Tạo sản phẩm', user);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/san-pham', app.permission.check(tmdtAdminSanPhamManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const { changes, id } = req.body;
            let item = await app.model.tmdtSanPham.update({ id }, changes);
            if (changes.tagList || typeof changes.tagList == 'string') {
                // Clear hết tag cũ
                await app.model.tmdtSanPhamTagMap.delete({ maSanPham: item.id });
                // Tạo các tag mới
                const newTagList = changes.tagList ? changes.tagList.split(',') : [];
                Promise.all(newTagList.map(async (tag) => { await app.model.tmdtSanPhamTagMap.create({ maSanPham: item.id, maTag: tag }); })).catch((error) => app.consoleError(req, error));
            }
            await saveSanPhamImagesWithAdminPermission(req, user, item);
            modifySanPhamLogging(item.id, 'Cập nhật sản phẩm', user);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/san-pham/toggle/kich-hoat', app.permission.orCheck(tmdtAdminSanPhamManageWrite), async (req, res) => {
        try {
            let item = await app.model.tmdtSanPham.update({ id: req.body.id }, { kichHoat: req.body.kichHoat });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/y-shop/admin/san-pham', app.permission.orCheck(tmdtAdminSanPhamManageDelete, 'developer:login'), async (req, res) => {
        try {
            const { id } = req.body;
            const user = req.session.user;
            await app.model.tmdtSanPhamTagMap.delete({ maSanPham: id });
            await app.model.tmdtCauHinhSanPham.delete({ maSanPham: id });
            let item = await app.model.tmdtSanPham.delete({ id });
            modifySanPhamLogging(item.id, 'Xóa sản phẩm', user);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/y-shop/san-pham/clear-unsave', app.permission.check(tmdtAdminSanPhamManageDelete), async (req, res) => {
        try {
            const user = req.session.user;
            const folderPath = getSanPhamUploadFolder(user.email);

            // Clear hết files trong thư mục người dùng (tránh lỗi socket chưa bắn về để cập nhật danh sách hình cần xóa mới trên client mà người dùng đã thoát / refresh trang
            const images = app.fs.existsSync(folderPath) && app.fs.readdirSync(folderPath);
            if (images) {
                for (const img of images) {
                    let filePath = app.path.join(folderPath, img);
                    app.fs.unlinkSync(filePath);
                }
            }
            res.send();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const modifySanPhamLogging = async (itemId, actionName, user) => {
        await app.model.tmdtEditSanPhamLog.create({ adminEmail: user.email, tenEditType: actionName, maItem: itemId, createdAt: Date.now() });
    };

    const saveSanPhamImagesWithAdminPermission = async (req, user, item) => {
        const userUploadFolder = getSanPhamUploadFolder(user.email);
        const imageFiles = app.fs.existsSync(userUploadFolder) && app.fs.readdirSync(userUploadFolder);

        if (imageFiles && imageFiles.length > 0) {
            app.model.tmdtSanPham.update({ id: item.id }, { ...(imageFiles && imageFiles.length > 0) && { defaultImage: app.path.join(getSanPhamSaveUrl(item.id), imageFiles[0]) } });
            imageFiles && imageFiles.length && await Promise.all(imageFiles.map(async (img) => {
                return await app.fs.rename(app.path.join(userUploadFolder, img), app.path.join(getSanPhamSaveFolder(item.id), img));
            })).catch((error) => app.consoleError(req, error));
        }
    };
};
