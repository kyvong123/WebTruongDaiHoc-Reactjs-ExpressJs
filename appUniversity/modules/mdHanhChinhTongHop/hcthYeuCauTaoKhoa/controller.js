module.exports = (app, appConfig) => {
    const forge = require('node-forge');
    const { trangThaiRequest } = require('../constant');
    const jimp = require('jimp');
    const moment = require('moment');
    const axios = require('axios');
    const { exec } = require('child_process');

    const OTP_EXPIRED_MINUS_DEBUG = 10;
    const OTP_EXPIRED_MINUS_PROD = 30;

    const encrypt = (key, iv, data) => {
        const cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(data));
        cipher.finish();
        return cipher.output.data;
    };

    const decrypt = (key, iv, data) => {
        const decipher = forge.cipher.createDecipher('AES-CBC', key);
        decipher.start({ iv: iv });
        decipher.update(forge.util.createBuffer(data));
        decipher.finish();
        return decipher.output.data;
    };

    const getEcryptKey = (shcc, otp) => {
        const encryptKey = app.crypto.createHash('sha256').update(otp, 'utf-8').digest('binary');
        const ivKey = app.crypto.createHash('sha256').update(shcc + otp, 'utf-8').digest('binary');
        return { encryptKey, ivKey };
    };

    const getAtiveOtp = async (shcc) => {
        return await app.model.hcthUserOtp.get({
            statement: 'shcc = :shcc and kichHoat = 1 and createdAt >= :bound',
            parameter: {
                shcc, bound: Date.now() - (app.isDebug ? OTP_EXPIRED_MINUS_DEBUG : OTP_EXPIRED_MINUS_PROD) * 60 * 1000
            }
        });
    };

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            505: { title: 'Yêu cầu tạo chữ ký', link: '/user/hcth/yeu-cau-tao-khoa', icon: 'fa-key', backgroundColor: '#db2c2c', groupIndex: 3 },
        },
    };

    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            405: { title: 'Chứng thư số', link: '/user/yeu-cau-tao-khoa', icon: 'fa-key', backgroundColor: '#db2c2c', groupIndex: 3 },
        },
    };

    app.fs.createFolder(app.path.join(app.assetPath, 'ca'));
    app.fs.createFolder(app.path.join(app.assetPath, 'ca', 'certs'));


    app.permissionHooks.add('staff', 'addRolesHcthSignature', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && (staff.maDonVi == '68' || staff.donViQuanLy.length)) {
            app.permissionHooks.pushUserPermission(user, 'hcthSignature:write');
            resolve();
        } else resolve();
    }));

    app.permission.add(
        { name: 'hcthSignature:write', menu },
        { name: 'hcthMocDo:write', menu },
    );
    app.permission.add({ name: 'hcthYeuCauTaoKhoa:read', menu: staffMenu }, 'hcthYeuCauTaoKhoa:write', 'hcthYeuCauTaoKhoa:delete');
    // app.permission.add({ name: 'manager:write', menu: menu });
    // app.permission.add({ name: 'rectors:login', menu: menu });
    app.get('/user/hcth/yeu-cau-tao-khoa', app.permission.check('hcthYeuCauTaoKhoa:read'), app.templates.admin);
    app.get('/user/yeu-cau-tao-khoa', app.permission.orCheck('rectors:login', 'manager:login', 'hcthMocDo:write', 'hcthSignature:write'), app.templates.admin);

    app.get('/api/hcth/yeu-cau-tao-khoa/user/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const filter = req.query.filter || {};
            const shcc = req.session.user.shcc;
            filter.canBoTao = shcc;
            const filterData = app.utils.stringify(filter);
            const pageCondition = req.query.searchTerm;
            const page = await app.model.hcthYeuCauTaoKhoa.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter }
            });
            // res.send({ items: [] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/khoa/user', app.permission.orCheck('rectors:login', 'manager:write', 'hcthMocDo:write', 'hcthSignature:write'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const khoa = await app.model.hcthUserPublicKey.get({ shcc, kichHoat: 1 });
            if (khoa) {
                const yeuCau = await app.model.hcthYeuCauTaoKhoa.get({ id: khoa.yeuCau });
                res.send({ item: { khoa, yeuCau } });
            } else {
                res.send({ item: {} });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/khoa/user/certificate/serial-number', app.permission.orCheck('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const khoa = await app.model.hcthUserPublicKey.get({ shcc, kichHoat: 1 });
            res.send({ serialNumber: khoa?.serialNumber });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.hcthKeystore = {
        genKeyStore: async (privateKey, caPassphrase, cert, attributes, passphrase) => {
            const caKey = forge.pki.decryptRsaPrivateKey(privateKey, caPassphrase);
            const caCert = forge.pki.certificateFromPem(cert);
            const hostKeys = forge.pki.rsa.generateKeyPair(2048);
            const getCertNotBefore = () => {
                let twoDaysAgo = new Date(Date.now() - 60 * 60 * 24 * 2 * 1000);
                let year = twoDaysAgo.getFullYear();
                let month = (twoDaysAgo.getMonth() + 1).toString().padStart(2, '0');
                let day = twoDaysAgo.getDate();
                return new Date(`${year}-${month}-${day} 00:00:00Z`);
            };

            const getCertNotAfter = (notBefore) => {
                let notAfter = new Date(notBefore.getTime() + 60 * 60 * 24 * 365 * 1000);
                let year = notAfter.getFullYear();
                let month = (notAfter.getMonth() + 1).toString().padStart(2, '0');
                let day = notAfter.getDate();
                return new Date(`${year}-${month}-${day} 23:59:59Z`);
            };

            const makeNumberPositive = (hexString) => {
                let mostSignificativeHexDigitAsInt = parseInt(hexString[0], 16);

                if (mostSignificativeHexDigitAsInt < 8) return hexString;

                mostSignificativeHexDigitAsInt -= 8;
                return mostSignificativeHexDigitAsInt.toString() + hexString.substring(1);
            };

            const randomSerialNumber = () => {
                return makeNumberPositive(forge.util.bytesToHex(forge.random.getBytesSync(10)));
            };
            attributes.forEach(attribute => attribute.valueTagClass = forge.asn1.Type.UTF8);
            const extensions = [{
                name: 'basicConstraints',
                cA: false
            }, {
                name: 'nsCertType',
                server: true
            }, {
                name: 'subjectKeyIdentifier'
            }, {
                name: 'authorityKeyIdentifier',
                authorityCertIssuer: true,
                serialNumber: caCert.serialNumber
            }, {
                name: 'keyUsage',
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true,
            }, {
                name: 'extKeyUsage',
                serverAuth: true,
                codeSigning: true,
            },
            ];

            let newHostCert = forge.pki.createCertificate();
            // Set the attributes for the new Host Certificate
            newHostCert.publicKey = hostKeys.publicKey;
            const serialNumber = randomSerialNumber();
            newHostCert.serialNumber = serialNumber;
            newHostCert.validity.notBefore = getCertNotBefore();
            newHostCert.validity.notAfter = getCertNotAfter(newHostCert.validity.notBefore);
            newHostCert.setSubject(attributes);
            newHostCert.setIssuer(caCert.subject.attributes);
            newHostCert.setExtensions(extensions);

            // Sign the new Host Certificate using the CA
            newHostCert.sign(caKey, forge.md.sha512.create());

            let p12Asn1 = forge.pkcs12.toPkcs12Asn1(
                hostKeys.privateKey, newHostCert, passphrase,
                { algorithm: '3des' });

            // base64-encode p12
            let p12Der = forge.asn1.toDer(p12Asn1).getBytes();

            let p12b64 = forge.util.encode64(p12Der);
            return { p12b64, cerfiticate: forge.pki.certificateToPem(newHostCert), serialNumber };
        }
    };

    const genUserKeystore = async (id, shcc, passphrase, req) => {
        const setting = await app.model.hcthSetting.getValue('rootPassphrase');
        const privateKey = app.fs.readFileSync(app.path.join(app.assetPath, 'ca/hcmussh.key'), 'utf-8');
        const cert = app.fs.readFileSync(app.path.join(app.assetPath, 'ca/hcmussh.pem'), 'utf-8');

        const qtChucVu = await app.model.qtChucVu.get({ shcc, chucVuChinh: 1, thoiChucVu: 0 }, 'maChucVu');

        const chucVu = await app.model.dmChucVu.get({ ma: qtChucVu?.maChucVu }, 'ten');

        const canBo = await app.model.tchcCanBo.get({ shcc }, 'ho, ten, maDonVi');

        const donVi = await app.model.dmDonVi.get({ ma: canBo?.maDonVi }, 'ten');

        // Define the attributes/properties for the Host Certificate
        let attributes;
        if (!req.session.user.permissions.includes('hcthMocDo:write')) {
            attributes = [{
                shortName: 'C',
                value: 'VN'
            }, {
                shortName: 'ST',
                value: 'Hồ Chí Minh'
            }, {
                shortName: 'L',
                value: 'ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH'
            }, {
                shortName: 'CN',
                value: `${chucVu?.ten || ''}`.trim() + ' ' + `${canBo?.ho || ''} ${canBo?.ten || ''}`.trim().normalizedName()
            }, {
                shortName: 'O',
                value: `${donVi?.ten || ''}`.trim()
            }, {
                shortName: 'OU',
                value: `${chucVu?.ten || ''}`.trim() + ' ' + `${canBo?.ho || ''} ${canBo?.ten || ''}`.trim().normalizedName() + `-${shcc}-${id}`
            }];
        } else {
            attributes = [{
                shortName: 'C',
                value: 'VN'
            }, {
                shortName: 'ST',
                value: 'Hồ Chí Minh'
            }, {
                shortName: 'L',
                value: 'ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH'
            }, {
                shortName: 'CN',
                value: 'ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH'
            }, {
                shortName: 'O',
                value: 'ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH'
            }, {
                shortName: 'OU',
                value: 'ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH-' + id
            }];
        }


        return await app.hcthKeystore.genKeyStore(privateKey, setting.rootPassphrase, cert, attributes, passphrase);
    };

    app.post('/api/hcth/khoa/user/download', app.permission.orCheck('rectors:login', 'manager:write', 'hcthMocDo:write', 'hcthSignature:write'), async (req, res) => {
        try {
            let { data } = req.body;
            const shcc = req.session.user.shcc;
            const otp = await getAtiveOtp(shcc);
            if (!otp) throw 'Xác thực người dùng lỗi';
            // const { encryptKey, ivKey } = getEcryptKey(shcc, otp.otp);
            // data = app.utils.parse(decrypt(encryptKey, ivKey, data));
            // if (!data.shcc || data.shcc != shcc) throw 'Invalid parameter';
            const passphrase = data.passphrase;
            if (!otp) throw 'Lỗi xác thực người dùng';
            const khoa = await app.model.hcthUserPublicKey.get({ shcc, kichHoat: 1 });
            if (!khoa) throw 'Không tìm thấy khóa người dùng';
            if (khoa.cerfiticate) throw 'Khóa đã được gửi đến người dùng';
            const { p12b64, cerfiticate, serialNumber } = await genUserKeystore(khoa.id, shcc, passphrase, req);

            await app.model.hcthUserPublicKey.update({ id: khoa.id }, { cerfiticate, serialNumber });
            // res.send({ data: encrypt(encryptKey, ivKey, p12b64) });
            //TODO: Long
            res.send({ data: p12b64, serialNumber });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/yeu-cau-tao-khoa/page/:pageNumber/:pageSize', app.permission.check('hcthYeuCauTaoKhoa:read'), async (req, res) => {
        try {
            const filter = req.query.filter || {};
            const filterData = app.utils.stringify(filter);
            const pageCondition = req.query.searchTerm;
            const page = await app.model.hcthYeuCauTaoKhoa.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter }
            });
            // res.send({ items: [] });
        } catch (error) {
            res.send({ error });
        }
    });


    app.post('/api/hcth/yeu-cau-tao-khoa', app.permission.orCheck('manager:write', 'rectors:login', 'hcthMocDo:write', 'hcthSignature:write'), async (req, res) => {
        try {
            const data = req.body;
            const shcc = req.session.user.shcc;
            const currentKey = await app.model.hcthUserPublicKey.get({ shcc, kichHoat: 1 });
            if (currentKey) throw 'Không thể tạo yêu cầu khi có khóa đang được kích hoạt';
            const hasRequest = await app.model.hcthYeuCauTaoKhoa.get({ shcc, trangThai: trangThaiRequest.CHO_DUYET.id });
            if (hasRequest) throw 'Bạn đã có 1 yêu cầu đang chờ duyệt';
            await app.model.hcthYeuCauTaoKhoa.create({ ...data, shcc, ngayTao: new Date().getTime(), trangThai: trangThaiRequest.CHO_DUYET.id });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/yeu-cau-tao-khoa/trang-thai/:id', app.permission.check('hcthYeuCauTaoKhoa:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const request = await app.model.hcthYeuCauTaoKhoa.get({ id });
            if (!request) throw 'Yêu cầu không tồn tại';
            if (request.trangThai != trangThaiRequest.CHO_DUYET.id) throw 'Trạng thái yêu cầu không hợp lệ';
            const shcc = req.session.user.shcc;
            const trangThai = req.body.trangThai;
            switch (trangThai) {
                case trangThaiRequest.DA_DUYET.id:
                    await approveRequest(request, shcc);
                    break;
                case trangThaiRequest.TU_CHOI.id:
                    await refuseRequest(request, shcc);
                    break;
                default:
            }
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    const approveRequest = async (request, shcc) => {
        await app.model.hcthYeuCauTaoKhoa.update({ id: request.id }, { trangThai: trangThaiRequest.DA_DUYET.id, capNhatBoi: shcc, ngayCapNhat: new Date().getTime() });
        await app.model.hcthUserPublicKey.create({ yeuCau: request.id, shcc: request.shcc, });
        //TODO: send notification
    };

    const refuseRequest = async (request, shcc) => {
        await app.model.hcthYeuCauTaoKhoa.update({ id: request.id }, { trangThai: trangThaiRequest.TU_CHOI.id, capNhatBoi: shcc, ngayCapNhat: new Date().getTime() });
        //TODO: send notification
    };

    app.post('/api/hcth/chu-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { shcc, dataUrl } = req.body;

            app.fs.createFolder(app.path.join(app.assetPath, 'key'));

            const destPath = app.path.join(app.assetPath, 'key', `${shcc}.png`);

            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

            app.fs.writeFileSync(destPath, base64Data, 'base64');

            let item = await app.model.hcthChuKy.get({ shcc });

            if (!item) item = await app.model.hcthChuKy.create({ shcc, ngayTao: Date.now() });

            res.send({ item, error: null });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.uploadHooks.add('hcthSignatureFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthSignatureFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthSignatureFile = async (req, fields, files, params, done) => {
        try {
            if (
                fields.userData &&
                fields.userData[0] &&
                fields.userData[0].startsWith('hcthSignatureFile') &&
                files.hcthSignatureFile &&
                files.hcthSignatureFile.length > 0) {
                const srcPath = files.hcthSignatureFile[0].path,
                    validUploadFileType = ['.png', '.jpg', '.jpeg'],
                    baseNamePath = app.path.extname(srcPath);
                if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                    done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                    app.fs.deleteFile(srcPath);
                } else {
                    const userData = fields.userData[0];
                    const isRemoveBg = userData.substring(userData.lastIndexOf(':') + 1, userData.length);
                    let dataUrl = '';

                    if (Number(isRemoveBg) === 1) {
                        const fileName = srcPath.replace(/^.*[\\\/]/, '');
                        const digest = app.crypto.createHash('sha256').update(fileName, 'utf-8').digest('hex');
                        const { ivKey, encryptKey } = getEcryptKey(fileName, secretKey);
                        const checksum = Buffer.from(encrypt(encryptKey, ivKey, digest), 'binary').toString('base64');
                        const hchtService = appConfig.services.mdHanhChinhTongHopService;
                        await axios.get(app.isDebug ? 'http://localhost:7012/api/hcth/chu-ky/background/remove' : `https://${hchtService.host}:${hchtService.port}/api/hcth/chu-ky/background/remove`, { params: { file: fileName, checksum } });
                    }
                    dataUrl = app.fs.readFileSync(srcPath, 'base64');

                    done && done({ item: { ...files.hcthSignatureFile[0], content: dataUrl } });
                }
            }
        } catch (error) {
            console.error(error);
            done && done({ error: 'Chữ ký không hợp lệ. Vui lòng thử lại.' });
        }
    };

    app.get('/api/hcth/chu-ky', app.permission.orCheck('rectors:login', 'manager:write', 'hcthMocDo:write', 'hcthSignature:write'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const signature = await app.model.hcthChuKy.get({ shcc });
            if (signature) {
                res.send({ item: signature });
            } else {
                res.send({ item: null });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/chu-ky/download', app.permission.orCheck('rectors:login', 'manager:write', 'hcthMocDo:write', 'staff:login', 'hcthSignature:write'), async (req, res) => {
        try {

            const { format, height, width, background, shcc: shccCanBo, rawImage = false } = req.query;
            const path = app.path.join(app.assetPath, `/key/${shccCanBo}.png`);
            let buffer;
            if (app.fs.existsSync(path)) buffer = app.fs.readFileSync(path, 'base64');
            else {
                const defaultImgPath = app.path.join(app.assetPath, 'key', 'default.png');
                buffer = app.fs.readFileSync(defaultImgPath, 'base64');
            }
            const sendResponse = (buffer) => {
                if (!format) {
                    res.writeHead(200, [['Content-Type', 'image/png'], ['Content-Disposition', 'attachment;filename=' + `${shccCanBo}.png`]]);
                    return res.end(Buffer.from(buffer, 'base64'));
                }
                else if (format == 'base64') {
                    return res.send({ data: buffer });
                }
                else
                    return res.status(400).send({ error: 'format không được hỗ trợ' });
            };
            if (rawImage) {
                return sendResponse(buffer);
            }
            let image = await jimp.read(Buffer.from(buffer, 'base64'));
            if (height != null && width != null) {
                image.resize(parseInt(width), parseInt(height));
            }
            if (background) {
                image.rgba(false);
                image.background(parseInt(background));
            } else {
                image.background(0xFFFFFFFF);
            }
            buffer = image.getBuffer(jimp.MIME_JPEG, (error, buffer) => {
                if (error) throw error;
                sendResponse(buffer.toString('base64'));
            });
        } catch (error) {
            res.status(400).send({ error });
        }
    });

    const generateOTP = () => {
        let digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    };

    const generateRandomString = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    };

    app.get('/api/hcth/chu-ky/request-otp', app.permission.orCheck('rectors:login', 'manager:write', 'staff:login', 'hcthSignature:write'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const canBo = await app.model.tchcCanBo.get({ shcc }, 'email');

            const { email: fromMail, emailPassword: fromMailPassword, guiOtpEmailTitle, guiOtpEmailEditorText, guiOtpEmailEditorHtml } = await app.model.hcthSetting.getValue('email', 'emailPassword', 'chiDaoEmailDebug', 'guiOtpEmailTitle', 'guiOtpEmailEditorText', 'guiOtpEmailEditorHtml');

            const otpCode = generateOTP();
            const key = generateRandomString(32);
            const matcher = generateRandomString(32);

            let mailTitle = guiOtpEmailTitle.toUpperCase(),
                mailText = guiOtpEmailEditorText.replaceAll('{otpCode}', otpCode),
                mailHtml = guiOtpEmailEditorHtml.replaceAll('{otpCode}', otpCode);
            try {
                await app.model.hcthUserOtp.update({ shcc, kichHoat: 1 }, { kichHoat: 0 });
            } catch {
                //skip
            }

            const { encryptKey, ivKey } = getEcryptKey(shcc, otpCode);
            const encrypted = encrypt(encryptKey, ivKey, matcher);

            await app.model.hcthUserOtp.create({ shcc, otp: otpCode, key, createdAt: Date.now(), kichHoat: 1, matcher });


            if (app.isDebug) {
                // app.email.normalSendEmail(fromMail, fromMailPassword, 'nqlong0709@gmail.com', [], mailTitle, mailText, mailHtml, []);
                console.info({ otp: otpCode });

            } else {
                app.service.emailService.send(fromMail, fromMailPassword, canBo.email, null, null, mailTitle, mailText, mailHtml, null);
                // app.email.normalSendEmail(fromMail, fromMailPassword, canBo.email, [app.defaultAdminEmail], mailTitle, mailText, mailHtml, []);
            }
            res.send({ error: null, encrypted: Buffer.from(encrypted).toString('base64') });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/chu-ky/verify-otp', app.permission.orCheck('rectors:login', 'manager:write', 'staff:login', 'hcthSignature:write'), async (req, res) => {
        try {
            // const { digest, otp: userOtp } = req.body;
            const { otp: userOtp } = req.body;
            const shcc = req.session.user.shcc;
            const otp = await getAtiveOtp(shcc);

            if (!otp) {
                throw 'OTP code is invalid';
            }
            //TODO: Long fix for demo
            // const { encryptKey, ivKey } = getEcryptKey(shcc, otp.otp);

            // const matcher = decrypt(ivKey, encryptKey, digest);
            // if (!matcher == otp.matcher) {
            //     throw 'OTP code is invalid';
            // }
            if (!userOtp == otp.otp) {
                throw 'OTP code is invalid';
            }
            res.send({ key: otp.key });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const execAsync = (command) => new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ error, stdout, stderr });
            }
        });
    });


    const preparePassphrase = async () => {
        const setting = await app.model.hcthSetting.getValue('rootPassphrase');
        app.fs.writeFileSync(app.path.join(app.assetPath, 'ca', 'passphrase'), setting.rootPassphrase);
    };

    const retrievePassphrase = async () => {
        app.fs.writeFileSync(app.path.join(app.assetPath, 'ca', 'passphrase'), '');
    };

    const revokeCertificate = async (item, revocationDate) => {
        try {
            await preparePassphrase();
            const path = app.path.join(app.assetPath, 'ca', 'certs', `${item.shcc}_${item.id}.pem`);
            app.fs.writeFileSync(path, item.cerfiticate);
            const configPath = app.path.join(app.assetPath, 'ca', 'openssl.cnf');
            const time = moment.utc(revocationDate).format('YYYYMMDDHHmmss') + 'Z';
            const passPath = app.path.join(app.assetPath, 'ca', 'passphrase');
            const command = `openssl ca -config ${configPath} -revoke ${path} -passin file:${passPath} -crl_compromise ${time}`;
            await execAsync(command);
            const crlPath = app.path.join(app.assetPath, 'ca', 'hcmussh.crl');
            const genCrlCommand = `openssl ca -config ${configPath} -gencrl -out ${crlPath} -passin file:${passPath}`;
            await execAsync(genCrlCommand);
            retrievePassphrase();
        } catch (error) {
            console.error(error);
            retrievePassphrase();
            if (app.isDebug)
                throw error;
            else
                throw 'Lỗi hệ thống';
        }
    };


    app.delete('/api/hcth/yeu-cau-tao-khoa/revocate', app.permission.orCheck('rectors:login', 'manager:write', 'hcthMocDo:write', 'hcthSignature:write'), async (req, res) => {
        try {
            const now = Date.now();
            const shcc = req.session.user.shcc;
            const revocationDateValue = parseInt(req.body.revocationDate);
            if (!shcc || !revocationDateValue || revocationDateValue > now) throw 'Không thể thu hồi chứng thư số! Vui lòng liên hệ quản trị hệ thống để biết thêm chi tiết';
            const revocationDate = new Date(revocationDateValue);
            const items = await app.model.hcthUserPublicKey.getAll({ shcc: shcc, revocationDate: null, kichHoat: 1 });
            if (!items.length) throw 'Chứng thư số không tồn tại';
            else {
                await Promise.all(items.map(async item => {
                    await revokeCertificate(item, revocationDate);
                    await app.model.hcthUserPublicKey.update({ id: item.id }, { revocationDate: revocationDateValue, kichHoat: 0 });
                }));
            }
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const secretKey = 'EpkgGyM6pAKM4LwHS4vnybMnn9ZunUDf';

    app.get('/api/hcth/chu-ky/background/remove', async (req, res) => {
        try {
            const { file, checksum } = req.query;

            //validate the request checksum
            const digest = app.crypto.createHash('sha256').update(file, 'utf-8').digest('hex');
            const { ivKey, encryptKey } = getEcryptKey(file, secretKey);
            if (decrypt(encryptKey, ivKey, Buffer.from(checksum, 'base64').toString('binary')) != digest) {
                return res.status(401).send({ error: 'Permission denied' });
            } else {
                const path = app.path.join(app.assetPath, 'upload', file);
                const python = app.path.join(app.assetPath, 'python', 'venv', 'bin', 'python');
                const pythonCode = app.path.join(app.assetPath, 'python', 'removebg.py');
                const command = `${python} ${pythonCode} ${path}`;
                await execAsync(command);
                res.send({ file });
            }
        } catch (error) {
            res.status(501).send({ error });
        }
    });
};
