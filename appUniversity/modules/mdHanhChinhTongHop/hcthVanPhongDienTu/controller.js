module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1054: { title: 'Văn phòng điện tử', link: '/user/van-phong-dien-tu', icon: 'fa-desktop', backgroundColor: '#de602f', groupIndex: 5 },
        },
    };

    const pendingMenu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            415: { title: 'Văn bản chờ xử lý', link: '/user/van-phong-dien-tu/van-ban/cho-xu-ly', icon: 'fa-check-square', backgroundColor: '#6c757d' },
        },
    };
    // app.get('/user/van-phong-dien-tu', app.permission.check('staff:login'), app.templates.admin);
    app.permission.add({ name: 'staff:login', menu });
    app.permission.add(
        { name: 'hcthVanBanPending:write', menu: pendingMenu }
    );

    app.permissionHooks.add('staff', 'addRolesHcthVanBanPending', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy?.length || staff.maDonVi == '68') {
            app.permissionHooks.pushUserPermission(user, 'hcthVanBanPending:write');
            resolve();
        } else resolve();
    }));


    app.permissionHooks.add('staff', 'hcthCheckUserManagerPermission', async (user) => {
        try {
            if (user.shcc) {
                const qtChucVu = await app.model.qtChucVu.getAll({ chucVuChinh: 1, thoiChucVu: 0, shcc: user.shcc });
                for (const chucVu of qtChucVu) {
                    const chucVuItem = await app.model.dmChucVu.get({ ma: chucVu.maChucVu });
                    if (chucVuItem.truong || chucVuItem.pho) {
                        app.permissionHooks.pushUserPermission(user, 'donViCongVanDen:read', 'donViCongVanDi:edit', 'donViCongVanDi:manage');
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('hcthCheckUserManagerPermission', error);
        }
    });


    app.get('/user/van-phong-dien-tu/van-ban/cho-xu-ly', app.permission.check('rectors:login'), app.templates.admin);
    app.get('/api/hcth/count', app.permission.check('rectors:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const { rows: result } = await app.model.hcthUserSetting.getUserCount(shcc);
            if (result && result[0]) {
                res.send({
                    countItems: {
                        401: result[0].vanBanDenCount,
                        402: result[0].vanBanDiCount,
                    }
                });
            }
            else {
                res.send({});
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban/cho-xu-ly/list', app.permission.check('rectors:login'), async (req, res) => {
        try {
            const { rows: items } = await app.model.hcthUserSetting.getPendingList(req.session.user.shcc);
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/van-ban/cho-xu-ly/seen/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { seen, loai } = req.body;
            const { id } = req.params;
            if (!seen == null || !loai || !id) throw new Error('Dữ liệu không hợp lệ');
            if (seen == 1) {
                await app.model.hcthSeenStatus.delete({ ma: id, loai, shcc: req.session.user.shcc });
            } else {
                await app.model.hcthSeenStatus.create({ ma: id, loai, shcc: req.session.user.shcc });
            }
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};