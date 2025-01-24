module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4117: { title: 'Chứng chỉ chữ ký', link: '/user/category/chung-chi-chu-ky' },
        },
    };

    app.permission.add(
        { name: 'dmChungChiChuKy:read', menu }
    );

    app.permissionHooks.add('staff', 'addRolesDmChungChi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '29') {
            app.permissionHooks.pushUserPermission(user, 'dmChungChiChuKy:read', 'dmChungChiChuKy:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/category/chung-chi-chu-ky', app.permission.check('dmChungChiChuKy:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chung-chi-chu-ky/page/:pageNumber/:pageSize', app.permission.check('dmChungChiChuKy:read'), async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
                };
            }
            const page = await app.model.dmChungChiChuKy.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/chung-chi-chu-ky/:id', app.permission.check('dmChungChiChuKy:read'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw 'Invalid id';
            }
            const chungChi = await app.model.dmChungChiChuKy.get({ id });
            res.send({ item: chungChi });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/danh-muc/chung-chi-chu-ky', app.permission.check('dmChungChiChuKy:write'), async (req, res) => {
        try {
            const id = req.body.id,
                changes = req.body.changes;
            const item = await app.model.dmChungChiChuKy.get({ id });
            if (!item) throw 'Chứng chỉ không tồn tại';
            if (changes.tenFile) {
                const oldPath = app.path.join(app.assetPath, 'dmChungChiChuKy', item.tenFile);

                app.fs.deleteFile(oldPath);
            }
            await app.model.dmChungChiChuKy.update({ id }, changes);
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/danh-muc/chung-chi-chu-ky', app.permission.check('dmChungChiChuKy:write'), async (req, res) => {
        try {
            const data = req.body.item;
            await app.model.dmChungChiChuKy.create(data);
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/danh-muc/chung-chi-chu-ky', app.permission.check('dmChungChiChuKy:write'), async (req, res) => {
        try {
            const id = req.body.id;
            const item = await app.model.dmChungChiChuKy.get({ id });
            if (!item) throw 'Chứng chỉ không tồn tại';

            app.fs.deleteFile(app.path.join(app.assetPath, 'dmChungChiChuKy', item.tenFile));
            await app.model.dmChungChiChuKy.delete({ id });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    // Upload API  -----------------------------------------------------------------------------------------------

    app.fs.createFolder(app.path.join(app.assetPath, '/dmChungChiChuKy'));

    app.uploadHooks.add('dmChungChiChuKyFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCaFile(req, fields, files, params, done), done)
    );

    const uploadCaFile = async (req, fields, files, params, done) => {
        try {
            const type = fields.userData?.length && fields.userData[0];
            if (type == 'dmChungChiChuKyFile') {
                const file = files.dmChungChiChuKyFile[0],
                    { path, originalFilename } = file,
                    validFileType = ['.crt', '.key', '.ca', '.crl', '.pem', '.p12'],
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(fileName);
                if (!validFileType.includes(extName))
                    return done && done({ error: 'Định dạng file không hợp lệ' });

                const newPath = app.path.join(app.assetPath, 'dmChungChiChuKy', originalFilename),
                    isCrl = extName === '.crl' ? 1 : 0;

                app.fs.renameSync(path, newPath);

                done && done({
                    originalFilename,
                    isCrl
                });
            }
        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };
};