module.exports = app => {
    app.post('/api/sdh/ts/bai-bao', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { changes } = req.body;
            let { id, tenBaiBao, tenTapChi, chiSo, diem, ngayDang } = changes;
            const cvChanges = { id, tenBaiBao, tenTapChi, chiSo, diem, ngayDang };
            let item = await app.model.sdhTsBaiBao.create(cvChanges);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/bai-bao', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { idBaiBao, changes } = req.body;
            let { tenBaiBao, tenTapChi, chiSo, diem, ngayDang } = changes;
            const cvChanges = { tenBaiBao, tenTapChi, chiSo, diem, ngayDang };
            let item = await app.model.sdhTsBaiBao.update({ idBaiBao }, cvChanges);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/bai-bao', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { idBaiBao } = req.body;
            const item = await app.model.sdhTsBaiBao.delete({ idBaiBao });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/bai-bao', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const { idThiSinh } = req.query;
            const items = await app.model.sdhTsBaiBao.getAll({ id: idThiSinh });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};