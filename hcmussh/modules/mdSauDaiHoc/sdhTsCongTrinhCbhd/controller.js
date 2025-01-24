module.exports = app => {
    app.post('/api/sdh/ts/ctnc', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { changes } = req.body;
            let { idCbhd, ten, tenTapChi, chiSo, diem, ngayDang } = changes;
            const cvChanges = { idCbhd, ten, tenTapChi, chiSo, diem, ngayDang };
            let item = await app.model.sdhTsCongTrinhCbhd.create(cvChanges);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/ctnc', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const { idCbhd, ten, tenTapChi, chiSo, diem, ngayDang } = changes;
            const cvChanges = { idCbhd, ten, tenTapChi, chiSo, diem, ngayDang };
            let item = await app.model.sdhTsCongTrinhCbhd.update({ id }, cvChanges);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/ctnc', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { id } = req.body;
            const item = await app.model.sdhTsCongTrinhCbhd.delete({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/ctnc', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const { idCbhd } = req.query;
            const items = await app.model.sdhTsCongTrinhCbhd.getAll({ idCbhd });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};