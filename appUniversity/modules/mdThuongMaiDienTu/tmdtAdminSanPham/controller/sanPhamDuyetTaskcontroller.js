module.exports = app => {
    const { tmdtSellerSanPhamDraftRead, tmdtAdminDuyetTaskManageRead, tmdtAdminDuyetTaskManageWrite, tmdtAdminDuyetTaskManageDelete } = require('../../permission.js')();

    app.permission.add(
        { name: tmdtAdminDuyetTaskManageRead },
        { name: tmdtAdminDuyetTaskManageWrite },
        { name: tmdtAdminDuyetTaskManageDelete },
    );

    const { getSanPhamDraftSaveFolder, getSanPhamDraftSaveUrl } = require('../../tmdtSellerDashboard/controller/util.js')(app);
    const { getSanPhamSaveFolder, getSanPhamSaveUrl } = require('./util.js')(app);

    app.get('/api/tmdt/y-shop/admin/duyet-task/page/:pageNumber/:pageSize', app.permission.check(tmdtAdminDuyetTaskManageRead), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            let page = await app.model.tmdtDuyetTask.searchPageWithImages(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/duyet-task/reject', app.permission.check(tmdtAdminDuyetTaskManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const currentTime = Date.now();
            const { id, rejectComment } = req.body;
            const duyetTaskItem = await app.model.tmdtDuyetTask.update({ id }, { nguoiDuyetEmail: user.email, nguoiDuyetShcc: user.shcc, rejectComment, tinhTrangDuyet: 2, lastUpdatedAt: currentTime });
            const sanPhamDraftItem = await app.model.tmdtSanPhamDraft.update({ maDuyetTask: id }, { tinhTrangDuyet: 2, lastUpdatedAt: currentTime });
            const sanPhamTagMapDraftIdList = (await app.model.tmdtSanPhamTagMapDraft.getAll({ maDuyetTask: id })).map(i => i.id);
            Promise.all(sanPhamTagMapDraftIdList.map(async (sanPhamTagMapDraftId) => {
                await app.model.tmdtSanPhamTagMapDraft.update({ id: sanPhamTagMapDraftId }, { tinhTrangDuyet: 2, lastUpdatedAt: currentTime });
            }));
            res.send({ item: duyetTaskItem, sanPhamDraftItem });
            await logRejectSanPham(duyetTaskItem, sanPhamDraftItem.id, user, currentTime);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/duyet-task/approve/create-san-pham', app.permission.check(tmdtAdminDuyetTaskManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const currentTime = Date.now();
            const { id: duyetTaskId } = req.body;
            const { duyetTaskItem, sanPhamDraftItem, sanPhamTagMapDraftList } = await updateDraftDuyetStateBeforeSavingSanPham(user, duyetTaskId, currentTime);
            const { sanPhamItem, draftId } = await createApprovedSanPham(sanPhamDraftItem, sanPhamTagMapDraftList);
            await saveSanPhamImagesFromDraft(sanPhamItem, duyetTaskId);
            logApproveSanPham(duyetTaskItem, draftId, user, currentTime);
            res.send({ item: duyetTaskItem, sanPhamItem });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tmdt/y-shop/admin/duyet-task/approve/update-san-pham', app.permission.check(tmdtAdminDuyetTaskManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const currentTime = Date.now();
            const { id: duyetTaskId } = req.body;
            const { duyetTaskItem, sanPhamDraftItem, sanPhamTagMapDraftList } = await updateDraftDuyetStateBeforeSavingSanPham(user, duyetTaskId, currentTime);
            const { sanPhamItem, draftId } = await updateApprovedSanPham(sanPhamDraftItem, sanPhamTagMapDraftList);
            await saveSanPhamImagesFromDraft(sanPhamItem, duyetTaskId);
            logApproveSanPham(duyetTaskItem, draftId, user, currentTime);
            res.send({ item: duyetTaskItem, sanPhamItem });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tmdt/y-shop/admin/san-pham-duyet/:id', app.permission.orCheck(tmdtAdminDuyetTaskManageRead, tmdtSellerSanPhamDraftRead), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = (await app.model.tmdtDuyetTask.getDetailById(id)).rows[0];
            const images = app.fs.existsSync(getSanPhamDraftSaveFolder(item.id)) && app.fs.readdirSync(getSanPhamDraftSaveFolder(item.id));
            if (images) {
                item.imagesUrl = images.map(url => app.path.join(getSanPhamDraftSaveUrl(item.id), url));
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const updateDraftDuyetStateBeforeSavingSanPham = async (user, duyetTaskId, currentTime) => {
        const duyetTaskItem = await app.model.tmdtDuyetTask.update({ id: duyetTaskId }, { nguoiDuyetEmail: user.email, nguoiDuyetShcc: user.shcc, tinhTrangDuyet: 1, lastUpdatedAt: currentTime });
        const sanPhamDraftItem = await app.model.tmdtSanPhamDraft.update({ maDuyetTask: duyetTaskId }, { tinhTrangDuyet: 1, lastUpdatedAt: currentTime });
        const sanPhamTagMapDraftList = await app.model.tmdtSanPhamTagMapDraft.getAll({ maDuyetTask: duyetTaskId });
        const sanPhamTagMapDraftIdList = sanPhamTagMapDraftList.map(i => i.id);
        Promise.all(sanPhamTagMapDraftIdList.map(async (sanPhamTagMapDraftId) => {
            await app.model.tmdtSanPhamTagMapDraft.update({ id: sanPhamTagMapDraftId }, { tinhTrangDuyet: 1, lastUpdatedAt: currentTime });
        }));
        return { duyetTaskItem, sanPhamDraftItem, sanPhamTagMapDraftList };
    }

    const createApprovedSanPham = async (sanPhamDraftItem, sanPhamTagMapDraftList) => {
        // Cập nhật sản phẩm live
        const draftId = sanPhamDraftItem.id;
        delete sanPhamDraftItem.id;
        const sanPhamItem = await app.model.tmdtSanPham.create({ ...sanPhamDraftItem, kichHoat: 1 });
        // Cập nhật tag live
        Promise.all(sanPhamTagMapDraftList.map(async (sanPhamTagMapDraftItem) => {
            sanPhamTagMapDraftItem.maSanPham = sanPhamItem.id;
            delete sanPhamTagMapDraftItem.id;
            await app.model.tmdtSanPhamTagMap.create(sanPhamTagMapDraftItem);
        }));
        return { sanPhamItem, draftId };
    }

    const updateApprovedSanPham = async (sanPhamDraftItem, sanPhamTagMapDraftList) => {
        // Cập nhật sản phẩm live
        const draftId = sanPhamDraftItem.id;
        delete sanPhamDraftItem.id;
        const sanPhamItem = await app.model.tmdtSanPham.update({ id: sanPhamDraftItem.maSanPham }, sanPhamDraftItem);
        // Cập nhật tag live
        await app.model.tmdtSanPhamTagMap.delete({ maSanPham: sanPhamItem.id });
        Promise.all(sanPhamTagMapDraftList.map(async (sanPhamTagMapDraftItem) => {
            delete sanPhamTagMapDraftItem.id;
            await app.model.tmdtSanPhamTagMap.create(sanPhamTagMapDraftItem);
        }));
        return { sanPhamItem, draftId };
    }

    const saveSanPhamImagesFromDraft = async (sanPhamItem, sanPhamDraftId) => {
        const folderDraft = getSanPhamDraftSaveFolder(sanPhamDraftId);
        const imageFiles = app.fs.existsSync(folderDraft) && app.fs.readdirSync(folderDraft);
        if (imageFiles && imageFiles.length > 0) {
            const spLiveSaveFolder = getSanPhamSaveFolder(sanPhamItem.id);
            await app.model.tmdtSanPham.update({ id: sanPhamItem.id }, { defaultImage: app.path.join(getSanPhamSaveUrl(sanPhamItem.id), imageFiles[0]) });

            // (Nếu cập nhật) Xóa hết hình trong thư mục của sản phẩm để thay hình từ draft qua
            const deleteOldImageFiles = app.fs.existsSync(spLiveSaveFolder) && app.fs.readdirSync(spLiveSaveFolder);
            deleteOldImageFiles && deleteOldImageFiles.length && await Promise.all(deleteOldImageFiles.map(async img => {
                return await app.fs.unlink(app.path.join(spLiveSaveFolder, img), (err) => {
                    if (err) console.error('error', err);
                });
            }));

            // Chuyển ảnh từ thư mục draft sang live
            await Promise.all(imageFiles.map(async img => {
                return await app.fs.cp(app.path.join(folderDraft, img), app.path.join(spLiveSaveFolder, img), (err) => {
                    if (err) console.error('error', err);
                });
            }));
        }
    }

    const logApproveSanPham = async (duyetTaskItem, draftId, user, currentTime) => {
        const tenDuyetType = (await app.model.tmdtDuyetType.get({ id: duyetTaskItem.maDuyetType })).ten;
        app.model.tmdtDuyetLog.create({ maDuyetTask: duyetTaskItem.id, nguoiDuyetEmail: user.email, maDraftItem: draftId, tenDuyetType, tinhTrangDuyet: 1, createdAt: currentTime });
    }

    const logRejectSanPham = async (duyetTaskItem, draftId, user, currentTime) => {
        const tenDuyetType = (await app.model.tmdtDuyetType.get({ id: duyetTaskItem.maDuyetType })).ten;
        app.model.tmdtDuyetLog.create({ maDuyetTask: duyetTaskItem.id, nguoiDuyetEmail: user.email, maDraftItem: draftId, tenDuyetType, tinhTrangDuyet: 2, createdAt: currentTime });
    }
};