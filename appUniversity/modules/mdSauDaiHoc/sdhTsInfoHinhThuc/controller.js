module.exports = app => {

    app.get('/api/sdh/ts-info/hinh-thuc/:maPhanHe', async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoHinhThuc.getData(req.params.maPhanHe);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/hinh-thuc', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const items = await app.model.sdhTsInfoHinhThuc.getDataAll();
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/hinh-thuc', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const { maPhanHe, idDot, maHinhThuc } = req.body.data;
            const phanHe = await app.model.sdhTsInfoPhanHe.get({ maPhanHe, idDot }),
                hinhThuc = await app.model.sdhTsInfoHinhThuc.get({ idPhanHe: phanHe.id, maHinhThuc });
            await Promise.all[
                app.model.sdhTsInfoHinhThuc.delete({ id: hinhThuc.id }),
                app.model.sdhTsInfoToHopThi.delete({ idHinhThuc: hinhThuc.id })
            ];
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/hinh-thuc', app.permission.check('sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const { maPhanHe, idDot, maHinhThuc } = req.body.data;
            const phanHe = await app.model.sdhTsInfoPhanHe.get({ maPhanHe, idDot });
            const stored = await app.model.sdhTsInfoHinhThuc.get({ maHinhThuc, idPhanHe: phanHe?.id });
            if (!stored) {
                const item = await app.model.sdhTsInfoHinhThuc.create({ ...req.body.data, idPhanHe: phanHe.id });
                res.send({ item: item });
            } else {
                throw 'Lỗi thao tác, hình thức này đã được lưu, vui lòng kiểm tra lại!';
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/hinh-thuc/item/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            let id = req.params.id;
            let item = await app.model.sdhTsInfoHinhThuc.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts-info/hinh-thuc/to-hop/:idPhanHe', app.permission.check('sdhTsXetTrungTuyen:write'), async (req, res) => {
        try {
            const idPhanHe = req.params.idPhanHe;
            const items = await app.model.sdhTsInfoHinhThuc.getToHop(idPhanHe);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};