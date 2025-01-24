module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6012: { title: 'Loại người nhận email', link: '/user/truyen-thong/e-news/dm-nguoi-nhan', icon: 'fa-list-alt', backgroundColor: '#00b8d4', groupIndex: 2 },
            6013: { title: 'Danh sách người nhận mail', link: '/user/truyen-thong/e-news/nguoi-nhan', icon: 'fa-users', backgroundColor: '#00b8d4', groupIndex: 2 },
            6014: { title: 'eNews', link: '/user/truyen-thong/e-news', icon: 'fa-list-alt', backgroundColor: '#00b001', groupIndex: 2 },
        }
    };

    app.permission.add(
        { name: 'fwENews:read', menu },
        { name: 'fwENews:write', menu },
        { name: 'fwENews:delete', menu }
    );

    app.get('/user/truyen-thong/e-news', app.permission.check('fwENews:read'), app.templates.admin);
    app.get('/user/truyen-thong/e-news/edit/:eNewsId', app.permission.check('fwENews:read'), app.templates.admin);

    // Send email
    app.enewsEmailInfo = {
        user: 'enews1@hcmussh.edu.vn',
        name: 'USSH-VNUHCM',
        clientId: '577130123446-9db194cks6m0qqvo3vhkdtu4ub52b6jr.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken: '1//0eWZMD9OENJgzCgYIARAAGA4SNgF-L9Ir6CRcsvBA82eyBag_aOc5TDS0Y4zRTm72x0z4wQmK11SZrowaUfF36AlZNfwC7gpi9g',
        accessToken: 'ya29.a0AbVbY6NNAq9wSipcL_TJKd_uWzjDYHE04mL3b0osEAo5GQycYt3-cHkc8DeoOHxXhqhFS5amIAquYWXu4BWvtK1aBmz-MaR4vsSkU2LHc89TmLGtM4LQPGy84PPlAE7oc8X54I2Pwu0X_z8ow9NZvL_kfXjpaCgYKAUsSARMSFQFWKvPlJg_DuF_7cvSnasXNUvsc0Q0163'
    };

    app.post('/api/tt/e-news/send-email', async (req, res) => {
        try {
            const { data } = req.body;

            if (data.id && data.receiverType) {
                const item = await app.service.emailService.sendENews(data);

                res.send({ item });
            } else {
                res.send({ error: 'Dữ liệu không hợp lệ' });
            }
        } catch (error) {
            console.error('POST: /api/tt/e-news/send-email', error);
            res.send({ error: 'Gửi mail bị lỗi' });
        }
    });

        app.get('/api/tt/e-news/page/:pageNumber/:pageSize', app.permission.check('fwENews:read'), async (req, res) => {
            try {
                const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
                const page = await app.model.fwENews.getPage(pageNumber, pageSize);
                res.send({ page });
            } catch (error) {
                console.error('GET /api/tt/e-news/page/:pageNumber/:pageSize', error);
                res.send({ error });
            }
        });

    app.get('/api/tt/e-news/item/:eNewsId', app.permission.check('fwENews:read'), async (req, res) => {
        try {
            const { eNewsId } = req.params;
            const item = await app.model.fwENews.get({ id: eNewsId });
            const newsItemsResult = await app.model.fwENewsItem.searchAll(eNewsId) || [];

            item.structures = await app.model.fwENewsStructure.getAll({ eNewsId }, '*', 'thuTu') || [];

            res.send({ item, newsItems: newsItemsResult.rows || [] });
        } catch (error) {
            console.error('GET /api/tt/e-news/item/:eNewsId', error);
            res.send({ error });
        }
    });


    app.post('/api/tt/e-news', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const item = await app.model.fwENews.create(req.body.data);

            res.send({ item });
        } catch (error) {
            console.error('POST /api/tt/e-news', error);
            res.send({ error });
        }
    });

    app.put('/api/tt/e-news', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.fwENews.update({ id }, changes);

            res.send({ item });
        } catch (error) {
            console.error('PUT /api/tt/e-news', error);
            res.send({ error });
        }
    });

    app.delete('/api/tt/e-news', app.permission.check('fwENews:delete'), async (req, res) => {
        try {
            const items = await app.model.fwENewsItem.getAll({ eNewsId: req.body.id });

            items.forEach(item => item.image && app.fs.deleteImage(item.image));

            await app.model.fwENewsItem.delete({ eNewsId: req.body.id });
            await app.model.fwENewsStructure.delete({ eNewsId: req.body.id });
            await app.model.fwENews.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            console.error('DELETE /api/tt/e-news', error);
            res.send({ error });
        }
    });
};