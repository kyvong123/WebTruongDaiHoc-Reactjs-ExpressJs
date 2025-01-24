module.exports = app => {
    const { tmdtAdminSanPhamManageRead, tmdtAdminSanPhamManageWrite, tmdtAdminSanPhamManageDelete } = require('../../permission.js')();
    const { getCauHinhSaveUrl, getCauHinhSaveFolder, getCauHinhUploadFolder } = require('./util.js')(app);

    app.get('/user/tmdt/y-shop/admin/san-pham/cau-hinh/:id', app.permission.check(tmdtAdminSanPhamManageRead), app.templates.admin);

    app.get('/api/tmdt/y-shop/admin/san-pham/cau-hinh/:id', app.permission.check(tmdtAdminSanPhamManageRead), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const cauHinhItems = await app.model.tmdtCauHinhSanPham.getAll({ maSanPham: id });
            cauHinhItems.forEach(item => {
                if (app.fs.existsSync(getCauHinhSaveFolder(item.id)) && app.fs.readdirSync(getCauHinhSaveFolder(item.id)).length > 0)
                    item.image = app.path.join(getCauHinhSaveUrl(item.id), app.fs.readdirSync(getCauHinhSaveFolder(item.id))[0]);
            });
            const spItem = (await app.model.tmdtSanPham.getDetailById(id)).rows[0];
            res.send({ items: cauHinhItems, spItem });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tmdt/y-shop/admin/san-pham/cau-hinh', app.permission.check(tmdtAdminSanPhamManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const data = req.body.data;
            const item = await app.model.tmdtCauHinhSanPham.create(data);
            saveCauHinhImageWithAdminPermission(user, item);
            modifyCauHinhSanPhamLogging(item.id, 'Tạo cấu hình sản phẩm', user);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });


    app.put('/api/tmdt/y-shop/admin/san-pham/cau-hinh', app.permission.check(tmdtAdminSanPhamManageWrite), async (req, res) => {
        try {
            const user = req.session.user;
            const id = parseInt(req.body.id), changes = req.body.changes;
            const item = await app.model.tmdtCauHinhSanPham.update({ id }, changes);
            saveCauHinhImageWithAdminPermission(user, item);
            modifyCauHinhSanPhamLogging(item.id, 'Cập nhật cấu hình sản phẩm', user);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tmdt/y-shop/admin/san-pham/cau-hinh', app.permission.orCheck(tmdtAdminSanPhamManageDelete, 'developer:login'), async (req, res) => {
        try {
            const user = req.session.user;
            const id = parseInt(req.body.id);
            const item = await app.model.tmdtCauHinhSanPham.delete(id);
            modifyCauHinhSanPhamLogging(item.id, 'Xóa cấu hình sản phẩm', user);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const modifyCauHinhSanPhamLogging = async (itemId, actionName, user) => {
        await app.model.tmdtEditSanPhamLog.create({ adminEmail: user.email, tenEditType: actionName, maItem: itemId, createdAt: Date.now() });
    }

    const saveCauHinhImageWithAdminPermission = (user, item) => {
        const userUploadFolder = getCauHinhUploadFolder(user.email);
        if (app.fs.existsSync(userUploadFolder) && (app.fs.readdirSync(userUploadFolder)).length > 0) {
            const newCauHinhImage = (app.fs.readdirSync(userUploadFolder))[0];
            app.fs.existsSync(getCauHinhSaveFolder(item.id)) && app.fs.readdirSync(getCauHinhSaveFolder(item.id)).forEach(file => {
                app.fs.unlinkSync(app.path.join(getCauHinhSaveFolder(item.id), file));
            });
            app.fs.rename(app.path.join(userUploadFolder, newCauHinhImage), app.path.join(getCauHinhSaveFolder(item.id), newCauHinhImage));
        }
    }
};