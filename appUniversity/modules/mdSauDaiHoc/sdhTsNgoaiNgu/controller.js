module.exports = app => {
    app.post('/api/sdh/ts/ngoai-ngu', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { changes } = req.body;
            let { maChungChi, loaiChungChi } = changes;
            const checkExist = await app.model.sdhTsNgoaiNgu.getAll({ maChungChi, loaiChungChi });
            if (checkExist.filter(i => i.idCcnn != changes.idCcnn).length) throw 'Trùng ccnn';
            const item = await app.model.sdhTsNgoaiNgu.create(changes);
            await app.model.sdhTsDangKyNgoaiNgu.delete({ idThiSinh: changes.id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/ngoai-ngu', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { idCcnn, changes } = req.body;
            const item = await app.model.sdhTsNgoaiNgu.update({ idCcnn }, changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/ngoai-ngu', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const { idCcnn } = req.body;
            const item = await app.model.sdhTsNgoaiNgu.delete({ idCcnn });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/ngoai-ngu', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const { idThiSinh } = req.query;
            const items = await app.model.sdhTsNgoaiNgu.getAll({ id: idThiSinh });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};