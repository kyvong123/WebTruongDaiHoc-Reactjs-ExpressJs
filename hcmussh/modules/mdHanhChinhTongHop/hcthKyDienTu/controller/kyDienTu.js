module.exports = app => {

    const moment = require('moment');
    const waiting = 'waiting', finished = 'finished';

    app.permission.add('hcthVanBanDiSigning:verification');

    const getShcc = (req) => req.session.user?.shcc;
    const getCurrentPermissions = (req) => (req.session && req.session.user && req.session.user.permissions) || [];

    const createNotification = async (emails, notification = { toEmail: '', title: '', subTitle: '', icon: 'fa-pencil-square-o', iconColor: '#1488db', link: '', buttons: [], sendEmail: null, sendSocket: true, notificationCategory: '' }) => {
        return (emails.map(async email => {
            await app.notification.send({
                toEmail: email,
                ...notification
            });
        }));
    };

    app.fs.createFolder(app.path.join(app.assetPath, 'pdf'));
    const cacheDir = app.path.join(app.assetPath, 'pdf/cache');
    app.fs.createFolder(cacheDir);
    const jimp = require('jimp');

    app.get('/api/hcth/ky-dien-tu/van-ban-di', app.permission.orCheck('hcthSignature:write', 'developer:login'), async (req, res) => {
        try {
            //TODO: check quyền user đối với văn bản
            // eslint-disable-next-line no-unused-vars
            let { name, location = 'Đại học Khoa học Xã hội và Nhân văn', reason, format, sessionId, vanBanDiFileId } = req.query, signatureCount = 0;
            const permissions = getCurrentPermissions(req);
            //get file imformation
            const shcc = getShcc(req);
            if (!Number(sessionId) || !Number(vanBanDiFileId)) throw 'Invalid parameter';
            const session = await app.model.hcthSession.get({ id: sessionId, shcc, trangThai: 'waiting' });
            const sessionItem = await app.model.hcthSessionItem.get({ sessionId, trangThai: 'waiting', vanBanDiFileId });
            if (!session || !sessionItem) {
                throw 'Session không tồn tại';
            }


            const vanBanDiFile = await app.model.hcthVanBanDiFile.get({ id: vanBanDiFileId });
            const vanBan = await app.model.hcthCongVanDi.getInstance(vanBanDiFile.vanBanDi);

            const file = await app.model.hcthFile.get({ id: vanBanDiFile.fileId });

            if (!file) throw 'Không tìm được file';
            let originalPath = app.path.join(app.assetPath, `/congVanDi/${vanBanDiFile.vanBanDi}/${file.tenFile}`);
            let input = app.path.join(app.assetPath, `/congVanDi/${vanBanDiFile.vanBanDi}/${file.tenFile.replace(/[.][A-Za-z0-9]*$/, '.pdf')}`);
            if (!app.fs.existsSync(input)) {
                let buffer = app.fs.readFileSync(originalPath);
                buffer = await app.docx.toPdfBuffer(buffer);
                app.fs.writeFileSync(input, buffer);
            }
            // const extension = app.path.extname(file.tenFile);
            const signTypeItem = await app.model.hcthSignType.get({ ma: vanBan.status.signType });

            //TODO: count current signature
            //TODO: convert file to pdf
            const { rows: configs } = await app.model.hcthSigningConfig.getList(vanBanDiFile.id);

            const usedConfig = configs.find(item => item.signType == vanBan.status.signType && !item.signAt && (item.shcc == shcc || (item.permission && permissions.includes(item.permission))));
            // if (extension != '.pdf') throw 'invalid file type';

            // prepare session folder for signing -> this would be deleted -> TODO: schedule delete these folder
            const sessionFolder = app.path.join(cacheDir, new Date().getTime().toString());
            app.fs.createFolder(sessionFolder);
            let output = app.path.join(sessionFolder, file.tenFile);

            // prepare soVanBanForm

            //resize image to session folder
            let imagePath, image;
            if (!usedConfig.isText) {
                imagePath = app.path.join(app.assetPath, `/key/${req.session.user.shcc}.png`);
                image = await jimp.read(imagePath);
                image.resize(signTypeItem.width * 4, signTypeItem.height * 4).write(app.path.join(sessionFolder, req.session.user.shcc + '.png'));
            } else {
                let template = usedConfig.signatureTemplate;
                template = template.replace('{thoi_gian}', moment(new Date()).format('[ngày] DD, [tháng] MM, [năm] YYYY; HH:mm:SS'));
                const { status, stderr } = await app.pdf.signWithText({
                    input, output, name: name || usedConfig.signType, location, reason: reason || usedConfig.tenSignType,
                    x: 0, y: 0, page: usedConfig.pageNumber || 1,
                    signatureLevel: 2,
                    alignRight: 1,
                    keystorePath: app.path.join(app.assetPath, '/pdf/p12placeholder/certificate.p12'),
                    soVanBan: template,
                    // width: Math.max(...template.split('\n').map(item => item.length)) * usedConfig.fontSize,
                    width: 420,
                    fontSize: usedConfig.fontSize,
                    ttfPath: app.path.join(app.assetPath, 'pdf', 'fonts', 'times.ttf')
                }); // status, stdout, stderr
                if (status != 0) {
                    console.error('text signature', stderr);
                    throw 'lỗi hệ thống';
                }
                input = output;
                output = app.path.join(sessionFolder, file.tenFile);
                signatureCount++;
            }

            if (usedConfig.signType == 'DONG_DAU') {
                const config = configs.find(item => item.signType == 'SO_VAN_BAN' && !item.signAt);
                const soVanBan = await app.model.hcthSoDangKy.get({ ma: vanBan.id });
                if (!soVanBan) throw 'Văn bản chưa được cấp số';
                const { status, stderr } = await app.pdf.signWithText({
                    input, output, name, location, reason: 'Số văn bản',
                    x: config.xCoordinate, y: config.yCoordinate - config.fontSize - 10, page: config.pageNumber,
                    signatureLevel: 2,
                    keystorePath: app.path.join(app.assetPath, '/pdf/p12placeholder/certificate.p12'),
                    soVanBan: soVanBan.soCongVan,
                    width: Math.max(...soVanBan.soCongVan.split('\n').map(item => item.length)) * config.fontSize,
                    fontSize: config.fontSize,
                    ttfPath: app.path.join(app.assetPath, 'pdf', 'fonts', 'times.ttf')
                }); // status, stdout, stderr
                if (status != 0) {
                    console.error('Số văn bản', stderr);
                    throw 'lỗi hệ thống';
                }

                input = output;
                output = app.path.join(sessionFolder, '_' + file.tenFile);
                signatureCount++;
            }

            if (usedConfig.isImage) {
                const { status, stderr } = await app.pdf.signVisualPlaceholder({
                    input, output, name, location, reason, scale: '-75',
                    x: `${Math.round(usedConfig.xCoordinate - signTypeItem.width / 2)}`, y: `${Math.round(usedConfig.yCoordinate - signTypeItem.height / 2)}`,
                    // x: usedConfig.xCoordinate, y: usedConfig.yCoordinate, 
                    page: usedConfig.pageNumber,
                    signatureLevel: 2,
                    keystorePath: app.path.join(app.assetPath, '/pdf/p12placeholder/certificate.p12'),
                    imgPath: app.path.join(sessionFolder, `${req.session.user.shcc}.png`),
                });
                if (status != 0) {
                    console.error('Ký văn bản', stderr);
                    throw 'lỗi hệ thống';
                }
                signatureCount++;
            }

            const outputBuffer = app.fs.readFileSync(output, 'base64');

            //TODO: validate number of signature

            //TODO: replace placeholder content with array of 0 (optional) -> make placeholder signature become invalid
            if (format) {
                return res.send({ data: outputBuffer, signatureCount });
            } else {
                res.writeHead(200, [['Content-Type', 'application/pdf'], ['Content-Disposition', 'attachment;filename=' + `${file.ten}`]]);
                res.end(Buffer.from(outputBuffer, 'base64'));
            }
        } catch (error) {
            console.error(error);
            res.status(400).send({ error });
        }
    });

    app.post('/api/hcth/ky-dien-tu/van-ban-di/session', app.permission.orCheck('staff:login'), async (req, res) => {
        try {
            let { vanBanDiList, macAddress, otp, locationString } = req.body.data;
            const permissions = getCurrentPermissions(req);
            const shcc = getShcc(req);
            if (!vanBanDiList?.length) {
                throw 'Invalid parameter';
            }
            vanBanDiList = vanBanDiList.map(id => Number(id)).filter(id => id);
            const idSet = new Set(vanBanDiList);
            if (idSet.size != vanBanDiList.length) {
                throw 'Danh sách văn bản đi không hợp lệ';
            } else if (idSet.size > 20) {
                throw 'Số lượng văn bản ký vượt quá giới hạn';
            }

            const instanceList = await Promise.all(vanBanDiList.map(async id => {
                const instance = await app.model.hcthCongVanDi.getInstance(id);
                const fileList = await app.model.hcthVanBanDiFile.getAll({ vanBanDi: id });
                let processedFile = await Promise.all(fileList.map(async file => {
                    const { rows: configs } = await app.model.hcthSigningConfig.getList(file.id);
                    const config = configs.find(config => instance.status.signType == config.signType && !config.signAt && (config.shcc == shcc || (config.permission && permissions.includes(config.permission))));
                    if (config) {
                        file.config = config;
                        return file;
                    }
                }));
                instance.files = processedFile.filter(file => file);
                return instance;
            }));
            const invalidVanBan = instanceList.find(instance => !instance.files || !instance.files.length);
            if (invalidVanBan) {
                throw 'Văn bản #' + invalidVanBan.id + ' không hợp lệ để ký';
            }
            const session = await app.model.hcthSession.create({ shcc, thoiGian: Date.now(), trangThai: 'waiting', macAddress, otp, locationString });
            const sessionItemData = instanceList.reduce((prev, cur) => { return [...prev, ...cur.files]; }, []);
            await Promise.all(sessionItemData.map(async file => await app.model.hcthSessionItem.create({ sessionId: session.id, vanBanDiFileId: file.id, trangThai: 'waiting', signType: file.config.signType })));
            const { rows: items } = await app.model.hcthSession.getItems(session.id);
            res.send({ session: { ...session, items } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/ky-dien-tu/van-ban-di/session/item', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { sessionId, vanBanDiFileId } = req.query;
            if (!Number(sessionId) || !Number(vanBanDiFileId)) {
                throw 'Invalid parameter';
            }
            const session = await app.model.hcthSession.get({ id: sessionId });
            if (session.shcc != getShcc(req)) throw 'Không thể truy cập session';
            const { rows: items } = await app.model.hcthSession.getItems(session.id);
            const item = items.find(item => item.vanBanDiFileId == vanBanDiFileId);
            if (!item) {
                res.send({});
            }
            else {
                await initItem(item);
                res.send({ item });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const initItem = async (item) => {
        item.vanBanDiFile = await app.model.hcthVanBanDiFile.get({ id: item.vanBanDiFileId });
        item.file = await app.model.hcthFile.get({ id: item.vanBanDiFile.fileId });
        item.vanBanDi = await app.model.hcthCongVanDi.getInstance(item.vanBanDiFile.vanBanDi);
        item.configs = await app.model.hcthSigningConfig.getAll({ vbdfId: item.vanBanDiFile.id });

    };

    app.get('/api/hcth/ky-dien-tu/van-ban-di/session/next-item', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { sessionId } = req.query;
            if (!Number(sessionId)) {
                throw 'Invalid parameter';
            }
            const session = await app.model.hcthSession.get({ id: sessionId });
            if (!session || session.shcc != getShcc(req)) throw 'Session không khả dụng';
            const { rows: items } = await app.model.hcthSession.getItems(session.id);
            const item = items.find(item => item.trangThai == waiting);
            if (!item) {
                res.send({});
            }
            else {
                await initItem(item);
                res.send({ item });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/ky-dien-tu/van-ban-di/ky-xac-thuc', app.permission.check('hcthVanBanDiSigning:verification'), async (req, res) => {
        try {
            const files = req.body.fileList;
            const signType = req.body.signType;
            const shcc = getShcc(req);
            let fileItems = await app.model.hcthVanBanDiFile.getAll({
                statement: 'id in (:files)', parameter: { files }
            });
            for (let item of fileItems) {
                const config = await app.model.hcthSigningConfig.get({ vbdfId: item.id, signType });
                if (config && config.signAt) {
                    continue;
                } else if (config) {
                    item.config = config;
                } else {
                    item.config = await app.model.hcthSigningConfig.create({ vbdfId: item.id, signType, shcc, pageNumber: 1, xCoordinate: 100, yCoordinate: 0, fontSize: 14, fontName: 'TIMES_NEW_ROMAN' });
                }
            }
            fileItems = fileItems.filter(item => item.config);
            const session = await app.model.hcthSession.create({ shcc, thoiGian: Date.now(), trangThai: 'waiting' });
            session.items = await Promise.all(fileItems.map(async file => await app.model.hcthSessionItem.create({ sessionId: session.id, vanBanDiFileId: file.id, trangThai: 'waiting', signType: file.config.signType })));
            createNotification([req.session.user.email], { title: 'Sesison ký mới', subTitle: 'Bạn đã tạo session ký mới, vui lòng truy cập thiết bị di động và tới mục thông báo để ký văn bản', icon: 'fa-pencil-square-o', iconColor: '#1488db', link: '', sendSocket: true, notificationCategory: 'SIGN_SESSION_KY_XAC_THUC:' + session.id });
            res.send({ session });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    const performEndSession = async (session, requireSendMail = false) => {
        const thoiGian = Date.now();

        try {
            await app.model.hcthSessionItem.update({
                statement: 'sessionId = :id and trangThai != :maTrangThai',
                parameter: {
                    maTrangThai: finished,
                    id: session.id
                }
            }, { trangThai: 'error', capNhat: thoiGian });
        } catch (error) {
            //skip
        }
        let { rows: items } = await app.model.hcthSession.getItems(session.id);
        if (items.some(item => item.trangThai == finished) || requireSendMail) {
            let { guiSignEmailEditorHtml: mailTemplate, guiSignEmailTitle: title, email, emailPassword } = await app.model.hcthSetting.getValue('guiSignEmailEditorHtml', 'guiSignEmailTitle', 'email', 'emailPassword');
            const pattern = new RegExp('<tbody>.*?</tbody>', 'gs');

            mailTemplate = mailTemplate.replace(pattern, `
<tbody>
${items.map((item, index) => `
<tr>
    <td style="text-align:center">${index + 1}</td>
    <td><a download href="${(app.isDebug ? app.debugUrl : app.rootUrl) + '/api/hcth/van-ban-di/file/' + item.fileId}">${item.ten}</a></td>
    <td style="text-align:center"><a href="${(app.isDebug ? app.debugUrl : app.rootUrl) + '/user/van-ban-di/' + item.vanBanDiId}">${(item.tenLoaiVanBan || 'Văn bản #') + item.vanBanDiId}</a></td>
    <td style="text-align:center">${item.trangThai == finished ? 'Thành công' : 'Thất bại'}</td>
    <td style="text-align:center">${moment(new Date(item.capNhat)).format('HH:mm, [ngày] DD/MM/YYY')}</td>
</tr>
`).join('')}
</tbody>`
            );
            mailTemplate = mailTemplate.replace('{startedAt}', moment(new Date(session.thoiGian)).format('HH:mm, [ngày] DD/MM/YYYY'));
            mailTemplate = mailTemplate.replace('{endedAt}', moment(new Date(thoiGian)).format('HH:mm, [ngày] DD/MM/YYYY'));
            mailTemplate = mailTemplate.replace('{location}', session.locationString || '- Không xác định vị trí ký');
            const canBo = await app.model.tchcCanBo.get({ shcc: session.shcc });
            if (!app.isDebug) {
                app.service.emailService.send(email, emailPassword, canBo.emailTruong, null, null, title, '', mailTemplate, null);
            } else {
                app.service.emailService.send(email, emailPassword, 'nqlong0709@gmail.com', null, null, (app.isDebug ? 'TEST: ' : '') + title, '', mailTemplate, null);
            }
        }
        await app.model.hcthSession.update({ id: session.id }, { trangThai: finished, capNhat: thoiGian });
        console.info('End Session #' + session.id);
    };

    const endSessions = async () => {
        try {
            const currentTime = Date.now() - 3600 * 3 * 1000;
            const sessionList = await app.model.hcthSession.getAll({
                statement: 'thoiGian < :currentTime and trangThai = :trangThaiSession',
                parameter: {
                    currentTime, trangThaiSession: waiting
                }
            });
            await Promise.all(sessionList.map(item => performEndSession(item, false)));
        } catch (error) {
            console.error(error);
        }
    };

    app.put('/api/hcth/ky-dien-tu/van-ban-di/session/end', app.permission.check('staff:login'), async (req, res) => {
        try {
            const session = await app.model.hcthSession.get({ id: req.body.id, shcc: getShcc(req), trangThai: waiting });
            if (!session) throw 'Session không tồn tại';
            await performEndSession(session, true);
            res.send({});
        } catch (error) {
            console.error({ error });
            res.send(error);
        }
    });

    app.uploadHooks.add('hcthKyDienTu', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthKyDienTu(req, fields, files, params, done), done, 'staff:login'));

    const hcthKyDienTu = async (req, fields, files, params, done) => {
        try {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'hcthKyDienTu' && files.file && files.file.length > 0) {
                const
                    file = files.file[0],
                    path = file.path,
                    originalFilename = file.originalFilename,
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(path),
                    data = fields.data && fields.data[0] && app.utils.parse(fields.data[0]);
                if (extName != '.pdf') throw 'Định dạng file không hợp lệ';
                if (!data) throw 'Dữ liệu văn bản không hợp lệ';
                const { sessionId, vanBanDiFileId } = data;
                const session = await app.model.hcthSession.get({ id: sessionId, shcc: getShcc(req), trangThai: waiting });
                if (!session) throw 'Session không tồn tại';
                const sessionItem = await app.model.hcthSessionItem.get({ sessionId, vanBanDiFileId, trangThai: waiting });
                if (!sessionItem) 'Session item không tồn tại';
                const vanBanDiFile = await app.model.hcthVanBanDiFile.get({ id: vanBanDiFileId });

                const originalFile = await app.model.hcthFile.get({ id: vanBanDiFile.fileId });
                const originalFileBuffer = app.fs.readFileSync(app.path.join(app.assetPath, 'congVanDi', vanBanDiFile.vanBanDi.toString(), originalFile.tenFile));
                const fileBuffer = app.fs.readFileSync(path);
                const originalFileBufferHash = app.crypto.createHash('sha256').update(originalFileBuffer.toString('utf-8'), 'utf-8').digest('binary');
                const fileBufferHash = app.crypto.createHash('sha256').update(fileBuffer.slice(0, originalFileBuffer.length).toString('utf-8'), 'utf-8').digest('binary');
                if (!originalFileBufferHash == fileBufferHash)
                    throw 'File cập nhật đã chỉnh sửa dữ liệu gốc';
                const signAt = new Date().getTime();
                app.fs.renameSync(path, app.path.join(app.assetPath, `congVanDi/${vanBanDiFile.vanBanDi}`, fileName));
                const newfile = await app.model.hcthFile.create({ ten: originalFilename, tenFile: fileName, loai: 'FILE_VBD', ma: vanBanDiFile.id, kichThuoc: file.size, nguoiTao: getShcc(req), thoiGian: signAt });
                await app.model.hcthVanBanDiFile.update({ id: vanBanDiFile.id }, { fileId: newfile.id });
                await app.model.hcthSigningConfig.update({ vbdfId: vanBanDiFile.id, signType: sessionItem.signType }, { signAt });
                await app.model.hcthSessionItem.update({ sessionId, vanBanDiFileId }, { trangThai: finished, capNhat: signAt });
                await checkVanBan(req, vanBanDiFile.vanBanDi);
                done({});
            }
        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };

    const checkVanBan = async (req, id) => {
        const instance = await app.model.hcthCongVanDi.getInstance(id);
        const files = await app.model.hcthVanBanDiFile.getAll({ vanBanDi: id });
        const config = await app.model.hcthSigningConfig.get({
            statement: 'signType = :maSignType and signAt is NULL and vbdfId in (:ids)',
            parameter: {
                maSignType: instance.status.signTypeObject.ma,
                ids: files.map(item => item.id)
            }
        });

        if (config || !instance.status.skipWhenSigned)
            return;
        await app.hcthVanBanDi.toNextStatus(req, { id, forward: 1 });
    };


    app.put('/api/hcth/ky-dien-tu/van-ban-di/config', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { sessionId, vanBanDiFileId, xCoordinate, yCoordinate, pageNumber } = req.body;
            const shcc = getShcc(req);
            let session, sessionItem;
            session = await app.model.hcthSession.get({ id: sessionId, shcc: shcc, trangThai: waiting });
            if (!session || !(sessionItem = await app.model.hcthSessionItem.get({ sessionId, vanBanDiFileId, trangThai: waiting }))) {
                throw 'Session không tồn tại';
            }
            let config = await app.model.hcthSigningConfig.get({ vbdfId: vanBanDiFileId, signType: sessionItem.signType, signAt: null });
            if (!config) throw 'Thông tin chữ ký không tồn tại';
            config = await app.model.hcthSigningConfig.update({ id: config.id }, { xCoordinate, yCoordinate, pageNumber });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/ky-dien-tu/font', app.permission.check('user:login'), async (req, res) => {
        try {
            const file = app.fs.readFileSync(app.path.join(app.assetPath, 'pdf', 'fonts', 'times.ttf'), 'base64');
            res.send({ data: file });
        } catch (error) {
            console.error(error);
            res.status(400).send({ error });
        }
    });

    (app.isDebug || app.appName == 'mdHanhChinhTongHopService') && app.readyHooks.add('HcthKyDienTu:endSession', {
        ready: () => app.database && app.assetPath,
        run: () => app.primaryWorker && app.schedule('0 8-20/2 * * *', () => endSessions()),
    });

    // default
    // Phân quyền ký nháy thể thức trong đơn vị
    const kyTheThuc = 'hcthKyTheThuc', kyTheThucPermission = 'hcthKyTheThuc:write';

    app.assignRoleHooks.addRoles(kyTheThuc, { id: kyTheThucPermission, text: 'Hành chính tổng hợp: Ký nháy thể thức' });

    app.assignRoleHooks.addHook(kyTheThuc, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === kyTheThuc && userPermissions.includes('hcth:manage')) {
            const assignRolesList = app.assignRoleHooks.get(kyTheThuc).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleHcthKyTheThuc', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == kyTheThuc);
        inScopeRoles.forEach(role => {
            if (role.tenRole === kyTheThucPermission) {
                app.permissionHooks.pushUserPermission(user, kyTheThucPermission, 'hcthSignature:write');
            }
        });
        resolve();
    }));
    // 
    // Phân quyền ký nháy thể thức trong đơn vị
    const kyXacThuc = 'hcthKyTheThuc', kyXacThucPermission = 'hcthVanBanDiSigning:verification';

    app.assignRoleHooks.addRoles(kyXacThuc, { id: kyXacThucPermission, text: 'Hành chính tổng hợp: Ký xác thực' });

    app.assignRoleHooks.addHook(kyXacThuc, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === kyXacThuc && userPermissions.includes('hcth:manage')) {
            const assignRolesList = app.assignRoleHooks.get(kyXacThuc).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleHcthKyTheThuc', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == kyXacThuc);
        inScopeRoles.forEach(role => {
            if (role.tenRole === kyXacThucPermission) {
                app.permissionHooks.pushUserPermission(user, kyXacThucPermission, 'hcthSignature:write');
            }
        });
        resolve();
    }));

    // Phân quyền ký nháy nội dung trong đơn vị
    const kyNoiDung = 'staffKyNoiDung', kyNoiDungPermission = 'staffKyNoiDung:write';

    app.assignRoleHooks.addRoles(kyNoiDung, { id: kyNoiDungPermission, text: 'Ký nháy nội dung văn bản' });

    app.assignRoleHooks.addHook(kyNoiDung, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === kyNoiDung && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(kyNoiDung).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleStaffKyNoiDung', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == kyNoiDung);
        inScopeRoles.forEach(role => {
            if (role.tenRole === kyNoiDungPermission) {
                app.permissionHooks.pushUserPermission(user, kyNoiDungPermission, 'hcthSignature:write');
            }
        });
        resolve();
    }));


    app.get('/api/hcth/ky-dien-tu/van-ban-di/session/:id', app.permission.check('hcthSignature:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const session = await app.model.hcthSession.get({ id });
            if (!session || session.shcc != getShcc(req)) throw 'Session không khả dụng';
            const { rows: items } = await app.model.hcthSession.getItems(session.id);
            session.items = items;
            res.send({ item: session });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });
};
