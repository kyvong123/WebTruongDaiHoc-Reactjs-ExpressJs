module.exports = app => {
    app.post('/api/sdh/ts/de-tai', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            let { idThiSinh, tenDeTai, shccs } = changes;
            let deTai = await app.model.sdhTsDeTai.create({ idThiSinh, tenDeTai });
            if (deTai.idDeTai) {
                let idDeTai = deTai.idDeTai;
                await Promise.all(shccs.map(shcc => app.model.sdhDeTaiHuongDan.create({ shcc, idDeTai })));
            }
            else throw 'Lỗi tạo đề tài';
            res.send({ item: deTai });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/de-tai', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const { idDeTai, changes } = req.body;
            let oldShccs = await app.model.sdhDeTaiHuongDan.getAll({ idDeTai });
            let { tenDeTai, noiDung } = changes;
            let addShcc = changes.shccs.filter(item => !oldShccs.map(item => item.shcc).includes(item));
            let deleteShcc = oldShccs.map(item => item.shcc).filter(item => !changes.shccs.includes(item));
            await Promise.all([
                ...addShcc.map(item => app.model.sdhDeTaiHuongDan.create({ idDeTai, shcc: item })),
                ...deleteShcc.map(item => app.model.sdhDeTaiHuongDan.delete({ idDeTai, shcc: item })),
                app.model.sdhTsDeTai.update({ idDeTai }, { tenDeTai, noiDung })

            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/de-tai', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const { idDeTai } = req.body;
            await Promise.all([
                app.model.sdhTsDeTai.delete({ idDeTai }),
                app.model.sdhDeTaiHuongDan.delete({ idDeTai }),
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/de-tai/thi-sinh', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            let idThiSinh = req.query.idThiSinh;
            let data = {};
            let [dataDeTai, dataCbhd, deTaiCbhd] = await Promise.all([
                app.model.sdhTsDeTai.get({ idThiSinh }),
                app.model.sdhTsCanBoHuongDan.getAll({ idThiSinh }),
                app.model.sdhTsCongTrinhCbhd.getAll({})
            ]);
            data.tenDeTai = dataDeTai ? dataDeTai.tenDeTai : '';
            data.listCbhd = dataCbhd ? dataCbhd.map(i => ({ ...i, id: i.id.toString() })) : [];
            data.deTaiCbhd = deTaiCbhd;
            res.send({ data });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};