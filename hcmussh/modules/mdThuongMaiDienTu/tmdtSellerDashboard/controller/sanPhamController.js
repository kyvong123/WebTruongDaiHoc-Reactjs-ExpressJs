module.exports = app => {
    const { tmdtSellerSanPhamDraftRead, tmdtSellerSanPhamDraftWrite, tmdtSellerSanPhamDraftDelete } = require('../../permission.js')();

    app.permission.add(
        { name: tmdtSellerSanPhamDraftRead },
        { name: tmdtSellerSanPhamDraftWrite },
        { name: tmdtSellerSanPhamDraftDelete },

        { name: 'tmdtSellerSanPhamDraft:readTest' },
        { name: 'tmdtSellerSanPhamDraft:writeTest' },
        { name: 'tmdtSellerSanPhamDraft:deleteTest' },
    );

    app.permissionHooks.add('staff', 'addRoleYShopSellerStaff', (user, staff) => new Promise(resolve => {
        if (staff) {
            app.permissionHooks.pushUserPermission(user, 'tmdtSellerSanPhamDraft:read', 'tmdtSellerSanPhamDraft:write', 'tmdtSellerSanPhamDraft:delete');
        }
        resolve();
    }));

    app.permissionHooks.add('student', 'addRoleYShopSellerStudent', (user) => new Promise(resolve => {
        if (user) {
            app.permissionHooks.pushUserPermission(user, 'tmdtSellerSanPhamDraft:read', 'tmdtSellerSanPhamDraft:write', 'tmdtSellerSanPhamDraft:delete');
        }
        resolve();
    }));

    app.get('/user/tmdt/y-shop/seller/san-pham/:id', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);
    app.get('/user/tmdt/y-shop/seller/my-dai-ly/:id/san-pham', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);

    const { getSanPhamDraftUploadFolder, getSanPhamDraftSaveFolder } = require('./util.js')(app);

    app.get('/api/tmdt/y-shop/seller/get-my-dai-ly/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            const user = req.session.user;
            let page = await app.model.tmdtDaiLy.searchPageByEmail(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, user.email);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Danh sách task/sản phẩm đang duyệt của đại lý
    app.get('/api/tmdt/y-shop/seller/san-pham/draft/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                maDaiLy = parseInt(req.query.maDaiLy),
                filter = req.query.filter ?? {};
            const user = req.session.user;
            const thanhVienDaiLyItem = await app.model.tmdtThanhVienDaiLy.get({ maDaiLy, email: user.email });
            if (!thanhVienDaiLyItem) throw 'Bạn không thuộc đại lý này';
            let page = await app.model.tmdtDuyetTask.searchPageByDaiLyWithImages(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, maDaiLy);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Danh sách cấu hình đang duyệt của đại lý
    app.get('/api/tmdt/y-shop/seller/san-pham/cau-hinh/draft/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                maDaiLy = parseInt(req.query.maDaiLy),
                filter = req.query.filter ?? {};
            const user = req.session.user;
            const thanhVienDaiLyItem = await app.model.tmdtThanhVienDaiLy.get({ maDaiLy, email: user.email });
            if (!thanhVienDaiLyItem) throw 'Bạn không thuộc đại lý này';
            let page = await app.model.tmdtDuyetTask.searchCauHinhPageByDaiLy(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, maDaiLy);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/san-pham/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                maDaiLy = parseInt(req.query.maDaiLy),
                filter = req.query.filter ?? {};
            const user = req.session.user;
            const thanhVienDaiLyItem = await app.model.tmdtThanhVienDaiLy.get({ maDaiLy, email: user.email });
            if (!thanhVienDaiLyItem) throw 'Bạn không thuộc đại lý này';
            let page = await app.model.tmdtSanPham.searchPageByDaiLyWithImages(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, maDaiLy);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });



    app.get('/api/tmdt/y-shop/seller/san-pham/:id', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = await app.model.tmdtSanPham.getItemDetail(id);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/y-shop/seller/san-pham/draft/create', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            /**
             * TODO: Phải check req.session.user có tham gia đại lý này không
             */
            const user = req.session.user;
            let newItem = req.body.data;
            const { tagList } = newItem;
            const currentTime = Date.now();
            const duyetTask = await app.model.tmdtDuyetTask.create({ nguoiTaoEmail: user.email, nguoiDuyetEmail: null, tinhTrangDuyet: 0, maDuyetType: 1, rejectComment: null, createdAt: currentTime, lastUpdatedAt: currentTime });
            newItem = { ...newItem, maSanPham: null, tinhTrangDuyet: 0, maDuyetTask: duyetTask.id, createdAt: currentTime, lastUpdatedAt: currentTime };
            const draftItem = await app.model.tmdtSanPhamDraft.create(newItem);
            if (tagList || typeof tagList == 'string') {
                const newTagList = tagList ? tagList.split(',') : [];
                Promise.all(newTagList.map(async (tag) => {
                    await app.model.tmdtSanPhamTagMapDraft.create({ maSanPham: null, maTag: tag, maDuyetTask: duyetTask.id, tinhTrangDuyet: 0, maDuyetType: 1, createdAt: currentTime });
                }));
            }
            await saveSanPhamDraftImages(user, duyetTask);
            res.send({ item: draftItem });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/y-shop/seller/san-pham/draft/update', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            /**
             * TODO: Phải check req.session.user có tham gia đại lý này không
             */
            const user = req.session.user;
            let { changes, id } = req.body;
            const { tagList } = changes;
            const currentTime = Date.now();
            const duyetTask = await app.model.tmdtDuyetTask.create({ nguoiTaoEmail: user.email, nguoiDuyetEmail: null, tinhTrangDuyet: 0, maDuyetType: 2, rejectComment: null, createdAt: currentTime, lastUpdatedAt: currentTime });
            changes = { ...changes, maSanPham: id, tinhTrangDuyet: 0, maDuyetTask: duyetTask.id, createdAt: currentTime, lastUpdatedAt: currentTime };
            let draftItem = await app.model.tmdtSanPhamDraft.create(changes);
            if (tagList || typeof tagList == 'string') {
                const newTagList = tagList ? tagList.split(',') : [];
                Promise.all(newTagList.map(async (tag) => {
                    await app.model.tmdtSanPhamTagMapDraft.create({ maSanPham: id, maTag: tag, maDuyetTask: duyetTask.id, tinhTrangDuyet: 0, maDuyetType: 2, createdAt: currentTime });
                }));
            }

            await saveSanPhamDraftImages(user, duyetTask);
            res.send({ item: draftItem });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Bật tắt kích hoạt sản phẩm
    app.put('/api/tmdt/y-shop/seller/san-pham/toggle/kich-hoat', app.permission.orCheck(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            /**
             * Kiểm tra xem người dùng có tham gia đại lý này không
             */
            const user = req.session.user;
            let maDaiLy = (await app.model.tmdtSanPham.get({ id: req.body.id }, 'maDaiLy')).maDaiLy;
            let thanhVienDaiLyItem = await app.model.tmdtThanhVienDaiLy.get({ maDaiLy, email: user.email });
            if (!thanhVienDaiLyItem) throw 'Bạn không thuộc đại lý này';
            let item = await app.model.tmdtSanPham.update({ id: req.body.id }, { kichHoat: req.body.kichHoat });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/tmdt/y-shop/seller/san-pham', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            /**
             * TODO: Phải check req.session.user có tham gia đại lý này không
             */
            const { changes, id } = req.body;
            const { kichHoat } = changes;
            let item = await app.model.tmdtSanPham.update({ id }, { kichHoat }); // Seller chỉ được đổi trường kichHoat
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/y-shop/seller/clear-unsave', app.permission.check(tmdtSellerSanPhamDraftDelete), async (req, res) => {
        try {
            const user = req.session.user;
            const folderPath = getSanPhamDraftUploadFolder(user.email);

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

    const saveSanPhamDraftImages = async (user, duyetTask) => {
        const itemId = duyetTask.id;
        const folderUpload = getSanPhamDraftUploadFolder(user.email);
        const imageFiles = app.fs.existsSync(folderUpload) && app.fs.readdirSync(folderUpload);
        imageFiles && imageFiles.length && await Promise.all(imageFiles.map(async img => {
            return await app.fs.rename(app.path.join(folderUpload, img), app.path.join(getSanPhamDraftSaveFolder(itemId), img));
        }));
    };
};