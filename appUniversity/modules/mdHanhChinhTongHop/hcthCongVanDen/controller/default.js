module.exports = (app) => {
    const forge = require('node-forge');
    const { trangThaiSwitcher, action, CONG_VAN_TYPE, MA_BAN_GIAM_HIEU, MA_HCTH, canBoType } = require('../../constant');
    const { PDFDocument, PDFName } = require('pdf-lib');
    const pkijs = require('pkijs');
    const pvtsutils = require('pvtsutils');
    const { Crypto } = require('@peculiar/webcrypto');
    const moment = require('moment');
    //special crypto engine use for pkijs
    const crypto = new Crypto();

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            501: { title: 'Văn bản đến', link: '/user/hcth/van-ban-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            401: { title: 'Văn bản đến', link: '/user/van-ban-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    // const menu = {
    //     parentMenu: app.parentMenu.user,
    //     menus: {
    //         1051: { title: 'Văn bản đến', link: '/user/van-ban-den', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00', groupIndex: 5 },
    //     },
    // };

    app.permission.add({ name: 'hcthCongVanDen:read', menu: staffMenu });
    app.permission.add({ name: 'staff:login', menu });
    app.permission.add({ name: 'hcthCongVanDen:write' });
    app.permission.add({ name: 'hcthCongVanDen:delete' });
    app.permission.add({ name: 'hcthCongVanDen:manage' });
    app.permission.add({ name: 'donViCongVanDen:read' });
    app.permission.add({ name: 'hcth:login' });
    app.permission.add({ name: 'hcth:manage' });

    app.permissionHooks.add('staff', 'addRolesHcthCongVanDen', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcth:login', 'hcthCongVanDen:read', 'hcthCongVanDen:write', 'hcthCongVanDen:delete', 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/van-ban-den', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/van-ban-den/:id', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/hcth/van-ban-den', app.permission.check('hcthCongVanDen:read'), app.templates.admin);
    app.get('/user/hcth/van-ban-den/file', app.permission.check('hcthCongVanDen:read'), app.templates.admin);
    app.get('/user/hcth/van-ban-den/sign', app.permission.check('hcthVanBanDenSigning:verification'), app.templates.admin);
    app.get('/user/hcth/van-ban-den/:id', app.permission.check('hcthCongVanDen:read'), app.templates.admin);

    //api
    app.get('/api/hcth/van-ban-den/all', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        app.model.hcthCongVanDen.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/van-ban-den/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['soCongVan', 'noiDung', 'chiDao']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.hcthCongVanDen.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    const createCanBoNhanChiDao = (danhSachCanBo, nguoiTao, id) => {
        const promises = danhSachCanBo.map(canBo => new Promise((resolve, reject) => {
            app.model.hcthCanBoNhan.create({ canBoNhan: canBo, nguoiTao, ma: id, loai: 'DEN', vaiTro: 'DIRECT' }, (error, item) => {
                if (error) reject(error);
                else resolve(item);
            });
        }));
        return Promise.all(promises);
    };

    app.post('/api/hcth/van-ban-den', app.permission.check('hcthCongVanDen:write'), async (req, res) => {
        const { fileList, chiDao, quyenChiDao, donViNhan, ...data } = req.body.data;
        const dsCanBoChiDao = quyenChiDao.length > 0 ? quyenChiDao.split(',') : [];
        try {
            const item = await app.model.hcthCongVanDen.create({ ...data, nguoiTao: req.session.user?.staff?.shcc });
            let { id } = item;
            try {
                app.fs.createFolder(app.path.join(app.assetPath, `/congVanDen/${id}`));
                await createChiDaoFromList(chiDao || [], id);
                await updateListFile(fileList || [], id);
                await createDonViNhanFromList(donViNhan || [], id);

                await app.model.hcthHistory.create({ key: id, loai: CONG_VAN_TYPE, hanhDong: action.CREATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });

                if (dsCanBoChiDao.length > 0) {
                    await createCanBoNhanChiDao(dsCanBoChiDao, req.session.user?.staff?.shcc, id);
                }
                res.send({ error: null, item });
            }
            catch (error) {
                console.error(error);
                deleteCongVan(id, () => res.send({ error }));
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });



    const updateListFile = (listFile, congVanId) => {
        return Promise.all(listFile.map(async fileItem => {
            const { id, ...changes } = fileItem,
                sourcePath = app.path.join(app.assetPath, `/congVanDen/new/${changes.tenFile}`),
                destPath = app.path.join(app.assetPath, `/congVanDen/${congVanId}/${changes.tenFile}`);
            if (!changes.ma) {
                app.fs.renameSync(sourcePath, destPath);
                await app.model.hcthFile.update({ id }, { ...changes, ma: congVanId });
            }
            else
                await app.model.hcthFile.update({ id }, { ...changes });
        }));
    };

    const deleteCongVan = (id, done) => {
        app.model.hcthFile.delete({ ma: id }, (error) => {
            if (error) done && done({ error });
            else
                app.model.hcthChiDao.delete({ congVan: id, loai: CONG_VAN_TYPE }, (error) => {
                    if (error) done && done({ error });
                    else
                        app.model.hcthCongVanDen.delete({ id }, error => {
                            app.fs.deleteFolder(app.assetPath + '/congVanDen/' + id);
                            done && done({ error });
                        });
                });
        });
    };

    const createNotification = (emails, notification, done) => {
        const promises = [];
        emails.forEach(email => {
            promises.push(app.notification.send({
                toEmail: email,
                ...notification
            }));
        });
        Promise.all(promises).then(() => done(null)).catch(error => done(error));
    };

    app.put('/api/hcth/van-ban-den', app.permission.check('hcthCongVanDen:read'), async (req, res) => {
        const { fileList, chiDao, donViNhan, ...changes } = req.body.changes;
        try {
            const congVan = await app.model.hcthCongVanDen.get({ id: req.body.id });

            if (congVan) {
                const updateItem = await app.model.hcthCongVanDen.update({ id: req.body.id }, changes);
                const canBoNhanChiDao = await app.model.hcthCanBoNhan.getAllFrom(req.body.id, CONG_VAN_TYPE);
                const listCanBoChiDaoShcc = canBoNhanChiDao?.rows.length > 0 ? canBoNhanChiDao.rows.map(canBo => canBo.shccCanBoNhan) : [];
                const newCanBoNhanChiDao = changes.quyenChiDao !== '' ? changes.quyenChiDao.split(',') : [];
                if (newCanBoNhanChiDao.length > listCanBoChiDaoShcc.length) {
                    const listNewCanBoChiDao = newCanBoNhanChiDao.filter(canBo => !listCanBoChiDaoShcc.includes(canBo));
                    await createCanBoNhanChiDao(listNewCanBoChiDao, req.session.user?.staff?.shcc, req.body.id);
                } else {
                    const listDeleteCanBoNhan = canBoNhanChiDao?.rows.filter(canBo => !newCanBoNhanChiDao.includes(canBo.shccCanBoNhan)) || [];
                    await Promise.all(listDeleteCanBoNhan.map(async canBo => {
                        await app.model.hcthCanBoNhan.delete({ id: canBo.id });
                    }));
                }
                await createChiDaoFromList(chiDao || [], req.body.id);
                await app.model.hcthDonViNhan.delete({ ma: req.body.id, loai: CONG_VAN_TYPE });

                await createDonViNhanFromList(donViNhan || [], req.body.id);
                await app.model.hcthHistory.create({ key: req.body.id, loai: CONG_VAN_TYPE, hanhDong: action.UPDATE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc });
                await updateListFile(fileList || [], req.body.id);
                const trangThaiBefore = congVan.trangThai;
                const trangThaiAfter = updateItem.trangThai;
                await onStatusChange(updateItem, trangThaiBefore, trangThaiAfter);
                res.send({ item: updateItem });



            } else {
                res.send({ error: 'Không tìm thấy văn bản' });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }


    });


    const createChiDaoFromList = (listChiDao, congVanId) => Promise.all(listChiDao.map(chiDao => app.model.hcthChiDao.create({ ...chiDao, congVan: congVanId, loai: CONG_VAN_TYPE })));

    const createDonViNhanFromList = (listDonViNhan, congVanId) => Promise.all(listDonViNhan.map(donViNhan => app.model.hcthDonViNhan.create({ donViNhan, ma: congVanId, loai: CONG_VAN_TYPE })));


    app.delete('/api/hcth/van-ban-den', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        deleteCongVan(req.body.id, ({ error }) => res.send({ error }));
    });



    app.get('/api/hcth/van-ban-den/search/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        try {
            const
                obj2Db = { 'ngayHetHan': 'NGAY_HET_HAN', 'ngayNhan': 'NGAY_NHAN', 'tinhTrang': 'TINH_TRANG' },
                pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

            let { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, congVanYear, sortBy, sortType, tab, status = '', requireProcessing } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
                { donViGuiCongVan: null, donViNhanCongVan: null, canBoNhanCongVan: null, timeType: null, fromTime: null, toTime: null, congVanYear: null, requireProcessing: '0' },
                donViCanBo = '', canBo = '', tabValue = parseInt(tab);
            requireProcessing = parseInt(requireProcessing) || 0;
            const user = req.session.user;
            const permissions = user.permissions;
            donViCanBo = (req.session?.user?.staff?.donViQuanLy || []);
            donViCanBo = donViCanBo.map(item => item.maDonVi).toString() || (permissions.includes('president:login') && MA_BAN_GIAM_HIEU) || permissions.includes('donViCongVanDen:read') && req.session?.user?.staff?.maDonVi || '';
            canBo = req.session?.user?.shcc || '';

            if (tabValue == 0) {
                if (permissions.includes('rectors:login') || permissions.includes('hcth:login') || (!user.isStaff && !user.isStudent)) {
                    donViCanBo = '';
                    canBo = '';
                }
            }
            else if (tabValue == 1) {
                if (donViCanBo.length) {
                    canBo = '';
                } else
                    donViCanBo = '';
            } else donViCanBo = '';



            if (congVanYear && Number(congVanYear) > 1900) {
                timeType = 2;
                fromTime = new Date(`${congVanYear}-01-01`).getTime();
                toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
            }

            app.model.hcthCongVanDen.searchPage(pageNumber, pageSize, donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, obj2Db[sortBy] || '', sortType, canBo, donViCanBo, permissions.includes('rectors:login') ? 1 : permissions.includes('hcth:login') ? 0 : 2, status, searchTerm, requireProcessing, req.session.user.shcc, (error, page) => {
                if (error || page == null) {
                    res.send({ error });
                } else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                    const pageCondition = searchTerm;
                    res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.fs.createFolder(app.path.join(app.assetPath, '/congVanDen'));


    app.uploadHooks.add('hcthCongVanDenFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthCongVanDenFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthCongVanDenFile = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0] &&
            fields.userData[0].startsWith('hcthCongVanDenFile') &&
            files.hcthCongVanDenFile &&
            files.hcthCongVanDenFile.length > 0) {

            const
                srcPath = files.hcthCongVanDenFile[0].path,
                fileName = srcPath.replace(/^.*[\\\/]/, ''),
                isNew = fields.userData[0].substring(19) == 'new',
                id = fields.userData[0].substring(19),
                originalFilename = files.hcthCongVanDenFile[0].originalFilename,
                filePath = (isNew ? '/new/' : `/${id}/`) + fileName,
                destPath = app.assetPath + '/congVanDen' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.fs.deleteFile(srcPath);
            } else {
                app.fs.createFolder(
                    app.path.join(app.assetPath, '/congVanDen/' + (isNew ? '/new' : '/' + id))
                );
                app.fs.rename(srcPath, destPath, error => {
                    if (error) {
                        done && done({ error });
                    } else {
                        app.model.hcthFile.create({
                            ten: originalFilename,
                            thoiGian: Date.now(),
                            loai: CONG_VAN_TYPE,
                            nguoiTao: req.session?.user?.shcc,
                            tenFile: fileName,
                            kichThuoc: files.hcthCongVanDenFile[0].size,
                            fileHash: null,
                            nextVersionId: null,
                            ma: id === 'new' ? null : id
                        }, (error, item) => done && done({ error, item }));
                    }
                });
            }
        }
    };

    app.uploadHooks.add('hcthCongVanDenUpdateFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthCongVanDenUpdateFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthCongVanDenUpdateFile = async (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0] &&
            fields.userData[0].startsWith('hcthCongVanDenUpdateFile') &&
            files.hcthCongVanDenUpdateFile &&
            files.hcthCongVanDenUpdateFile.length > 0) {

            const
                fileInfo = files.hcthCongVanDenUpdateFile[0],
                data = app.utils.parse(fields.data && fields.data.length && fields.data[0]),
                srcPath = fileInfo.path,
                fileName = srcPath.replace(/^.*[\\\/]/, ''),
                originalFilename = fileInfo.originalFilename,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.fs.deleteFile(srcPath);
            } else {
                const file = await app.model.hcthFile.get({ id: data.id });
                if (!file) {
                    app.fs.deleteFile(srcPath);
                    done && done({ error: 'File gốc không tồn tại!' });
                }
                // eslint-disable-next-line no-unused-vars
                const { id, ...oldData } = file;
                app.fs.renameSync(srcPath, app.path.join(app.assetPath, 'congVanDen', `${file.ma}`, fileName));

                const newFile = await app.model.hcthFile.create({
                    ...oldData,
                    ten: originalFilename,
                    thoiGian: Date.now(),
                    loai: CONG_VAN_TYPE,
                    nguoiTao: req.session?.user?.shcc,
                    tenFile: fileName,
                    kichThuoc: fileInfo.size,
                    fileHash: null,
                    nextVersionId: null
                });
                await app.model.hcthFile.update({ id: data.id }, { nextVersionId: newFile.id });
                done && done({ newFile });
            }
        }
    };

    //Delete file
    app.put('/api/hcth/van-ban-den/delete-file', app.permission.check('hcthCongVanDen:delete'), (req, res) => {
        const
            id = req.body.id,
            fileId = req.body.fileId,
            file = req.body.file,
            congVan = id || null,
            filePath = app.assetPath + '/congVanDen/' + (id ? id + '/' : 'new/') + file;
        app.model.hcthFile.delete({ id: fileId, ma: congVan, loai: CONG_VAN_TYPE }, (error) => {
            if (error) {
                res.send({ error });
            }
            else {
                if (app.fs.existsSync(filePath))
                    app.fs.deleteFile(filePath);
                res.send({ error: null });
            }
        });
    });

    app.get('/api/hcth/van-ban-den/download/:id/:fileName', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id, fileName } = req.params;
            const { format } = req.query;
            if (id == 'new') {
                const path = app.path.join(app.assetPath, 'congVanDen', 'new', fileName);
                if (format == 'base64') {
                    const data = app.fs.readFileSync(path, 'base64');
                    return res.send({ data });
                }
                else {
                    return res.sendFile(path);
                }
            }
            else {
                const congVan = await app.model.hcthCongVanDen.get({ id });
                const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: CONG_VAN_TYPE }, 'donViNhan', 'id');
                if (!await isRelated(congVan, donViNhan, req)) {
                    throw { status: 401, message: 'Bạn không có quyền xem tập tin này!' };
                } else {
                    const dir = app.path.join(app.assetPath, `/congVanDen/${id}`);
                    if (app.fs.existsSync(dir)) {
                        const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
                        for (const serverFileName of serverFileNames) {
                            const clientFileIndex = serverFileName.indexOf(fileName);
                            if (clientFileIndex !== -1 && serverFileName.slice(clientFileIndex) === fileName) {
                                if (format == 'base64') {
                                    const data = app.fs.readFileSync(app.path.join(dir, serverFileName), 'base64');
                                    return res.send({ data });
                                }
                                else {
                                    const buffer = app.fs.readFileSync(app.path.join(dir, serverFileName));
                                    const file = await app.model.hcthFile.get({ ma: id, loai: 'DEN', tenFile: fileName });
                                    res.setHeader('Content-Disposition', 'attachment;filename=' + `${app.toEngWord(file.ten)}`.replaceAll(/[^A-Za-z\.0-9\s]/g, '_'));
                                    return res.end(buffer);
                                }
                            }
                        }
                    }
                }
                throw { status: 404, message: 'Không tìm thấy tập tin!' };
            }
        } catch (error) {
            console.error(error);
            res.status(error.status || 400).send(error.message || 'Không tìm thấy tập tin');
        }
    });

    const createPhanHoiNotification = async (phanHoi, emails, congVan, canBo) => {
        const phanHoiNotification = {
            title: `Văn bản đến #${congVan.id}`,
            icon: 'fa-commenting',
            iconColor: 'warning',
            subTitle: `${canBo?.lastName || ''} ${canBo?.firstName || ''}`.trim().normalizedName() + ' đã gửi một phản hồi : ' + phanHoi,
            link: `/user/van-ban-den/${congVan.id}?focusPhanHoi=${phanHoi.id}`,
            buttons: [],
            sendEmail: null,
            sendSocket: true
        };

        return Promise.all(emails.map(async email => {
            await app.notification.send({
                toEmail: email,
                ...phanHoiNotification,
                notificationCategory: 'VAN_BAN_DEN:' + congVan.id,
            });
        }));
    };

    app.post('/api/hcth/van-ban-den/phan-hoi-chi-dao', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { data } = req.body;
            await app.model.hcthPhanHoi.create({ ...data, canBoGui: req.session.user.shcc, ngayTao: Date.now() });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/van-ban-den/phan-hoi', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const loginEmail = req.session.user.email;
            const { key, noiDung } = req.body.data;
            const id = parseInt(key);

            const item = await app.model.hcthPhanHoi.create({ ...req.body.data, loai: CONG_VAN_TYPE, canBoGui: req.session.user.shcc, ngayTao: Date.now() });

            const congVan = await app.model.hcthCongVanDen.get({ id });

            const [listRelatedStaff, listCanBoChiDao] = await Promise.all([
                app.model.hcthCongVanDen.getRelatedStaff(id),
                app.model.hcthCanBoNhan.getAll({ ma: congVan.id, loai: 'DEN', vaiTro: 'DIRECT' }, 'canBoNhan', 'canBoNhan')
            ]);

            let listDirectorShcc = listCanBoChiDao.map(item => item.canBoNhan);
            listDirectorShcc.push(congVan.nguoiTao);

            const directors = await app.model.tchcCanBo.getAll({
                statement: 'shcc IN (:dsCanBo)',
                parameter: {
                    dsCanBo: [...listDirectorShcc],
                }
            }, 'email', 'email');

            const directorEmails = directors.map(director => director.email);

            let emailList = directorEmails;
            if (congVan.trangThai === trangThaiSwitcher.DA_PHAN_PHOI.id) {
                const relatedStaffEmails = listRelatedStaff.rows.map(item => item.email);
                emailList = emailList.concat(relatedStaffEmails);
            }

            emailList = emailList.filter(email => email !== loginEmail);

            await createPhanHoiNotification(noiDung, emailList, congVan, req.session.user);

            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    const isRelated = async (congVan, donViNhan, req) => {
        try {
            // nếu là văn bản công khai cho phép tất cả cán bộ cùng thấy nếu văn bản ở các trạng thái dưới
            if (congVan.vanBanCongKhai && [trangThaiSwitcher.THEO_DOI_TIEN_DO.id, trangThaiSwitcher.DA_PHAN_PHOI.id, trangThaiSwitcher.THU_HOI.id].includes(congVan.trangThai)) return true;

            //Cán bộ hành chính và ban giám hiệu được phép thấy tất cả
            const permissions = req.session.user.permissions;
            if (permissions.includes('rectors:login') || permissions.includes('hcth:login')) {
                return true;
            }

            //Kiểm tra nếu có nhiệm vụ được phân phối
            if (req.query.nhiemVu) {
                const count = (await app.model.hcthLienKet.count({
                    keyA: req.query.nhiemVu,
                    loaiA: 'NHIEM_VU',
                    loaiB: 'VAN_BAN_DEN',
                    keyB: req.params.id
                }));
                if (await app.hcthNhiemVu.checkNhiemVuPermission(req, null, req.query.nhiemVu)
                    && count && count.rows[0] && count.rows[0]['COUNT(*)'])
                    return true;
            }

            // nếu trong cán bộ nhận thì trả trong trạng thái sau
            const canBoNhan = congVan.canBoNhan || '';
            if (canBoNhan.split(',').includes(req.session.user.shcc) && [trangThaiSwitcher.THEO_DOI_TIEN_DO.id, trangThaiSwitcher.DA_PHAN_PHOI.id, trangThaiSwitcher.THU_HOI.id].includes(congVan.trangThai))
                return true;
            else {
                let maDonViNhan = donViNhan.map((item) => item.donViNhan);
                if (congVan.donViChuTri)
                    maDonViNhan.push(congVan.donViChuTri);
                let maDonViQuanLy = req.session.user?.staff?.donViQuanLy || [];
                return maDonViQuanLy.find(item => maDonViNhan.includes(item.maDonVi)) || (permissions.includes('donViCongVanDen:read') && maDonViNhan.includes(Number(req.session.user.staff?.maDonVi)));
            }
        } catch {
            return false;
        }
    };

    const viewCongVanDen = async (congVanId, shccCanBo, creator) => {
        if (!shccCanBo || shccCanBo == creator) return;
        const lichSuDoc = await app.model.hcthHistory.get({ loai: 'DEN', key: congVanId, shcc: shccCanBo, hanhDong: action.VIEW });
        if (!lichSuDoc) {
            return await app.model.hcthHistory.create({ loai: 'DEN', key: congVanId, shcc: shccCanBo, hanhDong: action.VIEW, thoiGian: new Date().getTime() });
        }
        return lichSuDoc;
    };

    app.get('/api/hcth/van-ban-den/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const congVan = await app.model.hcthCongVanDen.get({ id });
            const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: CONG_VAN_TYPE }, 'donViNhan', 'id');
            if (!await isRelated(congVan, donViNhan, req))
                throw { status: 401, message: 'permission denied' };
            else if (req.session.user?.shcc) {
                await viewCongVanDen(id, req.session.user.shcc, congVan?.nguoiTao);
            }
            let danhSachDonViNhan = [];
            let danhSachCanBoNhan = [];
            if (donViNhan?.length) {
                danhSachDonViNhan = await app.model.dmDonVi.getAll({
                    statement: `MA in (${donViNhan.map(item => item.donViNhan).toString()})`,
                    parameter: {},
                }, 'ma, ten', 'ma');
            }
            if (congVan?.canBoNhan && congVan?.canBoNhan.length)
                danhSachCanBoNhan = await app.model.tchcCanBo.getAll({
                    statement: 'SHCC IN (:danhSachShcc)',
                    parameter: { danhSachShcc: congVan?.canBoNhan.split(',') }
                }, 'shcc,ten,ho,email', 'ten');

            let donViGuiInfo = {};

            if (congVan?.donViGui) {
                donViGuiInfo = await app.model.dmDonViGuiCv.get({ id: congVan.donViGui }, 'id, ten', 'id');
            }

            const files = await app.model.hcthFile.getAll({
                statement: 'ma =:ma and loai = :loai and nextVersionId is Null',
                parameter: { ma: id, loai: CONG_VAN_TYPE }
            }, '*', 'thoiGian');
            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, CONG_VAN_TYPE);
            const history = await app.model.hcthHistory.getAllFrom(id, CONG_VAN_TYPE, req.query.historySortType);
            const canBoChiDao = await app.model.hcthCanBoNhan.getAllFrom(id, CONG_VAN_TYPE);
            const quyenChiDao = canBoChiDao?.rows.filter(i => i.vaiTro == 'DIRECT').map(cb => cb.shccCanBoNhan).join(',');
            const chiDao = await app.model.hcthChiDao.getCongVanChiDao(id, CONG_VAN_TYPE);
            if (req.session?.user?.shcc && !(await app.model.hcthSeenStatus.get({ ma: congVan.id, loai: 'DEN', shcc: req.session.user.shcc }))) {
                await app.model.hcthSeenStatus.create({ ma: congVan.id, loai: 'DEN', shcc: req.session.user.shcc });
            }
            const { rows: nhiemVu = [] } = await app.model.hcthNhiemVu.getFromLienKet(app.utils.stringify({
                loaiLienKet: 'VAN_BAN_DEN', maLienKet: congVan.id, userShcc: req.session.user.shcc,
                donViCanBo: (req.session.user.staff?.donViQuanLy || []).map(i => i.maDonVi).toString(),
                userPermissions: req.session.user.permissions.filter(i => ['htch:mnage', 'rectors:login'].includes(i)).toString()
            }));

            const danhSachChiDao = await Promise.all((chiDao?.rows || []).map(async cd => {
                const phanHoi = await app.model.hcthPhanHoi.getChiDao(cd.id);
                return { ...cd, listPhanHoi: phanHoi?.rows || [] };
            }));

            res.send({
                item: {
                    ...congVan,
                    phanHoi: phanHoi?.rows || [],
                    donViNhan: (donViNhan ? donViNhan.map(item => item.donViNhan) : []).toString(),
                    listFile: files || [],
                    danhSachChiDao,
                    history: history?.rows || [],
                    quyenChiDao,
                    danhSachDonViNhan,
                    danhSachCanBoNhan,
                    nhiemVu,
                    tenDonViGui: donViGuiInfo?.ten || ''
                }
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/van-ban-den/chi-dao', app.permission.orCheck('rectors:login', 'hcth:manage', 'hcth:login'), async (req, res) => {
        try {
            const item = await app.model.hcthChiDao.create({ ...req.body.data, loai: CONG_VAN_TYPE, canBo: req.session.user.shcc, thoiGian: Date.now() });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban-den/lich-su/:id', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), CONG_VAN_TYPE, req.query.historySortType, (error, items) => res.send({ error, items: items?.rows || [] }));
    });


    const updateCongvanDen = (id, changes) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDen.update({ id }, changes, (error, item) => {
            if (error)
                reject(error);
            else
                resolve(item);
        });
    });

    const statusToAction = (before, after) => {
        switch (after) {
            case trangThaiSwitcher.CHO_DUYET.id:
                return action.UPDATE;
            case trangThaiSwitcher.CHO_PHAN_PHOI.id:
                if (before == trangThaiSwitcher.TRA_LAI_HCTH.id)
                    return action.UPDATE;
                else if (before == trangThaiSwitcher.DA_DUYET.id)
                    return action.UPDATE_STATUS;
                else
                    return action.APPROVE;
            case trangThaiSwitcher.TRA_LAI_HCTH.id:
            case trangThaiSwitcher.TRA_LAI_BGH.id:
                return action.RETURN;
            case trangThaiSwitcher.DA_PHAN_PHOI.id:
                return action.PUBLISH;
            case trangThaiSwitcher.THU_HOI.id:
                return action.UPDATE_STATUS;
            default:
                return '';
        }
    };

    app.put('/api/hcth/van-ban-den/status', app.permission.orCheck('rectors:login', 'hcthCongVanDen:write'), async (req, res) => {
        try {
            let { id, trangThai } = req.body.data;
            trangThai = parseInt(trangThai);
            const congVan = await app.model.hcthCongVanDen.get({ id });
            if (congVan.trangThai == trangThai || !trangThai) {
                res.send({ error: null, item: congVan });
            }
            else {
                const newCongVan = await updateCongvanDen(id, { trangThai });
                await app.model.hcthHistory.create({
                    key: id, loai: CONG_VAN_TYPE, thoiGian: new Date().getTime(), shcc: req.session?.user?.shcc,
                    hanhDong: statusToAction(congVan.trangThai, trangThai),
                });
                await onStatusChange(newCongVan, congVan.trangThai, trangThai);
                res.send({ newCongVan });
            }
        } catch (error) {
            res.send({ error });
        }
    });


    app.put('/api/hcth/van-ban-den/tra-lai', app.permission.orCheck('hcthCongVanDen:manage', 'rectors:login'), async (req, res) => {
        try {
            const { id, lyDo } = req.body;
            let congVan = await app.model.hcthCongVanDen.get({ id });
            if (!congVan) throw 'Văn bản không tồn tại';
            else if (!lyDo) throw 'Vui lòng nhập lý do trả lại văn bản';
            else {
                const chiDao = {
                    canBo: req.session.user?.shcc,
                    chiDao: lyDo,
                    thoiGian: new Date().getTime(),
                    congVan: id,
                    loai: CONG_VAN_TYPE,
                    action: action.RETURN,
                };
                await app.model.hcthChiDao.create(chiDao);
                const trangThaiHienTai = congVan.trangThai;
                let newTrangThai = trangThaiSwitcher.TRA_LAI_BGH.id;
                if (trangThaiHienTai === trangThaiSwitcher.CHO_PHAN_PHOI.id) newTrangThai = trangThaiSwitcher.TRA_LAI_HCTH.id;
                congVan = await app.model.hcthCongVanDen.update({ id }, { trangThai: newTrangThai });
                await app.model.hcthHistory.create({
                    key: id,
                    loai: CONG_VAN_TYPE,
                    hanhDong: action.RETURN,
                    thoiGian: new Date().getTime(),
                    shcc: req.session?.user?.shcc
                });
                await onStatusChange(congVan, trangThaiHienTai, newTrangThai);
                res.send({ item: congVan });
            }
        } catch (error) {
            if (typeof error == 'string')
                res.send({ error: { errorMessage: error } });
            else
                res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban-den/duyet', app.permission.orCheck('hcthCongVanDen:manage', 'rectors:login'), async (req, res) => {
        try {
            const { id, noiDung } = req.body;
            let congVan = await app.model.hcthCongVanDen.get({ id });
            const userShcc = req.session.user?.shcc;
            const quyenChiDao = await app.model.hcthCanBoNhan.getAllFrom(id, CONG_VAN_TYPE),
                canBoChiDao = (quyenChiDao?.rows || []).map(item => item.shccCanBoNhan);
            const userPermission = req.session.user?.permissions || [];
            if (!congVan) throw 'Văn bản không tồn tại';
            else if (congVan.trangThai != trangThaiSwitcher.CHO_DUYET.id) throw 'Không thể duyệt lại văn bản này';
            else if (!userPermission.includes('president:login') && !canBoChiDao.includes(userShcc)) throw 'Bạn không có quyền duyệt văn bản này';
            else if (!noiDung) throw 'Vui lòng nhập chỉ đạo';
            else {
                const chiDao = {
                    canBo: req.session.user?.shcc,
                    chiDao: noiDung,
                    thoiGian: new Date().getTime(),
                    congVan: id,
                    loai: CONG_VAN_TYPE,
                    action: action.APPROVE,
                };
                await app.model.hcthChiDao.create(chiDao);
                const trangThaiHienTai = congVan.trangThai;
                congVan = await app.model.hcthCongVanDen.update({ id }, { trangThai: trangThaiSwitcher.DA_DUYET.id });
                await app.model.hcthHistory.create({
                    key: id,
                    loai: CONG_VAN_TYPE,
                    hanhDong: action.APPROVE,
                    thoiGian: new Date().getTime(),
                    shcc: req.session?.user?.shcc
                });
                await onStatusChange(congVan, trangThaiHienTai, trangThaiSwitcher.DA_DUYET.id);
                res.send({ item: congVan });
            }
        } catch (error) {
            if (typeof error == 'string')
                res.send({ error: { errorMessage: error } });
            else
                res.send({ error });
        }
    });


    app.get('/api/hcth/van-ban-den/phan-hoi/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, CONG_VAN_TYPE);
            res.send({ error: null, items: phanHoi.rows || [] });
        }
        catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban-den/chi-dao/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        app.model.hcthChiDao.getCongVanChiDao(parseInt(req.params.id), CONG_VAN_TYPE, (error, items) => res.send({ error, items: items?.rows || [] }));
    });

    // Phân quyền cho các đơn vị ------------------------------------------------------------------------------------------------------------------------

    const docCongVanPhongRole = 'quanLyCongVanPhong';
    app.assignRoleHooks.addRoles(docCongVanPhongRole, { id: 'donViCongVanDen:read', text: 'Quản lý văn bản đến đơn vị' });

    app.assignRoleHooks.addHook(docCongVanPhongRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == docCongVanPhongRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(docCongVanPhongRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleDocCongVanDenPhong', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length) {
            app.permissionHooks.pushUserPermission(user, 'donViCongVanDen:read');
        }
        resolve();
    }));


    app.permissionHooks.add('assignRole', 'checkRoleDocCongVanDenPhong', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == docCongVanPhongRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'donViCongVanDen:read') {
                app.permissionHooks.pushUserPermission(user, 'donViCongVanDen:read');
            }
        });
        resolve();
    }));

    const nhomRole = 'quanLyCongVanDen';
    app.assignRoleHooks.addRoles(nhomRole, { id: 'hcthCongVanDen:manage', text: 'Hành chính - Tổng hợp: Quản lý văn bản đến' });

    app.assignRoleHooks.addHook(nhomRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == nhomRole && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(nhomRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyHcth', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthVanBanDenSigning:verification', 'hcthCongVanDen:manage', 'hcth:manage', 'hcthCongVanDi:manage', 'hcthSoVanBan:write', 'hcthSoVanBan:delete', 'hcthVanBanDiSigning:verification', 'dmLoaiVanBan:read', 'dmLoaiVanBan:write', 'dmLoaiVanBan:delete', 'dmNhomLoaiVanBan:read', 'dmNhomLoaiVanBan:write', 'dmNhomLoaiVanBan:delete', 'hcthCongTac:manage', 'hcthCongTac:read', 'hcthCongTac:write');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyCongVanDen', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == nhomRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'hcthCongVanDen:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcthCongVanDen:manage', 'hcth:login', 'dmDonVi:read', 'dmDonViGuiCv:read', 'dmDonViGuiCv:write', 'dmDonViGuiCv:delete', 'hcthCongVanDen:read', 'hcthCongVanDen:write', 'hcthCongVanDen:delete');
            }
        });
        resolve();
    }));

    const getMessage = (status) => {
        switch (status) {
            case trangThaiSwitcher.TRA_LAI_BGH.id:
            case trangThaiSwitcher.TRA_LAI_HCTH.id:
                return 'Bạn có văn bản đến bị trả lại!';
            case trangThaiSwitcher.CHO_PHAN_PHOI.id:
                return 'Bạn có văn bản chờ phân phối.';
            case trangThaiSwitcher.DA_PHAN_PHOI.id:
                return 'Bạn có văn bản đến mới.';
            case trangThaiSwitcher.DA_DUYET.id:
                return 'Văn bản của bạn đã được duyệt.';
            default:
                return '';

        }
    };

    const getIconColor = (status) => {
        switch (status) {
            case trangThaiSwitcher.TRA_LAI_BGH.id:
            case trangThaiSwitcher.TRA_LAI_HCTH.id:
                return 'danger';
            case trangThaiSwitcher.CHO_PHAN_PHOI.id:
                return 'info';
            default:
                return '';
        }
    };


    const createChiDaoNotification = (item, trangThaiChiDao = true) => new Promise((resolve, reject) => {
        const canBoChiDao = item.quyenChiDao?.split(',') || [];
        app.model.tchcCanBo.getAll({
            statement: 'shcc IN (:dsCanBo)',
            parameter: {
                dsCanBo: [...canBoChiDao, ''],
            }
        }, 'email', 'email', (error, canBos) => {
            if (error) reject(error);
            else {
                if (!trangThaiChiDao) {
                    createNotification(canBos.map(item => item.email), { title: 'Văn bản đến', icon: 'fa-book', iconColor: 'danger', subTitle: `Bạn đã bị xoá quyền chỉ đạo ra khỏi văn bản #${item.id}`, link: `/user/van-ban-den/${item.id}`, notificationCategory: 'VAN_BAN_DEN:' + item.id }, (error) => {
                        if (error)
                            reject(error);
                        else resolve();
                    });
                } else {
                    createNotification(canBos.map(item => item.email), { title: 'Văn bản đến', icon: 'fa-book', iconColor: 'info', subTitle: `Bạn được gán quyền chỉ đạo cho văn bản #${item.id}`, link: `/user/van-ban-den/${item.id}`, notificationCategory: 'VAN_BAN_DEN:' + item.id }, (error) => {
                        if (error)
                            reject(error);
                        else resolve();
                    });
                }
            }
        });
    });

    const createCreatorNotification = (item, status) => new Promise((resolve, reject) => {
        if (item.nguoiTao)
            app.model.fwUser.get({ shcc: item.nguoiTao }, 'email', 'email', (error, staff) => {
                if (error) reject(error);
                else if (staff && staff.email) {
                    const emails = [staff.email];
                    createNotification(emails, { title: 'Văn bản đến', icon: 'fa-book', subTitle: getMessage(status), iconColor: getIconColor(status), link: `/user/hcth/van-ban-den/${item.id}`, notificationCategory: 'VAN_BAN_DEN:' + item.id }, error => {
                        if (error) reject(error);
                        else resolve();
                    });
                }
                else resolve();
            });
        else resolve();
    });

    const createRelatedStaffNotification = (item, status) => new Promise((resolve, reject) => {
        app.model.hcthCongVanDen.getRelatedStaff(item.id, (error, staffs) => {
            if (error) reject(error);
            else {
                const emails = staffs.rows.map(item => item.email);
                createNotification(emails, { title: 'Văn bản đến', icon: 'fa-book', subTitle: getMessage(status), iconColor: getIconColor(status), link: `/user/van-ban-den/${item.id}`, notificationCategory: 'VAN_BAN_DEN:' + item.id }, error => {
                    error ? reject(error) : resolve();
                });
            }
        });
    });

    const sendMailToRelatedStaff = async (item) => {
        const listRelatedStaff = await app.model.hcthCongVanDen.getRelatedStaff(item.id);
        const emails = listRelatedStaff.rows.map(item => item.email);

        const donViGuiInfo = await app.model.dmDonViGuiCv.get({ id: item.donViGui });

        const { email: fromMail, emailPassword: fromMailPassword, chiDaoEmailDebug, nhanCongVanDenEmailTitle, nhanCongVanDenEmailEditorText, nhanCongVanDenEmailEditorHtml } = await app.model.hcthSetting.getValue('email', 'emailPassword', 'chiDaoEmailDebug', 'nhanCongVanDenEmailTitle', 'nhanCongVanDenEmailEditorText', 'nhanCongVanDenEmailEditorHtml');

        const rootUrl = app.rootUrl;
        let mailTitle = nhanCongVanDenEmailTitle.toUpperCase(),
            mailText = nhanCongVanDenEmailEditorText.replaceAll('{id}', item.id)
                .replaceAll('{soDen}', item.soDen || 'Chưa có')
                .replaceAll('{soCongVan}', item.soCongVan || 'Chưa có')
                .replaceAll('{donViGui}', donViGuiInfo.ten)
                .replaceAll('{ngayCongVan}', app.date.dateTimeFormat(new Date(item.ngayCongVan), 'dd/mm/yyyy'))
                .replaceAll('{ngayNhan}', app.date.dateTimeFormat(new Date(item.ngayNhan), 'dd/mm/yyyy'))
                .replaceAll('{trichYeu}', item.trichYeu),
            mailHtml = nhanCongVanDenEmailEditorHtml.replaceAll('{id}', item.id).replaceAll('{link}', `${rootUrl}/user/van-ban-den/${item.id}`)
                .replaceAll('{soDen}', item.soDen || 'Chưa có')
                .replaceAll('{soCongVan}', item.soCongVan || 'Chưa có')
                .replaceAll('{donViGui}', donViGuiInfo.ten)
                .replaceAll('{ngayCongVan}', app.date.dateTimeFormat(new Date(item.ngayCongVan), 'dd/mm/yyyy'))
                .replaceAll('{ngayNhan}', app.date.dateTimeFormat(new Date(item.ngayNhan), 'dd/mm/yyyy'))
                .replaceAll('{trichYeu}', item.trichYeu);

        if (app.isDebug) {
            app.service.emailService.send(fromMail, fromMailPassword, chiDaoEmailDebug, null, null, mailTitle, mailText, mailHtml, null);
        } else {
            emails.map(email => {
                app.service.emailService.send(fromMail, fromMailPassword, email, null, null, mailTitle, mailText, mailHtml, null);
            });
        }
    };

    const sendChiDaoCongVanDenMailToRectors = async (item) => {
        const canBoChiDao = item.quyenChiDao?.split(',') || [];
        const canBos = await app.model.tchcCanBo.getAll({
            statement: 'shcc IN (:dsCanBo)',
            parameter: {
                dsCanBo: [...canBoChiDao, ''],
            }
        }, 'email', 'email');

        const { email: fromMail, emailPassword: fromMailPassword, chiDaoEmailDebug, chiDaoEmailTitle, chiDaoEmailEditorText, chiDaoEmailEditorHtml } = await app.model.hcthSetting.getValue('email', 'emailPassword', 'chiDaoEmailDebug', 'chiDaoEmailTitle', 'chiDaoEmailEditorText', 'chiDaoEmailEditorHtml');

        const donViGuiInfo = await app.model.dmDonViGuiCv.get({ id: item.donViGui });

        const rootUrl = app.rootUrl;

        let mailTitle = chiDaoEmailTitle.toUpperCase(),
            mailText = chiDaoEmailEditorText.replaceAll('{id}', item.id)
                .replaceAll('{soDen}', item.soDen || 'Chưa có')
                .replaceAll('{soCongVan}', item.soCongVan || 'Chưa có')
                .replaceAll('{donViGui}', donViGuiInfo.ten)
                .replaceAll('{ngayCongVan}', app.date.dateTimeFormat(new Date(item.ngayCongVan), 'dd/mm/yyyy'))
                .replaceAll('{ngayNhan}', app.date.dateTimeFormat(new Date(item.ngayNhan), 'dd/mm/yyyy'))
                .replaceAll('{trichYeu}', item.trichYeu),
            mailHtml = chiDaoEmailEditorHtml.replaceAll('{id}', item.id)
                .replaceAll('{link}', `${rootUrl}/user/van-ban-den/${item.id}`)
                .replaceAll('{soDen}', item.soDen || 'Chưa có')
                .replaceAll('{soCongVan}', item.soCongVan || 'Chưa có')
                .replaceAll('{donViGui}', donViGuiInfo.ten)
                .replaceAll('{ngayCongVan}', app.date.dateTimeFormat(new Date(item.ngayCongVan), 'dd/mm/yyyy'))
                .replaceAll('{ngayNhan}', app.date.dateTimeFormat(new Date(item.ngayNhan), 'dd/mm/yyyy'))
                .replaceAll('{trichYeu}', item.trichYeu);
        if (app.isDebug) {
            app.service.emailService.send(fromMail, fromMailPassword, chiDaoEmailDebug, null, null, mailTitle, mailText, mailHtml, null);
        } else {
            canBos.map(canBo => {
                app.service.emailService.send(fromMail, fromMailPassword, canBo.email, null, null, mailTitle, mailText, mailHtml, null);

                // app.email.normalSendEmail(fromMail, fromMailPassword, canBo.email, [app.defaultAdminEmail], mailTitle, mailText, mailHtml, [], (error) => {
                //     if (error) throw (error);
                // });
            });
        }
    };

    const createDistributingNotification = async (item) => {
        const canBos = await app.model.hcthCongVanDen.getAuthorizedStaff();
        const emails = canBos.rows.map(canBo => canBo.email);

        const notificationPromise = new Promise((resolve, reject) => createNotification(emails, { title: 'Văn bản đến cần phân phối', icon: 'fa-book', subTitle: 'Bạn có một văn bản đến cần kiểm tra và phân phối.', iconColor: 'info', link: `/user/hcth/van-ban-den/${item.id}`, notificationCategory: 'VAN_BAN_DEN:' + item.id }, (error) => error ? reject(error) : resolve()
        ));
        return await notificationPromise;
    };

    const onStatusChange = (item, before, after) => new Promise((resolve) => {
        try {
            if (before == after)
                resolve();
            else if (after == trangThaiSwitcher.CHO_DUYET.id) {
                createChiDaoNotification(item).then(() => resolve()).catch(error => { throw error; });
                sendChiDaoCongVanDenMailToRectors(item);
            }
            else if ([trangThaiSwitcher.DA_DUYET.id, trangThaiSwitcher.TRA_LAI_BGH.id].includes(after)) {
                createCreatorNotification(item, after).then(() => resolve()).catch(error => { throw error; });
            }
            else if ((after == trangThaiSwitcher.DA_PHAN_PHOI.id && before != trangThaiSwitcher.THEO_DOI_TIEN_DO.id) || after == trangThaiSwitcher.THEO_DOI_TIEN_DO.id) {
                createRelatedStaffNotification(item, after).then(() => resolve()).catch(error => { throw error; });
                sendMailToRelatedStaff(item);
            }
            else if (after == trangThaiSwitcher.CHO_PHAN_PHOI.id) {
                createDistributingNotification(item).then(() => resolve()).catch(error => { throw error; });
            }
            else
                resolve();
        } catch (error) {
            console.error('fail to send notification', error);
            resolve();
        }
    });

    app.hcthCongVanDen = {
        notifyExpired: async () => {
            try {
                console.log('HCTH: Notify expired document start');
                const today = new Date();
                const expireTime = new Date();
                expireTime.setDate(today.getDate() + 3);
                expireTime.setHours(0, 0, 0, 0);
                const result = await app.model.hcthCongVanDen.getNotification(expireTime.getTime());
                if (result.rows && result.rows.length > 0) {
                    await app.model.hcthCongVanDen.update({
                        statement: 'id in (:ids)',
                        parameter: { ids: result.rows.map(item => item.id) }
                    }, { nhacNho: 1 });
                    const canBos = await app.model.hcthCongVanDen.getAuthorizedStaff();
                    const emails = canBos.rows.map(canBo => canBo.email);
                    const promises = [];
                    const template = `
<div style="border-radius:20px; border:2px outset blue; font-family:Times New Roman,Times,serif; max-width:1000px; min-width:500px; overflow:hidden; padding-bottom:20px; text-align:center">
    <div style="width:100%"><img alt="" src="https://hcmussh.edu.vn/img/email-header.jpg" style="transform:scale(110%); width:100%" /></div>
    <div style="padding:20px; text-align:justify;font-family:Times New Roman,Times,serif;font-size:19px;">{noi_dung_thong_bao}</div>
</div>

<hr />
<blockquote>
<p><span style="font-size:12px"><span style="font-family:Times New Roman,Times,serif">Hệ thống văn ph&ograve;ng điện tử E-office.</span></span></p>

<p><span style="font-size:12px"><span style="font-family:Times New Roman,Times,serif">Trường Đại học Khoa học X&atilde; hội v&agrave; Nh&acirc;n văn - Đại học Quốc gia Th&agrave;nh phố Hồ Ch&iacute; Minh.&nbsp;</span></span></p>
</blockquote>
`;
                    result.rows.forEach(item => {
                        promises.push(new Promise((resolve, reject) => {
                            createNotification(emails, { title: 'Văn bản đến sắp hết hạn', icon: 'fa-book', subTitle: 'Văn bản đến sắp hết hạn. Bạn hãy kiểm tra lại các đơn vị liên quan đã có thao tác cần thiết đối với văn bản.', iconColor: 'danger', link: `/user/hcth/van-ban-den/${item.id}`, notificationCategory: 'VAN_BAN_DEN:' + item.id }, (error) => {
                                error ? reject(error) : resolve();
                            });
                        }));
                    });
                    /**Send admin expires document */
                    const adminExpiresMessage = template.replaceAll('{noi_dung_thong_bao}', `
                    <p>Danh sách các văn bản sắp hết hạn</p>
                    <ul>
                        ${result.rows.map(i => `<li><a href="${(app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + '/user/van-ban-den/' + i.id}">${i.trichYeu}</a> (hết hạn vào ${moment(new Date(i.ngayHetHan)).format('DD/MM/YYYY')})</li>`).join('\n')}
                    </ul>
                    `);
                    const mailTitle = '[HCMUSSH-EOFFICE]: THÔNG BÁO VĂN BẢN HẾT HẠN';

                    if (app.isDebug)
                        promises.push(app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', '', null, 'long.nguyen0709@hcmut.edu.vn,superlong2017@gmail.com', mailTitle, '', adminExpiresMessage, null));
                    else {
                        promises.push(app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', '', null, emails.join(','), mailTitle, '', adminExpiresMessage, null));
                    }

                    const getEmailFromShcc = async (shccs) => {
                        const canBo = await app.model.tchcCanBo.getAll({
                            statement: 'shcc in (:shccs)',
                            parameter: { shccs }
                        }, 'email', 'email');
                        return canBo.map(i => i.email);
                    };

                    promises.push(...result.rows.map(async item => {
                        const emailContent = template.replaceAll('{noi_dung_thong_bao}', `
                        Hệ thống văn phòng điện tử xin thông báo tới quý thầy/cô, văn bản <a href="${(app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + '/user/van-ban-den/' + item.id}">${item.trichYeu}</a> sẽ hết hạn vào ${moment(new Date(item.ngayHetHan)).format('DD/MM/YYYY')}.
                        `);
                        let emails = [];
                        if (item.maDonViNhan)
                            emails.push(...await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff(item.maDonViNhan, 'donViCongVanDen:read', Date.now()).then(({ rows: items }) => items.map(i => i.email)));
                        if (item.maCanBoNhan) {
                            emails.push(...await getEmailFromShcc(item.maCanBoNhan.split(',')));
                        }

                        emails = [...new Set(emails)].filter(i => i);
                        if (!emails.length) return;
                        if (app.isDebug)
                            await app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', '', null, 'long.nguyen0709@hcmut.edu.vn,superlong2017@gmail.com', mailTitle, '', emailContent, null);
                        else {
                            await app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', '', null, emails.join(','), mailTitle, '', emailContent, null);
                        }
                    }));
                    await Promise.all(promises).catch(error => { throw error; });

                }
            } catch (error) {
                console.error('Gửi thông báo nhắc nhở văn bản đến hết hạn lỗi', error);
            }
        }
    };

    (app.isDebug || app.appName == 'mdHanhChinhTongHopService') && app.readyHooks.add('hcthVanBanDen:ExpireNotification', {
        ready: () => app.database && app.assetPath,
        run: () => app.primaryWorker && !app.isDebug && app.schedule('* 8 * * *', app.hcthCongVanDen.notifyExpired),
    });


    app.get('/api/hcth/van-ban-den/selector/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const userPermissions = req.session.user?.permissions || [];
        const donViCanBo = (req.session?.user?.staff?.donViQuanly || []).map(item => item.maDonVi);
        const { status = '', ids = '', excludeIds = '', hasIds = 0, fromTime = null, toTime = null } = req.query.filter;
        const data = {
            staffType: userPermissions.includes('hcth:login') ? canBoType.HCTH : userPermissions.includes('rectors:login') ? canBoType.RECTOR : null,
            donViCanBo: donViCanBo.toString() || (userPermissions.includes('donViCongVanDen:read') ? req.session.user?.staff?.maDonVi : '') || '',
            shccCanBo: req.session.user?.shcc,
            fromTime, toTime, status, ids, hasIds, excludeIds
        };

        let filterParam;
        try {
            filterParam = JSON.stringify(data);
        } catch {
            res.send({ error: 'Dữ liệu lọc lỗi!' });
        }
        app.model.hcthCongVanDen.searchSelector(pageNumber, pageSize, filterParam, searchTerm, (error, page) => {
            if (error || !page) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    const deleteCanBoNhanChiDao = (danhSachCanBo, id, nguoiTao) => {
        const listShccCanBo = danhSachCanBo.split(',');
        const promises = listShccCanBo.map(canBoShcc => new Promise((resolve, reject) => {
            app.model.hcthCanBoNhan.delete({ canBoNhan: canBoShcc, loai: 'DEN', ma: id, vaiTro: 'DIRECT' }, async (error) => {
                if (error) reject(error);
                else {
                    try {
                        if (canBoShcc !== nguoiTao) {
                            await createChiDaoNotification({ id, quyenChiDao: canBoShcc, }, false);
                        }
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        }));
        return Promise.all(promises);
    };

    app.post('/api/hcth/van-ban-den/quyen-chi-dao', app.permission.check('rectors:login'), async (req, res) => {
        try {
            const { id, shcc, status } = req.body;
            let quyenChiDaoStatus = JSON.parse(status);
            if (quyenChiDaoStatus) {
                let listCanBo = [];
                listCanBo.push(shcc);
                await createCanBoNhanChiDao(listCanBo, req.session.user?.staff?.shcc, req.body.id);
                if (shcc !== req.session?.user?.staff.shcc) {
                    await createChiDaoNotification({
                        id,
                        quyenChiDao: shcc,
                    });
                }
            } else {
                const shccNguoiTao = req.session?.user?.staff?.shcc || req.session?.user?.shcc;
                await deleteCanBoNhanChiDao(shcc, id, shccNguoiTao);
            }
            res.send({ error: null });
        }
        catch (error) {
            res.send({ error });
        }
    });

    // Download Template ---------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/hcth/van-ban-den/download-excel/:filter', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        let { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, congVanYear, tab, status, sortBy, sortType } = req.params.filter ? JSON.parse(req.params.filter) : { donViGuiCongVan: null, donViNhanCongVan: null, canBoNhanCongVan: null, timeType: null, fromTime: null, toTime: null, congVanYear: null, tab: 0, status: null, sortBy: '', sortType: '' };

        const obj2Db = { 'ngayHetHan': 'NGAY_HET_HAN', 'ngayNhan': 'NGAY_NHAN', 'tinhTrang': 'TINH_TRANG' };

        let donViCanBo = '', canBo = '', tabValue = parseInt(tab);

        const user = req.session.user;
        const permissions = user.permissions;
        donViCanBo = (req.session?.user?.staff?.donViQuanLy || []);
        donViCanBo = donViCanBo.map(item => item.maDonVi).toString() || (permissions.includes('president:login') && MA_BAN_GIAM_HIEU) || permissions.includes('donViCongVanDen:read') && req.session?.user?.staff?.maDonVi || '';
        canBo = req.session?.user?.shcc || '';
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        if (tabValue == 0) {
            if (permissions.includes('rectors:login') || permissions.includes('hcth:login') || (!user.isStaff && !user.isStudent)) {
                donViCanBo = '';
                canBo = '';
            }
        }
        else if (tabValue == 1) {
            if (donViCanBo.length) {
                canBo = '';
            } else
                donViCanBo = '';
        } else donViCanBo = '';



        if (congVanYear && Number(congVanYear) > 1900) {
            timeType = 2;
            fromTime = new Date(`${congVanYear}-01-01`).getTime();
            toTime = new Date(`${Number(congVanYear) + 1}-01-01`).getTime();
        }
        app.model.hcthCongVanDen.downloadExcel(donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, obj2Db[sortBy] || '', sortType, canBo, donViCanBo, permissions.includes('rectors:login') ? 1 : permissions.includes('hcth:login') ? 0 : 2, status, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const workBook = app.excel.create();
                const ws = workBook.addWorksheet('Cong_van_den');
                const defaultColumns = [
                    { header: 'STT', key: 'stt', width: 10 },
                    { header: 'Số lưu riêng (các ô bên cạnh - số được đánh bên trái của cv đến - dùng để kiếm cv)', key: 'soDen', width: 10 },
                    { header: 'NGÀY', key: 'ngay', width: 15 },
                    { header: 'ĐƠN VỊ GỬI', key: 'donViGuiCv', width: 30 },
                    { header: 'SỐ CV', key: 'soCV', width: 20 },
                    { header: 'NGÀY CV', key: 'ngayCongVan', width: 15 },
                    { header: 'NỘI DUNG', key: 'trichYeu', width: 50 },
                    { header: 'ĐƠN VỊ, NGƯỜI NHẬN', key: 'donViNguoiNhan', width: 30 },
                    { header: 'NGÀY HẾT HẠN', key: 'ngayHetHan', width: 15 },
                    { header: 'CHỈ ĐẠO CỦA HIỆU TRƯỞNG', key: 'chiDao', width: 30 },
                ];
                ws.columns = defaultColumns;
                ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center', wrapText: true };
                ws.getRow(1).height = 40;
                ws.getRow(1).font = {
                    name: 'Times New Roman',
                    family: 4,
                    size: 12,
                    bold: true,
                    color: { argb: 'FF000000' }
                };
                page.rows.forEach((item, index) => {
                    ws.getRow(index + 2).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center', wrapText: true };
                    ws.getRow(index + 2).font = { name: 'Times New Roman' };
                    ws.getCell('A' + (index + 2)).value = index + 1;
                    ws.getCell('B' + (index + 2)).value = item.soDen;
                    ws.getCell('B' + (index + 2)).font = { ...ws.getRow(index + 2).font, bold: true };
                    ws.getCell('C' + (index + 2)).value = app.date.dateTimeFormat(new Date(item.ngayNhan), 'dd/mm/yyyy');
                    ws.getCell('D' + (index + 2)).value = item.tenDonViGuiCV;
                    ws.getCell('D' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'left' };
                    ws.getCell('E' + (index + 2)).value = item.soCongVan ? item.soCongVan : '';
                    ws.getCell('F' + (index + 2)).value = item.ngayCongVan ? app.date.dateTimeFormat(new Date(item.ngayCongVan), 'dd/mm/yyyy') : '';
                    ws.getCell('G' + (index + 2)).value = item.trichYeu;
                    ws.getCell('G' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'left' };
                    const donViNhan = item.danhSachDonViNhan?.split(';').map(dv => dv + '\r\n').join('') || '';
                    const canBoNhan = item.danhSachCanBoNhan?.split(';').map(cb => cb + '\r\n').join('') || '';
                    ws.getCell('H' + (index + 2)).value = canBoNhan !== '' || donViNhan !== '' ? canBoNhan + donViNhan : '';
                    ws.getCell('H' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'left' };
                    ws.getCell('I' + (index + 2)).value = item.ngayHetHan !== 0 ? app.date.dateTimeFormat(new Date(item.ngayHetHan), 'dd/mm/yyyy') : '';
                    ws.getCell('I' + (index + 2)).font = { ...ws.getRow(index + 2).font, color: { argb: 'FFFF0000' } };
                    ws.getCell('J' + (index + 2)).value = item.chiDao?.split('|').map(cd => cd + '\r\n').join('');
                    ws.getCell('J' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'left' };
                });
                let fileName = `Cong_van_den_${Date.now()}.xlsx`;
                app.excel.attachment(workBook, res, fileName);
            }
        });
    });

    const processFile = async (file /**buffer */) => {
        const pdfDoc = await PDFDocument.load(file);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const data = fields.filter(field => field.constructor.name == 'PDFSignature').map(field => {
            const name = field.getName();
            const valueObjectRef = field.acroField.dict.get(PDFName.of('V'));
            const dict = pdfDoc.context.indirectObjects.get(valueObjectRef);
            try {
                const ngayKy = dict.get(PDFName.of('M'))?.decodeDate() || '';
                const byteRange = dict.get(PDFName.of('ByteRange')).asArray();
                const thongTinLienLac = dict.get(PDFName.of('ContactInfo'))?.decodeText() || '';
                const reason = dict.get(PDFName.of('Reason'))?.decodeText() || '';
                const contents = dict.get(PDFName.of('Contents'))?.asString() || '';
                return { name, ngayKy, thongTinLienLac, reason, byteRange: byteRange.map(item => item.asNumber()), contents };
            } catch {
                //skip signature
            }
        });
        return data;
    };


    const getSignedBytes = (view, byteRange) => {
        let count = 0;
        const signedDataBuffer = new ArrayBuffer(byteRange[1] + byteRange[3]);
        const signedDataView = new Uint8Array(signedDataBuffer);
        for (let i = byteRange[0]; i < (byteRange[0] + byteRange[1]); i++, count++)
            signedDataView[count] = view[i];

        for (let j = byteRange[2]; j < (byteRange[2] + byteRange[3]); j++, count++)
            signedDataView[count] = view[j];
        return { signedDataBuffer, signedDataView };
    };

    const verifySignature = async (view, byteRange, contents, trustedCertificates, crls) => {
        try {
            contents = Buffer.from(contents, 'hex').toString('binary');
            const contentLength = contents.length;
            const contentBuffer = new ArrayBuffer(contentLength);
            const contentView = new Uint8Array(contentBuffer);
            for (let i = 0; i < contentLength; i++)
                contentView[i] = contents.charCodeAt(i);

            const cmsContentSimp = pkijs.ContentInfo.fromBER(contentBuffer);
            const cmsSignedSimp = new pkijs.SignedData({ schema: cmsContentSimp.content, crls });

            const { signedDataBuffer } = getSignedBytes(view, byteRange);
            const verifyResult = await cmsSignedSimp.verify({
                signer: 0,
                data: signedDataBuffer,
                trustedCerts: trustedCertificates,
                checkChain: true
            });
            if (!verifyResult) return false;
            else if ('signedAttrs' in cmsSignedSimp.signerInfos[0]) {
                const crypto = pkijs.getCrypto(true);
                let shaAlgorithm = '';

                switch (cmsSignedSimp.signerInfos[0].digestAlgorithm.algorithmId) {
                    case '1.3.14.3.2.26':
                        shaAlgorithm = 'sha-1';
                        break;
                    case '2.16.840.1.101.3.4.2.1':
                        shaAlgorithm = 'sha-256';
                        break;
                    case '2.16.840.1.101.3.4.2.2':
                        shaAlgorithm = 'sha-384';
                        break;
                    case '2.16.840.1.101.3.4.2.3':
                        shaAlgorithm = 'sha-512';
                        break;
                    default:
                        throw new Error('Unknown hashing algorithm');
                }

                if (verifyResult === false)
                    throw new Error('Signature verification failed');

                const digest = await crypto.digest({ name: shaAlgorithm }, new Uint8Array(signedDataBuffer));

                let messageDigest = new ArrayBuffer(0);

                const signedAttrs = cmsSignedSimp.signerInfos[0].signedAttrs;
                for (let j = 0; signedAttrs && j < signedAttrs.attributes.length; j++) {
                    if (signedAttrs.attributes[j].type === '1.2.840.113549.1.9.4') {
                        messageDigest = signedAttrs.attributes[j].values[0].valueBlock.valueHex;
                        break;
                    }
                }

                if (messageDigest.byteLength === 0)
                    throw new Error('No signed attribute \'MessageDigest\'');
                const view1 = new Uint8Array(messageDigest);
                const view2 = new Uint8Array(digest);

                if (view1.length !== view2.length)
                    throw new Error('Hash is not correct');

                for (let i = 0; i < view1.length; i++) {
                    if (view1[i] !== view2[i])
                        throw new Error('Hash is not correct');
                }
                return true;
            } else
                return false;
        } catch (error) {
            return false;
        }
    };

    const verifyIntegrity = (fileBuffer, byteRange) => {
        try {
            const signedData = Buffer.concat([fileBuffer.slice(byteRange[0], byteRange[0] + byteRange[1]), fileBuffer.slice(byteRange[2], byteRange[2] + byteRange[3])]);
            let signatureHex = fileBuffer.slice(byteRange[1] + 1, byteRange[2] - 1).toString('binary');
            signatureHex = signatureHex.replace(/(?:00)*$/, '');
            let signature = Buffer.from(signatureHex, 'hex').toString('binary');
            let p7Asn1 = forge.asn1.fromDer(signature);
            const message = forge.pkcs7.messageFromAsn1(p7Asn1);
            const { digestAlgorithm } = message.rawCapture;
            const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm);
            let hashAlgorithm;
            switch (hashAlgorithmOid) {
                case '1.3.14.3.2.26':
                    hashAlgorithm = 'SHA1';
                    break;
                case '2.16.840.1.101.3.4.2.1':
                    hashAlgorithm = 'SHA256';
                    break;
                case '2.16.840.1.101.3.4.2.2':
                    hashAlgorithm = 'SHA384';
                    break;
                case '2.16.840.1.101.3.4.2.3':
                    hashAlgorithm = 'SHA512';
                    break;
                default:
                    throw new Error('Unknown hashing algorithm');
            }
            const sig = message.rawCapture.signature;
            const attrs = message.rawCapture.authenticatedAttributes;
            const set = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, attrs);
            const buf = Buffer.from(forge.asn1.toDer(set).data, 'binary');
            const cert = forge.pki.certificateToPem(message.certificates[0]);
            const verifier = app.crypto.createVerify(`RSA-${hashAlgorithm}`);
            verifier.update(buf);
            const validAuthenticatedAttributes = verifier.verify(cert, sig, 'binary');
            if (!validAuthenticatedAttributes) throw new Error('Wrong authenticated attributes');
            const oids = forge.pki.oids;
            const hash = app.crypto.createHash(hashAlgorithm);
            const data = signedData;
            hash.update(data);
            const fullAttrDigest = attrs.find(attr => forge.asn1.derToOid(attr.value[0].value) === oids.messageDigest);
            const attrDigest = fullAttrDigest.value[1].value[0].value;
            const dataDigest = hash.digest();
            const validContentDigest = dataDigest.toString('binary') === attrDigest;
            return validContentDigest;
        } catch (error) {
            return false;
        }
    };

    const decodePEM = (pem, tag = '[A-Z0-9 ]+') => {
        const pattern = new RegExp(`-{5}BEGIN ${tag}-{5}([a-zA-Z0-9=+\\/\\n\\r]+)-{5}END ${tag}-{5}`, 'g');
        const res = [];
        let matches = null;
        // eslint-disable-next-line no-cond-assign
        while (matches = pattern.exec(pem)) {
            const base64 = matches[1]
                .replace(/\r/g, '')
                .replace(/\n/g, '');
            res.push(pvtsutils.Convert.FromBase64(base64));
        }
        return res;
    };
    const parseCertificate = (source) => {
        const buffers = [];
        const buffer = pvtsutils.BufferSourceConverter.toArrayBuffer(source);
        const pem = pvtsutils.Convert.ToBinary(buffer);
        if (/----BEGIN CERTIFICATE-----/.test(pem)) {
            buffers.push(...decodePEM(pem, 'CERTIFICATE'));
        }
        else {
            buffers.push(buffer);
        }
        const res = [];
        for (const item of buffers) {
            res.push(pkijs.Certificate.fromBER(item));
        }
        return res;
    };
    const parseCertificateRevocationList = (source) => {
        return decodePEM(source).map(item => pkijs.CertificateRevocationList.fromBER(item));
    };

    app.post('/api/hcth/van-ban-den/xac-thuc', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id, tenFile } = req.body;
            const filePath = app.path.join(app.assetPath, `congVanDen/${id}/${tenFile}`);
            const fileBuffer = app.fs.readFileSync(filePath);
            const view = new Uint8Array(fileBuffer);
            let certificates = await app.model.dmChungChiChuKy.getAll({ isCrl: 0 });
            let crls = await app.model.dmChungChiChuKy.getAll({ isCrl: 1 });
            certificates = certificates.reduce((lst, item) => {
                const file = app.fs.readFileSync(item.duongDan);
                const temp = parseCertificate(file);
                lst.push(...temp);
                return lst;
            }, []);
            crls = crls.reduce((lst, item) => {
                const file = app.fs.readFileSync(item.duongDan);
                const temp = parseCertificateRevocationList(file);
                lst.push(...temp);
                return lst;
            }, []);
            pkijs.setEngine('OpenSSL', crypto, new pkijs.CryptoEngine({ name: 'OpenSSL', crypto, subtle: crypto.subtle }));
            const signatureInfos = await processFile(fileBuffer);
            res.send({
                items: await Promise.all(signatureInfos.map(async signature => {
                    const { name, ngayKy, thongTinLienLac, reason, byteRange, contents } = signature;
                    return { name, ngayKy: ngayKy?.getTime() || null, thongTinLienLac, reason, integrity: verifyIntegrity(fileBuffer, byteRange), verified: await verifySignature(view, byteRange, contents, certificates, crls) };
                }))
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban-den/rectors/:id', app.permission.check('rectors:login'), async (req, res) => {
        try {
            const id = req.params.id;
            let { donViNhan = [], canBoNhan = [], donViChuTri } = req.body;
            donViNhan = Array.from(new Set(donViNhan));
            canBoNhan = Array.from(new Set(canBoNhan));
            const vanBan = await app.model.hcthCongVanDen.get({ id });
            if (!vanBan) {
                throw 'Văn bản không tồn tại';
            } else {
                const promises = [];
                if (donViChuTri != vanBan.donViChuTri) {
                    promises.push(app.model.hcthCongVanDen.update({ id }, { donViChuTri }));
                }
                let donViNhanList = await app.model.hcthDonViNhan.getAll({ ma: id, loai: 'DEN' }, 'donViNhan', 'donViNhan');
                donViNhanList = donViNhanList.map(item => item.donViNhan);
                const addedDonVi = donViNhan.difference(donViNhanList);
                const deletedDonVi = donViNhanList.difference(donViNhan);
                if (addedDonVi.length) {
                    promises.push(Promise.all(addedDonVi.map(item => app.model.hcthDonViNhan.create({ ma: id, loai: 'DEN', donViNhan: item }))));
                }
                if (deletedDonVi.length) {
                    promises.push(app.model.hcthDonViNhan.delete({
                        statement: 'ma = :id and loai = :loai and donViNhan in (:donViNhanList)',
                        parameter: {
                            id, loai: 'DEN', donViNhanList: deletedDonVi
                        }
                    }));
                }
                // let canBoNhanList = await app.model.hcthCanBoNhan.getAll({ ma: id, loai: 'DEN' }, 'canBoNhan', 'canBoNhan');
                // canBoNhanList = donViNhanList.map(item => item.canBoNhan);

                // const addedCanBo = canBoNhan.difference(canBoNhanList);
                // const deletedCanBo = canBoNhanList.difference(canBoNhan);
                // if (addedCanBo.length) {
                //     promises.push(Promise.all(addedCanBo.map(item => app.model.hcthCanBoNhan.create({ ma: id, loai: 'DEN', canBoNhan: item }))));
                // }
                // if (deletedCanBo.length) {
                //     promises.push(app.model.hcthCanBoNhan.delete({
                //         statement: 'ma = :id and loai = :loai and canBoNhan in (:shccs)',
                //         parameter: {
                //             id, loai: 'DEN', shccs: deletedCanBo
                //         }
                //     }));
                // }
                promises.push(app.model.hcthCongVanDen.update({ id: id }, { canBoNhan: Array.from(new Set(canBoNhan)).toString() },));
                await Promise.all(promises);
                res.send({});
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/van-ban-den/notification/read/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            await app.model.fwNotification.update({ email: req.session.user.email, notificationCategory: 'VAN_BAN_DEN:' + req.params.id }, { read: 1 })
                .catch(() => 'ignore errror');
            if (req.session.user.shcc) {
                const congVan = await app.model.hcthCongVanDen.get({ id: req.params.id });

                const [listRelatedStaff, listCanBoChiDao] = await Promise.all([
                    app.model.hcthCongVanDen.getRelatedStaff(req.params.id),
                    app.model.hcthCanBoNhan.getAll({ ma: congVan.id, loai: 'DEN', vaiTro: 'DIRECT' }, 'canBoNhan', 'canBoNhan')
                ]);

                let listDirectorShcc = listCanBoChiDao.map(item => item.canBoNhan);
                listDirectorShcc.push(congVan.nguoiTao);

                const directors = await app.model.tchcCanBo.getAll({
                    statement: 'shcc IN (:dsCanBo)',
                    parameter: {
                        dsCanBo: [...listDirectorShcc],
                    }
                }, 'email', 'email');

                const directorEmails = directors.map(director => director.email);

                let emailList = directorEmails;
                if (congVan.trangThai === trangThaiSwitcher.DA_PHAN_PHOI.id) {
                    const relatedStaffEmails = listRelatedStaff.rows.map(item => item.email);
                    emailList = emailList.concat(relatedStaffEmails);
                }

                if (emailList.includes(req.session.user.email)) {
                    await app.model.hcthFollowLog.updateOrCreate(congVan.id, req.session.user.staff.shcc);
                }
            }
            res.send({});
        } catch (error) {
            console.error('van ban den: notification', error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban-den/follow/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const items = await app.model.hcthFollowLog.getList(app.utils.stringify({ congVanDenId: req.params.id })).then(r => r.rows);
            const userLog = req.session.user.shcc ? await app.model.hcthFollowLog.getAll({ congVanDenId: req.params.id, shcc: req.session.user.shcc }) : [];
            res.send({ items, userLog });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban-den/follow', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const item = await app.model.hcthFollowLog.create({ createdAt: Date.now(), shcc: req.session.user.shcc, ...req.body.data });
            const vanBan = await app.model.hcthCongVanDen.get({ id: item.congVanDenId });
            let notification = {}, emails = [];
            if (item.chiDaoId) {
                const chiDao = await app.model.hcthChiDao.get({ id: item.chiDaoId });
                notification = { title: 'Văn bản đến', icon: 'fa-book', iconColor: 'info', subTitle: `${req.session.user.lastName || ''} ${req.session.user.lastName || ''} đã tiếp nhận chỉ đạo "${chiDao.chiDao}" của bạn trong văn bản "${vanBan.trichYeu}"`, link: `/user/van-ban-den/${vanBan.id}`, notificationCategory: 'VAN_BAN_DEN:' + vanBan.id };
                emails = [await app.model.tchcCanBo.get({ shcc: chiDao.canBo }).then(item => item.email)];
            } else if (item.phanHoiId) {
                const phanHoi = await app.model.hcthPhanHoi.get({ id: item.phanHoiId });
                notification = { title: 'Văn bản đến', icon: 'fa-book', iconColor: 'info', subTitle: `${req.session.user.lastName || ''} ${req.session.user.lastName || ''} đã tiếp nhận phản hồi "${phanHoi.noiDung}" của bạn trong văn bản "${vanBan.trichYeu}"`, link: `/user/van-ban-den/${vanBan.id}`, notificationCategory: 'VAN_BAN_DEN:' + vanBan.id };
                emails = [await app.model.tchcCanBo.get({ shcc: phanHoi.canBoGui }).then(item => item.email)];
            }
            createNotification(emails, notification, () => { });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/van-ban-den/trang-thai/:id', app.permission.check('hcthCongVanDen:manage'), async (req, res) => {
        try {
            const item = await app.model.hcthCongVanDen.get({ id: req.params.id });
            if (!item) {
                throw 'Văn bản không tồn tại';
            } else {
                await app.model.hcthCongVanDen.update({ id: item.id }, { trangThai: req.body.trangThai });
            }
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban-den/urgent', app.permission.check('hcthCongVanDen:manage'), async (req, res) => {
        try {
            const id = req.body.id;
            let item = await app.model.hcthCongVanDen.get({ id });
            item = await app.model.hcthCongVanDen.update({ id }, { isUrgent: Number(!item.isUrgent) });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
