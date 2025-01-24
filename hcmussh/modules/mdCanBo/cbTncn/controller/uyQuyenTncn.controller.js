module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            5123: {
                title: 'Ủy quyền quyết toán TNCN',
                link: '/user/tncn/uy-quyen',
                icon: 'fa fa-pencil',
                parentKey: 5120
            }
        }
    };

    app.permission.add(
        { name: 'tcThueUyQuyen:read', menu },
        { name: 'tcThueUyQuyen:write' },
        { name: 'tcThueUyQuyen:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcThueUyQuyen', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcThueUyQuyen:read', 'tcThueUyQuyen:write', 'tcThueUyQuyen:delete');
        }
    });

    app.get('/user/tncn/uy-quyen', app.permission.orCheck('tcThueUyQuyen:read', 'tcThueUyQuyen:write', 'tcThueUyQuyen:delete'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/cb/tncn/uy-quyen', app.permission.check('tcThueUyQuyen:read'), async (req, res) => {
        try {
            const shcc = req.session.user?.shcc;
            const thongTinCanBo = await app.model.tchcCanBo.get({ shcc });
            const lichSuDangKy = await app.model.tcTncnUyQuyen.getAll({ shcc }, '*', 'ngayTao DESC');
            res.send({ lichSuDangKy, thongTinCanBo });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    // eslint-disable-next-line no-unused-vars
    const handleUploadMinhChung = (req, fields, files, params, done) => {

        if (fields.userData && files.TcUyQuyen && files.TcUyQuyen.length > 0) {
            const sourcePath = files.TcUyQuyen[0].path;
            const ext = sourcePath.split('.');
            if (fields.userData[0] == 'TcUyQuyenToKhai') {
                const { id } = app.utils.parse(fields.data[0]);
                const newPath = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcUyQuyen', `${id}`, `${req.session.user?.shcc}_toKhai.${ext[ext.length - 1]}`);
                app.fs.renameSync(sourcePath, newPath);
            } else if (fields.userData[0] == 'TcUyQuyenCmndTruoc') {
                const { id } = app.utils.parse(fields.data[0]);
                const newPath = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcUyQuyen', `${id}`, `${req.session.user?.shcc}_cmndMatTruoc.${ext[ext.length - 1]}`);
                app.fs.renameSync(sourcePath, newPath);
            } else if (fields.userData[0] == 'TcUyQuyenCmndSau') {
                const { id } = app.utils.parse(fields.data[0]);
                const newPath = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcUyQuyen', `${id}`, `${req.session.user?.shcc}_cmndMatSau.${ext[ext.length - 1]}`);
                app.fs.renameSync(sourcePath, newPath);
            }
        }

    };
    app.uploadHooks.add('TcUyQuyen', (req, fields, files, params, done) =>
        app.permission.has(req, () => handleUploadMinhChung(req, fields, files, params, done), done, 'tcThueUyQuyen:write')
    );

    app.post('/api/cb/tncn/uy-quyen', app.permission.check('tcThueUyQuyen:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const shcc = req.session.user?.shcc;
            const id = await app.model.tcTncnUyQuyen.create({ ...data, shcc, ngayTao: Date.now(), nguoiUpdate: req.session.user.email, ngayUpdate: Date.now(), trangThai: 'CHO_XAC_NHAN' }).then(item => item.id);
            const pathFolder = app.path.join('khtc', 'tncn', req.session.user?.shcc, 'tcUyQuyen', `${id}`);
            await app.fs.promises.mkdir(app.path.join(app.assetPath, pathFolder), { recursive: true });
            await app.model.tcTncnUyQuyen.update({ id }, { pathFolder });
            res.send({ id });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/cb/tncn/uy-quyen/download/:id', app.permission.check('tcThueUyQuyen:read'), async (req, res) => {
        try {
            const archiver = require('archiver');
            const id = req.params.id;
            const item = await app.model.tcTncnUyQuyen.get({ id });
            const directoryPath = app.path.join(app.assetPath, item.pathFolder);
            res.set('Content-Type', 'application/zip');
            res.set('Content-Disposition', `attachment; filename=minhChungDangKy_${item.shcc}.zip`);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });
            archive.pipe(res);
            const files = app.fs.readdirSync(directoryPath, { withFileTypes: true });
            files.forEach((file) => {
                const filePath = app.path.join(directoryPath, file.name);

                if (file.isFile()) {
                    const input = app.fs.createReadStream(filePath);
                    archive.append(input, { name: file.name });
                } else if (file.isDirectory()) {
                    archive.directory(filePath, file.name);
                }
            });
            archive.finalize();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};