module.exports = app => {
    // const FILE_TYPE = 'DI';

    const LOAI_VAN_BAN = 'DI';


    const { CONG_VAN_DI_TYPE, action, vanBanDi, MA_HCTH } = require('../../constant');

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            502: { title: 'Văn bản đi', link: '/user/hcth/van-ban-di', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA' },
        },
    };
    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            402: { title: 'Văn bản đi', link: '/user/van-ban-di', icon: 'fa-caret-square-o-right', backgroundColor: '#0B86AA' },
        },
    };

    const staffPermission = 'donViCongVanDi:edit',
        managerPermission = 'donViCongVanDi:manage';

    app.permissionHooks.add('staff', 'addRoleSoanThaoVanBanDi', (user, staff) => new Promise(resolve => {
        if (staff && staff.maDonVi) {
            app.permissionHooks.pushUserPermission(user, 'donViCongVanDi:edit');
            resolve();
        } else resolve();
    }));

    /**
     *  permission list*/
    app.permission.add(
        { name: 'hcthCongVanDi:read' },
        { name: 'hcthCongVanDi:write' },
        { name: 'hcthCongVanDi:delete' },
        { name: 'hcthCongVanDi:manage' },
        { name: managerPermission },
        { name: 'hcth:login', menu: staffMenu },
        { name: 'staff:login', menu },
        { name: 'hcth:manage' },
        { name: 'hcthSoVanBan:write' }
    );

    app.permissionHooks.add('staff', 'addRolesHcthVanBanDi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/van-ban-di', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/van-ban-di/bulk', app.permission.orCheck('developer:switched'), app.templates.admin);
    app.get('/user/van-ban-di/:id', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/van-ban-di/convert/:id', app.permission.orCheck('hcthCongVanDi:write', 'donViCongVanDi:edit'), app.templates.admin);
    app.get('/user/hcth/van-ban-di', app.permission.check('hcthCongVanDi:read'), app.templates.admin);
    app.get('/user/hcth/van-ban-di/:id', app.permission.check('hcthCongVanDi:read'), app.templates.admin);
    app.get('/user/hcth/van-ban-di/convert/:id', app.permission.orCheck('hcthCongVanDi:write', 'donViCongVanDi:edit'), app.templates.admin);

    const getDonViQuanLy = (req) => req.session?.user?.staff?.donViQuanLy?.map(item => item.maDonVi) || [];
    const getDonVi = (req) => req.session?.user?.staff?.maDonVi;
    const getShcc = (req) => req.session.user?.shcc;
    const getCurrentPermissions = (req) => (req.session && req.session.user && req.session.user.permissions) || [];


    const createHistory = async (data) => {
        try {
            await app.model.hcthHistory.create(data);
        } catch (error) {
            //skip
            console.error(error);
        }
    };

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/van-ban-di/search/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const
                // pageNumber = parseInt(req.params.pageNumber),
                // pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                permissions = req.session.user.permissions;
            let { isProcessed, requireProcessing, donViGui, donViNhan, canBoNhan, capVanBan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime, congVanYear } = req.query.filter || {};
            let chucVu = req.session.user?.staff?.listChucVu || [];
            chucVu = chucVu.map(i => `${i.maDonVi}_${i.isManager}_${i.isViceManager}`);

            //status scheme
            let scope = { SELF: [], DEPARTMENT: [], GLOBAL: [], };

            scope.SELF = [vanBanDi.trangThai.DA_PHAT_HANH.id];

            if (permissions.includes(managerPermission))
                scope.DEPARTMENT = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('rectors:login') || permissions.includes('hcthCongVanDi:read'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('developer:login'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).map(item => item.id);
            Object.keys(scope).forEach(key => scope[key] = scope[key].toString());

            const userDepartments = new Set(getDonViQuanLy(req));
            if (getDonVi(req))
                userDepartments.add(getDonVi(req));

            const userShcc = getShcc(req);
            let reuqiredPermission = await app.model.hcthDoiTuongKiemDuyet.getAll({}, 'permissionList', 'permissionList');
            reuqiredPermission = reuqiredPermission.map(item => item.permissionList);

            let userPermission = getCurrentPermissions(req).intersect(reuqiredPermission).toString();
            const filterData = { chucVuUser: chucVu.toString(), isProcessed: Number(isProcessed) || 0, requireProcessing: Number(requireProcessing) || 0, userShcc, userPermission, userDepartments: [...userDepartments].toString(), donViGui, donViNhan, canBoNhan, capVanBan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime };
            if (congVanYear && Number(congVanYear) > 1900) {
                filterData.timeType = 1;
                filterData.fromTime = new Date(`${congVanYear}-01-01`).getTime();
                filterData.toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
            }
            // const page = await app.model.hcthCongVanDi.searchPageAlternate(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), searchTerm, app.utils.stringify(scope), app.utils.stringify(filterData));
            const page = await app.model.hcthCongVanDi.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), searchTerm, app.utils.stringify(filterData));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //create van ban
    app.post('/api/hcth/van-ban-di', app.permission.check('staff:login'), async (req, res) => {
        try {
            console.log(req.body);
            const { files = [], canBoNhan = [], donViNhan = [], donViNhanNgoai = [], banLuu = [], soCongVan, nhomDonViNhan = [], ...data } = req.body.data;

            let soDangKy;
            if (soCongVan) {
                soDangKy = await app.model.hcthSoDangKy.get({ id: soCongVan, suDung: 0 });
            }

            const { capVanBan, isPhysical, donViGui, isConverted = 0 } = data;
            const initialStatus = await app.model.hcthCongVanDi.getStatus(capVanBan, donViGui, isPhysical, null, isConverted, true, data.systemId);

            const instance = await app.model.hcthCongVanDi.create({ ...data, nguoiTao: req.session.user.shcc, ngayTao: new Date().getTime(), trangThai: initialStatus.trangThai, soDangKy: soDangKy ? soDangKy.id : null });
            const id = instance.id;

            // cap nhat soDangKy voi ma la id congvan
            if (soDangKy)
                await app.model.hcthSoDangKy.update({ id: soCongVan }, { ma: id, suDung: 1 });

            try {
                //create don vi nhan from list
                await app.model.hcthDonViNhan.createFromList(donViNhan, instance.id, LOAI_VAN_BAN);

                //create don vi nhan ngoai from list
                await app.model.hcthDonViNhan.createFromList(donViNhanNgoai, instance.id, LOAI_VAN_BAN, { donViNhanNgoai: 1, });

                //create nhom don vi nhan from list
                await app.model.hcthDonViNhan.createFromList(nhomDonViNhan, instance.id, LOAI_VAN_BAN, { isNhomDonVi: 1, });

                // create ban luu
                await app.model.hcthBanLuu.createFromList(banLuu, instance.id, LOAI_VAN_BAN,);

                //create can bo nhan from list
                await app.model.hcthCanBoNhan.listCreate(canBoNhan.map(shcc => ({ canBoNhan: shcc, ma: instance.id, loai: LOAI_VAN_BAN })));

                //handle list file
                app.fs.createFolder(app.path.join(app.assetPath, 'congVanDi', `${instance.id}`));
                await Promise.all(files.map(item => createFileVanBanDi(item, instance.id, req.session.user.shcc)));

                //create history
                await app.model.hcthHistory.create({ loai: 'DI', key: instance.id, shcc: req.session?.user?.shcc, hanhDong: 'CREATE', thoiGian: instance.ngayTao });
                await app.model.hcthVanBanDiStaging.create({ loai: 'DI', ma: instance.id, shcc: req.session?.user?.shcc, thoiGian: instance.ngayTao, maTrangThai: initialStatus.trangThai });


                res.send({ item: instance });
            } catch (error) {
                console.error(error);
                deleteCongVan(id, () => res.send({ error }));
                // res.send({ error });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    /**
     * 
     * Handle files when creating van ban di
     * @param file: object {fileName, originalFileName, phuLuc}
     * @param vanBanDi: id van ban di moi tao
     * @param creator: shcc cua can bo tai len file
     * 
     */
    const createFileVanBanDi = async (file, vanBanDi, creator) => {
        let instance = await app.model.hcthVanBanDiFile.create({ vanBanDi, phuLuc: file.phuLuc }),
            currentPath = app.path.join(app.assetPath, `congVanDi/new/${file.fileName}`),
            fileStat = await app.fs.statSync(currentPath);

        app.fs.renameSync(currentPath, app.path.join(app.assetPath, `congVanDi/${vanBanDi}/${file.fileName}`));

        const newFile = await app.model.hcthFile.create({ ten: file.originalFilename, nguoiTao: creator, tenFile: file.fileName, kichThuoc: Math.round(fileStat.size / 1024 * 100) / 100, loai: 'FILE_VBD', ma: instance.id, ngayTao: new Date().getTime(), });

        instance = await app.model.hcthVanBanDiFile.update({ id: instance.id }, { fileId: newFile.id });

        return instance;
    };


    const deleteCongVan = async (id, done, item, req) => {
        try {
            const files = await app.model.hcthVanBanDiFile.getAll({ vanBanDi: id }, 'id');
            await app.model.hcthVanBanDiFile.delete({ vanBanDi: id });
            const fileIdList = files.map(item => item.id);
            if (fileIdList.length) {
                await app.model.hcthFile.delete({
                    statement: 'ma in (:fileIdList) and loai = \'FILE_VBD\'',
                    parameter: { fileIdList }
                });
            }
            await app.model.hcthPhanHoi.delete({ loai: 'DI', key: id });
            await app.model.hcthHistory.delete({ loai: 'DI', key: id });
            await app.model.hcthCongVanDi.delete({ id });
            if (item)
                await app.model.hcthDeletedVanBanDi.create({ id, thoiGian: Date.now(), shcc: req.session.user.shcc, trichYeu: item.trichYeu });
            app.fs.deleteFolder(app.assetPath + '/congVanDi/' + id);
            done && done();
        } catch (error) {
            done && done(error);
        }
    };


    app.get('/api/hcth/van-ban-di/file/new/:fileName', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            let { fileName } = req.params, buffer, originalFileName = fileName;
            const { format, purpose } = req.query;


            let path = app.path.join(app.assetPath, 'congVanDi', 'new', fileName);
            if (purpose == 'view') {
                const realPath = path;
                fileName = fileName.replace(/[.][A-Za-z0-9]*$/, '.pdf');
                originalFileName = fileName;
                path = path.replace(/[.][A-Za-z0-9]*$/, '.pdf');
                if (app.fs.existsSync(path)) {
                    buffer = app.fs.readFileSync(path);
                } else {
                    buffer = app.fs.readFileSync(realPath);
                    buffer = await app.docx.toPdfBuffer(buffer);
                    app.fs.writeFileSync(path, buffer);
                }
            } else
                buffer = app.fs.readFileSync(path);
            if (!format) {
                res.setHeader('Content-Disposition', 'attachment;filename=' + `${app.toEngWord(originalFileName)}`);
                return res.end(buffer);
            }
            else if (format == 'base64')
                return res.send({ data: buffer.toString('base64') });
            throw 'Lỗi format file';
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    });

    app.get('/api/hcth/van-ban-di/file/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id } = req.params;
            const { format, version, purpose } = req.query;
            const instance = await app.model.hcthVanBanDiFile.get({ id });
            let condition = {
                id: instance.fileId,
                ma: instance.id,
                loai: 'FILE_VBD'
            };
            if (version)
                condition.id = version;
            const file = await app.model.hcthFile.get({ id: instance.fileId });
            if (!instance || !file) return res.status(404).send({ error: 'Tệp tin không tồn tại' });
            let path = app.path.join(app.assetPath, `congVanDi/${instance.vanBanDi}`, file.tenFile);
            let fileName = file.tenFile, buffer, originalFileName = file.ten;
            if (purpose == 'view') {
                const realPath = path;
                fileName = fileName.replace(/[.][A-Za-z0-9]*$/, '.pdf');
                originalFileName = originalFileName.replace(/[.][A-Za-z0-9]*$/, '.pdf');
                path = app.path.join(app.assetPath, `congVanDi/${instance.vanBanDi}`, fileName);
                if (app.fs.existsSync(path)) {
                    buffer = app.fs.readFileSync(path);
                } else {
                    buffer = app.fs.readFileSync(realPath);
                    buffer = await app.docx.toPdfBuffer(buffer);
                    app.fs.writeFileSync(path, buffer);
                }
            } else
                buffer = app.fs.readFileSync(path);
            if (!format) {
                res.setHeader('Content-Disposition', 'attachment;filename=' + `${app.toEngWord(originalFileName)}`.replaceAll(/[^a-zA-Z0-9-_.\(\)\[\]\s]/, '_'));
                return res.end(buffer);
            }
            else if (format == 'base64')
                return res.send({ data: buffer.toString('base64') });
            throw 'Lỗi format file';
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    });

    const canSave = (req, item) => {
        const permissions = getCurrentPermissions(req);
        if (!item || !item.status.isEditable) return false;
        const editors = item.status.editor;
        return checkTarget(permissions, editors, item, req);
    };

    const canPartialEdit = (req, item) => {
        const permissions = getCurrentPermissions(req);
        if (!item?.status?.isPartialEditable) return false;
        const partialEditors = item.status.partialEditors;
        return partialEditors.some(editor => {
            if (editor.isCreator) return isCreator(req, item);
            else if (editor.isDepartment && isManager(req, item, editor.permission)) return true;
            else {
                if (permissions.includes(editor.permission)) return true;
            }
        });
    };

    app.put('/api/hcth/van-ban-di/:id', app.permission.orCheck(staffPermission, 'hcthCongVanDi:read', 'developer:login'), async (req, res) => {
        try {
            //NOTE this api will not accept modification of status
            // eslint-disable-next-line no-unused-vars            
            let { canBoNhan = [], donViNhan = [], nhomDonViNhan = [], donViNhanNgoai = [], banLuu = [], soCongVan, trangThai, ...data } = req.body;
            console.log({ body: req.body });
            const id = req.params.id;
            const saveHistory = req.query.saveHistory;

            let current = await app.model.hcthCongVanDi.getInstance(id);

            if (!(canSave(req, current) || canPartialEdit(req, current)))
                throw 'Trạng thái văn bản không hợp lệ';

            const partialEdit = canPartialEdit(req, current) && !canSave(req, current);
            if (partialEdit) {
                data = { ngayKy: data.ngayKy, ngayGui: data.ngayGui, soVanBan: data.soVanBan };
            }
            // cập nhật số đăng ký
            let instance = await app.model.hcthCongVanDi.update({ id }, { ...data, soDangKy: soCongVan });

            /*  Xét khi số đăng ký hiện tại khác số đăng ký mới
            *   1. Nếu mà số đăng ký hiện tại có thì cập nhật ở db soDangKy là suDung: 0, ma: null
            *   2. Nếu mà số đăng ký mới có thì cập nhật ở db soDangKy là suDung: 1, ma: congVanId
            *   3. Xét if ở if (soCongVan) do có 2 trường hợp số văn bản mới là có số ở db hoặc là null
            */
            if (current.soDangKy != soCongVan) {
                if (current.soDangKy) await app.model.hcthSoDangKy.update({ id: current.soDangKy }, { suDung: 0, ma: null });
                if (soCongVan) await app.model.hcthSoDangKy.update({ id: soCongVan }, { suDung: 1, ma: instance.id });
            }

            //update don vi nhan
            // NOTE: this is just a quick solution
            //TODO: delete only deleted items and create only new item
            if (!partialEdit) {

                await app.model.hcthDonViNhan.delete({ ma: id, loai: LOAI_VAN_BAN });
                await app.model.hcthCanBoNhan.delete({ ma: id, loai: LOAI_VAN_BAN });
                await app.model.hcthBanLuu.delete({ ma: id, loai: LOAI_VAN_BAN });

                //create don vi nhan ngoai from list
                await app.model.hcthDonViNhan.createFromList(donViNhanNgoai, instance.id, LOAI_VAN_BAN, { donViNhanNgoai: 1, });
                await app.model.hcthDonViNhan.createFromList(donViNhan, instance.id, LOAI_VAN_BAN, { donViNhanNgoai: 0, });
                //create nhom don vi nhan from list
                await app.model.hcthDonViNhan.createFromList(nhomDonViNhan, instance.id, LOAI_VAN_BAN, { isNhomDonVi: 1, });


                // create ban luu
                await app.model.hcthBanLuu.createFromList(banLuu, instance.id, LOAI_VAN_BAN,);

                //create can bo nhan from list
                await app.model.hcthCanBoNhan.listCreate(canBoNhan.map(shcc => ({ canBoNhan: shcc, ma: instance.id, loai: LOAI_VAN_BAN })));
            }
            if (req.session?.user?.shcc)
                saveHistory && await app.model.hcthHistory.create({ key: id, loai: LOAI_VAN_BAN, hanhDong: action.UPDATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.delete('/api/hcth/van-ban-di', app.permission.check('staff:login'), async (req, res) => {
        try {
            const instance = await app.model.hcthCongVanDi.getInstance(req.body.id);
            if (await isRelated(instance, req) && isDeletable(req, instance))
                await deleteCongVan(req.body.id, null, instance, req);
            else
                throw 'Permission denied';
            res.send({});

        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/van-ban-di/delete-file', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { vanBanDi, fileId, id, fileName } = req.body;

            let filePath, fileItem;
            if (!vanBanDi) {
                filePath = app.path.join(app.assetPath, '/congVanDi/new/', fileName);
                app.fs.deleteFile(filePath);
            } else {
                fileItem = await app.model.hcthFile.get({ id: fileId });
                filePath = app.path.join(app.assetPath, `/congVanDi/${vanBanDi}/`, fileItem.tenFile);
                await app.model.hcthFile.delete({ id: fileId });
                await app.model.hcthHistory.create({ key: vanBanDi, loai: LOAI_VAN_BAN, content: '<p><span><span style="color:#0000ff"><strong>{ten_can_bo}</strong></span> đ&atilde; <strong><span style="color:#ff0000">xo&aacute; file {ten_file}</span> </strong>thuộc<strong>&nbsp;</strong>văn bản n&agrave;y.</span></p>'.replaceAll('{ten_file}', fileItem.ten), thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });
                await app.model.hcthVanBanDiFile.delete({ id });
                await app.model.hcthSigningConfig.delete({ vbdfId: id });
                app.fs.deleteFile(filePath);
            }
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });







    // Upload API  -----------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.assetPath, '/congVanDi'));
    app.fs.createFolder(app.path.join(app.assetPath, 'congVanDi', 'import'));


    app.uploadHooks.add('hcthVanBanDiFileV2', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthVanBanDiFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthVanBanDiFile = async (req, fields, files, params, done) => {
        try {
            const type = fields.userData?.length && fields.userData[0],
                data = fields.data && fields.data[0] && app.utils.parse(fields.data[0]);
            if (type == 'hcthVanBanDiFileV2') {
                let
                    file = files.hcthVanBanDiFileV2[0],
                    { path, originalFilename } = file,
                    validFileType = ['.pdf', '.doc', '.docx'], //TODO: allow doc and docx
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(fileName);
                if (!validFileType.includes(extName))
                    return done && done({ error: 'Định dạng file không hợp lệ' });
                if (!data.id) {
                    app.fs.renameSync(path, app.path.join(app.assetPath, 'congVanDi/new', fileName));
                    done && done({
                        fileName,
                        originalFilename,
                        phuLuc: data.phuLuc,
                        file: { ten: originalFilename, tenFile: fileName },
                    });
                }
                else {
                    //check if van ban di to add file existed
                    const vbd = await app.model.hcthCongVanDi.getInstance(data.id);
                    //get file stat
                    const fileStat = await app.fs.statSync(path);
                    //move file to van ban asset folder
                    app.fs.renameSync(path, app.path.join(app.assetPath, `congVanDi/${data.id}`, fileName));
                    // create van ban di file instance
                    let instance, originFile, extension = '';
                    if (!data.fileId)
                        instance = await app.model.hcthVanBanDiFile.create({ vanBanDi: vbd.id, phuLuc: data.phuLuc });
                    else {
                        instance = await app.model.hcthVanBanDiFile.get({ vanBanDi: vbd.id, id: data.fileId });
                        originFile = await app.model.hcthFile.get({ loai: 'FILE_VBD', id: instance.fileId });
                    }

                    if (originFile && originFile.ten != file.originalFilename) {
                        extension = `&nbsp; bằng&nbsp;<strong><span style="color:#00a65a">file </span><em><span style="color:#00a65a">{ten_file}</span></em></strong>
                            `.replaceAll('{ten_file}', file.originalFilename);
                    }


                    if (!instance) throw 'Invalid arguments';

                    // create physic file information
                    const newFile = await app.model.hcthFile.create({ ten: file.originalFilename, nguoiTao: req.session.user.shcc, tenFile: fileName, kichThuoc: Math.round((fileStat.size / 1024) * 100) / 100, loai: 'FILE_VBD', ma: instance.id, thoiGian: new Date().getTime(), });
                    // update the latest physic file of van ban di file
                    if (!originFile)
                        await createHistory({ key: vbd.id, loai: LOAI_VAN_BAN, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc, content: '<p><span><span style="color:#0000ff"><strong>{ten_can_bo}</strong></span> đ&atilde; <strong><span style="color:#00a65a">tải lên file {ten_file}</span> &nbsp;</strong>cho văn bản bản n&agrave;y.</span></p>'.replaceAll('{ten_file}', file.originalFilename) });
                    else
                        await createHistory({ key: vbd.id, loai: LOAI_VAN_BAN, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc, content: '<p><span style="color:#0000ff"><strong>{ten_can_bo}</strong></span> đ&atilde; <strong><span style="color:#00a65a">cập nhật file </span><em><span style="color:#00a65a">{ten_file}</span></em></strong><span style="color:#000000">{extension}</span><span style="color:#000000">.</span></p>'.replaceAll('{ten_file}', originFile.ten).replaceAll('{extension}', extension) });
                    instance = await app.model.hcthVanBanDiFile.update({ id: instance.id }, { fileId: newFile.id });
                    done && done({
                        ...instance,
                        file: newFile
                    });
                }
            }

        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };

    app.get('/api/hcth/van-ban-di/file-list/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const instance = await app.model.hcthCongVanDi.getInstance(id);
            if (!await isRelated(instance, req)) {
                throw { status: 401, message: 'permission denied' };
            }
            res.send({ files: await getFiles(instance.id) });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //TODO: delelte file

    const isRelated = async (congVan, req) => {
        try {
            if (isVisible(req, congVan))
                return true;
            if (req.query.nhiemVu) {
                const count = await app.model.hcthLienKet.count({
                    keyA: req.query.nhiemVu,
                    loaiA: 'NHIEM_VU',
                    loaiB: 'VAN_BAN_DI',
                    keyB: req.params.id
                });
                if (await app.hcthNhiemVu.checkNhiemVuPermission(req, null, req.query.nhiemVu)
                    && count && count.rows[0] && count.rows[0]['COUNT(*)'])
                    return true;
            }
            const { outBinds } = await app.model.hcthNhiemVu.hasVanBan(req.session.user?.shcc, congVan.id, 'VAN_BAN_DI');
            if (outBinds.ret > 0) {
                return true;
            }

        } catch {
            return false;
        }
    };

    const viewCongVan = async (congVanId, shcc, nguoiTao) => {
        if (!shcc || shcc == nguoiTao) return;
        const history = await app.model.hcthHistory.get({ loai: 'DI', key: congVanId, shcc: shcc, hanhDong: action.VIEW });
        if (!history) {
            return await app.model.hcthHistory.create({ loai: 'DI', key: congVanId, shcc: shcc, hanhDong: action.VIEW, thoiGian: new Date().getTime() });
        }
        return;
    };


    app.get('/api/hcth/van-ban-di/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw { status: 400, message: 'Invalid id' };
            }

            const congVan = await app.model.hcthCongVanDi.getInstance(id);
            if (congVan.status.systemId != congVan.systemId) {
                await app.model.hcthCongVanDi.update({ id: congVan.id }, { systemId: congVan.status.systemId });
            }

            // const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: 'DI' }, 'id, donViNhan, donViNhanNgoai', 'id');
            let donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: LOAI_VAN_BAN, donViNhanNgoai: 0, isNhomDonVi: 0 }, 'donViNhan', 'id');
            let nhomDonViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: LOAI_VAN_BAN, donViNhanNgoai: 0, isNhomDonVi: 1 }, 'donViNhan', 'id');
            let donViNhanNgoai = await app.model.hcthDonViNhan.getAll({ ma: id, loai: LOAI_VAN_BAN, donViNhanNgoai: 1 }, 'donViNhan', 'id');
            let canBoNhan = await app.model.hcthCanBoNhan.getAll({ ma: id, loai: LOAI_VAN_BAN });
            const banLuu = await app.model.hcthBanLuu.getAll({ ma: id, loai: LOAI_VAN_BAN }, 'donVi', 'id');
            if (!(req.session.user.permissions.includes('developer:login') || await isRelated(congVan, req))) {
                throw { status: 401, message: 'permission denied' };
            }

            else if (congVan.trangThai == vanBanDi.trangThai.DA_PHAT_HANH.id && req.session.user?.shcc) {
                await viewCongVan(id, req.session.user.shcc, congVan.nguoiTao);
            }
            // let files = await app.model.hcthFile.getAllFrom(id, 'DI');

            const files = await getFiles(id);

            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, 'DI');
            const history = await app.model.hcthHistory.getAllFrom(id, 'DI', req.query.historySortType);

            let danhSachCanBoNhan = [],
                danhSachDonViNhan = [],
                danhSachDonViNhanNgoai = [],
                danhSachNhomDonViNhan = [],
                tenVietTatDonViGui = '',
                tenVietTatLoaiVanBan = '';
            donViNhan = donViNhan.map((item) => item.donViNhan);
            donViNhanNgoai = donViNhanNgoai.map((item) => item.donViNhan);
            nhomDonViNhan = nhomDonViNhan.map((item) => item.donViNhan);
            canBoNhan = canBoNhan.map((item) => item.canBoNhan);
            if (canBoNhan.length) {
                danhSachCanBoNhan = await app.model.tchcCanBo.getAll({
                    statement: 'SHCC IN (:danhSach)',
                    parameter: { danhSach: canBoNhan }
                }, 'shcc,ten,ho,email', 'ten');
            }

            if (donViNhan?.length) {
                danhSachDonViNhan = await app.model.dmDonVi.getAll({
                    statement: `MA IN (${donViNhan.toString()})`,
                    parameter: {},
                }, 'ma, ten', 'ma');
            }

            if (donViNhanNgoai?.length) {
                danhSachDonViNhanNgoai = await app.model.dmDonViGuiCv.getAll({
                    statement: `ID IN (${donViNhanNgoai.toString()})`,
                    parameter: {},
                }, 'id, ten', 'id');
            }

            if (nhomDonViNhan?.length) {
                danhSachNhomDonViNhan = await app.model.dmNhomDonVi.getAll({
                    statement: `ID IN (${nhomDonViNhan.toString()})`,
                    parameter: {},
                }, 'id, ten', 'id');
            }

            let soVanBan = null;

            if (congVan.soDangKy) {
                soVanBan = await app.model.hcthSoDangKy.get({ id: congVan.soDangKy }, 'id, soCongVan');
            }

            if (congVan.loaiVanBan) {
                const loaiVanBan = await app.model.dmLoaiVanBan.get({ id: Number(congVan.loaiVanBan) });
                if (loaiVanBan) tenVietTatLoaiVanBan = loaiVanBan.tenVietTat;
            }

            const donViGui = await app.model.dmDonVi.get({ ma: Number(congVan.donViGui) });

            if (donViGui) {
                tenVietTatDonViGui = donViGui.tenVietTat;
            }

            if (req.session?.user?.shcc && !(await app.model.hcthSeenStatus.get({ ma: congVan.id, loai: 'DI', shcc: req.session.user.shcc }))) {
                await app.model.hcthSeenStatus.create({ ma: congVan.id, loai: 'DI', shcc: req.session.user.shcc });
            }
            const { rows: nhiemVu = [] } = await app.model.hcthNhiemVu.getFromLienKet(app.utils.stringify({
                loaiLienKet: 'VAN_BAN_DI', maLienKet: congVan.id, userShcc: getShcc(req),
                donViCanBo: getDonViQuanLy(req).toString(),
                userPermissions: getCurrentPermissions(req).filter(i => ['htch:mnage', 'rectors:login'].includes(i)).toString()
            }));

            res.send({
                item: {
                    ...congVan,
                    donViNhan, donViNhanNgoai, nhomDonViNhan, canBoNhan, files,
                    danhSachCanBoNhan, danhSachDonViNhan, danhSachDonViNhanNgoai, danhSachNhomDonViNhan,
                    banLuu: banLuu.map(item => item.donVi),
                    phanHoi: phanHoi?.rows || [],
                    history: history?.rows || [],
                    soVanBan,
                    tenVietTatDonViGui,
                    tenVietTatLoaiVanBan,
                    nhiemVu
                },
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    const getFiles = async (id) => {
        /**
         * TODO:
         *  there aren't many files in each van ban di, but we should use function in db just in case;
         */
        const
            files = await app.model.hcthVanBanDiFile.getAll({ vanBanDi: id }),
            result = files.map(async (item) => {
                const config = await app.model.hcthSigningConfig.getList(item.id),
                    file = await app.model.hcthFile.get({ id: item.fileId });
                return {
                    ...item,
                    file, //physic file info 
                    config: config.rows || [] //all signing config of van ban di file(signType, singer, ...)
                };
            });
        return await Promise.all(result);
    };

    app.post('/api/hcth/van-ban-di/phan-hoi', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { noiDung, key } = req.body.data;

            const instance = await app.model.hcthCongVanDi.getInstance(Number(key));

            if (!await isRelated(instance, req)) {
                throw { status: 401, message: 'permission denied' };
            }

            const newPhanHoi = {
                canBoGui: req.session.user.shcc,
                noiDung,
                key: Number(key),
                ngayTao: new Date().getTime(),
                loai: LOAI_VAN_BAN
            };

            await app.model.hcthPhanHoi.create(newPhanHoi);
            res.send({});
        } catch (error) { console.error(error); res.send({ error }); }
    });

    app.get('/api/hcth/van-ban-di/lich-su/:id', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), 'DI', req.query.historySortType, (error, item) => res.send({ error, item: item?.rows || [] }));
    });


    // Phân quyền Quản lý Văn bản đi trong đơn vị
    const quanLyCongVanDiRole = 'quanLyCongVanDiPhong';

    app.assignRoleHooks.addRoles(quanLyCongVanDiRole, { id: managerPermission, text: 'Quản lý văn bản đi trong đơn vị' });

    app.assignRoleHooks.addHook(quanLyCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === quanLyCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(quanLyCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyDonVi', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length > 0) {
            app.permissionHooks.pushUserPermission(user, staffPermission, managerPermission, 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyCongVanDiTrongDonVi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole === quanLyCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole == managerPermission) {
                app.permissionHooks.pushUserPermission(user, managerPermission, staffPermission, 'dmDonVi:read', 'dmDonViGuiCv:read');
            }
        });
        resolve();
    }));

    // Phân quyền hành chính tổng hợp - Quản lí văn bản đi

    const hcthQuanLyCongVanDiRole = 'hcthQuanLyCongVanDi';
    app.assignRoleHooks.addRoles(hcthQuanLyCongVanDiRole, { id: 'hcthCongVanDi:manage', text: 'Hành chính - Tổng hợp: Quản lý văn bản đi' });

    app.assignRoleHooks.addHook(hcthQuanLyCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == hcthQuanLyCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(hcthQuanLyCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleHcthQuanLyCongVanDi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == hcthQuanLyCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'hcthCongVanDi:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcth:login', 'hcthCongVanDi:manage', 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write', 'dmDonViGuiCv:delete', 'hcthCongVanDi:read', 'hcthCongVanDi:write', 'hcthCongVanDi:delete', 'hcthSoVanBan:write');
            }
        });
        resolve();
    }));

    // Phân quyền soạn thảo văn bản đi trong đơn vị
    const soanThaoCongVanDiRole = 'soanThaoCongVanDi';

    app.assignRoleHooks.addRoles(soanThaoCongVanDiRole, { id: staffPermission, text: 'Soạn thảo văn bản đi trong đơn vị' });

    app.assignRoleHooks.addHook(soanThaoCongVanDiRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === soanThaoCongVanDiRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(soanThaoCongVanDiRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleSoanThaoCongVanDi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == soanThaoCongVanDiRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === staffPermission) {
                app.permissionHooks.pushUserPermission(user, staffPermission, 'dmDonVi:read', 'dmDonViGuiCv:read');
            }
        });
        resolve();
    }));


    app.get('/api/hcth/van-ban-di/selector/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                permissions = req.session.user.permissions;
            const { ids = '', excludeIds = '', hasIds = 0, fromTime = null, toTime = null } = req.query.filter;

            const userDepartments = new Set(getDonViQuanLy(req));
            if (getDonVi(req))
                userDepartments.add(getDonVi(req));

            const userShcc = getShcc(req);

            //status scheme
            let scope = { SELF: [], DEPARTMENT: [], GLOBAL: [], };

            scope.SELF = [vanBanDi.trangThai.DA_PHAT_HANH.id];

            if (permissions.includes(managerPermission))
                scope.DEPARTMENT = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('rectors:login') || permissions.includes('hcthCongVanDi:read'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('developer:login'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).map(item => item.id);

            Object.keys(scope).forEach(key => scope[key] = scope[key].toString());

            const filterParam = {
                ids, excludeIds, hasIds, fromTime, toTime,
                userShcc, userDepartments: [...userDepartments].toString()
            };

            const page = await app.model.hcthCongVanDi.searchSelector(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), app.utils.stringify(filterParam), app.utils.stringify(scope), searchTerm);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;

            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/van-ban-di/phan-hoi/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, CONG_VAN_DI_TYPE);
            res.send({ error: null, item: phanHoi?.rows || [] });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/hcth/van-ban-di/download-excel/:filter', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {

            const permissions = req.session.user.permissions;
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

            let { donViGui, donViNhan, canBoNhan, capVanBan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime, congVanYear } = app.utils.parse(req.params.filter) || { donViGui: '', donViNhan: '', capVanBan: '', loaiVanBan: '', donViNhanNgoai: '', status: '', timeType: '', fromTime: '', toTime: '', congVanYear: '' };

            //status scheme
            let scope = { SELF: [], DEPARTMENT: [], GLOBAL: [], };

            scope.SELF = [vanBanDi.trangThai.DA_PHAT_HANH.id];

            if (permissions.includes(managerPermission))
                scope.DEPARTMENT = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('rectors:login') || permissions.includes('hcthCongVanDi:read'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).filter(item => item.id != vanBanDi.trangThai.NHAP.id).map(item => item.id);
            if (permissions.includes('developer:login'))
                scope.GLOBAL = Object.values(vanBanDi.trangThai).map(item => item.id);
            Object.keys(scope).forEach(key => scope[key] = scope[key].toString());

            const userDepartments = new Set(getDonViQuanLy(req));
            if (getDonVi(req))
                userDepartments.add(getDonVi(req));

            const userShcc = getShcc(req);

            const filterParam = {
                userShcc, userDepartments: [...userDepartments].toString(), donViGui, donViNhan, canBoNhan, capVanBan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime
            };

            if (congVanYear && Number(congVanYear) > 1900) {
                filterParam.timeType = 1;
                filterParam.fromTime = new Date(`${congVanYear}-01-01`).getTime();
                filterParam.toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
            }

            const result = await app.model.hcthCongVanDi.downloadExcel(app.utils.stringify(filterParam), app.utils.stringify(scope), searchTerm);

            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('congvancacphong');
            const cells = [
                {
                    header: 'STT', width: 10, style: {
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                },
                {
                    header: 'Ngày gửi', width: 15, style: {
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                },
                {
                    header: 'Ngày ký', width: 15, style: {
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                },
                {
                    header: 'Trích yếu', width: 50, style: {
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                },
                {
                    header: 'Số văn bản', width: 20, style: {
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                },
                {
                    header: 'Đơn vị gửi', width: 30, style: {
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                },
                {
                    header: 'Đơn vị, cán bộ nhận', width: 45, style: {
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                }
            ];

            worksheet.columns = cells;
            worksheet.getRow(1).alignment = {
                ...worksheet.getRow(1).alignment,
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };
            worksheet.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true
            };

            worksheet.getRow(1).height = 40;
            result.rows.forEach((item, index) => {
                worksheet.getRow(index + 2).alignment = {
                    ...worksheet.getRow(index + 2).alignment,
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                };
                worksheet.getRow(index + 2).font = {
                    name: 'Times New Roman',
                    size: 12
                };
                worksheet.getCell('A' + (index + 2)).value = index + 1;
                worksheet.getCell('B' + (index + 2)).value = item.ngayGui ? app.date.dateTimeFormat(new Date(item.ngayGui), 'dd/mm/yyyy') : '';
                worksheet.getCell('C' + (index + 2)).value = item.ngayKy ? app.date.dateTimeFormat(new Date(item.ngayKy), 'dd/mm/yyyy') : '';
                worksheet.getCell('D' + (index + 2)).value = item.trichYeu;
                worksheet.getCell('D' + (index + 2)).alignment = { ...worksheet.getRow(index + 2).alignment, horizontal: 'left' };
                worksheet.getCell('E' + (index + 2)).value = item.soDangKy;
                worksheet.getCell('F' + (index + 2)).value = item.tenDonViGui;
                worksheet.getCell('F' + (index + 2)).alignment = { ...worksheet.getRow(index + 2).alignment, horizontal: 'left' };

                const donViNhan = item.danhSachDonViNhan?.split(';').map(item => item + '\r\n').join('') || '';
                const canBoNhan = item.danhSachCanBoNhan?.split(';').map(item => item + '\r\n').join('') || '';
                const donViNhanNgoai = item.danhSachDonViNhanNgoai?.split(';').map(item => item + '\r\n').join('') || '';
                worksheet.getCell('G' + (index + 2)).value = donViNhan != '' || donViNhanNgoai != '' || canBoNhan != '' ? donViNhan + donViNhanNgoai + canBoNhan : '';
                worksheet.getCell('G' + (index + 2)).alignment = { ...worksheet.getRow(index + 2).alignment, horizontal: 'left' };
            });
            let fileName = 'congvancacphong.xlsx';
            app.excel.attachment(workbook, res, fileName);
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/van-ban-di/file/config', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id, config } = req.body;
            const vanBanDiFile = await app.model.hcthVanBanDiFile.get({ id });
            const promises = config.map(async item => {
                const { id: itemId, ...data } = item;
                if (!itemId)
                    return await app.model.hcthSigningConfig.create({ vbdfId: vanBanDiFile.id, ...data });
                else
                    return await app.model.hcthSigningConfig.update({ id: itemId }, data);
            });
            await Promise.all(promises);
            await app.model.hcthHistory.create({ key: vanBanDiFile.vanBanDi, loai: LOAI_VAN_BAN, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc, hanhDong: action.UPDATE_SIGNING_CONFIG, });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const createNotification = async (emails, notification = { toEmail: '', title: '', subTitle: '', icon: 'fa-commenting', iconColor: '#1488db', link: '', buttons: [], sendEmail: null, sendSocket: true, notificationCategory: '' }) => {
        return (emails.map(async email => {
            await app.notification.send({
                toEmail: email,
                ...notification
            });
        }));
    };


    // Phân quyền soạn thảo văn bản đi trong đơn vị
    const dongDau = 'hcthMocDo', dongDauPermission = 'hcthMocDo:write';

    app.assignRoleHooks.addRoles(dongDau, { id: dongDauPermission, text: 'Hành chính tổng hợp: Quản lý mộc đỏ' });

    app.assignRoleHooks.addHook(dongDau, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === dongDau && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(dongDau).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleMocDo', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == dongDau);
        inScopeRoles.forEach(role => {
            if (role.tenRole === dongDauPermission) {
                app.permissionHooks.pushUserPermission(user, dongDauPermission, 'hcthSignature:write');
            }
        });
        resolve();
    }));

    // SEND MAIL ----------------------------------------------------------------------------------------------------------------------------------------
    // const sendMailWhenSign = async (item, req) => {
    //     const canBo = req.session?.user;

    //     const { email, emailPassword, signEmailDebug, guiSignEmailTitle, guiSignEmailEditorText, guiSignEmailEditorHtml } = await app.model.hcthSetting.getValue('email', 'emailPassword', 'signEmailDebug', 'guiSignEmailTitle', 'guiSignEmailEditorText', 'guiSignEmailEditorHtml');

    //     const url = `${app.isDebug ? app.debugUrl : app.rootUrl}/user/van-ban-di/${item.id}`;

    //     let mailTitle = guiSignEmailTitle.toUpperCase(),
    //         mailText = guiSignEmailEditorText.replaceAll('{id}', item.id)
    //             .replaceAll('{soCongVan}', item.soCongVan || 'Chưa có')
    //             .replaceAll('{nguoiKy}', `${canBo?.lastName || ''} ${canBo?.firstName || ''}`.trim().normalizedName() || 'Chưa có'),
    //         mailHtml = guiSignEmailEditorHtml.replaceAll('{id}', item.id).replaceAll('{link}', url)
    //             .replaceAll('{soCongVan}', item.soCongVan || 'Chưa có')
    //             .replaceAll('{nguoiKy}', `${canBo?.lastName || ''} ${canBo?.firstName || ''}`.trim().normalizedName() || 'Chưa có');

    //     if (app.isDebug) {
    //         app.service.emailService.send(email, emailPassword, signEmailDebug, null, null, mailTitle, mailText, mailHtml, null);
    //     } else {
    //         app.service.emailService.send(email, emailPassword, canBo?.email, null, null, mailTitle, mailText, mailHtml, null);
    //     }
    // };


    const isCreator = (req, item) => {
        return item.nguoiTao == req.session.user.shcc;
    };

    const isManager = (req, item, checkPermission) => {
        const permissions = getCurrentPermissions(req), donViQuanLy = getDonViQuanLy(req), donVi = getDonVi(req);
        return permissions.includes(checkPermission) && [...donViQuanLy, donVi].includes(item.donViGui);
    };
    const isViceManager = (req, item) => {
        const chucVu = req.session.user?.staff?.listChucVu || [];
        return chucVu.some(i => i.maDonVi == item.donViGui && i.isViceManager);
    };
    const canSwitchStatus = (req, item) => {
        const permissions = getCurrentPermissions(req);
        if (!item || !(item.status.backTo || item.status.forwardTo)) return false;
        const censors = item.status.censor;
        return checkTarget(permissions, censors, item, req);
    };

    const isVisible = (req, item) => {
        const permissions = getCurrentPermissions(req);
        const visibility = item.status.visibility;
        return checkTarget(permissions, visibility, item, req);
    };

    const isDeletable = (req, item) => {
        const permissions = getCurrentPermissions(req);
        const deletor = item.status.deletor;
        return checkTarget(permissions, deletor, item, req);
    };

    const checkTarget = (permissions, targetList, item, req) => {
        return targetList.some(target => {
            if (target.isCreator) return isCreator(req, item);
            else if (target.isDepartment && target.isViceManager) {
                return isViceManager(req, item);
            }
            else if (target.isDepartment) return isManager(req, item, target.permission);
            else {
                if (permissions.includes(target.permission)) return true;
            }
        });
    };

    app.put('/api/hcth/van-ban-di/item/status', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const data = req.body;
            if (data.multiple) {
                const idList = data.id;
                if (!idList || !idList.length) {
                    throw 'Danh sách văn bản không hợp lệ';
                }
                const ret = await Promise.allSettled(idList.map(id => app.hcthVanBanDi.toNextStatus(req, { ...data, id })));
                res.send({ error: ret.filter(i => i.status != 'fulfilled').length ? 'Có lỗi trong quá trình cập nhật' : null });
            } else {
                const { nextStatus, recipients } = await app.hcthVanBanDi.toNextStatus(req, req.body);
                res.send({ nextStatus, recipients });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.hcthVanBanDi = {
        toNextStatus: async (req, data) => {
            let nextStatus, skipped, { id, forward, back, status, modified, recipients, phanHoi, shccCanBoXuLy } = data;
            const permissions = getCurrentPermissions(req);
            const instance = await app.model.hcthCongVanDi.getInstance(id);

            if (forward) {
                nextStatus = await app.model.hcthVanBanDiStatusDetail.get({ systemId: instance.status.systemId, trangThai: instance.status.forwardTo });
            }
            else if (back) {
                nextStatus = await app.model.hcthVanBanDiStatusDetail.get({ systemId: instance.status.systemId, trangThai: instance.status.backTo });
            }
            else if (status && permissions.includes('hcthCongVanDi:manage')) {
                nextStatus = await app.model.hcthVanBanDiStatusDetail.get({ systemId: instance.status.systemId, trangThai: status });
            } else {
                throw 'Dữ liệu không hợp lệ';
            }
            if (!canSwitchStatus(req, instance) || !nextStatus) {
                throw 'Bạn không thể cập nhật trạng thái văn bản';
            }
            if (forward && nextStatus.allowSkip && nextStatus.forwardTo) {
                nextStatus = await app.model.hcthVanBanDiStatusDetail.get({ systemId: nextStatus.systemId, trangThai: nextStatus.backTo });
                skipped = true;
            }
            await app.model.hcthCongVanDi.getStatusAttribute(nextStatus);
            if (modified) {
                recipients = recipients || [];
                if (skipped) {
                    recipients = [...new Set([...recipients, ...await getNotificationRecipient(req, nextStatus, instance)])];
                }
            } else {
                recipients = await getNotificationRecipient(req, nextStatus, instance);
            }

            const recipientsInfo = recipients.length ? await await app.model.hcthCongVanDi.getUserInfo(recipients.toString()) : { rows: [] };

            const donViGuiObject = await app.model.dmDonVi.get({ ma: instance.donViGui });
            const soVanBanObject = instance.soDangKy ? await app.model.hcthSoDangKy.get({ id: instance.soDangKy }) : {};
            const soVanBan = soVanBanObject.soVanBan || 'Chưa có số văn bản';
            const tenCanBo = `${req.session.user.lastName || ''} ${req.session.user.firstName || ''}`.trim().normalizedName();
            let { mailText, mailHtml, mailSubject, historyContent, verifyFile, notificationSubject, notificationContent, notificationIcon } = nextStatus;
            if (mailText && mailHtml && mailSubject) {
                const { email, emailPassword } = await app.model.hcthSetting.getValue('email', 'emailPassword');

                mailSubject = mailSubject.replaceAll('{id}', instance.id).replaceAll('{don_vi_gui}', donViGuiObject.ten).replaceAll('{trich_yeu}', instance.trichYeu);
                mailHtml = mailHtml.replaceAll('{id}', instance.id).replaceAll('{ten_can_bo}', tenCanBo).replaceAll('{so_van_ban}', soVanBan).replaceAll('{don_vi_gui}', donViGuiObject.ten).replaceAll('{trich_yeu}', instance.trichYeu).replaceAll('{link}', (app.isDebug ? app.debugUrl.replaceAll('http://', '') : app.rootUrl.replaceAll('https://', '')) + '/user/van-ban-di/' + instance.id);
                mailText = mailText.replaceAll('{id}', instance.id).replaceAll('{ten_can_bo}', tenCanBo).replaceAll('{so_van_ban}', soVanBan).replaceAll('{don_vi_gui}', donViGuiObject.ten).replaceAll('{trich_yeu}', instance.trichYeu).replaceAll('{link}', (app.isDebug ? app.debugUrl.replaceAll('http://', '') : app.rootUrl.replaceAll('https://', '')) + '/user/van-ban-di/' + instance.id);
                recipientsInfo.rows.forEach(recipient => {
                    app.service.emailService.send(email, emailPassword, app.isDebug ? 'nqlong0709@gmail.com' : recipient.email, null, null, mailSubject, mailText, mailHtml, null);
                });
            }

            if (notificationSubject && notificationContent && notificationIcon) {
                notificationSubject = notificationSubject.replaceAll('{id}', instance.id).replaceAll('{ten_can_bo}', tenCanBo).replaceAll('{so_van_ban}', soVanBan).replaceAll('{don_vi_gui}', donViGuiObject.ten).replaceAll('{trich_yeu}', instance.trichYeu);
                notificationContent = notificationContent.replaceAll('{id}', instance.id).replaceAll('{ten_can_bo}', tenCanBo).replaceAll('{so_van_ban}', soVanBan).replaceAll('{don_vi_gui}', donViGuiObject.ten).replaceAll('{trich_yeu}', instance.trichYeu);
                const nextVanBanDiStatus = await app.model.hcthVanBanDiStatus.get({ ma: nextStatus.trangThai });
                createNotification(recipientsInfo.rows.map(item => item.email), { title: notificationSubject, subTitle: notificationContent, iconColor: nextVanBanDiStatus.mau, icon: notificationIcon, link: '/user/van-ban-di/' + instance.id, notificationCategory: 'VAN_BAN_DI:' + instance.id });
            }

            if (phanHoi) {
                const newPhanHoi = {
                    canBoGui: req.session.user.shcc,
                    noiDung: phanHoi,
                    key: instance.id,
                    ngayTao: new Date().getTime(),
                    loai: LOAI_VAN_BAN
                };

                await app.model.hcthPhanHoi.create(newPhanHoi);
            }

            await app.model.hcthCongVanDi.update({ id: instance.id }, { trangThai: nextStatus.trangThai });
            try {
                await app.model.hcthVanBanDiStaging.update({ ma: instance.id, maTrangThai: instance.trangThai }, { shcc: req.session.user.shcc, thoiGian: Date.now() });
            } catch {
                // skip
            }

            await app.model.hcthVanBanDiStaging.create({ loai: 'DI', ma: instance.id, maTrangThai: nextStatus.trangThai, shcc: shccCanBoXuLy });
            if (verifyFile) {
                verifyVanBanDiFile(id, 'Xác thực kiểm duyệt văn bản', 'Đại học khoa học và xã hội nhân văn', `${req.session.user.lastName || ''} ${req.session.user.firstName || ''}`.trim().normalizedName() + ' đã duyệt văn bản này', req).catch(error => console.error('Lỗi khi xác thực văn bản', error));
            }
            if (!nextStatus.isInitial)
                await createHistory({ key: instance.id, loai: LOAI_VAN_BAN, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc, content: historyContent });
            return { nextStatus, recipients };
        }
    };

    const verifyVanBanDiFile = async (vanBanId, name, location, reason, req) => {
        let fileList = await app.model.hcthVanBanDiFile.getAll({ vanBanDi: vanBanId });
        await Promise.all(fileList.map(async file => {
            file.item = await app.model.hcthFile.get({ id: file.fileId });
        }));
        fileList = fileList.filter(file => ['.pdf', '.doc', '.docx'].includes(app.path.extname(file.item.tenFile)));
        const sessionFolder = app.path.join(app.path.join(app.assetPath, 'pdf/cache'), `verify_${Date.now()}`);
        app.fs.createFolder(sessionFolder);
        await Promise.all(fileList.map(async file => {
            let path = app.path.join(app.assetPath, 'congVanDi', `${vanBanId}`, file.item.tenFile);
            if (app.path.extname(file.item.tenFile) != '.pdf') {
                let buffer = app.fs.readFileSync(path);
                buffer = await app.docx.toPdfBuffer(buffer);
                path = app.path.join(sessionFolder, file.item.tenFile.replace(/[.][A-Za-z0-9]*$/, '.pdf'));
                app.fs.writeFileSync(path, buffer);
            }
            const settingData = await app.model.hcthSetting.getValue('systemKeystorePassword');
            const newFileName = file.item.tenFile.replace(/[.][A-Za-z0-9]*$/, '_verified.pdf');
            const newName = file.item.ten.replace(/[.][A-Za-z0-9]*$/, '.pdf');
            const newFilePath = app.path.join(app.assetPath, 'congVanDi', `${vanBanId}`, newFileName);
            const { status, stderr, stdout } = await app.pdf.standardSign({
                input: path, output: newFilePath, location, reason, name,
                keystorePath: app.path.join(app.assetPath, 'ca', 'systemKeystore.p12'),
                passphrase: settingData.systemKeystorePassword,
            }); // status, stdout, stderr
            console.info({ status, stderr, stdout });
            if (status != 0) {
                console.error('verify file error', stderr, stdout);
            } else {
                const stats = app.fs.statSync(newFilePath);
                // eslint-disable-next-line no-unused-vars
                const { id: fileId, ...newFileData } = file.item;
                const newFile = await app.model.hcthFile.create({
                    ...newFileData,
                    ten: newName,
                    tenFile: newFileName,
                    thoiGian: Date.now(), nguoiTao: getShcc(req),
                    kichThuoc: stats.size,
                });

                await app.model.hcthVanBanDiFile.update({ id: file.id }, { fileId: newFile.id });
            }
        }));
    };

    app.get('/api/hcth/van-ban-di/recipients/list/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            let { nextStatus } = req.query;
            const id = req.params.id;
            const instance = await app.model.hcthCongVanDi.getInstance(id);

            if (!canSwitchStatus(req, instance) || !nextStatus) {
                throw 'Dữ liệu không hợp lệ';
            }
            const nextStatusObject = await app.model.hcthVanBanDiStatusDetail.get({ systemId: instance.status.systemId, trangThai: nextStatus });
            await app.model.hcthCongVanDi.getStatusAttribute(nextStatusObject);
            const recipients = await getNotificationRecipient(req, nextStatusObject, instance);
            const recipientsInfo = await app.model.hcthCongVanDi.getUserInfo(recipients.toString());

            res.send({ recipientsInfo: recipientsInfo.rows });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban-di/censor/list/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            let { nextStatus, forward, back, status } = req.query;
            const permissions = getCurrentPermissions(req);
            const id = req.params.id;
            const instance = await app.model.hcthCongVanDi.getInstance(id);
            if (forward) {
                nextStatus = await app.model.hcthVanBanDiStatusDetail.get({ systemId: instance.status.systemId, trangThai: instance.status.forwardTo });
            }
            else if (back) {
                nextStatus = await app.model.hcthVanBanDiStatusDetail.get({ systemId: instance.status.systemId, trangThai: instance.status.backTo });
            }
            else if (status && permissions.includes('hcthCongVanDi:manage')) {
                nextStatus = await app.model.hcthVanBanDiStatusDetail.get({ systemId: instance.status.systemId, trangThai: status });
            } else {
                throw 'Dữ liệu không hợp lệ';
            }
            if (!canSwitchStatus(req, instance) || !nextStatus) {
                throw 'Bạn không thể cập nhật trạng thái văn bản';
            }

            await app.model.hcthCongVanDi.getStatusAttribute(nextStatus);
            const censors = await getTargetListShcc(instance, nextStatus.censor, nextStatus);
            const censorsInfo = await app.model.hcthCongVanDi.getUserInfo(censors.toString());

            res.send({ censor: censorsInfo.rows });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban-di/item/is-switchable', app.permission.check('staff:login'), async (req, res) => {
        try {
            const idList = req.query.idList;
            if (!idList || !idList.length) {
                throw 'Thông tin danh sách không hợp lệ';
            } else if (idList.length > 20) {
                throw 'Số lượng tối đa văn bản có thể duyệt cùng lúc là 20';
            }
            const messages = await Promise.all(idList.map(async instanceId => {
                const instance = await app.model.hcthCongVanDi.getInstance(instanceId);
                if (!canSwitchStatus(req, instance)) {
                    return 'Bạn không thể cập nhật trạng thái văn bản ' + (instance.soVanBan?.soCongVan || `"${instance.trichYeu}"`);
                }
            })).then(items => items.filter(i => i));
            res.send({ error: messages.join('\n') });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/van-ban-di/recipients/info', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const shcc = req.body.shcc;
            const recipientsInfo = await app.model.hcthCongVanDi.getUserInfo(shcc.toString());
            res.send({ recipientsInfo: recipientsInfo.rows });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const getNotificationRecipient = async (req, status, item, handler) => {
        const recipients = [];
        for (const recipient of status.notifyRecipient) {
            if (recipient.isCreator && item.nguoiTao) recipients.push(item.nguoiTao);
            else if (recipient.isCanBoXuLy) {
                handler && recipients.push(handler);
            } else if (recipient.isCreatorDepartment && !recipient.isManager && !recipient.isViceManager) {
                const shccs = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(item.donViSoanThao, recipient.tenRole, Date.now());
                shccs.rows.length && recipients.push(...shccs.rows.map(item => item.shcc));
            } else if (recipient.isCreatorDepartment && recipient.isManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and maChucVu in (:maChucVu)',
                    parameter: {
                        maChucVu: ['003', '005', '007', '009', '011', '013'],
                        maDonVi: item.donViSoanThao
                    },
                }, 'shcc', 'shcc');
                canBoList.length && recipients.push(...canBoList.map(item => item.shcc));
            } else if (recipient.isCreatorDepartment && recipient.isViceManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and EXISTS(SELECT DM_CHUC_VU.MA FROM DM_CHUC_VU WHERE DM_CHUC_VU.MA = maChucVu AND DM_CHUC_VU.PHO = 1)',
                    parameter: {
                        maDonVi: item.donViSoanThao
                    },
                }, 'shcc', 'shcc');
                canBoList.length && recipients.push(...canBoList.map(item => item.shcc));
            } else if (recipient.isSigner) {
                const files = await getFiles(item.id),
                    signConfigs = files.reduce((total, cur) => [...cur.config, ...total], []);
                const signer = signConfigs.filter(item => item.signType == status.signType).map(signer => signer.shcc);
                recipients.push(...signer);
            } else if (recipient.isDepartment && !recipient.isManager) {
                const shccs = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(item.donViGui, recipient.tenRole, Date.now());
                shccs.rows.length && recipients.push(...shccs.rows.map(item => item.shcc));
            } else if (recipient.isDepartment && recipient.isManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and maChucVu in (:maChucVu)',
                    parameter: {
                        maChucVu: ['003', '005', '007', '009', '011', '013'],
                        maDonVi: item.donViGui
                    },
                }, 'shcc', 'shcc');
                canBoList.length && recipients.push(...canBoList.map(item => item.shcc));
            } else if (recipient.isDepartment && recipient.isViceManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and EXISTS(SELECT DM_CHUC_VU.MA FROM DM_CHUC_VU WHERE DM_CHUC_VU.MA = maChucVu AND DM_CHUC_VU.PHO = 1)',
                    parameter: {
                        maDonVi: item.donViGui
                    },
                }, 'shcc', 'shcc');
                canBoList.length && recipients.push(...canBoList.map(item => item.shcc));
            } else if (recipient.isManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and maChucVu in (:maChucVu)',
                    parameter: {
                        maChucVu: ['003', '005', '007', '009', '011', '013'],
                        maDonVi: recipient.maDonVi
                    },
                }, 'shcc', 'shcc');
                canBoList.length && recipients.push(...canBoList.map(item => item.shcc));
            }
            else if (recipient.isRector) {
                const canBoList = await app.model.qtChucVu.getAll({ maDonVi: 68, thoiChucVu: 0 }, 'shcc', 'shcc');
                canBoList.length && recipients.push(...canBoList.map(item => item.shcc));
            } else if (recipient.isPresident) {
                const canBo = await app.model.qtChucVu.get({ maChucVu: '001', thoiChucVu: 0 });
                canBo && recipients.push(canBo.shcc);
            } else if (recipient.isRecipient) {
                const donViNhan = await app.model.hcthDonViNhan.getAll({ loai: 'DI', ma: item.id, donViNhanNgoai: 0 });
                if (item.donViChuTri) {
                    donViNhan.push({ donViNhan: item.donViChuTri });
                }
                const canBoNhan = await app.model.hcthCanBoNhan.getAll({ loai: 'DI', ma: item.id });
                recipients.push(...canBoNhan.map(item => item.canBoNhan));
                if (donViNhan.length) {
                    const shccs = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(donViNhan.map(item => item.donViNhan).toString(), managerPermission, Date.now());
                    shccs.rows.length && recipients.push(...shccs.rows.map(item => item.shcc));
                    const canBoList = await app.model.qtChucVu.getAll({
                        statement: 'maDonVi in (:maDonVi) and thoiChucVu = 0 and maChucVu in (:maChucVu)',
                        parameter: {
                            maChucVu: ['003', '005', '007', '009', '011', '013'],
                            maDonVi: donViNhan.map(item => item.donViNhan)
                        },
                    }, 'shcc', 'shcc');
                    canBoList.length && recipients.push(...canBoList.map(item => item.shcc));
                }
            } else {
                const shccs = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(item.maDonVi, recipient.tenRole, Date.now());
                shccs.rows.length && recipients.push(...shccs.rows.map(item => item.shcc));
            }
        }
        return [...(new Set(recipients))].filter(item => item != req.session.user.shcc);
    };


    const getTargetListShcc = async (item, targetList, status) => {
        const shccList = [];
        for (const target of targetList) {
            if (target.isCreator && item.nguoiTao) shccList.push(item.nguoiTao);
            else if (target.isSigner) {
                const files = await getFiles(item.id),
                    signConfigs = files.reduce((total, cur) => [...cur.config, ...total], []);
                const signer = signConfigs.filter(item => item.signType == status.signType).map(signer => signer.shcc);
                shccList.push(...signer);
            } else if (target.isDepartment && !target.isManager && !target.isViceManager) {
                const shccs = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(item.donViGui, target.tenRole, Date.now());
                shccs.rows.length && shccList.push(...shccs.rows.map(item => item.shcc));
            } else if (target.isDepartment && target.isManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and maChucVu in (:maChucVu)',
                    parameter: {
                        maChucVu: ['003', '005', '007', '009', '011', '013'],
                        maDonVi: item.donViGui
                    },
                }, 'shcc', 'shcc');
                canBoList.length && shccList.push(...canBoList.map(item => item.shcc));
            } else if (target.isDepartment && target.isViceManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and EXISTS(SELECT DM_CHUC_VU.MA FROM DM_CHUC_VU WHERE DM_CHUC_VU.MA = maChucVu AND DM_CHUC_VU.PHO = 1)',
                    parameter: {
                        maDonVi: item.donViGui
                    },
                }, 'shcc', 'shcc');
                canBoList.length && shccList.push(...canBoList.map(item => item.shcc));
            } else if (target.isManager) {
                const canBoList = await app.model.qtChucVu.getAll({
                    statement: 'maDonVi = :maDonVi and thoiChucVu = 0 and maChucVu in (:maChucVu)',
                    parameter: {
                        maChucVu: ['003', '005', '007', '009', '011', '013'],
                        maDonVi: target.maDonVi
                    },
                }, 'shcc', 'shcc');
                canBoList.length && shccList.push(...canBoList.map(item => item.shcc));
            }
            else if (target.isRector) {
                const canBoList = await app.model.qtChucVu.getAll({ maDonVi: 68, thoiChucVu: 0 }, 'shcc', 'shcc');
                canBoList.length && shccList.push(...canBoList.map(item => item.shcc));
            } else if (target.isPresident) {
                const canBo = await app.model.qtChucVu.get({ maChucVu: '001', thoiChucVu: 0 });
                canBo && shccList.push(canBo.shcc);
            } else if (target.isRecipient) {
                const donViNhan = await app.model.hcthDonViNhan.getAll({ loai: 'DI', ma: item.id, donViNhanNgoai: 0 });
                if (item.donViChuTri) {
                    donViNhan.push({ donViNhan: item.donViChuTri });
                }
                const canBoNhan = await app.model.hcthCanBoNhan.getAll({ loai: 'DI', ma: item.id });
                shccList.push(...canBoNhan.map(item => item.canBoNhan));
                if (donViNhan.length) {
                    const shccs = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(donViNhan.map(item => item.donViNhan).toString(), managerPermission, Date.now());
                    shccs.rows.length && shccList.push(...shccs.rows.map(item => item.shcc));
                    const canBoList = await app.model.qtChucVu.getAll({
                        statement: 'maDonVi in (:maDonVi) and thoiChucVu = 0 and maChucVu in (:maChucVu)',
                        parameter: {
                            maChucVu: ['003', '005', '007', '009', '011', '013'],
                            maDonVi: donViNhan.map(item => item.donViNhan)
                        },
                    }, 'shcc', 'shcc');
                    canBoList.length && shccList.push(...canBoList.map(item => item.shcc));
                }
            } else {
                const shccs = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(item.maDonVi, target.tenRole, Date.now());
                shccs.rows.length && shccList.push(...shccs.rows.map(item => item.shcc));
            }
        }
        return [...(new Set(shccList))];
    };


    app.get('/api/hcth/van-ban-di/circuit/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await app.model.hcthCongVanDi.getInstance(id);
            const circuit = await app.model.hcthVanBanDiStatusSystem.getCircuit(instance.status.systemId);
            res.send({ circuit: circuit.rows });
        } catch (error) {
            res.send(error);
        }
    });

    app.get('/api/hcth/van-ban-di/staging/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await app.model.hcthCongVanDi.getInstance(id);
            const { rows: stages } = await app.model.hcthVanBanDiStaging.getList(instance.id, 'DI');
            const { rows: circuit } = await app.model.hcthVanBanDiStatusSystem.getCircuit(instance.status.systemId, stages.length ? stages[stages.length - 1].trangThai : null);
            res.send({ stages: [...stages, ...(stages.length ? circuit.slice(1) : circuit)] });
        } catch (error) {
            res.send(error);
        }
    });


    app.get('/api/hcth/van-ban-di/notification/read/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            await app.model.fwNotification.update({ email: req.session.user.email, notificationCategory: 'VAN_BAN_DI:' + req.params.id }, { read: 1 });
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

};
