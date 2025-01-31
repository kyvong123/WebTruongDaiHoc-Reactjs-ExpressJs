module.exports = app => {
    app.permission.add('fwSmsViettel:send');
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6021: {
                title: 'SMS',
                link: '/user/sms/send-sms', icon: 'fa-paper-plane', groupIndex: 6
            },
        },
    };

    app.permission.add(
        { name: 'fwSmsViettel:send', menu },
    );

    app.get('/user/sms/send-sms', app.permission.check('fwSmsViettel:send'), app.templates.admin);

    app.permissionHooks.add('staff', 'addTempSms', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && [].includes(staff.email)) {
            app.permissionHooks.pushUserPermission(user, 'fwSmsViettel:send');
            resolve();
        } else resolve();
    }));

    app.get('/api/tt/sms/test', app.permission.check('developer:login'), async (req, res) => {
        let student = await app.model.fwStudent.get({ mssv: '12345' });
        app.sms.sendByViettel('TEST', student.dienThoaiCaNhan, req.query.content || 'Tien');
        // await app.model.tcHocPhiTransaction.notify({ student, hocKy: 1, namHoc: 2022, amount: 10000, payDate: '20220919202000' });
        res.end();
    });

    app.post('/api/tt/sms/service/viettel', app.permission.check('fwSmsViettel:send'), async (req, res) => {
        try {
            let body = req.body;
            let { phone, mess, idSms } = body;
            let user = req.session?.user?.email || '';

            await app.sms.sendByViettel(user, phone, mess, idSms);
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tt/test-fail', (req, res) => {
        setTimeout(() => {
            res.status(401).send();
        }, 10000);
    });
};