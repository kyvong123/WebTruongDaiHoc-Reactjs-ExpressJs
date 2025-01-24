module.exports = app => {

    app.get('/api/sdh/ts-info/to-hop/all', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoToHopThi.getDataAll();
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts-info/to-hop/:idPhanHe', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoToHopThi.getData(req.params.idPhanHe);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/to-hop/hinh-thuc/:idHinhThuc', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoToHopThi.getByHinhThuc(req.params.idHinhThuc);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/to-hop', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let { idPhanHe, maToHop, idHinhThuc } = req.body.data;
            const toHop = await app.model.sdhTsInfoToHopThi.get({ idPhanHe, maToHop, idHinhThuc });
            await Promise.all([
                app.model.sdhTsInfoToHopThi.delete({ idPhanHe, maToHop, idHinhThuc }),
                app.model.sdhTsInfoMonThi.delete({ idToHop: toHop.id })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/to-hop', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let data = req.body.data;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            const { maToHop, idPhanHe, idHinhThuc } = data;
            const stored = await app.model.sdhTsInfoToHopThi.get({ maToHop, idPhanHe, idHinhThuc });
            if (!stored) {
                await app.model.sdhTsInfoToHopThi.create(data);
                res.end();
            } else {
                throw 'Lỗi thao tác, vui lòng kiểm tra lại!';
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};