module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            11001: { title: 'Chatbox Cá Nhân', link: '/user/tt/chatbox', icon: 'fa-comment', backgroundColor: '#00aa00', pin: true },
        },
    };
    app.permission.add({ name: 'student:login', menu });
    app.get('/user/tt/chatbox', app.permission.check('student:login'), app.templates.admin);

    app.get('/api/tt/chatbox/personal/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ?? {};
            const user = req.session.user;
            const page = await app.model.fwQuestionAnswer.searchPersonalChatboxPage(_pageNumber, _pageSize, user.email, app.utils.stringify(filter), searchTerm);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            list = list.map(item => {
                item.memberList = app.utils.parse(item.memberList);
                item.messages = (app.utils.parse(item.messages)).sort((a, b) => a.createdAt - b.createdAt > 0 ? 1 : -1);

                if (item.chatBoxType === 'BLACKBOX') {
                    item.messages = item.messages.map(message => {
                        return (message.email != user.email) ? { ...message, ho: null, ten: null, email: null } : message;
                    });
                }

                if (item.messages && item.messages.length > 0) {
                    item.lastMessage = item.messages[item.messages.length - 1];
                }
                return item;
            });
            list.sort((a, b) => a.lastMessage.createdAt - b.lastMessage.createdAt > 0 ? -1 : 1);
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, list: Object.values(list) } });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};