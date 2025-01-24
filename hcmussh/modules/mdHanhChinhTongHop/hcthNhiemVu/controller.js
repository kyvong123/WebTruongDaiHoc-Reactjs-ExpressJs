module.exports = (app) => {

    const { canBoType, trangThaiNhiemVu, action, NHIEM_VU_TYPE } = require('../constant');

    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            406: { title: 'Giao nhiệm vụ', link: '/user/nhiem-vu', icon: 'fa-list-alt', backgroundColor: '#de602f', groupIndex: 1 },
        },
    };

    const hcthMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            503: { title: 'Giao nhiệm vụ', link: '/user/hcth/nhiem-vu', icon: 'fa-tasks', backgroundColor: '#de602f', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'hcthGiaoNhiemVu:read' },
        { name: 'hcthGiaoNhiemVu:write' },
        { name: 'hcthGiaoNhiemVu:delete' },
        { name: 'hcth:login', menu: hcthMenu },
        { name: 'hcth:manage' },
        { name: 'staff:login', menu },
    );

    app.get('/user/hcth/nhiem-vu', app.permission.check('hcth:login'), app.templates.admin);
    app.get('/user/hcth/nhiem-vu/:id', app.permission.check('hcth:login'), app.templates.admin);
    app.get('/user/hcth/nhiem-vu/statistic', app.permission.check('hcth:login'), app.templates.admin);

    app.get('/user/nhiem-vu', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/nhiem-vu/:id', app.permission.check('staff:login'), app.templates.admin);

    //utils
    const laNguoiThamGia = (req, nhiemVu) => {
        const shcc = req.session.user?.staff?.shcc;
        const canBoNhan = nhiemVu.canBoNhan;
        return canBoNhan.some(item => item.shccCanBoNhan == shcc);
    };

    const laTruongDonViNhan = (req, nhiemVu) => {
        const donViQuanLy = req.session.user?.staff?.donViQuanLy || [];
        if (donViQuanLy.length == 0)
            return false;
        const donViNhan = nhiemVu.donViNhan;
        return donViQuanLy.some(item => donViNhan.some(donVi => donVi.donViNhan == item.maDonVi));
    };


    const checkNhiemVuPermission = async (req, nhiemVu, nhiemVuId) => {
        try {
            const permissions = req.session.user?.permissions || [];
            if (!nhiemVu) {
                nhiemVu = await app.model.hcthNhiemVu.get({ id: nhiemVuId });
                const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: nhiemVuId, loai: NHIEM_VU }, '*', 'id');
                const canBoNhan = await app.model.hcthCanBoNhan.getAllFrom(nhiemVuId, NHIEM_VU);
                nhiemVu.canBoNhan = canBoNhan?.rows || [];
                nhiemVu.donViNhan = donViNhan || [];
            }
            return (
                permissions.includes('hcthGiaoNhiemVu:read') ||
                permissions.includes('rectors:login') ||
                permissions.includes('hcth:manage') ||
                req.session.user?.staff.shcc == nhiemVu.nguoiTao ||
                laTruongDonViNhan(req, nhiemVu) ||
                laNguoiThamGia(req, nhiemVu)
            );
        }
        catch (error) {
            return false;
        }
    };

    app.hcthNhiemVu = {
        laNguoiThamGia,
        laTruongDonViNhan,
        checkNhiemVuPermission,
    };

    //api

    const updateListFile = (listFile, nhiemVuId) => {
        const promises = listFile.map(file => new Promise((resolve, reject) => {
            const
                { id, ...changes } = file,
                sourcePath = app.path.join(app.assetPath, `/nhiemVu/new/${changes.ten}`),
                destPath = app.path.join(app.assetPath, `/nhiemVu/${nhiemVuId}/${changes.ten}`);
            if (!changes.ma)
                app.fs.rename(sourcePath, destPath, error => {
                    if (error) reject(error);
                    else
                        app.model.hcthFile.update({ id }, { ...changes, ma: nhiemVuId }, (error) => {
                            if (error) reject(error);
                            else resolve();
                        });
                });
            else
                app.model.hcthFile.update({ id }, { ...changes }, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
        }));
        return Promise.all(promises);
    };


    const updateDonViNhan = async (current, change, ma) => {
        const diff = change.filter(maDonVi => !current.some(currentItem => currentItem.donViNhan == maDonVi));
        const deleteList = current.filter(currentItem => !change.includes(currentItem.donViNhan.toString())).map(currentItem => currentItem.id);
        if (deleteList.length > 0)
            await app.model.hcthDonViNhan.delete({ statement: 'id in (:ids)', parameter: { ids: deleteList } });
        if (diff.length > 0)
            await app.model.hcthDonViNhan.createFromList(diff, ma, NHIEM_VU);
    };


    const createCanBoNhan = (danhSachCanBo, nguoiTao, vaiTro, id) => {
        const promises = danhSachCanBo.map(canBo => new Promise((resolve, reject) => {
            app.model.hcthCanBoNhan.create({ canBoNhan: canBo, nguoiTao, ma: id, loai: NHIEM_VU, vaiTro }, (error, item) => {
                if (error) reject(error); else resolve(item);
            });
        }));
        return Promise.all(promises);
    };


    const updateCanBoNhan = async (ids, ma) => {
        if (ids && ids.length != 0)
            await app.model.hcthCanBoNhan.update({ statement: 'id in (:ids)', parameter: { ids: ids.map(item => Number(item)) } }, { ma });
    };

    const vaiTroCanBoNhan = {
        PARTICIPANT: {
            id: 'PARTICIPANT',
            text: 'Cán bộ phối hợp',
            color: 'info',
            icon: 'fa-user-times'
        },
        MANAGER: {
            id: 'MANAGER',
            text: 'Cán bộ chủ trì',
            color: 'warning',
            icon: 'fa-user-plus'
        }
    };

    const CAN_BO_NHAN_ACTION = {
        ADD: 'add',
        REMOVE: 'remove',
        CHANGE_ROLE: 'changeRole',
        RESET_STATUS: 'reset_status',
        ADD_LIEN_KET: 'add_lien_ket'
    };

    const TRANG_THAI_CAN_BO_NHAN = {
        READ: 'READ',
        COMPLETED: 'COMPLETED'
    };

    const NHIEM_VU = 'NHIEM_VU';

    const createNotification = async (emails, notification, done) => {
        const prmomises = [];
        emails.forEach(email => {
            prmomises.push(app.notification.send({
                toEmail: email,
                ...notification
            }));
            if (notification.emailContent) {
                const { mailTitle, mailText, mailHtml } = notification.emailContent;
                if (app.isDebug)
                    prmomises.push(app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', 'nqlong0709@gmail.com', null, null, mailTitle, mailText, mailHtml, null));
                else {
                    prmomises.push(app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', email, null, null, mailTitle, mailText, mailHtml, null));
                }
            }
        });
        return await Promise.all(prmomises).then(() => done && done(null)).catch(error => done && done(error));
    };

    const onCreateCanBoNhanNotification = ({ maNhiemVu, nguoiTaoShcc, canBoNhan, vaiTro = {}, phanHoi = '', hanhDong, nhiemVu, sendToEmail }) => new Promise((resolve, reject) => {
        try {
            let listEmployees = [];
            listEmployees.push(nguoiTaoShcc);
            listEmployees = listEmployees.concat(canBoNhan);
            app.model.tchcCanBo.getAll({
                statement: 'shcc IN (:dsCanBo)',
                parameter: {
                    dsCanBo: [...listEmployees]
                }
            }, 'email, ho, ten, shcc', 'email', (error, canBos) => {
                if (error) reject(error);
                else {
                    const nguoiTao = canBos.find(canBo => canBo.shcc === nguoiTaoShcc);
                    const dsNguoiNhan = canBos.filter(canBo => canBo.shcc !== nguoiTaoShcc);
                    const hoTenNguoiTao = nguoiTao?.ho + ' ' + nguoiTao?.ten;
                    const tenVaiTro = vaiTro?.text || vaiTroCanBoNhan[vaiTro]?.text || '';
                    let subTitle = '';
                    let iconColor = '';
                    let icon = '';
                    switch (hanhDong) {
                        case CAN_BO_NHAN_ACTION.ADD:
                            subTitle = `${hoTenNguoiTao.trim().normalizedName()} đã thêm bạn vào nhiệm vụ #${maNhiemVu} với vai trò ${tenVaiTro}.`;
                            iconColor = 'success';
                            icon = 'fa-tasks';
                            break;
                        case CAN_BO_NHAN_ACTION.ADD_LIEN_KET:
                            subTitle = `${hoTenNguoiTao.trim().normalizedName()} đã thêm 1 liên kết vào nhiệm vụ #${maNhiemVu}.`;
                            iconColor = 'success';
                            icon = 'fa-tasks';
                            break;
                        case CAN_BO_NHAN_ACTION.REMOVE:
                            subTitle = `${hoTenNguoiTao.trim().normalizedName()} đã xoá bạn ra khỏi nhiệm vụ #${maNhiemVu}.`;
                            iconColor = 'danger';
                            icon = 'fa-tasks';
                            break;
                        case CAN_BO_NHAN_ACTION.RESET_STATUS:
                            subTitle = `${hoTenNguoiTao.trim().normalizedName()} đã đặt lại trạng thái của bạn ở nhiệm vụ #${maNhiemVu} vì lý do :${phanHoi}.`;
                            iconColor = 'primary';
                            icon = 'fa-tasks';
                            break;
                        default:
                            subTitle = `${hoTenNguoiTao.trim().normalizedName()} đã thay đổi vai trò của bạn sang ${tenVaiTro} trong nhiêm vụ #${maNhiemVu}.`;
                            iconColor = vaiTroCanBoNhan[vaiTro].color;
                            icon = vaiTroCanBoNhan[vaiTro].icon;
                    }
                    createNotification(dsNguoiNhan.map(item => item.email), {
                        title: 'Nhiệm vụ',
                        icon, iconColor, subTitle, link: `/user/nhiem-vu/${maNhiemVu}`, notificationCategory: 'NHIEM_VU:' + maNhiemVu, emailContent: sendToEmail ? {
                            mailTitle: `[HCMUSSH-EOFFICE]: Nhiệm vụ #${maNhiemVu}: ${nhiemVu.tieuDe}`,
                            mailHtml: `<p><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif"><strong>{thongDiep}</strong></span></span></p>

                            <hr />
                            <p><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif"><a href="{url}">Nhiệm vụ #{id}</a>: {tieuDe}</span></span></p>
                            
                            <blockquote>
                            <p><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif"><tt>{noiDung}</tt></span></span></p>
                            </blockquote>
                            
                            <p>&nbsp;</p>
                            
                            <hr />
                            <p><span style="font-family:Arial,Helvetica,sans-serif">This is an automatic email from EOFFICE SYSTEM OF USSH - VNUHCM. Please do not reply this.</span></p>
                            `.replaceAll('{thongDiep}', subTitle).replaceAll('{tieuDe}', nhiemVu.tieuDe).replaceAll('{noiDung}', nhiemVu.noiDung).replaceAll('{id}', nhiemVu.id).replaceAll('{url}', app.isDebug ? `http://localhost:7012/user/nhiem-vu/${nhiemVu.id}` : `https://hcmussh.edu.vn/user/nhiem-vu/${nhiemVu.id}`),
                        } : null
                    }, (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                }
            });
        } catch (error) {
            console.error('fail to send notification', error);
            resolve();
        }
    });

    const onCreateOpenAndCloseTaskNotification = ({ maNhiemVu, nguoiTaoShcc, canBoNhan, hanhDong }) => new Promise((resolve, reject) => {
        try {
            let listEmployees = [];
            listEmployees.push(nguoiTaoShcc);
            listEmployees = listEmployees.concat(canBoNhan);
            app.model.tchcCanBo.getAll({
                statement: 'shcc IN (:dsCanBo)',
                parameter: {
                    dsCanBo: [...listEmployees]
                }
            }, 'email, ho, ten, shcc', 'email', (error, canBos) => {
                if (error) reject(error);
                else {
                    const nguoiTao = canBos.find(canBo => canBo.shcc === nguoiTaoShcc);
                    const dsNguoiNhan = canBos.filter(canBo => canBo.shcc !== nguoiTaoShcc);
                    const hoTenNguoiTao = nguoiTao?.ho + ' ' + nguoiTao?.ten;
                    let subTitle = '';
                    let icon = '';
                    let iconColor = '';
                    if (hanhDong === action.CLOSE) {
                        subTitle = `${hoTenNguoiTao.trim().normalizedName()} đã kết thúc nhiệm vụ #${maNhiemVu}.`;
                        icon = 'fa-lock';
                        iconColor = 'danger';
                    }
                    else {
                        subTitle = `${hoTenNguoiTao.trim().normalizedName()} đã mở lại nhiệm vụ #${maNhiemVu}.`;
                        icon = 'fa-unlock';
                        iconColor = 'success';
                    }
                    createNotification(dsNguoiNhan.map(item => item.email), { title: 'Nhiệm vụ', icon, iconColor, subTitle, link: `/user/nhiem-vu/${maNhiemVu}`, notificationCategory: 'NHIEM_VU:' + maNhiemVu }, (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                }
            });
        } catch (error) {
            console.error('fail to send close task to employees notification', error);
            resolve();
        }
    });


    app.post('/api/hcth/nhiem-vu', app.permission.orCheck('manager:write', 'htch:manage', 'rectors:login'), async (req, res) => {
        try {
            const { canBoNhan = [], fileList = [], donViNhan = [], lienKet = [], ...data } = req.body;
            const nhiemVu = await app.model.hcthNhiemVu.create({ ...data, trangThai: trangThaiNhiemVu.MO.id });
            await app.model.hcthDonViNhan.createFromList(donViNhan, nhiemVu.id, NHIEM_VU);
            await updateCanBoNhan(canBoNhan, nhiemVu.id);
            app.fs.createFolder(app.path.join(app.assetPath, `/nhiemVu/${nhiemVu.id}`));
            await updateListFile(fileList, nhiemVu.id);
            await app.model.hcthHistory.create({ loai: NHIEM_VU, key: nhiemVu.id, shcc: req.session.user.shcc, hanhDong: action.CREATE, thoiGian: Date.now() });
            if (canBoNhan.length > 0) {
                const listCanBoNhans = await app.model.hcthCanBoNhan.getAll({
                    statement: 'id IN (:canBoNhan)',
                    parameter: {
                        canBoNhan: [...canBoNhan.map(item => Number(item))]
                    }
                }, 'canBoNhan, vaiTro', 'canBoNhan');
                await Promise.all(Object.values(vaiTroCanBoNhan).map(async (vaiTro) => {
                    const canBoInVaiTro = listCanBoNhans.filter(canBo => canBo.vaiTro === vaiTro.id);
                    if (canBoInVaiTro.length > 0) {
                        const note = {
                            quantity: canBoInVaiTro.length,
                            role: vaiTro.id
                        };
                        await app.model.hcthHistory.create({ loai: NHIEM_VU, key: nhiemVu.id, shcc: req.session.user.shcc, hanhDong: action.ADD_EMPLOYEES, ghiChu: JSON.stringify(note), thoiGian: Date.now() });
                        onCreateCanBoNhanNotification({
                            maNhiemVu: nhiemVu.id,
                            nguoiTaoShcc: req.session.user.shcc,
                            canBoNhan: canBoInVaiTro.map(item => item.canBoNhan),
                            vaiTro,
                            phanHoi: '',
                            hanhDong: CAN_BO_NHAN_ACTION.ADD,
                            nhiemVu,
                            sendToEmail: true,
                        }).catch(error => console.error(error));
                    }
                }));
            }
            if (lienKet && lienKet.loaiLienKet) {
                await createListLienKet(lienKet.lienKet, lienKet.loaiLienKet, nhiemVu.id, NHIEM_VU, req.session.user.shcc);
            }
            res.send({ error: null });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/nhiem-vu', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const
                { id, changes } = req.body,
                { fileList = [], donViNhan = [], ...data } = changes;
            const nhiemVu = app.model.hcthNhiemVu.update({ id }, data);
            await updateDonViNhan(await app.model.hcthDonViNhan.getAll({ ma: id, loai: NHIEM_VU }, '*', ''), donViNhan, id);
            await updateListFile(fileList, id);
            await app.model.hcthHistory.create({ loai: NHIEM_VU, key: id, shcc: req.session.user.shcc, hanhDong: action.UPDATE, thoiGian: Date.now() });

            res.send({ error: null, item: nhiemVu });

        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/hcth/nhiem-vu', app.permission.check('hcthGiaoNhiemVu:delete'), (req, res) => {
        app.model.hcthNhiemVu.delete({ id: req.body.id }, errors => {
            app.fs.deleteFolder(app.assetPath + '/congVanDen/' + req.body.id);
            res.send({ errors });
        });
    });

    app.get('/api/hcth/nhiem-vu/search/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViNhan, canBoNhan, loaiNhiemVu, lienPhong = null, doUuTien = null, nguoiTao = null } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
            { donViNhan: null, canBoNhan: null, ngayHetHan: null };
        donViNhan = donViNhan || null;
        canBoNhan = canBoNhan || null;
        loaiNhiemVu = loaiNhiemVu || null;

        const user = req.session.user;
        const permissions = user.permissions;
        let shccCanBo = user.shcc;
        const donViCanBo = ((user.staff?.donViQuanLy || []).map(item => item.maDonVi)).toString();
        let _canBoType;
        if (permissions.includes('hcth:manage'))
            _canBoType = canBoType.HCTH;
        else if (permissions.includes('president:login')) {
            _canBoType = canBoType.RECTOR;
        }

        const data = { nguoiTao, donViNhan, canBoNhan, shccCanBo, donViCanBo, lienPhong, doUuTien, loaiNhiemVu, canBoType: _canBoType || null };
        let filterParam;
        try {
            filterParam = JSON.stringify(data);
        } catch (error) {
            filterParam = '{}';
        }

        app.model.hcthNhiemVu.searchPage(pageNumber, pageSize, filterParam, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });

    });

    app.get('/api/hcth/nhiem-vu/statistic/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const page = await app.model.hcthNhiemVu.getStatisticPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), app.utils.stringify(req.query.filter), searchTerm);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;

            let totalNhiemVu = list.length,
                totalReadNhiemVu = list.reduce((total, item) => item?.trangThai == 'READ' ? total + 1 : total, 0),
                totalCompletedNhiemVu = list.reduce((total, item) => item?.trangThai == 'COMPLETED' ? total + 1 : total, 0);

            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, totalNhiemVu, totalReadNhiemVu, totalCompletedNhiemVu } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.fs.createFolder(app.path.join(app.assetPath, '/nhiemVu'));
    app.fs.createFolder(app.path.join(app.assetPath, '/baoCaoNhiemVu'));


    app.uploadHooks.add('hcthNhiemVuFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthNhiemVuFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthNhiemVuFile = (req, fields, files, params, done) => {
        if (
            fields.userData &&
            fields.userData[0] &&
            fields.userData[0].startsWith('hcthNhiemVuFile') &&
            files.hcthNhiemVuFile &&
            files.hcthNhiemVuFile.length > 0) {
            const
                srcPath = files.hcthNhiemVuFile[0].path,
                isNew = fields.userData[0].substring(16) == 'new',
                id = fields.userData[0].substring(16),
                originalFilename = files.hcthNhiemVuFile[0].originalFilename,
                filePath = (isNew ? '/new/' : `/${id}/`) + files.hcthNhiemVuFile[0].originalFilename,
                destPath = app.assetPath + '/nhiemVu' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.fs.deleteFile(srcPath);
            } else {
                app.fs.createFolder(
                    app.path.join(app.assetPath, '/nhiemVu/' + (isNew ? '/new' : '/' + id))
                );
                app.fs.rename(srcPath, destPath, error => {
                    if (error) {
                        done && done({ error });
                    } else {
                        app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: NHIEM_VU, ma: id === 'new' ? null : id }, (error, item) => {
                            done && done({ error, item });
                        });
                    }
                });
            }
        }
    };

    app.get('/api/hcth/nhiem-vu/download/:id/:fileName', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        const { id, fileName } = req.params;
        const dir = app.path.join(app.assetPath, `/nhiemVu/${id}`);
        if (app.fs.existsSync(dir)) {
            const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
            for (const serverFileName of serverFileNames) {
                const clientFileIndex = serverFileName.indexOf(fileName);
                if (clientFileIndex !== -1 && serverFileName.slice(clientFileIndex) === fileName) {
                    return res.sendFile(app.path.join(dir, serverFileName));
                }
            }
        }

        res.status(400).send('Không tìm thấy tập tin');
    });


    const readNhiemVu = async (nhiemVuId, shccCanBo, creator) => {
        if (!shccCanBo || shccCanBo == creator) return;
        const lichSuDoc = await app.model.hcthHistory.get({ loai: NHIEM_VU, key: nhiemVuId, shcc: shccCanBo, hanhDong: action.READ });
        if (!lichSuDoc) {
            return await app.model.hcthHistory.create({ loai: NHIEM_VU, key: nhiemVuId, shcc: shccCanBo, hanhDong: action.READ, thoiGian: Date.now() });
        }
        return lichSuDoc;
    };

    app.get('/api/hcth/nhiem-vu/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const nhiemVuItem = await app.model.hcthNhiemVu.get({ id });
            const phanHoi = await app.model.hcthPhanHoi.getAllFrom(id, NHIEM_VU);
            const canBoNhan = await app.model.hcthCanBoNhan.getAllFrom(id, NHIEM_VU);
            const listFile = await app.model.hcthFile.getAll({ ma: id, loai: NHIEM_VU }, '*', 'thoiGian');
            const lienKet = await app.model.hcthLienKet.getAllFrom(id, NHIEM_VU, null, null);
            const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: NHIEM_VU }, '*', 'id');
            const { rows: baoCao } = await app.model.hcthBaoCaoNhiemVu.getList(nhiemVuItem.id);

            const nhiemVu = {
                ...nhiemVuItem,
                baoCao,
                phanHoi: phanHoi?.rows || [],
                listFile: listFile || [],
                canBoNhan: canBoNhan?.rows || [],
                lienKet: lienKet?.rows || [],
                donViNhan: donViNhan || []
            };

            if (!await checkNhiemVuPermission(req, nhiemVu)) {
                return res.send({ error: { status: 401, message: 'Bạn không có đủ quyền để xem nhiệm vu này' } });
            }
            else if (laNguoiThamGia(req, nhiemVu) || laTruongDonViNhan(req, nhiemVu)) {
                await readNhiemVu(nhiemVu.id, req.session.user.shcc, nhiemVu.nguoiTao);
                const isTrangThaiNull = nhiemVu.canBoNhan.some(canBo => canBo.shccCanBoNhan === req.session?.user?.staff?.shcc && !canBo.trangThai);
                if (isTrangThaiNull) {
                    const oldCanBoNhan = nhiemVu.canBoNhan;
                    const updateIndex = oldCanBoNhan.findIndex(canBo => canBo.shccCanBoNhan === req.session?.user?.staff?.shcc);
                    await app.model.hcthCanBoNhan.update({ loai: NHIEM_VU, ma: id, canBoNhan: oldCanBoNhan[updateIndex].shccCanBoNhan }, { trangThai: TRANG_THAI_CAN_BO_NHAN.READ });
                    oldCanBoNhan[updateIndex].trangThai = TRANG_THAI_CAN_BO_NHAN.READ;
                    nhiemVu.canBoNhan = oldCanBoNhan.slice(0);
                }
            }

            const history = await app.model.hcthHistory.getAllFrom(nhiemVu.id, NHIEM_VU, req.query.historySortType);
            nhiemVu.history = history?.rows || [];
            if (req.session?.user?.shcc && !(await app.model.hcthSeenStatus.get({ ma: nhiemVu.id, loai: 'NHIEM_VU', shcc: req.session.user.shcc }))) {
                await app.model.hcthSeenStatus.create({ ma: nhiemVu.id, loai: 'NHIEM_VU', shcc: req.session.user.shcc });
            }
            res.send({ error: null, item: nhiemVu });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/nhiem-vu/phan-hoi', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        app.model.hcthPhanHoi.create({ ...req.body.data, loai: NHIEM_VU }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.get('/api/hcth/nhiem-vu/phan-hoi/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {

        const id = parseInt(req.params.id);
        app.model.hcthPhanHoi.getAllFrom(id, NHIEM_VU, (error, items) => {
            res.send({ error, items: items.rows });
        });

    });

    // cán bộ nhận nhiệm vụ API
    const isCanBoNhanExists = (canBoNhan, id) => new Promise((resolve, reject) => {
        app.model.hcthCanBoNhan.get({ statement: 'CAN_BO_NHAN in (:shccs) and LOAI = :loai and ma = :ma', parameter: { shccs: canBoNhan, loai: NHIEM_VU, ma: id } }, (error, item) => {
            if (error) {
                reject(error);
            }
            else if (item) {
                resolve(item);
            }
            else resolve(false);
        });
    });

    app.post('/api/hcth/nhiem-vu/can-bo-nhan', app.permission.orCheck('manager:write', 'rectors:login', 'staff:login'), async (req, res) => {
        const { ma, canBoNhan, nguoiTao, vaiTro } = req.body;
        try {
            const canBo = await isCanBoNhanExists(canBoNhan, ma);
            if (canBo) {
                res.send({ error: `Cán bộ (${canBo.canBoNhan}) đã tồn tại` });
            } else {
                //TODO: check permission
                const canBos = await createCanBoNhan(canBoNhan, req.session.user?.shcc, vaiTro, ma);
                if (ma) {
                    const nhiemVu = await app.model.hcthNhiemVu.get({ id: ma });
                    const note = {
                        quantity: canBoNhan.length,
                        role: vaiTro
                    };
                    await app.model.hcthHistory.create({ loai: NHIEM_VU, key: ma, shcc: nguoiTao, hanhDong: action.ADD_EMPLOYEES, ghiChu: JSON.stringify(note), thoiGian: Date.now() });
                    onCreateCanBoNhanNotification({
                        maNhiemVu: ma,
                        nguoiTaoShcc: nguoiTao,
                        canBoNhan,
                        vaiTro,
                        phanHoi: '',
                        hanhDong: CAN_BO_NHAN_ACTION.ADD,
                        nhiemVu,
                        sendToEmail: true,
                    });
                }
                res.send({ error: null, items: canBos });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/nhiem-vu/can-bo-nhan', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id, nhiemVuId, shccCanBoNhan, shccNguoiTao, vaiTroMoi, hoCanBo, tenCanBo } = req.body;
            //TODO: Long permission check
            const item = await app.model.hcthCanBoNhan.update({ id }, { vaiTro: vaiTroMoi });
            const nhiemVu = await app.model.hcthNhiemVu.get({ id: item.ma });
            const note = {
                name: (hoCanBo + ' ' + tenCanBo).trim().normalizedName(),
                role: vaiTroMoi
            };
            const history = await app.model.hcthHistory.create({ loai: NHIEM_VU, key: nhiemVuId, shcc: shccNguoiTao, hanhDong: action.CHANGE_ROLE, ghiChu: JSON.stringify(note), thoiGian: Date.now() });
            onCreateCanBoNhanNotification({
                maNhiemVu: nhiemVuId,
                nguoiTaoShcc: shccNguoiTao,
                canBoNhan: shccCanBoNhan,
                vaiTro: vaiTroMoi,
                phanHoi: '',
                hanhDong: CAN_BO_NHAN_ACTION.CHANGE_ROLE,
                nhiemVu,
                sendToEmail: true,
            });
            res.send({ item, history });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.delete('/api/hcth/nhiem-vu/can-bo-nhan', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id, nhiemVuId, shccCanBoNhan, shccNguoiTao, hoNguoiXoa, tenNguoiXoa } = req.body;
            const item = await app.model.hcthCanBoNhan.get({ id });
            const nhiemVu = await app.model.hcthNhiemVu.get({ id: item.ma });
            app.model.hcthCanBoNhan.delete({ id });
            const note = {
                name: (hoNguoiXoa + ' ' + tenNguoiXoa).trim().normalizedName()
            };
            const history = await app.model.hcthHistory.create({ loai: NHIEM_VU, key: nhiemVuId, shcc: shccNguoiTao, hanhDong: action.REMOVE_EMPOYEE, ghiChu: JSON.stringify(note), thoiGian: Date.now() });
            onCreateCanBoNhanNotification({
                maNhiemVu: nhiemVuId,
                nguoiTaoShcc: shccNguoiTao,
                canBoNhan: shccCanBoNhan,
                phanHoi: '',
                hanhDong: CAN_BO_NHAN_ACTION.REMOVE,
                nhiemVu,
                sendToEmail: true
            });
            res.send({ item, history });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }

    });


    app.get('/api/hcth/nhiem-vu/can-bo-nhan/list', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { ids, ma } = req.query;
            const { rows: items } = await app.model.hcthCanBoNhan.getAllFrom(ma || null, NHIEM_VU, (ids || []).toString());
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    // liên kết API
    const createListLienKet = (lienKet, loaiLienKet, ma, loai, shcc) => {
        const promises = lienKet.map(key => app.model.hcthLienKet.create({
            keyA: ma, loaiA: loai,
            loaiB: loaiLienKet, keyB: key,
            nguoiTao: shcc
        }));
        return Promise.all(promises);
    };

    app.post('/api/hcth/nhiem-vu/lien-ket', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id, lienKet, loaiLienKet } = req.body;
            await createListLienKet(lienKet, loaiLienKet, id, NHIEM_VU, req.session.user.shcc);
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/nhiem-vu/lien-ket/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        const id = parseInt(req.params.id);
        app.model.hcthLienKet.getAllFrom(id, NHIEM_VU, null, null, (error, result) => {
            res.send({ error: error, items: result?.rows });
        });
    });

    app.delete('/api/hcth/nhiem-vu/lien-ket', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        const { id } = req.body;
        app.model.hcthLienKet.delete({ id }, (error) => {
            res.send({ error });
        });
    });

    app.put('/api/hcth/nhiem-vu/delete-file', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        const
            id = req.body.id,
            fileId = req.body.fileId,
            file = req.body.file,
            nhiemVu = id || null,
            filePath = app.assetPath + '/nhiemVu/' + (id ? id + '/' : 'new/') + file;
        app.model.hcthFile.delete({ id: fileId, ma: nhiemVu, loai: NHIEM_VU }, (error) => {
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

    // history
    app.post('/api/hcth/nhiem-vu/lich-su/list', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        const { id } = req.body;
        app.model.hcthHistory.getAllFrom(id, NHIEM_VU, req.query.historySortType, (error, result) => {
            res.send({ error: error, items: result?.rows });
        });
    });

    app.get('/api/hcth/nhiem-vu/lich-su/:id', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        app.model.hcthHistory.getAllFrom(parseInt(req.params.id), NHIEM_VU, req.query.historySortType, (error, items) => res.send({ error, items: items?.rows || [] }));
    });

    app.get('/api/hcth/nhiem-vu/hoan-thanh/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const nhiemVuItem = await app.model.hcthNhiemVu.get({ id });
            const canBoNhan = await app.model.hcthCanBoNhan.getAllFrom(id, NHIEM_VU);
            const donViNhan = await app.model.hcthDonViNhan.getAll({ ma: id, loai: NHIEM_VU }, '*', 'id');
            if (laNguoiThamGia(req, {
                ...nhiemVuItem, canBoNhan: canBoNhan?.rows || [],
                donViNhan: donViNhan || []
            })) {
                await app.model.hcthHistory.create({ loai: NHIEM_VU, key: id, shcc: req.session.user?.shcc, hanhDong: action.COMPLETE, thoiGian: Date.now() });
                const updateCanBoNhan = await app.model.hcthCanBoNhan.get({ loai: NHIEM_VU, canBoNhan: req.session?.user?.staff?.shcc, ma: id });
                if (updateCanBoNhan) {
                    await app.model.hcthCanBoNhan.update({ id: updateCanBoNhan.id }, { trangThai: TRANG_THAI_CAN_BO_NHAN.COMPLETED });
                }
                res.send({ error: null });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/nhiem-vu/dong/:id', app.permission.orCheck('staff:login', 'developer:login'), (req, res) => {
        try {
            const id = req.params.id;
            const { canBoNhan, nguoiTao } = req.body;
            app.model.hcthNhiemVu.update({ id }, { trangThai: trangThaiNhiemVu.DONG.id }, async (error, item) => {
                if (error) {
                    res.send({ error });
                } else {
                    const _newHistory = {
                        loai: NHIEM_VU,
                        key: id,
                        shcc: req.session.user?.shcc,
                        hanhDong: action.CLOSE,
                        thoiGian: Date.now()
                    };
                    await app.model.hcthHistory.create(_newHistory).then(() => {
                        let listCanBoNhanShcc = [];
                        if (nguoiTao !== req.session.user?.shcc) listCanBoNhanShcc.push(nguoiTao);
                        if (canBoNhan.length > 0) listCanBoNhanShcc = listCanBoNhanShcc.concat([...canBoNhan.map(cb => cb.shccCanBoNhan)]);
                        if (listCanBoNhanShcc.length > 0) {
                            onCreateOpenAndCloseTaskNotification({
                                maNhiemVu: id,
                                nguoiTaoShcc: req.session.user?.shcc,
                                canBoNhan: listCanBoNhanShcc,
                                hanhDong: action.CLOSE
                            });
                        }
                        res.send({ error: null, item });
                    })
                        .catch(error => res.send({ error }));
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/nhiem-vu/mo-lai/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const { canBoNhan, nguoiTao } = req.body;
            app.model.hcthNhiemVu.update({ id }, { trangThai: trangThaiNhiemVu.MO.id }, async (error, item) => {
                if (error) {
                    res.send({ error });
                } else {
                    const _newHistory = {
                        loai: NHIEM_VU,
                        key: id,
                        shcc: req.session.user?.shcc,
                        hanhDong: action.REOPEN,
                        thoiGian: Date.now()
                    };
                    await app.model.hcthHistory.create(_newHistory).then(() => {
                        let listCanBoNhanShcc = [];
                        if (nguoiTao !== req.session.user?.shcc) listCanBoNhanShcc.push(nguoiTao);
                        if (canBoNhan.length > 0) listCanBoNhanShcc = listCanBoNhanShcc.concat([...canBoNhan.map(cb => cb.shccCanBoNhan)]);
                        if (listCanBoNhanShcc.length > 0) {
                            onCreateOpenAndCloseTaskNotification({
                                maNhiemVu: id,
                                nguoiTaoShcc: req.session.user?.shcc,
                                canBoNhan: listCanBoNhanShcc,
                                hanhDong: action.REOPEN
                            });
                        }
                        res.send({ error: null, item });
                    })
                        .catch(error => res.send({ error }));
                }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/nhiem-vu/reset-trang-thai/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { content, shccCanBoNhan, hoCanBoNhan, tenCanBoNhan } = req.body;
            const nhiemVuId = req.params.id;
            const shccNguoiTao = req.session?.user?.staff?.shcc;
            const nhiemVu = await app.model.hcthNhiemVu.get({ id: nhiemVuId });
            await app.model.hcthCanBoNhan.update({ ma: nhiemVuId, loai: NHIEM_VU, canBoNhan: shccCanBoNhan }, { trangThai: TRANG_THAI_CAN_BO_NHAN.READ });
            await app.model.hcthHistory.create({
                loai: NHIEM_VU,
                key: nhiemVuId,
                shcc: shccNguoiTao,
                ghiChu: JSON.stringify({
                    name: (hoCanBoNhan + ' ' + tenCanBoNhan).normalizedName(),
                    status: TRANG_THAI_CAN_BO_NHAN.READ
                }),
                hanhDong: action.RESET,
                thoiGian: Date.now()
            });

            onCreateCanBoNhanNotification({
                maNhiemVu: nhiemVuId,
                nguoiTaoShcc: req.session?.user?.staff?.shcc,
                canBoNhan: [shccCanBoNhan],
                phanHoi: content,
                hanhDong: CAN_BO_NHAN_ACTION.RESET_STATUS,
                nhiemVu,
                sendToEmail: true
            });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/nhiem-vu/add', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            //TODO: permission check on lien ket and nhiem vu
            const id = parseInt(req.body.id),
                { vanBan, loaiVanBan, ghiChu, canBoXuLy } = req.body.changes;
            const checkVanBan = await app.model.hcthLienKet.get({ loaiA: NHIEM_VU_TYPE, keyA: id, loaiB: loaiVanBan, keyB: vanBan });
            if (checkVanBan) {
                throw { message: 'Văn bản đã được thêm vào nhiệm vụ này!' };
            } else {
                await app.model.hcthLienKet.create({ loaiA: 'NHIEM_VU', keyA: id, loaiB: loaiVanBan, keyB: vanBan, ghiChu, nguoiTao: req.session.user.shcc, canBoXuLy });
                if (id) {
                    const nhiemVu = await app.model.hcthNhiemVu.get({ id });
                    const canBoNhan = await app.model.hcthCanBoNhan.getAll({ loai: 'NHIEM_VU', ma: id });
                    onCreateCanBoNhanNotification({
                        maNhiemVu: id, nguoiTaoShcc: req.session.user.shcc, canBoNhan: canBoNhan.map(i => i.canBoNhan), hanhDong: CAN_BO_NHAN_ACTION.ADD_LIEN_KET, nhiemVu, sendToEmail: true
                    });
                }
            }
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    const getInstance = async (id) => {
        const nhiemVu = await app.model.hcthNhiemVu.get({ id });
        if (!nhiemVu) throw 'Nhỉệm vụ không tồn tại';
        return nhiemVu;
    };

    const getBaoCao = async (id, shcc) => {
        let baoCao;
        if (shcc)
            baoCao = await app.model.hcthBaoCaoNhiemVu.get({ id, shcc });
        else
            baoCao = await app.model.hcthBaoCaoNhiemVu.get({ id });
        if (!baoCao) throw 'Báo cáo không tồn tại';
        return baoCao;
    };

    const getShcc = req => {
        return req.session.user.shcc;
    };


    app.post('/api/hcth/nhiem-vu/bao-cao', app.permission.check('staff:login'), async (req, res) => {
        try {
            // const id = req.body.id;
            const { nhiemVuId, noiDungBaoCao, attachment, file } = req.body;
            const shcc = getShcc(req);
            const nhiemVu = await getInstance(nhiemVuId);
            if (await app.model.hcthCanBoNhan.get({ loai: NHIEM_VU, ma: nhiemVu.id, canBoNhan: shcc })) {
                const baoCao = await app.model.hcthBaoCaoNhiemVu.create({ nhiemVuId, noiDungBaoCao, shcc, createdAt: Date.now(), acceptance: 't', isMain: 1, attachment });
                if (file) {
                    app.fs.createFolder(app.path.join(app.assetPath, 'baoCaoNhiemVu', `${baoCao.id}`));
                    app.fs.renameSync(
                        app.path.join(app.assetPath, 'baoCaoNhiemVu', 'new', file),
                        app.path.join(app.assetPath, 'baoCaoNhiemVu', `${baoCao.id}`, file)
                    );
                }
                res.send({ baoCao });
            } else
                throw 'Bạn không thể thêm báo cáo cho nhiệm vụ này';
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/nhiem-vu/bao-cao/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            // const id = req.body.id;
            const { id: nhiemVuId } = req.params;
            const nhiemVu = await getInstance(nhiemVuId);
            const { rows: baoCao } = await app.model.hcthBaoCaoNhiemVu.getList(nhiemVu.id);
            res.send({ baoCao });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/nhiem-vu/bao-cao/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            // const id = req.body.id;
            const { id } = req.params;
            const data = req.body;
            delete data.id;
            delete data.shcc;
            delete data.nhiemVuId;
            delete data.attachment;
            const shcc = getShcc(req);
            const baoCao = await getBaoCao(id, shcc);
            if (baoCao.acceptance == 't') {
                app.model.hcthBaoCaoNhiemVu.update({ id: baoCao.id }, { ...data, createdAt: Date.now() });
            }
            res.send({ baoCao });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/nhiem-vu/bao-cao/acceptance/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { id } = req.params;
            const shcc = getShcc(req);
            const baoCao = await getBaoCao(id);
            const nextAcceptance = req.body.acceptance;
            const nhiemVu = await getInstance(baoCao.nhiemVuId);
            if (nhiemVu.nguoiTao == shcc && baoCao.acceptance == 'c' && ['d', 'a'].includes(nextAcceptance)) {
                await app.model.hcthBaoCaoNhiemVu.update({ id: baoCao.id }, { acceptance: nextAcceptance, createdAt: Date.now() });
                const reciver = await app.model.tchcCanBo.get({ shcc: baoCao.shcc });
                await createNotification([reciver.email], {
                    title: 'Nhiệm vụ',
                    icon: 'fa-tasks',
                    iconColor: nextAcceptance == 'a' ? 'green' : 'red',
                    subTitle: `${((req.session.user.lastName || ' ') + ' ' + (req.session.user.firstName || ' ')).trim().normalizedName()} đã ${nextAcceptance == 'a' ? 'chấp nhận' : 'từ chối'} báo cáo cho nhiệm vụ #${nhiemVu.id}: ${nhiemVu.tieuDe} của bạn`,
                    link: `/user/nhiem-vu/${nhiemVu.id}`, notificationCategory: 'NHIEM_VU:' + nhiemVu.id
                });
            } else if (shcc == baoCao.shcc && baoCao.acceptance == 't' && nextAcceptance == 'c') {
                await app.model.hcthBaoCaoNhiemVu.update({ id: baoCao.id }, { acceptance: nextAcceptance, createdAt: Date.now() });
                const reciver = await app.model.tchcCanBo.get({ shcc: nhiemVu.nguoiTao });
                await createNotification([reciver.email], {
                    title: 'Nhiệm vụ', icon: 'fa-tasks', iconColor: 'green', subTitle: `${((req.session.user.lastName || ' ') + ' ' + (req.session.user.firstName || ' ')).trim().normalizedName()} đã thêm 1 báo cáo cho nhiệm vụ #${nhiemVu.id}: ${nhiemVu.tieuDe} `, link: `/user/nhiem-vu/${nhiemVu.id}`, notificationCategory: 'NHIEM_VU:' + nhiemVu.id
                });
            } else
                throw 'Invalid parameter';
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.uploadHooks.add('hcthBaoCaoNhiemVu', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthBaoCaoNhiemVuFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthBaoCaoNhiemVuFile = async (req, fields, files, params, done) => {
        try {
            const type = fields.userData?.length && fields.userData[0],
                data = fields.data && fields.data[0] && app.utils.parse(fields.data[0]);
            if (type == 'hcthBaoCaoNhiemVuFile' && files.hcthBaoCaoNhiemVuFile?.length) {
                if (!data.id) {
                    const dir = app.path.join(app.assetPath, 'baoCaoNhiemVu', 'new');
                    try {
                        app.fs.createFolder(dir);
                    } catch {
                        //skip
                    }
                    const file = files.hcthBaoCaoNhiemVuFile[0];
                    const fileName = file.path.replace(/^.*[\\\/]/, '');
                    app.fs.renameSync(file.path, app.path.join(dir, fileName));
                    done({ attachment: fileName, originalFilename: file.originalFilename });
                } else {
                    const baoCao = await getBaoCao(data.id, req.session.user.shcc);
                    const dir = app.path.join(app.assetPath, 'baoCaoNhiemVu', `${data.id}`);
                    try {
                        app.fs.createFolder(dir);
                    } catch {
                        //skip
                    }
                    const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
                    serverFileNames.forEach(path => app.fs.rmSync(path, { force: true, maxRetries: 3 }));
                    const file = files.hcthBaoCaoNhiemVuFile[0];
                    const fileName = file.path.replace(/^.*[\\\/]/, '');
                    app.fs.renameSync(file.path, app.path.join(dir, fileName));
                    await app.model.hcthBaoCaoNhiemVu.update({ id: baoCao.id }, { attachment: file.originalFilename });
                    done({ attachment: fileName, originalFilename: file.originalFilename });
                }
            }
        } catch (error) {
            console.error(error);
            done({ error });
        }
    };

    app.get('/api/hcth/nhiem-vu/bao-cao/download/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const baoCao = await getBaoCao(req.params.id);
            if (!baoCao.attachment) throw 'Tệp tin không tồn tại';
            if (!await checkNhiemVuPermission(req, null, baoCao.nhiemVuId)) {
                return res.status(401).send({ error: 'permission denied' });
            }
            const dir = app.path.join(app.assetPath, 'baoCaoNhiemVu', baoCao.id.toString());
            const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
            const file = serverFileNames[0];
            if (!file)
                throw 'Tệp tin không tồn tại';
            res.writeHead(200, [['Content-Disposition', 'attachment;filename=' + `${app.toEngWord(baoCao.attachment)}`]]);
            return res.end(app.fs.readFileSync(app.path.join(dir, file)));
        } catch (error) {
            console.error(error);
            res.status(400).send({ error });
        }
    });

    app.get('/api/hcth/nhiem-vu/notification/read/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            await app.model.fwNotification.update({ email: req.session.user.email, notificationCategory: 'NHIEM_VU:' + req.params.id }, { read: 1 });
            res.send({});
        } catch (error) {
            console.error('GET: /api/hcth/nhiem-vu/notification/read/', error);
            res.send({ error });
        }
    });
};


