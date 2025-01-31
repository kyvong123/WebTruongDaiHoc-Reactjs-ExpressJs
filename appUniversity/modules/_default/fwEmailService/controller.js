module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            5: { title: 'Email Task', link: '/user/email-task', icon: 'fa-envelope', backgroundColor: '#BB001B' }
        },
    };
    app.permission.add(
        { name: 'emailTask:manage', menu },
    );

    app.get('/user/email-task', app.permission.check('emailTask:manage'), app.templates.admin);

    app.readyHooks.add('addSocketListener:EmailTask', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('emailTask', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('emailTask:manage') && socket.join('emailTask');
        })
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/email-task/page/:pageNumber/:pageSize', app.permission.check('emailTask:manage'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                filter = req.query.filter;

            const { pagenumber, pagesize, pagetotal, totalitem, rows } = await app.model.fwEmailTask.searchPage(pageNumber, pageSize, app.utils.stringify(filter));
            res.send({ page: { pageNumber: pagenumber, pageSize: pagesize, pageTotal: pagetotal, totalItem: totalitem, list: rows } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/email-task/item', app.permission.check('emailTask:manage'), async (req, res) => {
        try {
            const item = await app.model.fwEmailTask.get({ id: req.query.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/email-task/resend', app.permission.check('emailTask:manage'), async (req, res) => {
        try {
            const { id } = req.body;
            const item = await app.model.fwEmailTask.get({ id });
            if (!item) throw `Không tìm thấy task!${id}`;
            await app.model.fwEmailTask.update({ id }, { state: 'waiting' });
            app.messageQueue.send('emailService:send', { id: item.id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/email-task/resend-multiple', app.permission.check('emailTask:manage'), async (req, res) => {
        try {
            const { list } = req.body;
            if (!list.length)
                throw 'Danh sách email rỗng';
            const items = await app.model.fwEmailTask.getAll({ statement: 'id in (:list)', parameter: { list } });
            await app.model.fwEmailTask.update({ statement: 'id in (:list)', parameter: { list: items.map(i => i.id) } }, { state: 'waiting' });
            for (const item of items) {
                app.messageQueue.send('emailService:send', { id: item.id });
            }
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};