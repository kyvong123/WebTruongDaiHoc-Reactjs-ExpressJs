module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2083: { title: 'Access Token', link: '/user/access-token', icon: 'fa-flag', backgroundColor: '#4db6ac' }
        }
    };

    app.permission.add({ name: 'developer:login', menu });

    app.get('/user/access-token', app.permission.check('developer:login'), app.templates.admin);
    app.get('/api/access-token/all', app.permission.check('developer:login'), async (req, res) => {
        try {
            const items = await app.model.fwAccessToken.getAll();

            res.send({ items });
        } catch (error) {
            console.error('GET /api/access-token/all', error);
            res.send({ error });
        }
    });

    app.post('/api/access-token', app.permission.check('developer:login'), async (req, res) => {
        try {
            const newItem = req.body.item;
            newItem.token = app.randomCharacter(50);

            const item = await app.model.fwAccessToken.create(newItem);
            res.send({ item });
        } catch (error) {
            console.error('POST /api/access-token', error);
            res.send({ error });
        }
    });

    app.put('/api/access-token', app.permission.check('developer:login'), async (req, res) => {
        try {
            const item = await app.model.fwAccessToken.update({ token: req.body.token }, req.body.changes);

            res.send({ item });
        } catch (error) {
            console.error('PUT /api/access-token', error);
            res.send({ error });
        }
    });

    app.delete('/api/access-token', app.permission.check('developer:login'), async (req, res) => {
        try {
            await app.model.fwAccessToken.delete({ token: req.body.token });

            res.end();
        } catch (error) {
            console.error('DELETE /api/access-token', error);
            res.send({ error });
        }
    });
};