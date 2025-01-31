module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            5125: {
                title: 'Nộp thuế TNCN',
                link: '/user/tncn/quyet-toan-thue',
                icon: 'fa fa-pencil',
                parentKey: 5120
            }
        }
    };
    const socketIoEmit = (email, key, error) => !error && app.io.to(email).emit(key);
    app.permission.add(
        { name: 'cbQuyetToanThue:read', menu },
        { name: 'cbQuyetToanThue:write' },
        { name: 'cbQuyetToanThue:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesCbQuyetToanThue', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'cbQuyetToanThue:read', 'cbQuyetToanThue:write', 'cbQuyetToanThue:delete');
        }
    });

    app.get('/user/tncn/quyet-toan-thue', app.permission.orCheck('cbQuyetToanThue:read', 'cbQuyetToanThue:write', 'cbQuyetToanThue:delete'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/cb/quyet-toan-thue', app.permission.check('cbQuyetToanThue:read'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const items = await app.model.tcTncnQuyetToanThue.getAll({ shcc }, '*', 'nam DESC');
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/cb/quyet-toan-thue/:nam', app.permission.check('cbQuyetToanThue:read'), async (req, res) => {
        try {
            const nam = req.params.nam;
            const shcc = req.session.user.shcc;
            const items = await app.model.tcTncnQuyetToanThueTransaction.getAll({ nam, customerId: shcc, status: 1 });
            const congNoDetail = await app.model.tcTncnQuyetToanThueDetail.get({ shcc, tinhTrang: 'CHUA_DONG', nam }, '*', 'dot ASC');
            res.send({ items, congNoDetail });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.readyHooks.add('comsumeQuyetToanThue', {
        ready: () => app.model && app.model.tcTncnQuyetToanThue,
        run: () => {
            if (app.primaryWorker && app.appName == 'hcmussh') {
                app.messageQueue.consume('quyetToanThue:send', async (message) => {
                    try {
                        const { mscb } = app.utils.parse(message);
                        const { email } = await app.model.tchcCanBo.get({ shcc: mscb });
                        console.info(`SOCKET TO ${email}`);
                        socketIoEmit(email, 'updateQuyetToan');
                    }
                    catch (error) {
                        console.error('quyetToanThue:send:', error);
                    }
                });
            }
        }
    });

    app.get('/api/cb/quyet-toan-thue/huong-dan/download', app.permission.check('tcThueDangKy:read'), async (req, res) => {
        try {

            const pathDownload = app.path.join(app.assetPath, 'khtc/huongDanNopThue/huong_dan_nop_thue.pdf');
            res.download(pathDownload);

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};