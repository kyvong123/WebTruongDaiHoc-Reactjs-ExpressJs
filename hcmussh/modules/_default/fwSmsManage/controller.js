module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2071: { title: 'Quản lý SMS', link: '/user/sms-manage', icon: 'fa-commenting', backgroundColor: '#5F556A' }
        },
    };
    app.permission.add(
        { name: 'smsManage:manage', menu },
    );

    app.get('/user/sms-manage', app.permission.check('smsManage:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sms-manage/page/:pageNumber/:pageSize', app.permission.check('smsManage:manage'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                condition = req.query.condition;

            const page = await app.model.fwSmsManage.getPage(pageNumber, pageSize, condition, '*', 'id DESC');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sms-manage/send-sms', app.permission.check('smsManage:manage'), async (req, res) => {
        try {
            const item = req.body?.item || {};
            if (!item) throw ('Thông tin SMS lỗi!');

            const checkSms = await app.model.fwSmsManage.get({ id: item.id });
            if (!checkSms) throw ('SMS không còn tồn tại thông tin');

            const user = req.session?.user?.email || '';
            await app.sms.sendByViettel(user, checkSms.receiver, checkSms.content, checkSms.id);

            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};