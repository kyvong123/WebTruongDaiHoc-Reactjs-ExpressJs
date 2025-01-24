module.exports = app => {
    const menuAuthor = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6026: { title: 'Danh mục tác giả', link: '/user/news/author', groupIndex: 1, icon: 'fa-list-alt', backgroundColor: '#00b8d4' }
        }
    };

    app.get('/user/news/author', app.permission.check('news-author:manage'), app.templates.admin);

    app.permission.add(
        { name: 'news-author:manage', menu: menuAuthor }, 'news-author:write', 'news-author:delete'
    );

    app.get('/api/tt/news/author/all', app.permission.check('news-author:manage'), async (req, res) => {
        try {
            const items = await app.model.fwNewsDmAuthor.getAll({});
            res.send({ items });
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/tt/news/author', app.permission.check('news-author:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.fwNewsDmAuthor.create({ ...data });
            res.send({ item });
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


    app.put('/api/tt/news/author', app.permission.check('news-author:write'), async (req, res) => {
        try {
            const { email, changes } = req.body;
            const item = await app.model.fwNewsDmAuthor.update({ email }, { ...changes });
            res.send({ item });
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/tt/news/author', app.permission.check('news-author:delete'), async (req, res) => {
        try {
            const { email } = req.body;
            const item = await app.model.fwNewsDmAuthor.delete({ email });
            res.send({ item });
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};