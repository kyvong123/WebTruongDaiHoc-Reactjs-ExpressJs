const archiver = require('archiver');

module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            5122: {
                title: 'Kê khai thông tin TNCN',
                link: '/user/tncn/ke-khai',
                icon: 'fa fa-pencil',
                parentKey: 5120
            }
        }
    };

    app.permission.add(
        { name: 'tcThueDangKy:read', menu },
        { name: 'tcThueDangKy:write' },
        { name: 'tcThueDangKy:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcThueDangKy', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcThueDangKy:read', 'tcThueDangKy:write', 'tcThueDangKy:delete');
        }
    });

    app.get('/user/tncn/ke-khai', app.permission.orCheck('tcThueDangKy:read', 'tcThueDangKy:write', 'tcThueDangKy:delete'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/cb/tncn/ke-khai', app.permission.check('tcThueDangKy:read'), async (req, res) => {
        try {
            const shcc = req.session.user?.shcc;
            const thongTinCanBo = await app.model.tchcCanBo.get({ shcc });
            const lichSuDangKy = await app.model.tcThueDangKy.getAll({ shcc }, '*', 'ngayTao DESC');
            const { luuYKeKhaiThueEditorHtml: noiDungLuuY } = await app.model.tcSetting.getValue('luuYKeKhaiThueEditorHtml');
            res.send({ lichSuDangKy, thongTinCanBo, noiDungLuuY });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    // eslint-disable-next-line no-unused-vars
    const handleUploadMinhChung = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] == 'TcThueDangKyToKhai' && files.TcDangKyThue && files.TcDangKyThue.length > 0) {
            const { id } = app.utils.parse(fields.data[0]);
            const sourcePath = files.TcDangKyThue[0].path;
            const ext = sourcePath.split('.');
            const newPath = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcDangKyThue', 'khaiThue', `${id}`, `${req.session.user?.shcc}_toKhai.${ext[ext.length - 1]}`);
            app.fs.renameSync(sourcePath, newPath);
        } else if (fields.userData && fields.userData[0] == 'TcThueDangKyCmndMatTruoc' && files.TcDangKyThue && files.TcDangKyThue.length > 0) {
            const { id } = app.utils.parse(fields.data[0]);
            const sourcePath = files.TcDangKyThue[0].path;
            const ext = sourcePath.split('.');
            const newPath = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcDangKyThue', 'khaiThue', `${id}`, `${req.session.user?.shcc}_cmndMatTruoc.${ext[ext.length - 1]}`);
            app.fs.renameSync(sourcePath, newPath);
        } else if (fields.userData && fields.userData[0] == 'TcThueDangKyCmndMatSau' && files.TcDangKyThue && files.TcDangKyThue.length > 0) {
            const { id } = app.utils.parse(fields.data[0]);
            const sourcePath = files.TcDangKyThue[0].path;
            const ext = sourcePath.split('.');
            const newPath = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcDangKyThue', 'khaiThue', `${id}`, `${req.session.user?.shcc}_cmndMatSau.${ext[ext.length - 1]}`);
            app.fs.renameSync(sourcePath, newPath);
        }
    };
    app.uploadHooks.add('TcDangKyThue', (req, fields, files, params, done) =>
        app.permission.has(req, () => handleUploadMinhChung(req, fields, files, params, done), done, 'tcThueDangKy:write')
    );

    app.post('/api/cb/tncn/ke-khai', app.permission.check('tcThueDangKy:write'), async (req, res) => {
        try {
            const { checkFile, ...data } = req.body;
            const shcc = req.session.user?.shcc;
            const id = await app.model.tcThueDangKy.create({ ...data, shcc, ngayTao: Date.now(), nguoiUpdate: req.session.user.email, ngayUpdate: Date.now() }).then(item => item.id);
            const pathFolder = app.path.join('khtc', 'tncn', req.session.user?.shcc, 'tcDangKyThue', 'khaiThue', `${id}`);
            if (checkFile) {
                await app.fs.promises.mkdir(app.path.join(app.assetPath, pathFolder), { recursive: true });
                await app.model.tcThueDangKy.update({ id }, { pathFolder });
            }
            res.send({ id });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/cb/tncn/ke-khai', app.permission.check('tcThueDangKy:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            await app.model.tcThueDangKy.update({ id }, { ...changes, lyDo: null, trangThai: 'CHO_XAC_NHAN', ngayUpdate: Date.now(), nguoiUpdate: req.session.user.email });
            res.send({ id });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/cb/tncn/ke-khai/tai-minh-chung/:id', app.permission.check('tcThueDangKy:read'), async (req, res) => {
        try {
            const id = req.params.id;
            const item = await app.model.tcThueDangKy.get({ id });
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