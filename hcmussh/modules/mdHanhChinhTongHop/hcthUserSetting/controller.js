module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            413: { title: 'Cài đặt của bạn', link: '/user/van-phong-dien-tu/setting', icon: 'fa-bell', backgroundColor: '#db2c2c', groupIndex: 3 },
        },
    };
    app.permission.add(
        { name: 'hcthUserSetting:write', menu }
    );

    app.permissionHooks.add('staff', 'addRolesHcthUserSetting', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy?.length || staff.maDonVi == '68') {
            app.permissionHooks.pushUserPermission(user, 'hcthUserSetting:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/van-phong-dien-tu/setting', app.permission.check('hcthUserSetting:write'), app.templates.admin);

    app.get('/api/hcth/user/setting', app.permission.check('hcthUserSetting:write'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const setting = await app.model.hcthUserSetting.get({ shcc });
            res.send({ setting });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/user/setting', app.permission.check('hcthUserSetting:write'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            let setting = await app.model.hcthUserSetting.get({ shcc });
            if (setting) {
                setting = await app.model.hcthUserSetting.update({ shcc }, req.body);
            } else {
                setting = await app.model.hcthUserSetting.create({ shcc, ...req.body },);
            }
            res.send({ setting });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const notify = async () => {
        // get user van ban den notify
        const setting = await app.model.hcthSetting.getValue('email', 'emailPassword');
        const { rows: list } = await app.model.hcthUserSetting.getList();
        const sms = {};
        const email = {};
        // get user van ban di notify
        list.forEach((item) => {
            if (item.vanBanDenSms || item.vanBanDenEmail) {
                if (item.vanBanDiCount || item.vanBanDenCount) {
                    const message = 'Thầy/Cô có' + (item.vanBanDiCount ? ` ${item.vanBanDiCount} văn bản đi` : '') + ((item.vanBanDenCount && item.vanBanDiCount) ? ' và' : '') + (item.vanBanDenCount ? ` ${item.vanBanDenCount} văn bản đến` : '') + ' cần xử lý';
                    item.vanBanDenSms && item.soDienThoai && (sms[item.soDienThoai] = app.toEngWord(message));
                    item.vanBanDenEmail && item.email && (email[item.email] = {
                        title: 'Thông báo văn phòng điện tử',
                        htmlContent: `<p><span style="font-family:Times New Roman,Times,serif"><span style="font-size:18px">K&iacute;nh gửi Thầy/C&ocirc;,</span></span></p>
    
                        <p><span style="font-family:Times New Roman,Times,serif"><span style="font-size:18px">${message}</span></span></p>
                        `,
                        textContent: message
                    });
                }
            }
        });
        Object.keys(sms).forEach(soDienThoai => {
            app.sms.sendByViettel('HCTC-USER', app.isDebug ? '0785788177' : soDienThoai, sms[soDienThoai]);
        });
        Object.keys(email).forEach(receiver => {
            const mailItem = email[receiver];
            app.service.emailService.send(setting.email, setting.emailPassword, app.isDebug ? 'nqlong0709@gmail.com' : receiver, null, null, mailItem.title, mailItem.textContent, mailItem.htmlContent);
        });
        // prepare number of vanBan

        // send notify
    };


    (app.isDebug || app.appName == 'mdHanhChinhTongHopService') && app.readyHooks.add('HcthUserSetting:Notification', {
        ready: () => app.database && app.assetPath,
        run: () => app.primaryWorker && app.schedule('0 8-17/4 * * *', () => {
            notify();
        }),
    });
};