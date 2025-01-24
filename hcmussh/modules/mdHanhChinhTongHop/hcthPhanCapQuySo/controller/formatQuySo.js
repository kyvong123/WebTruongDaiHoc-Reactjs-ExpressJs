module.exports = app => {
    app.get('/user/hcth/format', app.permission.check('hcthPhanCapQuySo:manage'), app.templates.admin);
    app.get('/api/hcth/so-van-ban/format/all', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const { rows: items } = await app.model.hcthFormatSoVanBan.getList();
            res.send({ items });
        } catch (error) {
            console.error(res.originalUrl, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/so-van-ban/format', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.hcthFormatSoVanBan.create(data);
            res.send({ item });
        } catch (error) {
            console.error(res.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/so-van-ban/format', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.hcthFormatSoVanBan.get({ id });
            if (!item) {
                throw 'Định dạng số không tồn tại';
            }
            res.send({ item: await app.model.hcthFormatSoVanBan.update({ id }, { changes }) });
        } catch (error) {
            console.error(res.originalUrl, error);
            res.send({ error });
        }
    });
};
