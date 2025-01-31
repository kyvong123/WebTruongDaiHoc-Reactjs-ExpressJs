module.exports = app => {
    app.get('/user/truyen-thong/e-news/dm-nguoi-nhan', app.permission.check('fwENews:read'), app.templates.admin);

    app.get('/api/tt/e-news/dm-nguoi-nhan/all', app.permission.check('fwENews:read'), async (req, res) => {
        try {
            const items = await app.model.fwENewsDmLoaiNguoiNhan.getAll();

            res.send({ items });
        } catch (error) {
            console.error('GET /api/tt/e-news/dm-nguoi-nhan/all', error);
            res.send({ error });
        }
    });

    app.get('/api/tt/e-news/dm-nguoi-nhan/item/:id', app.permission.check('fwENews:read'), async (req, res) => {
        try {
            const item = await app.model.fwENewsDmLoaiNguoiNhan.get({ id: req.params.id });

            res.send({ item });
        } catch (error) {
            console.error('GET /api/tt/e-news/dm-nguoi-nhan/item/:id', error);
            res.send({ error });
        }
    });

    app.post('/api/tt/e-news/dm-nguoi-nhan', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const item = await app.model.fwENewsDmLoaiNguoiNhan.create(req.body.item);

            res.send({ item });
        } catch (error) {
            console.error('POST /api/tt/e-news/dm-nguoi-nhan', error);
            res.send({ error });
        }
    });

    app.put('/api/tt/e-news/dm-nguoi-nhan', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const item = await app.model.fwENewsDmLoaiNguoiNhan.update({ id: req.body.id }, req.body.changes);

            res.send({ item });
        } catch (error) {
            console.error('PUT /api/tt/e-news/dm-nguoi-nhan', error);
            res.send({ error });
        }
    });

    app.delete('/api/tt/e-news/dm-nguoi-nhan', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            await app.model.fwENewsDmLoaiNguoiNhan.delete({ id: req.body.id });

            res.end();
        } catch (error) {
            console.error('DELETE /api/tt/e-news/dm-nguoi-nhan', error);
            res.send({ error });
        }
    });
};