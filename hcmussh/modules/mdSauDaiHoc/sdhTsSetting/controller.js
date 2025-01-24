module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7617: { title: 'Cấu hình', link: '/user/sau-dai-hoc/tuyen-sinh/ts-setting', icon: 'fa-cog', backgroundColor: '#1488db', groupIndex: 1, parentKey: 7544 },
        },
    };
    app.permission.add({ name: 'sdhTsSetting:read', menu }, 'sdhTsSetting:write');

    app.get('/user/sau-dai-hoc/tuyen-sinh/ts-setting', app.permission.check('sdhTsSetting:read'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/ts-setting/all', app.permission.check('sdhTsSetting:read'), async (req, res) => {
        try {
            let items = await app.model.sdhTsSetting.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/sdh/ts-setting', app.permission.check('sdhTsSetting:write'), async (req, res) => {
        const { changes } = req.body;
        let error = await app.model.sdhTsSetting.setValue(changes);
        if (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
        res.end();
    });

    app.post('/api/sdh/ts-setting/send-edit-link', app.permission.check('sdhTsSetting:write'), async (req, res) => {
        try {
            let { listEmail } = req.body;
            const prepareData = async (listEmail) => {
                try {
                    let mailData = [];
                    for (const _email of listEmail) {
                        let item = await app.model.sdhTsThongTinCoBan.get({ email: _email });
                        const name = item.ho + ' ' + item.ten,
                            emailTo = !app.isDebug ? _email : 'bao.tran133@hcmut.edu.vn';
                        const mailSetting = await app.model.sdhTsSetting.getValue('email', 'emailPassword', 'emailEditEditorText', 'emailEditEditorHtml', 'emailEditTitle', 'sdhPhone', 'sdhAddress', 'sdhSupportPhone', 'sdhEmail');
                        let { email, emailPassword, emailEditEditorText, emailEditEditorHtml, emailEditTitle, sdhPhone, sdhAddress, sdhEmail, sdhSupportPhone, expiredIn } = mailSetting || { expiredIn: '1d' };
                        let maTruyXuat = '';
                        let data = { email: _email };
                        maTruyXuat = await app.model.sdhTsThongTinCoBan.generateToken(data, expiredIn);
                        let linkTruyXuat = app.rootUrl + '/sdh/bieu-mau-dang-ky/detail?maTruyXuat=' + maTruyXuat;
                        const text = emailEditEditorText
                            .replaceAll('{name}', name)
                            .replaceAll('{sdh_address}', sdhAddress)
                            .replaceAll('{sdh_phone}', sdhPhone)
                            .replaceAll('{support_phone}', sdhSupportPhone)
                            .replaceAll('{sdh_email}', sdhEmail)
                            .replaceAll('{linkTruyXuat}', linkTruyXuat),
                            html = emailEditEditorHtml.replaceAll('{name}', name)
                                .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{linkTruyXuat}', linkTruyXuat),
                            title = emailEditTitle;
                        mailData.push({ email, emailPassword, emailTo, title, text, html });
                    }
                } catch (error) {
                    console.error('Lỗi chuẩn bị email data');
                }
            };
            let mailPromise = prepareData(listEmail);
            Promise.all(mailPromise.map(item => {
                let { email, emailPassword, emailTo, title, text, html } = item;
                app.service.emailService.send(email, emailPassword, emailTo, null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
            }));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};
