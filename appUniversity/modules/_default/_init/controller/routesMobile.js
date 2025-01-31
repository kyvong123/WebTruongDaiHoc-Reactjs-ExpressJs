module.exports = app => {
    /**
     * Mobile Settings Menu Page
     */
    const mobileSettingsMenuPage = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2001: {
                title: 'Mobile Config', link: '/user/settings/mobile', groupIndex: 0, icon: 'fa-mobile', backgroundColor: '#2962ff'
            }
        }
    };

    /**
     * Mobile toggle features page
     */
    const mobileFeaturesMenu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2002: {
                title: 'Mobile Release Feature', groupIndex: 0, parentKey: 2001, link: '/user/settings/mobile/features', icon: 'fa-mobile', backgroundColor: '#366384'
            }
        }
    };

    /**
     * TODO: Mobile devices - account table
     */

    app.permission.add(
        { name: 'developer:login', menu: mobileSettingsMenuPage },
        { name: 'developer:login', menu: mobileFeaturesMenu },
    );

    app.get('/user/settings/mobile', app.permission.check('developer:login'), app.templates.admin);
    app.get('/user/settings/mobile/features', app.permission.check('developer:login'), app.templates.admin);

    app.put('/api/system/mobile', app.permission.check('developer:login'), async (req, res) => {
        try {
            const { latestIOSVersion, latestAndroidVersion, isQA, isBlackbox, isYShop, isTtLienHeBeta, isTmdtYShopTestBeta, isMaintainence } = req.body;
            const changes = [];
            if (latestIOSVersion || latestIOSVersion == '') changes.push('latestIOSVersion', latestIOSVersion.trim());
            if (latestAndroidVersion || latestAndroidVersion == '') changes.push('latestAndroidVersion', latestAndroidVersion.trim());
            if (isQA || isQA == '') changes.push('isQA', isQA.trim());
            if (isBlackbox || isBlackbox == '') changes.push('isBlackbox', isBlackbox.trim());
            if (isYShop || isYShop == '') changes.push('isYShop', isYShop.trim());
            if (isTtLienHeBeta || isTtLienHeBeta == '') changes.push('isTtLienHeBeta', isTtLienHeBeta.trim());
            if (isTmdtYShopTestBeta || isTmdtYShopTestBeta == '') changes.push('isTmdtYShopTestBeta', isTmdtYShopTestBeta.trim());
            if (isMaintainence || isMaintainence == '') changes.push('isMaintainence', isMaintainence.trim());
            await app.mobileState.set(...changes);
            const data = await app.mobileState.get();
            res.send(data);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/mobile/state', (req, res, next) => next(), async (req, res) => {
        try {
            const data = await app.mobileState.get();
            if (data == null) {
                res.send({ error: 'System has error!' });
            } else {
                Object.keys(data).forEach(key => {
                    if (key.toLowerCase().indexOf('password') != -1) delete data[key]; // delete data.emailPassword, data.tchcEmailPassword
                });

                if (app.isDebug) data.isDebug = true;
                if (req.session.user) data.user = req.session.user;
                res.send(data);
            }
        } catch (error) {
            res.send({ error });
        }
    });
};
