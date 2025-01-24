module.exports = app => {
    const { tmdtSellerSanPhamDraftWrite, tmdtSellerSanPhamDraftRead } = require('../../permission.js')();

    const { getCauHinhDraftUploadFolder, getCauHinhDraftSaveFolder } = require('./util')(app);
    const { getCauHinhSaveUrl, getCauHinhSaveFolder } = require('../../tmdtAdminSanPham/controller/util.js')(app);

    app.get('/user/tmdt/y-shop/seller/san-pham/cau-hinh/:maSanPham', app.permission.check(tmdtSellerSanPhamDraftRead), app.templates.admin);

    app.get('/api/tmdt/y-shop/seller/san-pham/cau-hinh/:maSanPham', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const maSanPham = parseInt(req.params.maSanPham);
            const cauHinhItems = await app.model.tmdtCauHinhSanPham.getAll({ maSanPham });
            const cauHinhDraftItems = await app.model.tmdtCauHinhSanPhamDraft.getAll({ maSanPham });
            const spItem = (await app.model.tmdtSanPham.getDetailById(maSanPham)).rows[0];
            cauHinhItems.forEach(item => {
                if (app.fs.existsSync(getCauHinhSaveFolder(item.id)) && app.fs.readdirSync(getCauHinhSaveFolder(item.id)).length > 0)
                    item.image = app.path.join(getCauHinhSaveUrl(item.id), app.fs.readdirSync(getCauHinhSaveFolder(item.id))[0]);
            });
            res.send({ items: cauHinhItems, spItem, draftItems: cauHinhDraftItems });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/seller/san-pham/cau-hinh/draft/by-dai-ly/page/:pageNumber/:pageSize', app.permission.check(tmdtSellerSanPhamDraftRead), async (req, res) => {
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

    app.post('/api/tmdt/y-shop/seller/san-pham/cau-hinh/draft/create', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const user = req.session.user;
            let newItem = req.body.data;
            const currentTime = Date.now();
            const duyetTask = await app.model.tmdtDuyetTask.create({ nguoiTaoEmail: user.email, nguoiDuyetEmail: null, tinhTrangDuyet: 0, maDuyetType: 4, rejectComment: null, createdAt: currentTime, lastUpdatedAt: currentTime });
            newItem = { ...newItem, maCauHinhSanPham: null, tinhTrangDuyet: 0, maDuyetTask: duyetTask.id, createdAt: currentTime, lastUpdatedAt: currentTime };
            const draftItem = await app.model.tmdtCauHinhSanPhamDraft.create(newItem);
            saveCauHinhDraftImage(user, draftItem);
            res.send({ item: draftItem });
        } catch (error) {
            res.send({ error });
        }
    });


    app.post('/api/tmdt/y-shop/seller/san-pham/cau-hinh/draft/update', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            const user = req.session.user;
            let newItem = req.body.data;
            const currentTime = Date.now();
            const duyetTask = await app.model.tmdtDuyetTask.create({ nguoiTaoEmail: user.email, nguoiDuyetEmail: null, tinhTrangDuyet: 0, maDuyetType: 5, rejectComment: null, createdAt: currentTime, lastUpdatedAt: currentTime });
            newItem = { ...newItem, tinhTrangDuyet: 0, maDuyetTask: duyetTask.id, createdAt: currentTime, lastUpdatedAt: currentTime };
            const draftItem = await app.model.tmdtCauHinhSanPhamDraft.create(newItem);
            saveCauHinhDraftImage(user, draftItem);
            res.send({ item: draftItem });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/seller/san-pham/cau-hinh', app.permission.check(tmdtSellerSanPhamDraftWrite), async (req, res) => {
        try {
            /**
             * TODO: Phải check req.session.user có tham gia đại lý này không
             */
            const { changes, id } = req.body;
            const { kichHoat } = changes;
            let item = await app.model.tmdtCauHinhSanPham.update({ id }, { kichHoat }); // Seller chỉ được đổi trường kichHoat
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const saveCauHinhDraftImage = (user, draftItem) => {
        const folderUpload = getCauHinhDraftUploadFolder(user.email);
        const image = (app.fs.readdirSync(folderUpload))[0];
        app.fs.rename(app.path.join(folderUpload, image), app.path.join(getCauHinhDraftSaveFolder(draftItem.id), image));
    }
};