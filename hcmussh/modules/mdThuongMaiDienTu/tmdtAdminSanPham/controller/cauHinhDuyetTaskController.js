module.exports = app => {
    const { tmdtAdminDuyetTaskManageRead, tmdtAdminDuyetTaskManageWrite } = require('../../permission.js')();
    const { getCauHinhDraftSaveFolder } = require('../../tmdtSellerDashboard/controller/util.js')(app);
    const { getCauHinhSaveFolder } = require('./util.js')(app);

    app.get('/api/tmdt/y-shop/admin/cau-hinh-duyet-task/page/:pageNumber/:pageSize', app.permission.check(tmdtAdminDuyetTaskManageRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtDuyetTask.searchCauHinhPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/cau-hinh-duyet-task/reject', app.permission.check(tmdtAdminDuyetTaskManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const currentTime = Date.now();
            const { id, rejectComment } = req.body;
            const duyetTaskItem = await app.model.tmdtDuyetTask.update({ id }, { nguoiDuyetEmail: user.email, nguoiDuyetShcc: user.shcc, rejectComment, tinhTrangDuyet: 2, lastUpdatedAt: currentTime });
            const cauHinhSanPhamDraftItem = await app.model.tmdtCauHinhSanPhamDraft.update({ maDuyetTask: id }, { tinhTrangDuyet: 2, lastUpdatedAt: currentTime });
            res.send({ item: duyetTaskItem, cauHinhSanPhamDraftItem });
            const tenDuyetType = (await app.model.tmdtDuyetType.get({ id: duyetTaskItem.maDuyetType })).ten;
            app.model.tmdtDuyetLog.create({ maDuyetTask: duyetTaskItem.id, nguoiDuyetEmail: user.email, maDraftItem: cauHinhSanPhamDraftItem.id, tenDuyetType, tinhTrangDuyet: 2, createdAt: currentTime });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/cau-hinh-duyet-task/approve/create-san-pham', app.permission.check(tmdtAdminDuyetTaskManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const currentTime = Date.now();
            const { id } = req.body;
            const duyetTaskItem = await app.model.tmdtDuyetTask.update({ id }, { nguoiDuyetEmail: user.email, nguoiDuyetShcc: user.shcc, tinhTrangDuyet: 1, lastUpdatedAt: currentTime });
            const cauHinhSanPhamDraftItem = await app.model.tmdtCauHinhSanPhamDraft.update({ maDuyetTask: id }, { tinhTrangDuyet: 1, lastUpdatedAt: currentTime });

            // Cập nhật cấu hình sản phẩm live
            const draftId = cauHinhSanPhamDraftItem.id;
            delete cauHinhSanPhamDraftItem.id;
            const cauHinhSanPhamItem = await app.model.tmdtCauHinhSanPham.create({ ...cauHinhSanPhamDraftItem, kichHoat: 1 });

            saveCauHinhImageFromDraft(draftId, cauHinhSanPhamItem);

            res.send({ item: duyetTaskItem, cauHinhSanPhamItem });
            const tenDuyetType = (await app.model.tmdtDuyetType.get({ id: duyetTaskItem.maDuyetType })).ten;
            app.model.tmdtDuyetLog.create({ maDuyetTask: duyetTaskItem.id, nguoiDuyetEmail: user.email, maDraftItem: draftId, tenDuyetType, tinhTrangDuyet: 1, createdAt: currentTime });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/cau-hinh-duyet-task/approve/update-san-pham', app.permission.check(tmdtAdminDuyetTaskManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const currentTime = Date.now();
            const { id } = req.body;
            const duyetTaskItem = await app.model.tmdtDuyetTask.update({ id }, { nguoiDuyetEmail: user.email, nguoiDuyetShcc: user.shcc, tinhTrangDuyet: 1, lastUpdatedAt: currentTime });
            const cauHinhSanPhamDraftItem = await app.model.tmdtCauHinhSanPhamDraft.update({ maDuyetTask: id }, { tinhTrangDuyet: 1, lastUpdatedAt: currentTime });

            // Cập nhật cấu hình sản phẩm live
            const draftId = cauHinhSanPhamDraftItem.id;
            delete cauHinhSanPhamDraftItem.id;
            const cauHinhSanPhamItem = await app.model.tmdtCauHinhSanPham.update({ id: cauHinhSanPhamDraftItem.maCauHinhSanPham }, cauHinhSanPhamDraftItem);

            saveCauHinhImageFromDraft(draftId, cauHinhSanPhamItem);

            res.send({ item: duyetTaskItem, cauHinhSanPhamItem });
            const tenDuyetType = (await app.model.tmdtDuyetType.get({ id: duyetTaskItem.maDuyetType })).ten;
            app.model.tmdtDuyetLog.create({ maDuyetTask: duyetTaskItem.id, nguoiDuyetEmail: user.email, maDraftItem: draftId, tenDuyetType, tinhTrangDuyet: 1, createdAt: currentTime });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const saveCauHinhImageFromDraft = (draftId, cauHinhSanPhamItem) => {
        if (app.fs.existsSync(getCauHinhDraftSaveFolder(draftId)) && app.fs.readdirSync(getCauHinhDraftSaveFolder(draftId)).length > 0) {
            const cauHinhImage = (app.fs.readdirSync(getCauHinhDraftSaveFolder(draftId)))[0];
            app.fs.cp(app.path.join(getCauHinhDraftSaveFolder(draftId), cauHinhImage), app.path.join(getCauHinhSaveFolder(cauHinhSanPhamItem.id), cauHinhImage), (err) => {
                if (err) console.error('error', err);
            });
        }
    };
};