module.exports = app => {

    app.get('/user/hcth/quy-so', app.permission.check('hcthPhanCapQuySo:manage'), app.templates.admin);


    app.get('/api/hcth/quy-so/all', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const items = await app.model.hcthQuySo.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/quy-so/:ma', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const item = await app.model.hcthQuySo.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/quy-so', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const { ma, namHanhChinh } = req.body.data;
            const item = await app.model.hcthQuySo.create({ ma, namHanhChinh });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    // Áp dụng quỹ số cho tất cả đơn vị (dùng khi năm mới bắt đầu)
    app.put('/api/hcth/quy-so/apply', app.permission.check('hcthPhanCapQuySo:manage'), async (req, res) => {
        try {
            const { ma } = req.body;
            const item = await app.model.hcthQuySo.get({ ma });
            if (!item) {
                throw 'Không tồn tại quỹ số';
            }
            await app.model.hcthQuySo.update({
                statement: '1=1',
                parameter: {},
            }, { macDinh: 0 });
            await app.model.hcthQuySo.update({ ma }, { macDinh: 1 });
            await app.model.hcthPhanCapQuySo.update({
                statement: '1=1',
                parameter: {},
            }, { quySo: item.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });
};