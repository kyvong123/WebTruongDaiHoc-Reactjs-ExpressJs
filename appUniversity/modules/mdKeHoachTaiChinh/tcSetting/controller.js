module.exports = app => {
    const { google } = require('googleapis');
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5001: { title: 'Cấu hình', link: '/user/finance/setting', icon: 'fa-cog', backgroundColor: 'rgb(245, 200, 66)', color: '#000', groupIndex: 0 },
        },
    };

    const menuEmailSetting = {
        parentMenu: app.parentMenu.setting,
        menus: {
            5023: { title: 'Cấu hình Email', link: '/user/finance/setting/mail', icon: 'fa-cogs', backgroundColor: 'rgb(245, 200, 66)', color: '#000', groupIndex: 0 },
        },
    };

    const oauthClientConfig = {
        clientSecret: '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',
        clientId: '108504856514-vkekmde3m4lovpns4q2bj4jfbtkn89br.apps.googleusercontent.com',
        redirectUrl: app.isDebug ? 'http://localhost:7012/api/khtc/setting/mail/verify' : `${app.rootUrl}/api/khtc/setting/mail/verify`,
    };

    const adminMenu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5002: { title: 'Cấu hình Admin', link: '/user/finance/admin-setting', icon: 'fa fa-cogs', color: '#000', backgroundColor: '#DB2C2C', groupIndex: 0 },
        },
    };
    app.permission.add({ name: 'tcSetting:manage', menu }, { name: 'tcSetting:classify', menu: adminMenu }, { name: 'emailSetting:manage', menu: menuEmailSetting }, 'tcSetting:write', 'tcSetting:delete');
    app.permissionHooks.add('staff', 'addRolesTcSetting', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcSetting:manage', 'tcSetting:write', 'tcSetting:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/setting', app.permission.check('tcSetting:manage'), app.templates.admin);
    app.get('/user/finance/admin-setting', app.permission.check('tcSetting:classify'), app.templates.admin);
    app.get('/user/finance/setting/mail', app.permission.check('developer:login'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/khtc/setting/all', app.permission.check('tcSetting:classify'), async (req, res) => {
        app.model.tcSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.get('/api/khtc/setting/keys', app.permission.orCheck('tcSetting:manage', 'staff:login'), async (req, res) => {
        const { keys } = req.query;

        app.model.tcSetting.getAll({
            statement: 'key IN (:keys)',
            parameter: { keys: keys.split(',') }
        }, (error, items) => res.send({ error, items }));
    });

    // app.get('/api/khtc/setting', app.permission.check('tcSetting:manage'), async (req, res) => {
    //     const { key } = req.body;
    //     app.model.tcSetting.get({ key }, (error, item) => res.send({ error, item }));
    // });

    app.put('/api/khtc/setting', app.permission.orCheck('tcSetting:write', 'staff:login'), async (req, res) => {
        const { changes } = req.body;
        app.model.tcSetting.setValue(changes, error => res.send({ error }));
    });

    app.delete('/api/khtc/setting', app.permission.check('tcSetting:delete'), async (req, res) => {
        const { key } = req.body;
        app.model.tcSetting.delete({ key }, error => res.send({ error }));
    });
    // Modify changes auto-dinh-phi
    app.put('/api/khtc/setting/change-auto-dinh-phi', app.permission.check('tcSetting:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            const date = parseInt(new Date().getTime());
            if (changes.autoDinhPhi == '1') {
                const checkDotDong = await app.model.tcDotDongHocPhi.get({
                    statement: ':curDay BETWEEN ngayBatDau AND ngayKetThuc',
                    parameter: { curDay: date },
                });
                if (checkDotDong) {
                    const item = await app.model.tcSetting.setValue(changes);
                    res.send({ item });
                } else {
                    res.send({ error: 100 });
                }
            }
            else {
                const item = await app.model.tcSetting.setValue(changes);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/setting/mail/url', app.permission.check('developer:login'), async (req, res) => {
        try {
            let mail = req.query.mail;
            if (!await app.model.tcEmailConfig.get({ email: mail })) {
                await app.model.tcEmailConfig.create({ email: mail });
            }
            let oauth2Client = new google.auth.OAuth2(oauthClientConfig.clientId, oauthClientConfig.clientSecret, oauthClientConfig.redirectUrl);
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://mail.google.com/']
            });
            req.session.user.settingEmail = mail;
            req.session.save();
            res.send({ authUrl });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/setting/mail/verify', app.permission.check('developer:login'), async (req, res) => {
        try {
            let oauth2Client = new google.auth.OAuth2(oauthClientConfig.clientId, oauthClientConfig.clientSecret, oauthClientConfig.redirectUrl);
            const data = await oauth2Client.getToken(req.query.code);
            const mail = req.session.user.settingEmail;
            req.session.user.settingEmail = null;
            req.session.save();
            const item = await app.model.tcEmailConfig.get({ email: mail });
            const emailToken = {
                ...data.tokens
            };
            if (!emailToken.refresh_token) {
                emailToken.refresh_token = app.utils.parse(item.emailToken).refresh_token;
            }
            await app.model.tcEmailConfig.update({ email: mail }, { emailToken: app.utils.stringify(emailToken) });
            await app.service.emailService.updateTransporter(mail);

            app.service.emailService.send(mail, 'temp', 'long.nguyen0709@hcmut.edu.vn', null, null, 'hello', 'hello world', '', null).catch(err => console.error(err));

            res.redirect('/user/finance/setting/mail');
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/setting/mail/all', app.permission.check('developer:login'), async (req, res) => {
        try {
            const items = await app.model.tcEmailConfig.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });
};