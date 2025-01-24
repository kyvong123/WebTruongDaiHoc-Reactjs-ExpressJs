module.exports = app => {
    const { MA_HCTH } = require('../constant');

    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            504: { title: 'Cấu hình', link: '/user/hcth/setting', icon: 'fa-cog', backgroundColor: '#1488db', pin: true },
        },
    };

    app.permissionHooks.add('staff', 'addRolesHcthSetting', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthSetting:read', 'hcthSetting:write', 'hcthSetting:delete');
            resolve();
        } else resolve();
    }));

    app.permission.add({ name: 'hcthSetting:read', menu }, 'hcthSetting:write', 'hcthSetting:delete');

    app.permissionHooks.add('staff', 'addRolesHcthSetting', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthSetting:read', 'hcthSetting:write', 'hcthSetting:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/hcth/setting', app.permission.check('hcthSetting:read'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/setting/all', app.permission.check('hcthSetting:read'), async (req, res) => {
        app.model.hcthSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/setting', app.permission.check('hcthSetting:read'), async (req, res) => {
        const { key } = req.body;
        app.model.hcthSetting.get({ key }, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/setting', app.permission.check('hcthSetting:write'), async (req, res) => {
        const { changes } = req.body;
        app.model.hcthSetting.setValue(changes, error => res.send({ error }));
    });

    app.delete('/api/hcth/setting', app.permission.check('hcthSetting:delete'), async (req, res) => {
        const { key } = req.body;
        app.model.hcthSetting.delete({ key }, error => res.send({ error }));
    });

    // Upload API  -----------------------------------------------------------------------------------------------

    app.fs.createFolder(app.path.join(app.assetPath, '/ca'));

    app.uploadHooks.add('caFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCaFile(req, fields, files, params, done), done)
    );

    const uploadCaFile = async (req, fields, files, params, done) => {
        try {
            const type = fields.userData?.length && fields.userData[0],
                data = fields.data && fields.data[0] && app.utils.parse(fields.data[0]);

            if (type == 'caFile') {
                const file = files.caFile[0],
                    { path } = file,
                    validFileType = ['.pem', '.key'],
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(fileName);
                let newFileName;
                if (!validFileType.includes(extName))
                    return done && done({ error: 'Định dạng file không hợp lệ' });

                if (data.key == 'certificate') newFileName = 'hcmussh.pem';
                else if (data.key == 'privateKey') newFileName = 'hcmussh.key';

                const newPath = app.path.join(app.assetPath, '/ca', newFileName);

                app.fs.renameSync(path, newPath);
                const item = await app.model.hcthSetting.get({ key: data.key });
                if (item) {
                    await app.model.hcthSetting.update({ key: data.key }, { value: newPath });
                } else {
                    await app.model.hcthSetting.create({ key: data.key, value: newPath });
                }

                done && done({
                    newFileName,
                    newPath
                });
            }
        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };

    const initCa = async () => {
        const key = 'openssl.cnf';
        const caPath = app.path.join(app.assetPath, 'ca');
        const databasePath = app.path.join(caPath, 'index.txt');
        const crlNumPath = app.path.join(caPath, 'crlnumber');

        if (!app.fs.existsSync(databasePath)) {
            app.fs.writeFileSync(databasePath, '');
        }
        if (!app.fs.existsSync(crlNumPath)) {
            app.fs.writeFileSync(crlNumPath, '1000');
        }
        const item = await app.model.hcthSetting.get({ key });
        const fileData = item.value.replaceAll('{caDir}', app.path.join(app.assetPath, 'ca'));
        app.fs.writeFileSync(app.path.join(app.assetPath, 'ca', key), fileData);
    };

    const initSystemKeystore = async () => {
        const filePath = app.path.join(app.assetPath, 'ca', 'systemKeystore.p12');
        const keyPath = app.path.join(app.assetPath, 'ca/hcmussh.key');
        const certPath = app.path.join(app.assetPath, 'ca/hcmussh.pem');
        const isKeystoreExists = app.fs.existsSync(filePath);
        if (isKeystoreExists || !app.fs.existsSync(certPath) || !app.fs.existsSync(keyPath)) {
            /**TODO: Long check system keystore valid status
             * if keystore invalid retrive keystore
            */
            return;
        }
        const setting = await app.model.hcthSetting.getValue('rootPassphrase', 'systemKeystorePassword');
        const privateKey = app.fs.readFileSync(keyPath, 'utf-8');
        const cert = app.fs.readFileSync(certPath, 'utf-8');
        const attributes = [{
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
            value: 'ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH'
        }];
        const { p12b64 } = await app.hcthKeystore.genKeyStore(privateKey, setting.rootPassphrase, cert, attributes, setting.systemKeystorePassword);
        app.fs.writeFileSync(app.path.join(app.assetPath, 'ca', 'systemKeystore.p12'), Buffer.from(p12b64, 'base64'));
        return;
    };

    app.get('/api/hcth/setting/init-ca-config', app.permission.check('developer:login'), async (req, res) => {
        try {
            await initCa();
            res.send({});
        } catch (error) {
            console.error('Init ca config: ', error);
            res.send({ error });
        }
    });

    (app.isDebug || app.appName == 'mdHanhChinhTongHopService') && app.readyHooks.add('hcthSetting:initCa', {
        ready: () => app.database && app.assetPath && app.model.hcthSetting,
        run: () => {
            if (app.primaryWorker) {
                initCa().catch((error) => { console.error('Error when init ca config', error); });
                initSystemKeystore().catch((error) => { console.error('Error when init system keystore', error); });
            }
        },
    });
};
