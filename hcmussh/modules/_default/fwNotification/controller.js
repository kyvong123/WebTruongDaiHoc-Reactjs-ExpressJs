module.exports = app => {
    // Settings --------------------------------------------------------------------------------------------------------

    // API -------------------------------------------------------------------------------------------------------------
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1020: { title: 'Thông báo', link: '/user/notification', icon: 'fa-bell-o', backgroundColor: '#220E6F', pin: true }
        },
    };
    app.permission.add({ name: 'user:login', menu });
    app.get('/user/notification', app.permission.check('user:login'), app.templates.admin);

    app.get('/api/notification/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
        const condition = {
            email: req.session.user.email,
        };
        if (req.query.read) {
            condition.read = Number(req.query.read);
        }
        app.model.fwNotification.getPage(pageNumber, pageSize, condition, '*', 'sendTime desc', (error, page) => res.send({ error, page }));
    });

    app.get('/api/notification/item/:id', app.permission.check('user:login'), (req, res) => {
        const action = req.query.action || '';
        const condition = {
            id: req.params.id,
            email: req.session.user.email
        };
        app.model.fwNotification.update(condition, { read: 1, action }, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/notification', app.permission.check('user:login'), (req, res) => {
        const condition = {
            id: req.body.id,
            email: req.session.user.email
        };
        app.model.fwNotification.delete(condition, (error) => res.send({ error }));
    });

    app.delete('/api/notification/items', app.permission.check('user:login'), async (req, res) => {
        try {
            const ids = req.body.idList || [];
            const condition = {
                statement: 'id in (:ids)',
                parameter: { ids }
            };
            await app.model.fwNotification.delete(condition);
            res.send({});
        } catch (error) {
            console.error('/api/notification/items', error);
            res.send({ error });
        }
    });

    app.get('/api/notification/items', app.permission.check('user:login'), async (req, res) => {
        try {
            const action = req.query.action || '';
            const ids = req.query.idList || [];
            const condition = {
                statement: 'id in (:ids)',
                parameter: { ids }
            };
            const items = await app.model.fwNotification.update(condition, { read: 1, action });
            res.send({ items });
        } catch (error) {
            console.error('/api/notification/items/read', error);
            res.send({ error });
        }
    });
};