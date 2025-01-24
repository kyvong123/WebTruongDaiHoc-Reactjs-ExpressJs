module.exports = app => {

    app.get('/api/sdh/ts/dang-thuc-thi/all', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsDangThucThi.getAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/dang-thuc-thi/item/:ma', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const ma = req.params.ma;
            let item = await app.model.sdhTsDangThucThi.get({ ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};