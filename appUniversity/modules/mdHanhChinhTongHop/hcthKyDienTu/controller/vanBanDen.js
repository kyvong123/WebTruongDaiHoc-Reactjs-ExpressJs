module.exports = app => {
    const kyXacThuc = 'hcthVanBanDenSigning', kyXacThucPermission = 'hcthVanBanDenSigning:verification';
    app.permission.add(kyXacThucPermission);
    const getShcc = (req) => req.session.user?.shcc;
    const moment = require('moment');

    const createNotification = async (emails, notification = { toEmail: '', title: '', subTitle: '', icon: 'fa-pencil-square-o', iconColor: '#1488db', link: '', buttons: [], sendEmail: null, sendSocket: true, notificationCategory: '' }) => {
        return (emails.map(async email => {
            await app.notification.send({
                toEmail: email,
                ...notification
            });
        }));
    };

    const cacheDir = app.path.join(app.assetPath, 'pdf/cache');

    app.get('/api/hcth/ky-dien-tu/van-ban-den', app.permission.check(kyXacThucPermission), async (req, res) => {
        try {
            //TODO: check quyền user đối với văn bản
            // eslint-disable-next-line no-unused-vars
            let { location = 'Đại học Khoa học Xã hội và Nhân văn', format, sessionId, fileId, name = 'Ký xác thực' } = req.query, signatureCount = 0;
            // const permissions = getCurrentPermissions(req);
            //get file imformation
            const shcc = getShcc(req);
            if (!Number(sessionId) || !Number(fileId)) throw 'Invalid parameter';
            const session = await app.model.hcthSession.get({ id: sessionId, shcc, trangThai: 'waiting' });
            const sessionItem = await app.model.hcthVanBanDenSignSessionItem.get({ sessionId, trangThai: 'waiting', fileId });
            if (!session || !sessionItem) {
                throw 'Session không tồn tại';
            }

            const file = await app.model.hcthFile.get({ id: fileId });
            const vanBanDen = await app.model.hcthCongVanDen.get({ id: file.ma });
            if (!file) throw 'Không tìm được file';

            let originalPath = app.path.join(app.assetPath, `/congVanDen/${file.ma}/${file.tenFile}`);
            let input = app.path.join(app.assetPath, `/congVanDen/${file.ma}/${file.tenFile.replace(/[.][A-Za-z0-9]*$/, '.pdf')}`);
            if (!app.fs.existsSync(input)) {
                let buffer = app.fs.readFileSync(originalPath);
                buffer = await app.docx.toPdfBuffer(buffer);
                app.fs.writeFileSync(input, buffer);
            }

            // prepare session folder for signing -> this would be deleted -> TODO: schedule delete these folder
            const sessionFolder = app.path.join(cacheDir, new Date().getTime().toString());
            app.fs.createFolder(sessionFolder);
            let output = app.path.join(sessionFolder, file.tenFile.replace(/[.][A-Za-z0-9]*$/, '.pdf'));

            // prepare soVanBanForm


            let template = 'Số: {so_cong_van}; {thoi_gian}.';
            template = template.replace('{thoi_gian}', moment(new Date()).format('[ngày] DD, [tháng] MM, [năm] YYYY; HH:mm:SS')).replace('{so_cong_van}', vanBanDen.soCongVan);
            const { status, stderr } = await app.pdf.signWithText({
                input, output, name, location, reason: 'Ký xác thực',
                x: 0, y: 0, page: 1,
                signatureLevel: 2,
                alignRight: 1,
                keystorePath: app.path.join(app.assetPath, '/pdf/p12placeholder/certificate.p12'),
                soVanBan: template,
                width: 320, fontSize: 14,
                ttfPath: app.path.join(app.assetPath, 'pdf', 'fonts', 'times.ttf')
            }); // status, stdout, stderr
            if (status != 0) {
                console.error('text signature', stderr);
                throw 'lỗi hệ thống';
            }
            input = output;
            output = app.path.join(sessionFolder, file.tenFile);
            signatureCount++;

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

    app.post('/api/hcth/ky-dien-tu/van-ban-den/session', app.permission.check(kyXacThucPermission), async (req, res) => {
        try {
            let { fileList } = req.body.data;
            const shcc = getShcc(req);
            if (!fileList?.length) {
                throw 'Invalid parameter';
            }
            fileList = fileList.map(id => Number(id)).filter(id => id);
            const idSet = new Set(fileList);
            if (idSet.size != fileList.length) {
                throw 'Danh sách tập tin văn bản đến không hợp lệ';
            } else if (idSet.size > 20) {
                throw 'Số lượng văn bản ký vượt quá giới hạn';
            }

            let instanceList = await Promise.all(fileList.map(async id => {
                const instance = await app.model.hcthFile.get({ id, nextVersionId: null, loai: 'DEN' });
                return instance;
            }));
            instanceList = instanceList.filter(item => item);
            const invalidVanBan = instanceList.find(instance => instance.isVerified == 1);
            if (invalidVanBan) {
                throw 'Văn bản #' + invalidVanBan.ten + ' không hợp lệ để ký';
            }
            const session = await app.model.hcthSession.create({ shcc, thoiGian: Date.now(), trangThai: 'waiting', loai: 'DEN' });
            await Promise.all(instanceList.map(async file => await app.model.hcthVanBanDenSignSessionItem.create({ sessionId: session.id, fileId: file.id, trangThai: 'waiting' })));
            const { rows: items } = await app.model.hcthSession.getItems(session.id);
            createNotification([req.session.user.email], { title: 'Sesison ký mới', subTitle: 'Bạn đã tạo session ký văn bản đến mới, vui lòng truy cập thiết bị di động và tới mục thông báo để ký văn bản', icon: 'fa-pencil-square-o', iconColor: '#1488db', link: '', sendSocket: true, notificationCategory: 'SIGN_SESSION_KY_XAC_THUC_VAN_BAN_DEN:' + session.id });

            res.send({ session: { ...session, items } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/ky-dien-tu/van-ban-den/file/:pageNumber/:pageSize', app.permission.check(kyXacThucPermission), async (req, res) => {
        try {
            const page = await app.model.hcthCongVanDen.fileSignSearchPage(Number(req.params.pageNumber), Number(req.params.pageSize), req.query.pageCondition || '', app.utils.stringify(req.query.filter, {}));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: req.query.pageCondition || '', list } });

        } catch (error) {
            console.error(req.method, req.originalUrl, error);
            res.send({ error });
        }
    });

    // Phân quyền ký nháy thể thức trong đơn vị
    app.assignRoleHooks.addRoles(kyXacThuc, { id: kyXacThucPermission, text: 'Hành chính tổng hợp: Ký xác thực văn bản đến' });

    app.assignRoleHooks.addHook(kyXacThuc, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === kyXacThuc && userPermissions.includes('hcth:manage')) {
            const assignRolesList = app.assignRoleHooks.get(kyXacThuc).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleHcthVanBanDenSigning', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == kyXacThuc);
        inScopeRoles.forEach(role => {
            if (role.tenRole === kyXacThucPermission) {
                app.permissionHooks.pushUserPermission(user, kyXacThucPermission, 'hcthSignature:write');
            }
        });
        resolve();
    }));

    app.get('/api/hcth/ky-dien-tu/van-ban-den/session/item', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { sessionId, fileId } = req.query;
            if (!Number(sessionId) || !Number(fileId)) {
                throw 'Invalid parameter';
            }
            const session = await app.model.hcthSession.get({ id: sessionId });
            if (session.shcc != getShcc(req)) throw 'Không thể truy cập session';
            const { rows: items } = await app.model.hcthSession.getVanBanDenItems(session.id);
            const item = items.find(item => item.fileId == fileId);
            if (!item) {
                res.send({});
            }
            else {
                item.session = session;
                res.send({ item });
            }
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/ky-dien-tu/van-ban-den/session/:id', app.permission.check('hcthSignature:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const session = await app.model.hcthSession.get({ id });
            if (!session || session.shcc != getShcc(req)) throw 'Session không khả dụng';
            let items = await app.model.hcthVanBanDenSignSessionItem.getAll({ sessionId: session.id });
            items = await Promise.all(items.map(async (item) => {
                const file = await app.model.hcthFile.get({ id: item.fileId });
                return { ...file, ...item };
            }));
            session.items = items;
            res.send({ item: session });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.uploadHooks.add('hcthKyVanBanDen', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthKyDienTu(req, fields, files, params, done), done, 'staff:login'));

    const hcthKyDienTu = async (req, fields, files, params, done) => {
        try {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'hcthKyVanBanDen' && files.file && files.file.length > 0) {
                const
                    file = files.file[0],
                    path = file.path,
                    originalFilename = file.originalFilename,
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(path),
                    data = fields.data && fields.data[0] && app.utils.parse(fields.data[0]);
                if (extName != '.pdf') throw 'Định dạng file không hợp lệ';
                if (!data) throw 'Dữ liệu văn bản không hợp lệ';
                const { sessionId, fileId } = data;
                const session = await app.model.hcthSession.get({ id: sessionId, shcc: getShcc(req), trangThai: 'waiting' });
                if (!session) throw 'Session không tồn tại';
                const sessionItem = await app.model.hcthSessionItem.get({ sessionId, fileId, trangThai: 'waiting' });
                if (!sessionItem) 'Session item không tồn tại';

                const originalFile = await app.model.hcthFile.get({ id: fileId });
                const originalFileBuffer = app.fs.readFileSync(app.path.join(app.assetPath, 'congVanDen', originalFile.ma.toString(), originalFile.tenFile));
                const fileBuffer = app.fs.readFileSync(path);
                const originalFileBufferHash = app.crypto.createHash('sha256').update(originalFileBuffer.toString('utf-8'), 'utf-8').digest('binary');
                const fileBufferHash = app.crypto.createHash('sha256').update(fileBuffer.slice(0, originalFileBuffer.length).toString('utf-8'), 'utf-8').digest('binary');
                if (!originalFileBufferHash == fileBufferHash)
                    throw 'File cập nhật đã chỉnh sửa dữ liệu gốc';
                const signAt = Date.now();
                app.fs.renameSync(path, app.path.join(app.assetPath, `congVanDen/${originalFile.ma}`, fileName));
                // eslint-disable-next-line no-unused-vars
                const { id: originalFileId, ...newData } = originalFile;
                const newfile = await app.model.hcthFile.create({ ...newData, ten: originalFilename, tenFile: fileName, kichThuoc: file.size, nguoiTao: getShcc(req), thoiGian: signAt, isVerified: 1 });
                await app.model.hcthFile.update({ id: originalFile.id }, { nextVersionId: newfile.id });
                done({});
            }
        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };

    const performEndSession = async (session, requireSendMail = false) => {
        const thoiGian = Date.now();

        try {
            await app.model.hcthVanBanDenSignSessionItem.update({
                statement: 'sessionId = :id and trangThai != :maTrangThai',
                parameter: {
                    maTrangThai: 'finished',
                    id: session.id
                }
            }, { trangThai: 'error', capNhat: thoiGian });
        } catch (error) {
            //skip
        }
        let { rows: items } = await app.model.hcthSession.getVanBanDenItems(session.id);
        if (items.some(item => item.trangThai == 'finished') || requireSendMail) {
            let { guiSignEmailEditorHtml: mailTemplate, guiSignEmailTitle: title, email, emailPassword } = await app.model.hcthSetting.getValue('guiSignEmailEditorHtml', 'guiSignEmailTitle', 'email', 'emailPassword');
            const pattern = new RegExp('<tbody>.*?</tbody>', 'gs');

            mailTemplate = mailTemplate.replace(pattern, `
<tbody>
${items.map((item, index) => `
<tr>
    <td style="text-align:center">${index + 1}</td>
    <td>${item.ten}</td>
    <td style="text-align:center"><a href="${(app.isDebug ? app.debugUrl : app.rootUrl) + '/user/van-ban-den/' + item.ma}">${(item.tenCapVanBan || 'Văn bản #') + item.ma}</a></td>
    <td style="text-align:center">${item.trangThai == 'finished' ? 'Thành công' : 'Thất bại'}</td>
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
        await app.model.hcthSession.update({ id: session.id }, { trangThai: 'finished', capNhat: thoiGian });
        console.info('End Session #' + session.id);
    };

    app.put('/api/hcth/ky-dien-tu/van-ban-den/session/end', app.permission.check(kyXacThucPermission), async (req, res) => {
        try {
            const session = await app.model.hcthSession.get({ id: req.body.id, shcc: getShcc(req), trangThai: 'waiting' });
            if (!session) throw 'Session không tồn tại';
            await performEndSession(session, true);
            res.send({});
        } catch (error) {
            console.error({ error });
            res.send(error);
        }
    });

};
