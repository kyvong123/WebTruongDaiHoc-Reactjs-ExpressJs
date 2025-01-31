const archiver = require('archiver');
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            5124: {
                title: 'Đăng ký người phụ thuộc',
                link: '/user/tncn/phu-thuoc',
                icon: 'fa fa-pencil',
                parentKey: 5120
            }
        }
    };

    app.permission.add(
        { name: 'tcThuePhuThuoc:read', menu },
        { name: 'tcThuePhuThuoc:write' },
        { name: 'tcThuePhuThuoc:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcThuePhuThuoc', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcThuePhuThuoc:read', 'tcThuePhuThuoc:write', 'tcThuePhuThuoc:delete');
        }
    });
    // eslint-disable-next-line no-unused-vars
    const handleUploadMinhChung = async (req, fields, files, params, done) => {
        if (files.TcDangKyPhuThuoc && files.TcDangKyPhuThuoc.length > 0) {
            const basePath = app.path.join(app.assetPath, 'khtc', 'tncn', `${req.session.user?.shcc}`, 'tcPhuThuoc');
            const { id } = app.utils.parse(fields.data[0]);
            const sourcePath = files.TcDangKyPhuThuoc[0].path;
            if (fields.userData && fields.userData[0] == 'ToKhai') {
                const ext = sourcePath.split('.');
                const newPath = app.path.join(basePath, `${id}`, `${req.session.user?.shcc}_toKhai.${ext[ext.length - 1]}`);
                app.fs.renameSync(sourcePath, newPath);
            } else if (fields.userData && fields.userData[0] == 'CmndMatTruoc') {
                const ext = sourcePath.split('.');
                const newPath = app.path.join(basePath, `${id}`, `${req.session.user?.shcc}_cmndMatTruoc.${ext[ext.length - 1]}`);
                app.fs.renameSync(sourcePath, newPath);
            } else if (fields.userData && fields.userData[0] == 'CmndMatSau') {
                const ext = sourcePath.split('.');
                const newPath = app.path.join(basePath, `${id}`, `${req.session.user?.shcc}_cmndMatSau.${ext[ext.length - 1]}`);
                app.fs.renameSync(sourcePath, newPath);
            }
        }

    };
    app.uploadHooks.add('TcDangKyPhuThuoc', (req, fields, files, params, done) =>
        app.permission.has(req, () => handleUploadMinhChung(req, fields, files, params, done), done, 'tcThuePhuThuoc:write')
    );
    const handleCreate = ({ srcPath, basePath, mota, shcc }) => {
        const ext = srcPath.split('.');
        const newPath = app.path.join(basePath, `${shcc}_${mota}.${ext[ext.length - 1]}`);
        app.fs.renameSync(srcPath, newPath);
    };
    // eslint-disable-next-line no-unused-vars
    const handleUploadMinhChungDetail = async (req, fields, files, params, done) => {
        if (files.PhuThuocDetail && files.PhuThuocDetail.length > 0) {
            const { idDangKy, id } = app.utils.parse(fields.data[0]);
            const basePath = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcPhuThuoc', idDangKy, `${id}`);
            const shcc = req.session.user?.shcc;
            const srcPath = files.PhuThuocDetail[0].path;
            if (fields.userData && fields.userData[0] == 'giayKhaiSinh') {
                const mota = 'giayKhaiSinh';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'cmndMatTruoc') {
                const mota = 'cmndMatTruoc';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'cmndMatSau') {
                const mota = 'cmndMatSau';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'chungNhanHssv') {
                const mota = 'chungNhanHssv';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'xacNhanThuNhap') {
                const mota = 'xacNhanThuNhap';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'soHoKhau') {
                const mota = 'soHoKhau';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'giayKetHon') {
                const mota = 'giayKetHon';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'giayChungNhanQuanHe') {
                const mota = 'giayChungNhanQuanHe';
                handleCreate({ srcPath, basePath, mota, shcc });
            } else if (fields.userData && fields.userData[0] == 'minhChungKhac') {
                const mota = 'minhChungKhac';
                const files = files.PhuThuocDetail;
                files.forEach((file, index) => {
                    handleCreate({ srcPath: file.path, basePath, mota: `${mota}_${index + 1}`, shcc });
                });
            }
        }
    };

    app.uploadHooks.add('PhuThuocDetail', (req, fields, files, params, done) =>
        app.permission.has(req, () => handleUploadMinhChungDetail(req, fields, files, params, done), done, 'tcThuePhuThuoc:write')
    );
    app.get('/user/tncn/phu-thuoc', app.permission.orCheck('tcThuePhuThuoc:read', 'tcThuePhuThuoc:write', 'tcThuePhuThuoc:delete'), app.templates.admin);
    app.get('/user/tncn/phu-thuoc/:id', app.permission.orCheck('tcThuePhuThuoc:read', 'tcThuePhuThuoc:write', 'tcThuePhuThuoc:delete'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/cb/tncn/phu-thuoc', app.permission.check('tcThuePhuThuoc:read'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const items = await app.model.tcTncnDangKyNguoiPhuThuoc.getAll({ shcc }, '*', 'id DESC');
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/cb/tncn/phu-thuoc', app.permission.check('tcThuePhuThuoc:write'), async (req, res) => {
        try {
            const { shcc, email } = req.session.user;
            const { cmnd, ngayCap, maSoThue, hoVaTen } = req.body.data;
            const now = Date.now();
            const id = await app.model.tcTncnDangKyNguoiPhuThuoc.create({
                shcc,
                cmnd,
                ngayCap,
                maSoThue,
                hoVaTen,
                ngayTao: now,
                ngayUpdate: now,
                nguoiTao: email,
                nguoiUpdate: email,
                trangThai: 'BAN_NHAP'
            }).then(item => item.id);
            const pathFolder = app.path.join('khtc', 'tncn', req.session.user?.shcc, 'tcPhuThuoc', `${id}`);
            await app.fs.promises.mkdir(app.path.join(app.assetPath, pathFolder), { recursive: true });
            await app.model.tcTncnDangKyNguoiPhuThuoc.update({ id }, { pathFolder });
            res.send({ id });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/cb/tncn/phu-thuoc', app.permission.check('tcThuePhuThuoc:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const ngayUpdate = Date.now();
            const item = await app.model.tcTncnDangKyNguoiPhuThuoc.update({ id }, { ...changes, ngayUpdate });
            res.send({ id: item.id });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/cb/tncn/phu-thuoc/detail', app.permission.check('tcThuePhuThuoc:write'), async (req, res) => {
        try {
            const { idDangKy, hoVaTen, loaiPhuThuoc, cmnd, ngaySinh, quocTich, quanHeVoiNguoiNop, thoiDiemBatDau, thoiDiemKetThuc, maSoThue, ngayCap } = req.body;
            const { id } = await app.model.tcTncnDangKyNguoiPhuThuocDetail.create({
                idDangKy, hoVaTen, loaiPhuThuoc, cmnd, ngaySinh, quocTich, quanHeVoiNguoiNop, thoiDiemBatDau, thoiDiemKetThuc, maSoThue, ngayCap, ngayTao: Date.now()
            });
            const pathFolder = app.path.join(app.assetPath, 'khtc', 'tncn', req.session.user?.shcc, 'tcPhuThuoc', `${idDangKy}`, `${id}`);
            await app.fs.promises.mkdir(pathFolder, { recursive: true });
            res.send({ id });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/cb/tncn/phu-thuoc/detail', app.permission.check('tcThuePhuThuoc:write'), async (req, res) => {
        try {
            const { id, changes, idDangKy } = req.body;
            const item = await app.model.tcTncnDangKyNguoiPhuThuocDetail.update({ id }, changes);
            await app.model.tcTncnDangKyNguoiPhuThuoc.update({ id: idDangKy }, { ngayUpdate: Date.now() });
            res.send({ id: item.id });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/cb/tncn/phu-thuoc/:id', app.permission.check('tcThuePhuThuoc:read'), async (req, res) => {
        try {
            const id = req.params.id;
            const shcc = req.session.user?.shcc;
            const isValidRequest = await app.model.tcTncnDangKyNguoiPhuThuoc.get({ id, shcc });
            // let items = [];
            if (isValidRequest) {
                const items = await app.model.tcTncnDangKyNguoiPhuThuocDetail.getAll({ idDangKy: id }, '*', 'id ASC');
                const nguoiKeKhai = await app.model.tcTncnDangKyNguoiPhuThuoc.get({ id });
                res.send({ items, nguoiKeKhai });

            } else {
                throw 'Invalid Permission';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/cb/tncn/phu-thuoc/detail/:id', app.permission.check('tcThuePhuThuoc:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const idDangKy = await app.model.tcTncnDangKyNguoiPhuThuocDetail.get({ id }).then(item => item.idDangKy);
            const phuThuoc = await app.model.tcTncnDangKyNguoiPhuThuoc.get({ id: idDangKy });
            if (phuThuoc?.trangThai == 'BAN_NHAP') {
                const pathDelete = app.path.join(phuThuoc.pathFolder, `${idDangKy}`, `${id}`);
                app.fs.deleteFolder(pathDelete);
                await app.model.tcTncnDangKyNguoiPhuThuocDetail.delete({ id });
                res.send({});
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/cb/tncn/phu-thuoc/download/:id', app.permission.check('tcThuePhuThuoc:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const item = await app.model.tcTncnDangKyNguoiPhuThuoc.get({ id });
            const directoryPath = item.pathFolder;
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

    app.get('/api/cb/tncn/phu-thuoc/download/detail/tai-minh-chung', app.permission.check('tcThuePhuThuoc:write'), async (req, res) => {
        try {
            const { id, idDangKy } = req.query;
            const item = await app.model.tcTncnDangKyNguoiPhuThuoc.get({ id: idDangKy });
            const directoryPath = app.path.join(item.pathFolder, id);
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